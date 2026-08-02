-- Add user_id column to public_event_registrations, sponsorships, and exhibitions
-- This allows matching registrations to logged-in users by their auth ID,
-- not just by email (which users can mistype).

ALTER TABLE public_event_registrations ADD COLUMN IF NOT EXISTS user_id VARCHAR;
CREATE INDEX IF NOT EXISTS idx_public_registrations_user_id ON public_event_registrations(user_id);

ALTER TABLE sponsorships ADD COLUMN IF NOT EXISTS user_id VARCHAR;
CREATE INDEX IF NOT EXISTS idx_sponsorships_user_id ON sponsorships(user_id);

ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS user_id VARCHAR;
CREATE INDEX IF NOT EXISTS idx_exhibitions_user_id ON exhibitions(user_id);
