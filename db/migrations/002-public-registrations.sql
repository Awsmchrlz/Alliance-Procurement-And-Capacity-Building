-- Create public event registrations table
CREATE TABLE IF NOT EXISTS public_event_registrations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id VARCHAR NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registration_group TEXT NOT NULL CHECK (registration_group IN ('group1', 'group2')),
  full_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  gender TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  title TEXT NOT NULL,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  payment_modes TEXT[] NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_public_registrations_event ON public_event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_public_registrations_email ON public_event_registrations(email);
CREATE INDEX IF NOT EXISTS idx_public_registrations_status ON public_event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_public_registrations_created ON public_event_registrations(created_at DESC);

-- Add RLS policies (optional - for security)
ALTER TABLE public_event_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for the registration form)
CREATE POLICY "Allow public insert" ON public_event_registrations
  FOR INSERT
  WITH CHECK (true);

-- Allow admins to view all
CREATE POLICY "Allow admin select" ON public_event_registrations
  FOR SELECT
  USING (true);

-- Allow admins to update
CREATE POLICY "Allow admin update" ON public_event_registrations
  FOR UPDATE
  USING (true);

-- Allow admins to delete
CREATE POLICY "Allow admin delete" ON public_event_registrations
  FOR DELETE
  USING (true);
