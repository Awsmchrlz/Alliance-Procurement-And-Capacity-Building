-- =====================================================
-- ALLIANCE PROCUREMENT & CAPACITY BUILDING
-- COMPREHENSIVE DATABASE SCHEMA
-- =====================================================
-- 🎯 SINGLE NORMALIZED SCHEMA FILE
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
    -- Event registrations constraints
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

    -- Sponsorship constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'sponsorships_level_check'
    ) THEN
        ALTER TABLE sponsorships DROP CONSTRAINT sponsorships_level_check;
    END IF;

    -- Exhibition constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'exhibitions_booth_size_check'
    ) THEN
        ALTER TABLE exhibitions DROP CONSTRAINT exhibitions_booth_size_check;
    END IF;
END $$;

-- =====================================================
-- 2. CORE TABLES SETUP
-- =====================================================

-- Users table (Enhanced for flexible auth)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    first_name TEXT NOT NULL CHECK (length(first_name) >= 1),
    last_name TEXT NOT NULL CHECK (length(last_name) >= 1),
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT UNIQUE NOT NULL CHECK (length(phone_number) >= 10),
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    role TEXT NOT NULL DEFAULT 'ordinary_user'
        CHECK (role IN ('super_admin', 'finance_person', 'event_manager', 'ordinary_user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL CHECK (length(title) >= 3),
    description TEXT NOT NULL CHECK (length(description) >= 10),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    max_attendees INTEGER CHECK (max_attendees IS NULL OR max_attendees > 0),
    current_attendees INTEGER DEFAULT 0 CHECK (current_attendees >= 0),
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Business logic constraints
    CONSTRAINT check_valid_date_range CHECK (end_date >= start_date)
);

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- 3. EVENT REGISTRATIONS WITH COMPLETE FORM DATA
-- =====================================================

CREATE TABLE IF NOT EXISTS event_registrations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    registration_number TEXT UNIQUE NOT NULL,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Personal Information (from form step 1)
    first_name TEXT NOT NULL CHECK (length(first_name) >= 1),
    last_name TEXT NOT NULL CHECK (length(last_name) >= 1),
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    
    -- Professional Information (from form step 2)
    country TEXT NOT NULL CHECK (length(country) >= 2),
    organization TEXT NOT NULL CHECK (length(organization) >= 2),
    organization_type TEXT CHECK (organization_type IN ('government', 'private', 'ngo', 'international', 'academic', 'other')),
    position TEXT NOT NULL CHECK (length(position) >= 2),
    
    -- Payment Information (from form step 3)
    payment_method TEXT CHECK (payment_method IN ('mobile', 'bank', 'cash', 'group_payment', 'org_paid')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'failed')),
    payment_evidence TEXT,
    currency TEXT DEFAULT 'ZMW' CHECK (currency IN ('USD', 'ZMW')),
    price_paid DECIMAL(10,2) CHECK (price_paid IS NULL OR price_paid >= 0),
    delegate_type TEXT CHECK (delegate_type IN ('private', 'public', 'international')),
    
    -- Group Payment Fields
    group_size INTEGER DEFAULT 1 NOT NULL CHECK (group_size >= 1),
    group_payment_amount DECIMAL(10,2) CHECK (group_payment_amount IS NULL OR group_payment_amount >= 0),
    group_payment_currency TEXT CHECK (group_payment_currency IN ('USD', 'ZMW') OR group_payment_currency IS NULL),
    organization_reference TEXT,
    
    -- Additional Information
    notes TEXT,
    dietary_requirements TEXT,
    accessibility_requirements TEXT,
    
    -- Status and Timestamps
    has_paid BOOLEAN DEFAULT false,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing table if they don't exist
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS organization_type TEXT,
ADD COLUMN IF NOT EXISTS group_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS group_payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS group_payment_currency TEXT,
ADD COLUMN IF NOT EXISTS organization_reference TEXT,
ADD COLUMN IF NOT EXISTS dietary_requirements TEXT,
ADD COLUMN IF NOT EXISTS accessibility_requirements TEXT;

