-- First, let's see what users we have in the system
SELECT 
  'Current Users in auth.users' as info,
  COUNT(*) as count
FROM auth.users 
WHERE email IS NOT NULL AND email != '';

-- Show some sample users
SELECT 
  id,
  email,
  created_at,
  confirmed_at
FROM auth.users 
WHERE email IS NOT NULL 
  AND email != ''
  AND confirmed_at IS NOT NULL
LIMIT 5;

-- Check if we have any users in public.users
SELECT 
  'Current Users in public.users' as info,
  COUNT(*) as count
FROM public.users;

-- Show sample public.users
SELECT 
  id,
  first_name,
  last_name,
  created_at
FROM public.users
LIMIT 5;

-- Clean up any existing newsletter subscriptions first
DELETE FROM public.newsletter_subscriptions;

-- Create a simple, direct migration function
CREATE OR REPLACE FUNCTION migrate_all_users_to_newsletter()
RETURNS INTEGER AS $$
DECLARE
  user_count INTEGER := 0;
  auth_user RECORD;
BEGIN
  -- Loop through ALL confirmed users in auth.users
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
      AND au.confirmed_at IS NOT NULL
  LOOP
    -- Insert into newsletter_subscriptions
    INSERT INTO public.newsletter_subscriptions (email, name)
    VALUES (
      auth_user.email,
      CASE 
        WHEN auth_user.first_name IS NOT NULL AND auth_user.last_name IS NOT NULL 
        THEN auth_user.first_name || ' ' || auth_user.last_name
        ELSE auth_user.email
      END
    );
    
    user_count := user_count + 1;
    
    -- Log each successful insertion
    RAISE NOTICE 'Subscribed user: % (%)', auth_user.email, user_count;
  END LOOP;
  
  RETURN user_count;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function for automatic subscription of new users
CREATE OR REPLACE FUNCTION auto_subscribe_new_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into newsletter_subscriptions when a new user is created in public.users
  INSERT INTO public.newsletter_subscriptions (email, name)
  SELECT 
    au.email,
    CASE 
      WHEN NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL 
      THEN NEW.first_name || ' ' || NEW.last_name
      ELSE au.email
    END
  FROM auth.users au
  WHERE au.id = NEW.id
    AND au.email IS NOT NULL
    AND au.email != ''
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic subscription
DROP TRIGGER IF EXISTS auto_subscribe_trigger ON public.users;
CREATE TRIGGER auto_subscribe_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_subscribe_new_users();

-- Run the migration
SELECT 'Starting migration...' as status;
SELECT migrate_all_users_to_newsletter() as migrated_users;

-- Verify the results
SELECT 
  'Newsletter Subscriptions After Migration' as info,
  COUNT(*) as count
FROM public.newsletter_subscriptions;

-- Show all newsletter subscriptions
SELECT 
  email,
  name,
  subscribed_at,
  created_at
FROM public.newsletter_subscriptions 
ORDER BY subscribed_at DESC;

-- Test the trigger by checking if it was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'auto_subscribe_trigger';

-- Create a function to manually subscribe a user (for testing)
CREATE OR REPLACE FUNCTION subscribe_user_manual(user_email TEXT, user_name TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.newsletter_subscriptions (email, name)
  VALUES (
    user_email,
    COALESCE(user_name, user_email)
  )
  ON CONFLICT (email) DO NOTHING;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error subscribing user %: %', user_email, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Test manual subscription
-- SELECT subscribe_user_manual('test@example.com', 'Test User');

-- Show final summary
SELECT 
  'Final Summary' as info,
  (SELECT COUNT(*) FROM auth.users WHERE email IS NOT NULL AND email != '' AND confirmed_at IS NOT NULL) as total_users,
  (SELECT COUNT(*) FROM public.newsletter_subscriptions) as total_subscriptions;
