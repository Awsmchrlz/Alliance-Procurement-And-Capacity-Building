-- Create public event registrations table
CREATE TABLE IF NOT EXISTS public_event_registrations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create function for generating public registration numbers
CREATE OR REPLACE FUNCTION generate_public_registration_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  reg_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(registration_number AS INTEGER)), 0) + 1
  INTO next_num
  FROM public_event_registrations
  WHERE registration_number ~ '^[0-9]+$';
  
  reg_number := LPAD(next_num::TEXT, 4, '0');
  RETURN reg_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate registration numbers
CREATE OR REPLACE FUNCTION set_public_registration_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.registration_number IS NULL OR NEW.registration_number = '' THEN
    NEW.registration_number := generate_public_registration_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS public_registration_number_trigger ON public_event_registrations;
CREATE TRIGGER public_registration_number_trigger
BEFORE INSERT ON public_event_registrations
FOR EACH ROW
EXECUTE FUNCTION set_public_registration_number();

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
