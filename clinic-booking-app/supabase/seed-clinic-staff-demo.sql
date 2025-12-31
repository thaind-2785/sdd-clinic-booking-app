-- Seed demo clinic staff account
-- Run this after creating staff@clinic.com account via UI

-- This SQL assumes you've created auth user with email: staff@clinic.com
-- Get the user ID from auth.users table first, then run this:

-- Example (replace 'your-user-id-here' with actual UUID from auth.users):
/*
-- 1. Update user role
UPDATE users 
SET role = 'clinic_staff' 
WHERE email = 'staff@clinic.com';

-- 2. Create clinic_staff record (pick any existing clinic_id)
INSERT INTO clinic_staff (user_id, clinic_id, position, permissions)
SELECT 
  id as user_id,
  (SELECT id FROM clinics WHERE is_active = true LIMIT 1) as clinic_id,
  'Quản lý' as position,
  '{"manage_appointments": true, "manage_schedule": true}'::jsonb as permissions
FROM users 
WHERE email = 'staff@clinic.com'
ON CONFLICT (user_id, clinic_id) DO NOTHING;
*/

-- Or create directly if you know the IDs:
-- INSERT INTO clinic_staff (user_id, clinic_id, position, permissions) VALUES
--   ('paste-user-id-here', 'paste-clinic-id-here', 'Quản lý', '{"manage_appointments": true, "manage_schedule": true}')
-- ON CONFLICT (user_id, clinic_id) DO NOTHING;
