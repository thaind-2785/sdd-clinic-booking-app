-- Migration: Simplify auto_create_patient_record trigger
-- Description: Only auto-create patient records, clinic_staff is handled in application code
-- Reason: Trigger cannot reliably access auth.users metadata when running on public.users

-- Update function to only handle patient creation
CREATE OR REPLACE FUNCTION auto_create_patient_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-create patient record for patient role
  -- clinic_staff records are created in application code with explicit clinic_id
  IF NEW.role = 'patient' THEN
    INSERT INTO patients (user_id, phone, notification_preferences)
    VALUES (NEW.id, '', '{"email": true, "sms": false}'::jsonb)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION auto_create_patient_record IS 'Automatically creates patient record for patient role. Clinic staff records are created in application code.';
