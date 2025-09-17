-- Group Payment Feature Migration for Supabase
-- Safe to run multiple times (idempotent)

-- First, check if there's a constraint on payment_method and drop it
DO $$ 
BEGIN
    -- Drop existing check constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'event_registrations_payment_method_check'
    ) THEN
        ALTER TABLE event_registrations DROP CONSTRAINT event_registrations_payment_method_check;
    END IF;
END $$;

-- Add new columns only if they don't exist
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS group_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS group_payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS group_payment_currency TEXT,
ADD COLUMN IF NOT EXISTS organization_reference TEXT;

-- Set group_size to NOT NULL with default after adding column
ALTER TABLE event_registrations 
ALTER COLUMN group_size SET DEFAULT 1,
ALTER COLUMN group_size SET NOT NULL;

-- Update any existing NULL values
UPDATE event_registrations 
SET group_size = 1 
WHERE group_size IS NULL;

-- Add updated check constraint that includes new payment methods
ALTER TABLE event_registrations 
ADD CONSTRAINT event_registrations_payment_method_check 
CHECK (payment_method IN ('mobile', 'bank', 'cash', 'group_payment', 'org_paid') OR payment_method IS NULL);

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_event_registrations_org_ref 
ON event_registrations(organization_reference) 
WHERE organization_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_registrations_group_payment 
ON event_registrations(payment_method, group_size) 
WHERE payment_method IN ('group_payment', 'org_paid');

-- Verify the migration worked
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
AND column_name IN ('group_size', 'group_payment_amount', 'group_payment_currency', 'organization_reference')
ORDER BY column_name;