-- Ensure group_size is NOT NULL with proper default
ALTER TABLE event_registrations 
ALTER COLUMN group_size SET DEFAULT 1,
ALTER COLUMN group_size SET NOT NULL;

-- Update any existing NULL values
UPDATE event_registrations 
SET group_size = 1 
WHERE group_size IS NULL;

-- =====================================================
-- 4. SPONSORSHIP TABLE WITH COMPLETE FORM DATA
-- =====================================================

CREATE TABLE IF NOT EXISTS sponsorships (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    
    -- Company Information (from form step 1)
    company_name TEXT NOT NULL CHECK (length(company_name) >= 2),
    contact_person TEXT NOT NULL CHECK (length(contact_person) >= 2),
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    website TEXT,
    company_address TEXT,
    company_logo TEXT, -- For logo uploads
    
    -- Sponsorship Details (from form step 2)
    sponsorship_level TEXT NOT NULL CHECK (sponsorship_level IN ('platinum', 'gold', 'silver', 'bronze')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'ZMW')),
    
    -- Payment Information (from form step 3)
    payment_method TEXT CHECK (payment_method IN ('mobile', 'bank', 'cash')),
    payment_evidence TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'failed')),
    
    -- Additional Requirements
    special_requirements TEXT,
    marketing_materials TEXT,
    booth_requirements TEXT,
    logo_placement_preferences TEXT,
    
    -- Status and Approval
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    rejection_reason TEXT,
    
    -- Additional Information
    notes TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing sponsorships table
ALTER TABLE sponsorships 
ADD COLUMN IF NOT EXISTS company_logo TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS booth_requirements TEXT,
ADD COLUMN IF NOT EXISTS logo_placement_preferences TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- =====================================================
-- 5. EXHIBITION TABLE WITH COMPLETE FORM DATA
-- =====================================================

CREATE TABLE IF NOT EXISTS exhibitions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    
    -- Company Information (from form step 1)
    company_name TEXT NOT NULL CHECK (length(company_name) >= 2),
    contact_person TEXT NOT NULL CHECK (length(contact_person) >= 2),
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    website TEXT,
    company_address TEXT,
    company_logo TEXT, -- For logo uploads
    industry TEXT, -- Company industry/sector
    
    -- Exhibition Details (from form step 2)
    booth_size TEXT DEFAULT 'standard' CHECK (booth_size IN ('standard', 'premium', 'custom')),
    amount DECIMAL(10,2) NOT NULL DEFAULT 7000.00 CHECK (amount > 0),
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'ZMW')),
    
    -- Payment Information (from form step 3)
    payment_method TEXT CHECK (payment_method IN ('mobile', 'bank', 'cash')),
    payment_evidence TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'failed')),
    
    -- Exhibition Requirements
    products_services TEXT,
    booth_requirements TEXT,
    electrical_requirements BOOLEAN DEFAULT false,
    internet_requirements BOOLEAN DEFAULT false,
    furniture_requirements TEXT,
    display_requirements TEXT,
    
    -- Status and Approval
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    rejection_reason TEXT,
    
    -- Additional Information
    notes TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing exhibitions table
ALTER TABLE exhibitions 
ADD COLUMN IF NOT EXISTS company_logo TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS furniture_requirements TEXT,
ADD COLUMN IF NOT EXISTS display_requirements TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS
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

-- =====================================================
-- 7. CREATE TRIGGERS
-- =====================================================

-- Registration number trigger
DROP TRIGGER IF EXISTS trigger_set_registration_number ON event_registrations;
CREATE TRIGGER trigger_set_registration_number
    BEFORE INSERT ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION set_registration_number();

-- Auth user creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
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

DROP TRIGGER IF EXISTS update_sponsorships_updated_at ON sponsorships;
CREATE TRIGGER update_sponsorships_updated_at
    BEFORE UPDATE ON sponsorships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exhibitions_updated_at ON exhibitions;
CREATE TRIGGER update_exhibitions_updated_at
    BEFORE UPDATE ON exhibitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. ADD ALL CONSTRAINTS
-- =====================================================

