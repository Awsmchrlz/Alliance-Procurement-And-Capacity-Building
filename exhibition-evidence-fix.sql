-- =====================================================
-- EXHIBITION EVIDENCE & LOGO MANAGEMENT FIX
-- Add missing columns for evidence and admin logo management
-- =====================================================

BEGIN;

-- Add payment_evidence column if it doesn't exist
ALTER TABLE exhibitions 
ADD COLUMN IF NOT EXISTS payment_evidence TEXT;

-- Add payment_method column if it doesn't exist  
ALTER TABLE exhibitions 
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add company_logo column if it doesn't exist (for admin management)
ALTER TABLE exhibitions 
ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- Add company_logo column to sponsorships if it doesn't exist (for admin management)
ALTER TABLE sponsorships 
ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- Add constraints for payment_method if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'exhibitions_payment_method_check'
    ) THEN
        ALTER TABLE exhibitions 
        ADD CONSTRAINT exhibitions_payment_method_check 
        CHECK (payment_method IN ('mobile', 'bank', 'cash') OR payment_method IS NULL);
    END IF;
END $$;

-- Verify the columns exist
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('exhibitions', 'sponsorships') 
AND column_name IN ('payment_evidence', 'payment_method', 'company_logo')
ORDER BY table_name, column_name;

COMMIT;

SELECT '✅ Exhibition evidence and logo columns added successfully!' as status;
