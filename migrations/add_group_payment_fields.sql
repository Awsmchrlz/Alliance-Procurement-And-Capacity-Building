-- Add group payment fields to event_registrations table
-- Migration: Add Group Payment Support
-- Date: 2025-01-17

-- Add new columns for group payment functionality
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS group_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS group_payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS group_payment_currency TEXT,
ADD COLUMN IF NOT EXISTS organization_reference TEXT;

-- Update payment_method enum to include new options
-- Note: In PostgreSQL, we need to add new enum values if using enum type
-- For now, we'll use text constraint or update the enum

-- Add comment for documentation
COMMENT ON COLUMN event_registrations.group_size IS 'Number of people in group registration (default 1 for individual)';
COMMENT ON COLUMN event_registrations.group_payment_amount IS 'Total amount paid for group registration';
COMMENT ON COLUMN event_registrations.group_payment_currency IS 'Currency for group payment (ZMW, USD)';
COMMENT ON COLUMN event_registrations.organization_reference IS 'Reference for organization/group payments (PO number, coordinator name, etc.)';

-- Create index for organization reference lookups
CREATE INDEX IF NOT EXISTS idx_event_registrations_org_reference 
ON event_registrations(organization_reference) 
WHERE organization_reference IS NOT NULL;

-- Create index for group payments
CREATE INDEX IF NOT EXISTS idx_event_registrations_group_payment 
ON event_registrations(payment_method, group_size) 
WHERE payment_method IN ('group_payment', 'org_paid');

-- Update existing records to have group_size = 1 for individual registrations
UPDATE event_registrations 
SET group_size = 1 
WHERE group_size IS NULL;

-- Make group_size NOT NULL with default 1
ALTER TABLE event_registrations 
ALTER COLUMN group_size SET NOT NULL,
ALTER COLUMN group_size SET DEFAULT 1;

COMMIT;