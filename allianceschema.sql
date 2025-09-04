-- Alliance Procurement and Capacity Building - Complete Database Schema
-- This is the definitive, foolproof schema for the entire application
-- Run this script on a fresh Supabase database to set up everything

-- ============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- Users table (public.users) - stores additional user profile data
-- This works alongside Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- This is for compatibility, actual auth is handled by Supabase
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    role TEXT NOT NULL DEFAULT 'ordinary_user' CHECK (role IN ('super_admin', 'finance_person', 'ordinary_user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table - stores all training events and workshops
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    image_url TEXT,
    tags TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event registrations table - stores user registrations for events
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'refunded')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Additional registration fields
    title TEXT, -- mr, dr, prof, etc.
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    country TEXT,
    organization TEXT,
    organization_type TEXT,
    position TEXT,
    notes TEXT,
    has_paid BOOLEAN DEFAULT FALSE,
    payment_evidence TEXT -- Path to uploaded payment evidence file
);

-- Newsletter subscriptions table - stores email newsletter subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(featured);
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);

-- Event registrations indexes
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON public.event_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_number ON public.event_registrations(registration_number);

-- Newsletter subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);

-- ============================================================================
-- 4. CREATE SEQUENCES AND FUNCTIONS
-- ============================================================================

-- Create sequence for registration numbers
CREATE SEQUENCE IF NOT EXISTS registration_number_seq START 1000;

-- Function to generate registration numbers
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'REG-' || LPAD(nextval('registration_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to increment event attendees
CREATE OR REPLACE FUNCTION increment_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.events 
    SET current_attendees = COALESCE(current_attendees, 0) + 1
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement event attendees
CREATE OR REPLACE FUNCTION decrement_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.events 
    SET current_attendees = GREATEST(COALESCE(current_attendees, 0) - 1, 0)
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CREATE TRIGGERS
-- ============================================================================

-- Trigger to auto-generate registration numbers
CREATE OR REPLACE FUNCTION set_registration_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_number IS NULL OR NEW.registration_number = '' THEN
        NEW.registration_number := generate_registration_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_registration_number
    BEFORE INSERT ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION set_registration_number();

-- Trigger to update event attendee count on registration
CREATE OR REPLACE FUNCTION update_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM increment_attendees(NEW.event_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM decrement_attendees(OLD.event_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_attendee_count
    AFTER INSERT OR DELETE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_attendee_count();

-- ============================================================================
-- 6. NEWSLETTER MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to auto-subscribe users to newsletter
CREATE OR REPLACE FUNCTION auto_subscribe_to_newsletter(user_email TEXT, user_name TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO public.newsletter_subscriptions (email, name)
    VALUES (user_email, COALESCE(user_name, user_email))
    ON CONFLICT (email) DO NOTHING;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to unsubscribe from newsletter
CREATE OR REPLACE FUNCTION unsubscribe_from_newsletter(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM public.newsletter_subscriptions WHERE email = user_email;
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to check subscription status
CREATE OR REPLACE FUNCTION is_user_subscribed(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM public.newsletter_subscriptions WHERE email = user_email);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'finance_person')
        )
    );

CREATE POLICY "Admins can insert users" ON public.users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'finance_person')
        )
    );

-- Events policies (public read, admin write)
CREATE POLICY "Anyone can view events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage events" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'finance_person')
        )
    );

-- Event registrations policies
CREATE POLICY "Users can view their own registrations" ON public.event_registrations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own registrations" ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own registrations" ON public.event_registrations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all registrations" ON public.event_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'finance_person')
        )
    );

CREATE POLICY "Admins can manage all registrations" ON public.event_registrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'finance_person')
        )
    );

-- Newsletter subscriptions policies
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own subscription" ON public.newsletter_subscriptions
    FOR SELECT USING (
        email IN (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all subscriptions" ON public.newsletter_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'finance_person')
        )
    );

-- ============================================================================
-- 8. SAMPLE DATA (OPTIONAL - UNCOMMENT TO INSERT)
-- ============================================================================

-- Sample events (uncomment to insert)
/*
INSERT INTO public.events (title, description, start_date, end_date, location, price, max_attendees, featured) VALUES
('Procurement Excellence Workshop', 'Learn advanced procurement strategies and best practices for modern organizations.', '2025-04-15 09:00:00+00', '2025-04-17 17:00:00+00', 'Cape Town, South Africa', 2500.00, 50, true),
('Supply Chain Management Masterclass', 'Comprehensive training on supply chain optimization and risk management.', '2025-05-20 09:00:00+00', '2025-05-22 17:00:00+00', 'Johannesburg, South Africa', 3000.00, 40, true),
('Digital Procurement Transformation', 'Modernize your procurement processes with digital tools and technologies.', '2025-06-10 09:00:00+00', '2025-06-12 17:00:00+00', 'Durban, South Africa', 2800.00, 35, false);
*/

-- ============================================================================
-- 9. STORAGE BUCKET SETUP (RUN IN SUPABASE DASHBOARD)
-- ============================================================================

-- Create storage bucket for payment evidence (run this in Supabase SQL editor)
/*
INSERT INTO storage.buckets (id, name, public) VALUES ('registrations', 'registrations', false);

-- Create storage policies for evidence files
CREATE POLICY "Users can upload their own evidence" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'registrations' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can view their own evidence" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'registrations' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Admins can view all evidence" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'registrations' AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'finance_person')
        )
    );
*/

-- ============================================================================
-- 10. VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'events', 'event_registrations', 'newsletter_subscriptions')
ORDER BY tablename;

-- Verify all functions were created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name IN (
        'generate_registration_number',
        'increment_attendees',
        'decrement_attendees',
        'auto_subscribe_to_newsletter',
        'unsubscribe_from_newsletter',
        'is_user_subscribed'
    )
ORDER BY routine_name;

-- Verify all triggers were created
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
    AND trigger_name IN (
        'trigger_set_registration_number',
        'trigger_update_attendee_count'
    )
ORDER BY trigger_name;

-- Show table row counts
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM public.users
UNION ALL
SELECT 
    'events' as table_name, COUNT(*) as row_count FROM public.events
UNION ALL
SELECT 
    'event_registrations' as table_name, COUNT(*) as row_count FROM public.event_registrations
UNION ALL
SELECT 
    'newsletter_subscriptions' as table_name, COUNT(*) as row_count FROM public.newsletter_subscriptions;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Your Alliance Procurement database is now ready!
-- 
-- Next steps:
-- 1. Set up your environment variables in .env
-- 2. Create the storage bucket in Supabase dashboard (see section 9)
-- 3. Run your application
-- 4. Create your first admin user through the registration flow
--
-- The first user to register will automatically become a super_admin.