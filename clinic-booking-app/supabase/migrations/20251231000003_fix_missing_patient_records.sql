-- Migration: Fix missing patient records for existing users
-- Description: Create patient records for all users with role='patient' who don't have one
-- This is a one-time data fix

-- Insert patient records for users with patient role but no patient profile
INSERT INTO patients (user_id, phone, notification_preferences)
SELECT 
  u.id,
  '', -- empty phone
  '{"email": true, "sms": false}'::jsonb
FROM users u
WHERE u.role = 'patient'
  AND NOT EXISTS (
    SELECT 1 FROM patients p WHERE p.user_id = u.id
  );

-- Log the number of records created
DO $$
DECLARE
  record_count INTEGER;
BEGIN
  GET DIAGNOSTICS record_count = ROW_COUNT;
  RAISE NOTICE 'Created % missing patient records', record_count;
END $$;

COMMENT ON TABLE patients IS 'Fixed missing patient records for existing users with patient role';
