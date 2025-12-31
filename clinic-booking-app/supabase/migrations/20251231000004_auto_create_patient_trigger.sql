-- Migration: Auto-create patient or clinic_staff record based on role
-- Description: Database trigger to ensure data consistency

-- Function to auto-create patient or clinic_staff record
CREATE OR REPLACE FUNCTION auto_create_patient_record()
RETURNS TRIGGER AS $$
DECLARE
  clinic_id_from_auth UUID;
BEGIN
  IF NEW.role = 'patient' THEN
    -- Create patient record
    INSERT INTO patients (user_id, phone, notification_preferences)
    VALUES (NEW.id, '', '{"email": true, "sms": false}'::jsonb)
    ON CONFLICT (user_id) DO NOTHING;
    
  ELSIF NEW.role = 'clinic_staff' THEN
    -- Get clinic_id from auth metadata
    SELECT (au.raw_user_meta_data->>'clinic_id')::uuid INTO clinic_id_from_auth
    FROM auth.users au
    WHERE au.id = NEW.id;
    
    -- Create clinic_staff record if clinic_id exists
    IF clinic_id_from_auth IS NOT NULL THEN
      INSERT INTO clinic_staff (user_id, clinic_id, role)
      VALUES (NEW.id, clinic_id_from_auth, 'receptionist')
      ON CONFLICT (user_id, clinic_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after user insert
DROP TRIGGER IF EXISTS trigger_auto_create_patient ON users;
CREATE TRIGGER trigger_auto_create_patient
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_patient_record();

COMMENT ON FUNCTION auto_create_patient_record IS 'Automatically creates patient or clinic_staff record based on user role';
