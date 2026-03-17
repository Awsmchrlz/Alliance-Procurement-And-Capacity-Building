-- Create the Ministry of Health 2026 National Seminar Event
-- Run this in your Supabase SQL Editor to UPDATE the event dates

-- First, delete the old event if it exists
DELETE FROM events WHERE title = '2026 NATIONAL SEMINAR "MINISTRY OF HEALTH"';

-- Now create it with correct 2026 dates
INSERT INTO events (
  id,
  title,
  description,
  start_date,
  end_date,
  location,
  price,
  current_attendees,
  max_attendees,
  image_url,
  tags,
  featured,
  created_at
) VALUES (
  gen_random_uuid(),
  '2026 NATIONAL SEMINAR "MINISTRY OF HEALTH"',
  'THEME: "STRENGTHENING RECORD MANAGEMENT AND INTERNAL CONTROLS TO ENHANCE VALUE FOR MONEY IN THE PUBLIC SECTOR" - Join us for this important national seminar focused on improving record management and internal controls in the public health sector.',
  '2026-03-25 08:00:00',  -- Group 1 start date (March 25, 2026)
  '2026-04-02 17:00:00',  -- Group 2 end date (April 2, 2026)
  'Livingstone, Zambia',
  '6500',
  0,
  500,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
  ARRAY['Ministry of Health', 'Record Management', 'Internal Controls', 'Public Sector', 'National Seminar', 'Livingstone'],
  true,  -- This makes it the featured event
  NOW()
);

-- Set all other events to NOT featured
UPDATE events 
SET featured = false 
WHERE title != '2026 NATIONAL SEMINAR "MINISTRY OF HEALTH"';

-- Verify the event was created correctly
SELECT id, title, featured, start_date, end_date, location FROM events ORDER BY featured DESC, start_date DESC;
