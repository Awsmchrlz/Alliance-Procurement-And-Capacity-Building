-- =====================================================
-- ALLIANCE PROCUREMENT & CAPACITY BUILDING
-- ULTIMATE DATABASE SETUP - ONE FILE TO RULE THEM ALL
-- =====================================================
-- 🎯 THE ONLY SQL FILE YOU NEED TO RUN
-- Safe to run multiple times (idempotent)
-- Run this in Supabase SQL Editor
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CLEANUP SECTION (Safe to run multiple times)
-- =====================================================

DO $$ 
BEGIN
    RAISE NOTICE '🧹 CLEANING UP FOR FRESH SETUP...';
END $$;

-- Drop existing constraints that might conflict
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'event_registrations_payment_method_check'
    ) THEN
        ALTER TABLE event_registrations DROP CONSTRAINT event_registrations_payment_method_check;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'event_registrations_payment_status_check'
    ) THEN
        ALTER TABLE event_registrations DROP CONSTRAINT event_registrations_payment_status_check;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'event_registrations_delegate_type_check'
    ) THEN
        ALTER TABLE event_registrations DROP CONSTRAINT event_registrations_delegate_type_check;
    END IF;
END $$;

-- =====================================================
-- 2. CORE TABLES SETUP
-- =====================================================

-- Users table (Enhanced for flexible auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL CHECK (length(first_name) >= 1),
    last_name TEXT NOT NULL CHECK (length(last_name) >= 1),
    email TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL CHECK (length(phone_number) >= 10),
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    role TEXT NOT NULL DEFAULT 'ordinary_user'
        CHECK (role IN ('super_admin', 'finance_person', 'event_manager', 'ordinary_user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table (Complete event management)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (length(title) >= 3),
    description TEXT NOT NULL CHECK (length(description) >= 10),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 100,
    
    -- Multi-currency pricing
    private_price DECIMAL(10,2),
    public_price DECIMAL(10,2),
    international_price DECIMAL(10,2),
    private_price_usd DECIMAL(10,2),
    public_price_usd DECIMAL(10,2),
    international_price_usd DECIMAL(10,2),
    
    -- Event management
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Business logic constraints
    CONSTRAINT check_positive_prices CHECK (
        (private_price IS NULL OR private_price >= 0) AND
        (public_price IS NULL OR public_price >= 0) AND
        (international_price IS NULL OR international_price >= 0) AND
        (private_price_usd IS NULL OR private_price_usd >= 0) AND
        (public_price_usd IS NULL OR public_price_usd >= 0) AND
        (international_price_usd IS NULL OR international_price_usd >= 0)
    ),
    CONSTRAINT check_positive_capacity CHECK (capacity > 0),
    CONSTRAINT check_valid_date_range CHECK (end_date >= start_date)
);

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- 3. EVENT REGISTRATIONS WITH GROUP PAYMENT SUPPORT
-- =====================================================

CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT UNIQUE NOT NULL,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Registration details
    country TEXT NOT NULL CHECK (length(country) >= 2),
    organization TEXT NOT NULL CHECK (length(organization) >= 2),
    position TEXT NOT NULL CHECK (length(position) >= 2),
    notes TEXT,
    
    -- Payment information
    has_paid BOOLEAN DEFAULT false,
    payment_status TEXT DEFAULT 'pending',
    payment_evidence TEXT,
    payment_method TEXT,
    currency TEXT DEFAULT 'ZMW',
    price_paid DECIMAL(10,2),
    delegate_type TEXT,
    
    -- 🆕 GROUP PAYMENT FIELDS
    group_size INTEGER DEFAULT 1 NOT NULL,
    group_payment_amount DECIMAL(10,2),
    group_payment_currency TEXT,
    organization_reference TEXT,
    
    -- Timestamps
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Business logic constraints
    CONSTRAINT check_positive_price_paid CHECK (price_paid IS NULL OR price_paid >= 0),
    CONSTRAINT check_positive_group_size CHECK (group_size >= 1),
    CONSTRAINT check_positive_group_amount CHECK (group_payment_amount IS NULL OR group_payment_amount >= 0)
);

-- Add new columns to existing table if they don't exist
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS group_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS group_payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS group_payment_currency TEXT,
ADD COLUMN IF NOT EXISTS organization_reference TEXT;

-- Ensure group_size is NOT NULL with proper default
ALTER TABLE event_registrations 
ALTER COLUMN group_size SET DEFAULT 1,
ALTER COLUMN group_size SET NOT NULL;

-- Update any existing NULL values
UPDATE event_registrations 
SET group_size = 1 
WHERE group_size IS NULL;

-- Add all constraints
ALTER TABLE event_registrations 
ADD CONSTRAINT event_registrations_payment_method_check 
CHECK (payment_method IN ('mobile', 'bank', 'cash', 'group_payment', 'org_paid') OR payment_method IS NULL);

ALTER TABLE event_registrations 
ADD CONSTRAINT event_registrations_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'cancelled'));

ALTER TABLE event_registrations 
ADD CONSTRAINT event_registrations_delegate_type_check 
CHECK (delegate_type IN ('private', 'public', 'international') OR delegate_type IS NULL);

