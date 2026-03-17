-- Create the Ministry of Health 2026 National Seminar Event
-- Run this in your Supabase SQL Editor

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
  '2025-03-25 08:00:00',  -- Group 1 start date
  '2025-04-02 17:00:00',  -- Group 2 end date
  'Livingstone, Zambia',
  '6500',
  0,
  500,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
  ARRAY['Ministry of Health', 'Record Management', 'Internal Controls', 'Public Sector', 'National Seminar', 'Livingstone'],
  true,  -- This makes it the featured event
  NOW()
);

-- Verify the event was created
SELECT id, title, featured, start_date, location FROM events WHERE title LIKE '%MINISTRY OF HEALTH%';
