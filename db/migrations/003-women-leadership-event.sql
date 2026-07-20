-- ============================================
-- Women in Leadership and Governance Seminar
-- Database Migration Script
-- ============================================

-- Step 1: Add new columns to public_event_registrations table
ALTER TABLE public_event_registrations 
ADD COLUMN IF NOT EXISTS delegate_type TEXT,
ADD COLUMN IF NOT EXISTS include_gala BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS include_accommodation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS include_boat_cruise BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS position TEXT;

-- Step 2: Create the Women in Leadership event
INSERT INTO events (
  id,
  title,
  description,
  start_date,
  end_date,
  location,
  price,
  max_attendees,
  current_attendees,
  image_url,
  tags,
  featured,
  created_at
) VALUES (
  gen_random_uuid(),
  'Women in Leadership and Governance Seminar 2026',
  'The Alliance Procurement & Capacity Building Africa Indaba 2026 warmly invites you to the International Conference on Women in Leadership, Governance and Business, taking place 28–30 October 2026 at the breathtaking Avani Victoria Falls Resort, Livingstone, Zambia. Theme: "EMPOWERING WOMEN FOR SUSTAINABLE LEADERSHIP: DRIVING GOVERNANCE AND BUSINESS IN THE 21ST CENTURY". Join us for three transformative days featuring plenary sessions, panel discussions, breakout workshops, networking opportunities with distinguished leaders and policymakers, and capacity building sessions designed to empower women in leadership roles across governance and business sectors.',
  '2026-10-28 08:00:00+00',
  '2026-10-30 18:00:00+00',
  'Avani Victoria Falls Resort, Livingstone, Zambia',
  10500.00,
  500,
  0,
  'https://res.cloudinary.com/duu5rnmeu/image/upload/v1784542196/Women-in-leadership_mqfj1y.jpg',
  ARRAY['leadership', 'governance', 'women empowerment', 'business', 'conference', 'capacity building'],
  true,
  NOW()
);

-- Step 3: Verify the event was created successfully
SELECT 
  id, 
  title, 
  start_date, 
  end_date,
  location, 
  price,
  featured, 
  image_url 
FROM events 
WHERE title LIKE '%Women in Leadership%';

-- Done! Event is now ready for registrations.
