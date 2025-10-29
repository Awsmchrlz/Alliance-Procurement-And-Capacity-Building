-- Add soft delete columns to tables
-- Migration: Add deletedAt timestamp for soft delete functionality

-- Add deletedAt to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add deletedAt to event_registrations table
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add deletedAt to sponsorships table
ALTER TABLE sponsorships ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add deletedAt to exhibitions table
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create indexes for better query performance on soft-deleted records
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_event_registrations_deleted_at ON event_registrations(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sponsorships_deleted_at ON sponsorships(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exhibitions_deleted_at ON exhibitions(deleted_at) WHERE deleted_at IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp - NULL means active, timestamp means deleted';
COMMENT ON COLUMN event_registrations.deleted_at IS 'Soft delete timestamp - NULL means active, timestamp means deleted';
COMMENT ON COLUMN sponsorships.deleted_at IS 'Soft delete timestamp - NULL means active, timestamp means deleted';
COMMENT ON COLUMN exhibitions.deleted_at IS 'Soft delete timestamp - NULL means active, timestamp means deleted';
