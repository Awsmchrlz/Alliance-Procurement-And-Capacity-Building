-- Alliance Procurement and Capacity Building - Enhanced RBAC Database Schema
-- This is the complete, secure schema with role-based access control
-- Run this script on a fresh Supabase database to set up everything

-- ============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. CREATE ENUMS FOR ROLE MANAGEMENT
-- ============================================================================

-- User role types
CREATE TYPE user_role AS ENUM (
    'ordinary_user',
    'event_manager',
    'finance_manager',
    'super_admin'
);

-- Payment status types
CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'completed',
    'cancelled',
    'failed'
);

-- Organization types
CREATE TYPE organization_type AS ENUM (
    'government',
    'private',
    'non-profit',
    'academic',
    'consulting',
    'other'
);

-- ============================================================================
-- 3. CREATE TABLES
-- ============================================================================

-- Users table (public.users) - stores additional user profile data
-- This works alongside Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    role user_role NOT NULL DEFAULT 'ordinary_user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    currency TEXT DEFAULT 'ZMW',
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    image_url TEXT,
    tags TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event registrations table - stores user registrations for events
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT UNIQUE NOT NULL,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Personal Information
    title TEXT,
    gender TEXT,
    country TEXT NOT NULL,
    organization TEXT NOT NULL,
    organization_type organization_type,
    position TEXT NOT NULL,
    notes TEXT,

    -- Payment Information
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cash_on_entry',
    currency TEXT DEFAULT 'ZMW',
    has_paid BOOLEAN DEFAULT FALSE,
    payment_evidence TEXT, -- file path or URL
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_verified_by UUID REFERENCES public.users(id),
    payment_notes TEXT,

    -- Metadata
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one registration per user per event (unless cancelled and re-registered)
    UNIQUE(event_id, user_id)
);

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    source TEXT DEFAULT 'website'
);

-- Audit log table for tracking important actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES public.users(id),
    user_email TEXT,
    user_role user_role,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_type TEXT, -- registration_confirmation, newsletter, admin_notification
    status TEXT DEFAULT 'sent', -- sent, delivered, bounced, failed
    external_id TEXT, -- Resend email ID
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE
);

-- User sessions table for enhanced security tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_token UUID DEFAULT gen_random_uuid(),
    ip_address INET,
    user_agent TEXT,
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(featured);
CREATE INDEX IF NOT EXISTS idx_events_active ON public.events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Event registrations indexes
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON public.event_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_number ON public.event_registrations(registration_number);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Email logs indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);

-- ============================================================================
-- 5. CREATE FUNCTIONS
-- ============================================================================

-- Function to generate registration numbers
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    next_number INTEGER;
BEGIN
    -- Get current year
    year_part := EXTRACT(year FROM NOW())::TEXT;

    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(registration_number FROM 'REG' || year_part || '-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.event_registrations
    WHERE registration_number LIKE 'REG' || year_part || '-%';

    -- Format with leading zeros
    sequence_part := LPAD(next_number::TEXT, 4, '0');

    RETURN 'REG' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendees()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment attendee count for new registration
        UPDATE public.events
        SET current_attendees = current_attendees + 1,
            updated_at = NOW()
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.payment_status != 'cancelled' AND NEW.payment_status = 'cancelled' THEN
            -- Decrement when cancelled
            UPDATE public.events
            SET current_attendees = current_attendees - 1,
                updated_at = NOW()
            WHERE id = NEW.event_id;
        ELSIF OLD.payment_status = 'cancelled' AND NEW.payment_status != 'cancelled' THEN
            -- Increment when reactivated
            UPDATE public.events
            SET current_attendees = current_attendees + 1,
                updated_at = NOW()
            WHERE id = NEW.event_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement attendee count for deleted registration
        UPDATE public.events
        SET current_attendees = current_attendees - 1,
            updated_at = NOW()
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    user_info RECORD;
BEGIN
    -- Get current user info from auth context
    SELECT id, email, raw_user_meta_data->>'role' as role
    INTO user_info
    FROM auth.users
    WHERE id = auth.uid();

    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, new_data,
            user_id, user_email, user_role, created_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW),
            user_info.id, user_info.email, user_info.role::user_role, NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, old_data, new_data,
            user_id, user_email, user_role, created_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW),
            user_info.id, user_info.email, user_info.role::user_role, NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, old_data,
            user_id, user_email, user_role, created_at
        ) VALUES (
            TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD),
            user_info.id, user_info.email, user_info.role::user_role, NOW()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. CREATE TRIGGERS
-- ============================================================================

-- Trigger to auto-generate registration numbers
CREATE TRIGGER trigger_generate_registration_number
    BEFORE INSERT ON public.event_registrations
    FOR EACH ROW
    WHEN (NEW.registration_number IS NULL)
    EXECUTE FUNCTION generate_registration_number();

-- Trigger to update event attendee counts
CREATE TRIGGER trigger_update_event_attendees
    AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_event_attendees();

-- Triggers for audit logging
CREATE TRIGGER trigger_audit_users
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER trigger_audit_events
    AFTER INSERT OR UPDATE OR DELETE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER trigger_audit_registrations
    AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log();

