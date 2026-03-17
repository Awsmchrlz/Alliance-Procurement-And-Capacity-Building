-- Update the Ministry of Health event dates to 2026
-- Run this in your Supabase SQL Editor

-- Update the event dates from 2025 to 2026
UPDATE events 
SET 
  start_date = '2026-03-25 08:00:00',
  end_date = '2026-04-02 17:00:00',
  featured = true
WHERE title = '2026 NATIONAL SEMINAR "MINISTRY OF HEALTH"';

-- Make sure all other events are NOT featured
UPDATE events 
SET featured = false 
WHERE title != '2026 NATIONAL SEMINAR "MINISTRY OF HEALTH"';

-- Verify the update
SELECT id, title, featured, start_date, end_date, location 
FROM events 
ORDER BY featured DESC, start_date DESC;
