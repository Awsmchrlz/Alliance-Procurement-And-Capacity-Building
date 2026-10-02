-- Update event_registrations registration number format to WREG-XXXX
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  reg_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(registration_number FROM 6) AS INTEGER)), 0) + 1
  INTO next_num
  FROM event_registrations
  WHERE registration_number ~ '^WREG-[0-9]+$';
  
  reg_number := 'WREG-' || LPAD(next_num::TEXT, 4, '0');
  RETURN reg_number;
END;
$$ LANGUAGE plpgsql;

-- Update public_event_registrations registration number format to WREG-XXXX
CREATE OR REPLACE FUNCTION generate_public_registration_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  reg_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(registration_number FROM 6) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public_event_registrations
  WHERE registration_number ~ '^WREG-[0-9]+$';
  
  reg_number := 'WREG-' || LPAD(next_num::TEXT, 4, '0');
  RETURN reg_number;
END;
$$ LANGUAGE plpgsql;
