-- Check which users are missing patient records
SELECT 
  u.id,
  u.email,
  u.role,
  CASE 
    WHEN p.user_id IS NOT NULL THEN 'HAS RECORD'
    ELSE 'MISSING'
  END as patient_status
FROM users u
LEFT JOIN patients p ON u.id = p.user_id
WHERE u.role = 'patient'
ORDER BY u.created_at DESC
LIMIT 20;

-- Count missing records
SELECT 
  COUNT(*) as total_patients,
  COUNT(p.user_id) as has_patient_record,
  COUNT(*) - COUNT(p.user_id) as missing_patient_record
FROM users u
LEFT JOIN patients p ON u.id = p.user_id
WHERE u.role = 'patient';
