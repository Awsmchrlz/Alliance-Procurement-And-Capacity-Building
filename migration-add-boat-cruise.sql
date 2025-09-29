-- Migration: Add boat cruise package column
-- Date: 2024-09-28
-- Description: Adds boat_cruise_package column to event_registrations table

-- Add the boat_cruise_package column
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS boat_cruise_package BOOLEAN DEFAULT false;

-- Add index for the new column
CREATE INDEX IF NOT EXISTS idx_registrations_boat_cruise_package 
ON event_registrations(boat_cruise_package);

-- Add comment for the new column
COMMENT ON COLUMN event_registrations.boat_cruise_package IS 'Whether delegate selected boat cruise package';

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
AND column_name = 'boat_cruise_package';