-- =====================================================
-- 4. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to generate sequential registration numbers
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    SELECT COALESCE(
        (SELECT CAST(SUBSTRING(registration_number FROM '[0-9]+') AS INTEGER) + 1
         FROM event_registrations
         WHERE registration_number ~ '^[0-9]+$'
         ORDER BY CAST(SUBSTRING(registration_number FROM '[0-9]+') AS INTEGER) DESC
         LIMIT 1),
        1
    ) INTO next_number;
    
    formatted_number := LPAD(next_number::TEXT, 4, '0');
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Function to set registration number and update timestamp
CREATE OR REPLACE FUNCTION set_registration_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_number IS NULL OR NEW.registration_number = '' THEN
        NEW.registration_number := generate_registration_number();
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        first_name,
        last_name,
        email,
        phone_number,
        gender,
        role
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'firstName', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
        NEW.email,
        NEW.raw_user_meta_data->>'phoneNumber',
        NEW.raw_user_meta_data->>'gender',
        COALESCE(NEW.raw_user_meta_data->>'role', 'ordinary_user')
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create public user record: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_set_registration_number ON event_registrations;
CREATE TRIGGER trigger_set_registration_number
    BEFORE INSERT ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION set_registration_number();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_registrations_updated_at ON event_registrations;
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. PERFORMANCE INDEXES
-- =====================================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active, start_date);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions(is_active, email);

-- Registration indexes
CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON event_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_number ON event_registrations(registration_number);

-- 🆕 GROUP PAYMENT INDEXES
CREATE INDEX IF NOT EXISTS idx_event_registrations_org_ref 
ON event_registrations(organization_reference) 
WHERE organization_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_registrations_group_payment 
ON event_registrations(payment_method, group_size) 
WHERE payment_method IN ('group_payment', 'org_paid');

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can manage users" ON users;
DROP POLICY IF EXISTS "Events are publicly readable" ON events;
DROP POLICY IF EXISTS "Event managers can manage events" ON events;
DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can insert own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can manage registrations" ON event_registrations;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscriptions;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'finance_person', 'event_manager')
        )
    );

CREATE POLICY "Super admins can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- Events policies (public read)
CREATE POLICY "Events are publicly readable" ON events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Event managers can manage events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'event_manager')
        )
    );

-- Event registrations policies
CREATE POLICY "Users can view own registrations" ON event_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own registrations" ON event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registrations" ON event_registrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations" ON event_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'finance_person', 'event_manager')
        )
    );

CREATE POLICY "Admins can manage registrations" ON event_registrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'finance_person', 'event_manager')
        )
    );

-- Newsletter policies (public insert)
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 7. STORAGE BUCKET FOR PAYMENT EVIDENCE
-- =====================================================

-- Create storage bucket for payment evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-evidence', 'payment-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload payment evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own payment evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own payment evidence" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all evidence" ON storage.objects;
DROP POLICY IF EXISTS "Anyone authenticated can upload evidence" ON storage.objects;
DROP POLICY IF EXISTS "Anyone authenticated can view evidence" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update evidence" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete evidence" ON storage.objects;

-- Storage policies for payment evidence
CREATE POLICY "Users can upload payment evidence" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'payment-evidence' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own payment evidence" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'payment-evidence' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own payment evidence" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'payment-evidence' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins can view all evidence" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'payment-evidence' AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'finance_person', 'event_manager')
        )
    );

-- =====================================================
-- 8. SAMPLE DATA (OPTIONAL - UNCOMMENT IF NEEDED)
-- =====================================================

/*
-- Sample event (uncomment if you want sample data)
INSERT INTO events (
    title, 
    description, 
    start_date, 
    end_date, 
    location, 
    capacity,
    private_price, 
    public_price, 
    international_price,
    private_price_usd, 
    public_price_usd, 
    international_price_usd,
    is_active,
    featured
) VALUES (
    'Alliance Procurement Summit 2025',
    'Annual procurement and capacity building conference with expert speakers and networking opportunities.',
    '2025-03-15 09:00:00+00',
    '2025-03-17 17:00:00+00',
    'Lusaka, Zambia',
    200,
    5000.00, 7000.00, 15000.00,
    200.00, 280.00, 600.00,
    true,
    true
) ON CONFLICT DO NOTHING;
*/

COMMIT;

-- =====================================================
-- 9. VERIFICATION QUERIES
-- =====================================================

-- Verify all tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'events', 'event_registrations', 'newsletter_subscriptions')
ORDER BY tablename;

-- Verify group payment columns
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
AND column_name IN ('group_size', 'group_payment_amount', 'group_payment_currency', 'organization_reference')
ORDER BY column_name;

-- Verify constraints
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%event_registrations%'
ORDER BY constraint_name;

-- Verify indexes
SELECT 
    indexname,
    tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'events', 'event_registrations', 'newsletter_subscriptions')
ORDER BY tablename, indexname;

-- Success message
SELECT '🎉 ULTIMATE DATABASE SETUP COMPLETED SUCCESSFULLY!' as status,
       '✅ All tables, functions, triggers, indexes, and policies are ready' as details,
       '🚀 Your Alliance Procurement platform is production-ready!' as next_step;

-- =====================================================
-- END OF ULTIMATE SETUP
-- =====================================================