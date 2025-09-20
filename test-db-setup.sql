-- Test basic table creation
BEGIN;

-- Test creating sponsorships table
CREATE TABLE IF NOT EXISTS test_sponsorships (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT,
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    sponsorship_level TEXT NOT NULL CHECK (sponsorship_level IN ('platinum', 'gold', 'silver', 'bronze')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'ZMW')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test creating exhibitions table  
CREATE TABLE IF NOT EXISTS test_exhibitions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT,
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    booth_size TEXT DEFAULT 'standard' CHECK (booth_size IN ('standard', 'premium', 'custom')),
    amount DECIMAL(10,2) NOT NULL DEFAULT 7000.00 CHECK (amount > 0),
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'ZMW')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test insert
INSERT INTO test_sponsorships (company_name, contact_person, email, phone_number, sponsorship_level, amount) 
VALUES ('Test Company', 'John Doe', 'john@test.com', '+260977123456', 'gold', 13000);

INSERT INTO test_exhibitions (company_name, contact_person, email, phone_number, booth_size, amount)
VALUES ('Test Exhibitor', 'Jane Smith', 'jane@test.com', '+260977654321', 'premium', 10000);

-- Verify
SELECT 'Sponsorships created successfully' as result, count(*) as count FROM test_sponsorships;
SELECT 'Exhibitions created successfully' as result, count(*) as count FROM test_exhibitions;

-- Cleanup
DROP TABLE test_sponsorships;
DROP TABLE test_exhibitions;

COMMIT;

SELECT '✅ Database structure test completed successfully!' as status;