-- Triggers to update timestamps
CREATE TRIGGER trigger_update_users_timestamp
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_events_timestamp
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_registrations_timestamp
    BEFORE UPDATE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can manage all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('super_admin', 'event_manager', 'finance_manager')
        )
    );

-- Events table policies
CREATE POLICY "Anyone can view active events" ON public.events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Event managers can manage events" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('super_admin', 'event_manager')
        )
    );

-- Event registrations policies
CREATE POLICY "Users can view their own registrations" ON public.event_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations" ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON public.event_registrations
    FOR UPDATE USING (
        auth.uid() = user_id AND
        payment_status != 'cancelled' AND
        OLD.payment_status != 'cancelled'
    );

CREATE POLICY "Admins can view all registrations" ON public.event_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('super_admin', 'event_manager', 'finance_manager')
        )
    );

CREATE POLICY "Finance managers can update payment info" ON public.event_registrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('super_admin', 'finance_manager')
        )
    ) WITH CHECK (
        -- Only allow updating payment-related fields
        (OLD.event_id = event_id AND OLD.user_id = user_id AND OLD.registration_number = registration_number)
    );

CREATE POLICY "Super admins can manage all registrations" ON public.event_registrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Newsletter subscriptions policies
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage newsletter subscriptions" ON public.newsletter_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('super_admin', 'event_manager')
        )
    );

-- Audit logs policies (read-only for admins)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('super_admin', 'event_manager', 'finance_manager')
        )
    );

-- Email logs policies (read-only for admins)
CREATE POLICY "Admins can view email logs" ON public.email_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('super_admin', 'event_manager', 'finance_manager')
        )
    );

-- User sessions policies
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all sessions" ON public.user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- 8. CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for registration details with user and event info
CREATE OR REPLACE VIEW public.registration_details AS
SELECT
    r.id,
    r.registration_number,
    r.event_id,
    r.user_id,
    r.payment_status,
    r.payment_method,
    r.currency,
    r.has_paid,
    r.payment_evidence,
    r.payment_date,
    r.registered_at,
    r.updated_at,
    -- User details
    u.first_name,
    u.last_name,
    u.email,
    u.phone_number,
    -- Event details
    e.title as event_title,
    e.start_date,
    e.end_date,
    e.location,
    e.price as event_price,
    -- Personal info from registration
    r.title,
    r.gender,
    r.country,
    r.organization,
    r.organization_type,
    r.position,
    r.notes
FROM public.event_registrations r
JOIN public.users u ON r.user_id = u.id
JOIN public.events e ON r.event_id = e.id;

-- View for event statistics
CREATE OR REPLACE VIEW public.event_statistics AS
SELECT
    e.id,
    e.title,
    e.start_date,
    e.location,
    e.price,
    e.max_attendees,
    e.current_attendees,
    COUNT(r.id) as total_registrations,
    COUNT(CASE WHEN r.payment_status = 'paid' THEN 1 END) as paid_registrations,
    COUNT(CASE WHEN r.payment_status = 'pending' THEN 1 END) as pending_registrations,
    COUNT(CASE WHEN r.payment_status = 'cancelled' THEN 1 END) as cancelled_registrations,
    SUM(CASE WHEN r.payment_status = 'paid' THEN e.price ELSE 0 END) as total_revenue
FROM public.events e
LEFT JOIN public.event_registrations r ON e.id = r.event_id
WHERE e.is_active = true
GROUP BY e.id, e.title, e.start_date, e.location, e.price, e.max_attendees, e.current_attendees;

-- ============================================================================
-- 9. SEED DATA
-- ============================================================================

-- Create default super admin user (will be created via auth signup)
-- This is just a placeholder - actual user creation happens through Supabase Auth

-- Insert sample events (optional - remove in production)
INSERT INTO public.events (
    title,
    description,
    start_date,
    end_date,
    location,
    price,
    max_attendees,
    featured
) VALUES
(
    'Advanced Procurement Management',
    'Comprehensive training on modern procurement practices, contract management, and supplier relationships.',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '32 days',
    'Lusaka, Zambia',
    750.00,
    50,
    true
),
(
    'Supply Chain Excellence Workshop',
    'Learn best practices in supply chain optimization, risk management, and performance measurement.',
    NOW() + INTERVAL '45 days',
    NOW() + INTERVAL '47 days',
    'Ndola, Zambia',
    650.00,
    40,
    true
),
(
    'Financial Management for Procurement',
    'Essential financial skills for procurement professionals including budgeting, cost analysis, and ROI measurement.',
    NOW() + INTERVAL '60 days',
    NOW() + INTERVAL '62 days',
    'Livingstone, Zambia',
    800.00,
    30,
    false
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to service_role (for Supabase functions)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- SCHEMA COMPLETION
-- ============================================================================

-- Log schema creation
INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    new_data,
    user_email,
    created_at
) VALUES (
    'schema',
    gen_random_uuid(),
    'SCHEMA_CREATED',
    '{"version": "2.0", "features": ["RBAC", "audit_logging", "email_tracking", "session_management"]}',
    'system@allianceprocurementandcapacitybuilding.org',
    NOW()
);

-- Success message
SELECT 'Alliance PCBL Database Schema with Enhanced RBAC Successfully Created! 🎉' as status;