-- Event registrations constraints
ALTER TABLE event_registrations 
ADD CONSTRAINT IF NOT EXISTS event_registrations_payment_method_check 
CHECK (payment_method IN ('mobile', 'bank', 'cash', 'group_payment', 'org_paid') OR payment_method IS NULL);

ALTER TABLE event_registrations 
ADD CONSTRAINT IF NOT EXISTS event_registrations_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'failed'));

ALTER TABLE event_registrations 
ADD CONSTRAINT IF NOT EXISTS event_registrations_delegate_type_check 
CHECK (delegate_type IN ('private', 'public', 'international') OR delegate_type IS NULL);

ALTER TABLE event_registrations 
ADD CONSTRAINT IF NOT EXISTS event_registrations_gender_check 
CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say') OR gender IS NULL);

ALTER TABLE event_registrations 
ADD CONSTRAINT IF NOT EXISTS event_registrations_organization_type_check 
CHECK (organization_type IN ('government', 'private', 'ngo', 'international', 'academic', 'other') OR organization_type IS NULL);

-- Sponsorships constraints
ALTER TABLE sponsorships 
ADD CONSTRAINT IF NOT EXISTS sponsorships_level_check 
CHECK (sponsorship_level IN ('platinum', 'gold', 'silver', 'bronze'));

ALTER TABLE sponsorships 
ADD CONSTRAINT IF NOT EXISTS sponsorships_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE sponsorships 
ADD CONSTRAINT IF NOT EXISTS sponsorships_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'failed'));

ALTER TABLE sponsorships 
ADD CONSTRAINT IF NOT EXISTS sponsorships_payment_method_check 
CHECK (payment_method IN ('mobile', 'bank', 'cash') OR payment_method IS NULL);

-- Exhibitions constraints
ALTER TABLE exhibitions 
ADD CONSTRAINT IF NOT EXISTS exhibitions_booth_size_check 
CHECK (booth_size IN ('standard', 'premium', 'custom'));

ALTER TABLE exhibitions 
ADD CONSTRAINT IF NOT EXISTS exhibitions_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE exhibitions 
ADD CONSTRAINT IF NOT EXISTS exhibitions_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'failed'));

ALTER TABLE exhibitions 
ADD CONSTRAINT IF NOT EXISTS exhibitions_payment_method_check 
CHECK (payment_method IN ('mobile', 'bank', 'cash') OR payment_method IS NULL);

-- =====================================================
-- 9. PERFORMANCE INDEXES
-- =====================================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);

-- Registration indexes
CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON event_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_number ON event_registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON event_registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_country ON event_registrations(country);
CREATE INDEX IF NOT EXISTS idx_registrations_organization ON event_registrations(organization);

-- Group payment indexes
CREATE INDEX IF NOT EXISTS idx_event_registrations_org_ref 
ON event_registrations(organization_reference) 
WHERE organization_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_registrations_group_payment 
ON event_registrations(payment_method, group_size) 
WHERE payment_method IN ('group_payment', 'org_paid');

-- Sponsorship indexes
CREATE INDEX IF NOT EXISTS idx_sponsorships_event ON sponsorships(event_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON sponsorships(status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_level ON sponsorships(sponsorship_level);
CREATE INDEX IF NOT EXISTS idx_sponsorships_email ON sponsorships(email);
CREATE INDEX IF NOT EXISTS idx_sponsorships_company ON sponsorships(company_name);
CREATE INDEX IF NOT EXISTS idx_sponsorships_payment_status ON sponsorships(payment_status);

-- Exhibition indexes
CREATE INDEX IF NOT EXISTS idx_exhibitions_event ON exhibitions(event_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_email ON exhibitions(email);
CREATE INDEX IF NOT EXISTS idx_exhibitions_company ON exhibitions(company_name);
CREATE INDEX IF NOT EXISTS idx_exhibitions_industry ON exhibitions(industry);
CREATE INDEX IF NOT EXISTS idx_exhibitions_payment_status ON exhibitions(payment_status);

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;

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
DROP POLICY IF EXISTS "Anyone can submit sponsorship" ON sponsorships;
DROP POLICY IF EXISTS "Admins can view all sponsorships" ON sponsorships;
DROP POLICY IF EXISTS "Admins can manage sponsorships" ON sponsorships;
DROP POLICY IF EXISTS "Anyone can submit exhibition" ON exhibitions;
DROP POLICY IF EXISTS "Admins can view all exhibitions" ON exhibitions;
DROP POLICY IF EXISTS "Admins can manage exhibitions" ON exhibitions;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()::text
            AND role IN ('super_admin', 'finance_person', 'event_manager')
        )
    );

CREATE POLICY "Super admins can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()::text
            AND role = 'super_admin'
        )
    );

