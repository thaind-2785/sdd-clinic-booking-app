-- Migration: Optimized email notification trigger
-- Description: Send full appointment data to Edge Function, no extra queries needed

-- Function to prepare email payload with all necessary data
CREATE OR REPLACE FUNCTION send_appointment_email()
RETURNS TRIGGER AS $$
DECLARE
  notification_type TEXT;
  patient_data JSONB;
  clinic_data JSONB;
  timeslot_data JSONB;
  staff_emails TEXT[];
  payload JSONB;
  function_url TEXT;
BEGIN
  -- Determine notification type
  IF TG_OP = 'INSERT' THEN
    notification_type := 'appointment_created';
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'Confirmed' THEN
      notification_type := 'appointment_confirmed';
    ELSIF NEW.status = 'Rejected' THEN
      notification_type := 'appointment_rejected';
    ELSE
      RETURN NEW; -- No notification for other status changes
    END IF;
  ELSE
    RETURN NEW; -- No notification needed
  END IF;

  -- Fetch patient data with user info in one query
  SELECT jsonb_build_object(
    'email', u.email,
    'name', u.name
  ) INTO patient_data
  FROM patients p
  JOIN users u ON u.id = p.user_id
  WHERE p.user_id = NEW.patient_id;

  -- Fetch clinic data
  SELECT jsonb_build_object(
    'name', c.name,
    'address', c.address,
    'city', c.city,
    'phone', c.phone,
    'email', c.email
  ) INTO clinic_data
  FROM clinics c
  WHERE c.id = NEW.clinic_id;

  -- Fetch timeslot data
  SELECT jsonb_build_object(
    'date', ts.date,
    'start_time', ts.start_time,
    'end_time', ts.end_time
  ) INTO timeslot_data
  FROM time_slots ts
  WHERE ts.id = NEW.time_slot_id;

  -- Fetch clinic staff emails
  SELECT array_agg(u.email)
  INTO staff_emails
  FROM clinic_staff cs
  JOIN users u ON u.id = cs.user_id
  WHERE cs.clinic_id = NEW.clinic_id;

  -- Build complete payload
  payload := jsonb_build_object(
    'notificationType', notification_type,
    'appointment', jsonb_build_object(
      'id', NEW.id,
      'reason_for_visit', NEW.reason_for_visit,
      'status', NEW.status,
      'rejection_reason', NEW.rejection_reason
    ),
    'patient', patient_data,
    'clinic', clinic_data,
    'timeSlot', timeslot_data,
    'staffEmails', staff_emails,
    'skipQuery', true  -- Tell Edge Function to skip DB queries
  );

  -- Get function URL from settings (set via: ALTER DATABASE postgres SET app.functions_url = 'https://...')
  function_url := current_setting('app.functions_url', true);
  
  IF function_url IS NULL THEN
    RAISE WARNING 'app.functions_url not set, cannot send email';
    RETURN NEW;
  END IF;

  -- Call Edge Function via pg_net (async, won't block transaction)
  -- Uncomment when pg_net is available:
  /*
  PERFORM net.http_post(
    url := function_url || '/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := payload
  );
  */

  -- For now, just log (remove this when pg_net is enabled)
  RAISE NOTICE 'Would send email: %', payload;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_send_appointment_email ON appointments;
CREATE TRIGGER trigger_send_appointment_email
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION send_appointment_email();

COMMENT ON FUNCTION send_appointment_email IS 'Sends complete appointment data to Edge Function without extra queries';
