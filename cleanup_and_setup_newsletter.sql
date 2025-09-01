-- Clean up dummy newsletter subscriptions
DELETE FROM public.newsletter_subscriptions 
WHERE email IN (
  'john.smith@example.com',
  'sarah.johnson@company.com', 
  'michael.brown@procurement.org',
  'lisa.wilson@training.co.za'
);

-- Verify cleanup
SELECT COUNT(*) as remaining_subscriptions FROM public.newsletter_subscriptions;

-- Create a function to automatically subscribe users to newsletter when they register
-- This function will be called from the application when users register for events
CREATE OR REPLACE FUNCTION auto_subscribe_to_newsletter(user_email TEXT, user_name TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert into newsletter_subscriptions
  INSERT INTO public.newsletter_subscriptions (email, name)
  VALUES (
    user_email,
    COALESCE(user_name, user_email)
  )
  ON CONFLICT (email) DO NOTHING; -- Don't fail if email already exists
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create a function to unsubscribe users from newsletter
CREATE OR REPLACE FUNCTION unsubscribe_from_newsletter(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Delete from newsletter_subscriptions
  DELETE FROM public.newsletter_subscriptions 
  WHERE email = user_email;
  
  RETURN FOUND; -- Returns TRUE if a row was deleted, FALSE if no rows found
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create a function to unsubscribe user by ID
CREATE OR REPLACE FUNCTION unsubscribe_user_by_id(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  -- If user found, unsubscribe them
  IF user_email IS NOT NULL THEN
    RETURN unsubscribe_from_newsletter(user_email);
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create a function to migrate existing users from auth.users to newsletter_subscriptions
-- This requires RLS to be temporarily disabled or run with service role
CREATE OR REPLACE FUNCTION migrate_existing_users_to_newsletter()
RETURNS INTEGER AS $$
DECLARE
  user_count INTEGER := 0;
  auth_user RECORD;
BEGIN
  -- Loop through all users in auth.users
  FOR auth_user IN 
    SELECT 
      au.id,
      au.email,
      pu.first_name,
      pu.last_name
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE au.email IS NOT NULL 
      AND au.email != ''
      AND au.confirmed_at IS NOT NULL -- Only confirmed users
  LOOP
    -- Try to insert into newsletter_subscriptions
    BEGIN
      INSERT INTO public.newsletter_subscriptions (email, name)
      VALUES (
        auth_user.email,
        COALESCE(
          auth_user.first_name || ' ' || auth_user.last_name,
          auth_user.email
        )
      )
      ON CONFLICT (email) DO NOTHING;
      
      -- Count successful insertions
      IF FOUND THEN
        user_count := user_count + 1;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but continue with other users
        RAISE NOTICE 'Failed to subscribe user %: %', auth_user.email, SQLERRM;
    END;
  END LOOP;
  
  RETURN user_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get user email by user ID (for future use)
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql;

-- Create a function to subscribe user by ID
CREATE OR REPLACE FUNCTION subscribe_user_by_id(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Get user email and name
  SELECT 
    au.email,
    COALESCE(
      pu.first_name || ' ' || pu.last_name,
      au.email
    ) INTO user_email, user_name
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE au.id = user_id;
  
  -- If user found, subscribe them
  IF user_email IS NOT NULL THEN
    RETURN auto_subscribe_to_newsletter(user_email, user_name);
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if user is subscribed
CREATE OR REPLACE FUNCTION is_user_subscribed(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.newsletter_subscriptions 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to get subscription status by user ID
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_id UUID)
RETURNS TABLE(
  is_subscribed BOOLEAN,
  email TEXT,
  name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  -- Return subscription status
  RETURN QUERY
  SELECT 
    ns.email IS NOT NULL as is_subscribed,
    COALESCE(ns.email, user_email) as email,
    ns.name,
    ns.subscribed_at
  FROM (SELECT user_email) as u
  LEFT JOIN public.newsletter_subscriptions ns ON u.user_email = ns.email;
END;
$$ LANGUAGE plpgsql;

-- Test the functions by checking if they were created
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN (
  'auto_subscribe_to_newsletter',
  'unsubscribe_from_newsletter',
  'unsubscribe_user_by_id',
  'migrate_existing_users_to_newsletter',
  'get_user_email',
  'subscribe_user_by_id',
  'is_user_subscribed',
  'get_user_subscription_status'
)
ORDER BY routine_name;

-- Show current newsletter subscriptions before migration
SELECT 
  'Before Migration' as status,
  COUNT(*) as subscription_count 
FROM public.newsletter_subscriptions;

-- Run migration (uncomment the line below to execute)
-- SELECT migrate_existing_users_to_newsletter() as migrated_users;

-- Show current newsletter subscriptions after migration
SELECT 
  email,
  name,
  subscribed_at,
  created_at
FROM public.newsletter_subscriptions 
ORDER BY subscribed_at DESC;

-- Show summary
SELECT 
  'After Migration' as status,
  COUNT(*) as subscription_count 
FROM public.newsletter_subscriptions;

-- Example usage queries (uncomment to test):

-- Subscribe a specific user by email
-- SELECT auto_subscribe_to_newsletter('user@example.com', 'User Name');

-- Unsubscribe a specific user by email
-- SELECT unsubscribe_from_newsletter('user@example.com');

-- Check if a user is subscribed
-- SELECT is_user_subscribed('user@example.com');

-- Get subscription status for a user by ID
-- SELECT * FROM get_user_subscription_status('user-uuid-here');
