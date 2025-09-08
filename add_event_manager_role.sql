-- Migration script to add event manager role and example users
-- Run this script to set up role-based access control with event manager role

-- First, let's ensure we have the proper role structure
-- Update any existing 'admin' roles to 'super_admin' for backwards compatibility
UPDATE users
SET role = 'super_admin'
WHERE role = 'admin' OR role IS NULL;

-- Update any users with no role to be ordinary_user
UPDATE users
SET role = 'ordinary_user'
WHERE role IS NULL OR role = '';

-- Create example users for each role (for testing purposes)
-- Note: In production, you would create these through your application's registration system

-- Example Super Admin
INSERT INTO users (id, email, password, first_name, last_name, phone_number, role, created_at)
VALUES (
  gen_random_uuid(),
  'superadmin@alliance.test',
  '$2b$10$example.hashed.password.here', -- You'll need to hash this properly
  'Super',
  'Administrator',
  '+1234567890',
  'super_admin',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Example Event Manager
INSERT INTO users (id, email, password, first_name, last_name, phone_number, role, created_at)
VALUES (
  gen_random_uuid(),
  'eventmanager@alliance.test',
  '$2b$10$example.hashed.password.here', -- You'll need to hash this properly
  'Event',
  'Manager',
  '+1234567891',
  'event_manager',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Example Finance Person
INSERT INTO users (id, email, password, first_name, last_name, phone_number, role, created_at)
VALUES (
  gen_random_uuid(),
  'finance@alliance.test',
  '$2b$10$example.hashed.password.here', -- You'll need to hash this properly
  'Finance',
  'Manager',
  '+1234567892',
  'finance_person',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Example Ordinary User
INSERT INTO users (id, email, password, first_name, last_name, phone_number, role, created_at)
VALUES (
  gen_random_uuid(),
  'user@alliance.test',
  '$2b$10$example.hashed.password.here', -- You'll need to hash this properly
  'Regular',
  'User',
  '+1234567893',
  'ordinary_user',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create a constraint to ensure only valid roles are used
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('super_admin', 'finance_person', 'event_manager', 'ordinary_user'));

-- Create an index on role for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Display current role distribution
SELECT
  role,
  COUNT(*) as user_count,
  STRING_AGG(CONCAT(first_name, ' ', last_name, ' (', email, ')'), ', ') as users
FROM users
GROUP BY role
ORDER BY
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'finance_person' THEN 2
    WHEN 'event_manager' THEN 3
    WHEN 'ordinary_user' THEN 4
    ELSE 5
  END;

-- Create a view for role permissions (for reference)
CREATE OR REPLACE VIEW user_role_permissions AS
SELECT
  'super_admin' as role,
  'Full system access with all administrative privileges' as description,
  ARRAY[
    'users.*', 'events.*', 'registrations.*', 'finance.*',
    'admin.*', 'newsletter.*'
  ] as permissions
UNION ALL
SELECT
  'finance_person' as role,
  'Handles financial aspects, payments, and financial reporting' as description,
  ARRAY[
    'events.read', 'registrations.read_all', 'registrations.read_own',
    'registrations.update', 'registrations.export', 'finance.*',
    'admin.dashboard', 'admin.reports'
  ] as permissions
UNION ALL
SELECT
  'event_manager' as role,
  'Manages events and registrations (excluding payment processing)' as description,
  ARRAY[
    'events.*', 'registrations.read_all', 'registrations.read_own',
    'registrations.create', 'registrations.approve', 'registrations.cancel',
    'registrations.export', 'admin.dashboard', 'admin.analytics',
    'newsletter.read', 'newsletter.create'
  ] as permissions
UNION ALL
SELECT
  'ordinary_user' as role,
  'Basic user access for event registration and profile management' as description,
  ARRAY[
    'events.read', 'registrations.read_own', 'registrations.create'
  ] as permissions;

-- Display the role permissions
SELECT * FROM user_role_permissions ORDER BY
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'finance_person' THEN 2
    WHEN 'event_manager' THEN 3
    WHEN 'ordinary_user' THEN 4
  END;

COMMIT;

-- Notes for implementation:
-- 1. Replace the example hashed passwords with properly hashed passwords
-- 2. Update email addresses to real ones for your testing
-- 3. In production, create users through your application's registration system
-- 4. The role hierarchy is: super_admin > finance_person > event_manager > ordinary_user
-- 5. Event managers cannot update payment status or view payment evidence
-- 6. Only finance_person and super_admin can handle payments
-- 7. Make sure to update your authentication system to use these roles