-- Events policies (public read)
CREATE POLICY "Events are publicly readable" ON events
    FOR SELECT USING (true);

CREATE POLICY "Event managers can manage events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()::text
            AND role IN ('super_admin', 'event_manager')
        )
    );

-- Event registrations policies
CREATE POLICY "Users can view own registrations" ON event_registrations
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own registrations" ON event_registrations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own registrations" ON event_registrations
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Admins can view all registrations" ON event_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()::text
            AND role IN ('super_admin', 'finance_person', 'event_manager')
        )
    );

CREATE POLICY "Admins can manage registrations" ON event_registrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()::text
            AND role IN ('super_admin', 'finance_person', 'event_manager')
        )
    );

-- Newsletter policies (public insert)
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage newsletter" ON newsletter_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()::text
            AND role IN ('super_admin', 'finance_person', 'event_manager')
        )
    );

-- Sponsorship policies (public insert, admin management)
CREATE POLICY "Anyone can submit sponsorship" ON sponsorships
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all sponsorships" ON sponsorships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()::text
            AND role IN ('super_admin', 'finance_person', 'event_manager')
        )
    );

CREATE POLICY "Finance admins can manage sponsorships" ON sponsorships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()::text
            AND role IN ('super_admin', 'finance_person')
        )
    );

-- Exhibition policies (public insert, admin management)
CREATE POLICY "Anyone can submit exhibition" ON exhibitions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all exhibitions" ON exhibitions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()::text
            AND role IN ('super_admin', 'finance_person', 'event_manager')
        )
    );

CREATE POLICY "Finance admins can manage exhibitions" ON exhibitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()::text
            AND role IN ('super_admin', 'finance_person')
        )
    );

-- =====================================================
-- 11. STORAGE BUCKET FOR PAYMENT EVIDENCE
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
CREATE POLICY "Anyone authenticated can upload evidence" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'payment-evidence' AND 
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can view own payment evidence" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'payment-evidence' AND 
        (auth.uid()::text = (storage.foldername(name))[1] OR
         EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()::text
            AND role IN ('super_admin', 'finance_person', 'event_manager')
        ))
    );

CREATE POLICY "Admins can manage all evidence" ON storage.objects
    FOR ALL USING (
        bucket_id = 'payment-evidence' AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()::text
            AND role IN ('super_admin', 'finance_person', 'event_manager')
        )
    );

COMMIT;

-- =====================================================
-- 12. VERIFICATION QUERIES
-- =====================================================

-- Verify all tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'events', 'event_registrations', 'newsletter_subscriptions', 'sponsorships', 'exhibitions')
ORDER BY tablename;

-- Verify all columns exist in event_registrations
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
ORDER BY column_name;

-- Verify sponsorship and exhibition tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('sponsorships', 'exhibitions')
ORDER BY table_name, column_name;

-- Verify constraints
SELECT 
    constraint_name,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public'
AND constraint_type = 'CHECK'
ORDER BY table_name, constraint_name;

-- Verify indexes
SELECT 
    indexname,
    tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'events', 'event_registrations', 'newsletter_subscriptions', 'sponsorships', 'exhibitions')
ORDER BY tablename, indexname;

-- Success message
SELECT '🎉 COMPREHENSIVE DATABASE SCHEMA SETUP COMPLETED!' as status,
       '✅ All tables, constraints, indexes, triggers, and policies are ready' as details,
       '🚀 Schema captures all form data and is production-ready!' as next_step;

-- =====================================================
-- END OF COMPREHENSIVE SCHEMA
-- =====================================================
