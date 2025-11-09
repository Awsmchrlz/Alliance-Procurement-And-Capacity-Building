-- Initial Database Schema
-- Run this first in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (syncs with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  gender TEXT,
  role TEXT NOT NULL DEFAULT 'ordinary_user',
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  location TEXT,
  price DECIMAL(10, 2) NOT NULL,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  image_url TEXT,
  tags TEXT[],
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT NOT NULL UNIQUE,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  event_id VARCHAR NOT NULL REFERENCES events(id),
  payment_status TEXT NOT NULL DEFAULT 'pending',
  registered_at TIMESTAMP DEFAULT NOW(),
  country TEXT,
  organization TEXT,
  position TEXT,
  notes TEXT,
  has_paid BOOLEAN DEFAULT false,
  payment_evidence TEXT,
  payment_method TEXT,
  currency TEXT,
  price_paid DECIMAL(10, 2),
  delegate_type TEXT,
  dinner_gala_attendance BOOLEAN DEFAULT false,
  accommodation_package BOOLEAN DEFAULT false,
  victoria_falls_package BOOLEAN DEFAULT false,
  boat_cruise_package BOOLEAN DEFAULT false,
  group_size INTEGER DEFAULT 1,
  group_payment_amount DECIMAL(10, 2),
  group_payment_currency TEXT,
  organization_reference TEXT,
  deleted_at TIMESTAMP
);

-- Create sponsorships table
CREATE TABLE IF NOT EXISTS sponsorships (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR NOT NULL REFERENCES events(id),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  website TEXT,
  company_address TEXT,
  sponsorship_level TEXT NOT NULL,
  logo_url TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_evidence TEXT,
  payment_method TEXT,
  special_requirements TEXT,
  marketing_materials TEXT,
  notes TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create exhibitions table
CREATE TABLE IF NOT EXISTS exhibitions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR NOT NULL REFERENCES events(id),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  website TEXT,
  company_address TEXT,
  booth_size TEXT DEFAULT 'standard',
  amount DECIMAL(10, 2) NOT NULL DEFAULT 7000.00,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_evidence TEXT,
  products_services TEXT,
  booth_requirements TEXT,
  electrical_requirements BOOLEAN DEFAULT false,
  internet_requirements BOOLEAN DEFAULT false,
  notes TEXT,
  logo_url TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscribed_at TIMESTAMP DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by VARCHAR NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_deleted_at ON event_registrations(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sponsorships_event ON sponsorships(event_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_deleted_at ON sponsorships(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exhibitions_event ON exhibitions(event_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_deleted_at ON exhibitions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

-- Create function for generating registration numbers
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  reg_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(registration_number AS INTEGER)), 0) + 1
  INTO next_num
  FROM event_registrations
  WHERE registration_number ~ '^[0-9]+$';
  
  reg_number := LPAD(next_num::TEXT, 4, '0');
  RETURN reg_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update event attendance
CREATE OR REPLACE FUNCTION update_event_attendance(event_id VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET current_attendees = (
    SELECT COUNT(*)
    FROM event_registrations
    WHERE event_registrations.event_id = update_event_attendance.event_id
      AND has_paid = true
      AND deleted_at IS NULL
  )
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts synced with Supabase Auth';
COMMENT ON TABLE events IS 'Training events and conferences';
COMMENT ON TABLE event_registrations IS 'User registrations for events';
COMMENT ON TABLE sponsorships IS 'Event sponsorship applications';
COMMENT ON TABLE exhibitions IS 'Event exhibition booth applications';
COMMENT ON TABLE documents IS 'Admin-uploaded documents accessible to all users';
COMMENT ON TABLE newsletter_subscriptions IS 'Newsletter email subscriptions';

COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN event_registrations.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN sponsorships.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN exhibitions.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN documents.deleted_at IS 'Soft delete timestamp';
