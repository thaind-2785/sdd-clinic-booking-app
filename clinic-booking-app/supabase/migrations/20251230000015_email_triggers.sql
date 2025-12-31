-- T104: Database trigger to invoke email function on appointment changes
-- This migration creates triggers to automatically send email notifications

-- Create function to invoke Edge Function for email notifications
CREATE OR REPLACE FUNCTION notify_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_type TEXT;
  payload JSONB;
BEGIN
  -- Determine notification type based on status change
  IF TG_OP = 'INSERT' THEN
    notification_type := 'appointment_created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'Confirmed' AND OLD.status != 'Confirmed' THEN
      notification_type := 'appointment_confirmed';
    ELSIF NEW.status = 'Rejected' AND OLD.status != 'Rejected' THEN
      notification_type := 'appointment_rejected';
    ELSE
      -- No notification needed for other status changes
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  -- Prepare payload for Edge Function
  payload := jsonb_build_object(
    'appointmentId', NEW.id,
    'notificationType', notification_type
  );

  -- Invoke Edge Function using pg_net extension (requires Supabase setup)
  -- Note: This is async - function will be called but won't block transaction
  PERFORM
    net.http_post(
      url := (SELECT current_setting('app.settings.supabase_functions_url') || '/send-email'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT current_setting('app.settings.supabase_anon_key'))
      ),
      body := payload
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for INSERT (new appointments)
DROP TRIGGER IF EXISTS trigger_notify_appointment_created ON appointments;
CREATE TRIGGER trigger_notify_appointment_created
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_change();

-- Create trigger for UPDATE (status changes)
DROP TRIGGER IF EXISTS trigger_notify_appointment_updated ON appointments;
CREATE TRIGGER trigger_notify_appointment_updated
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_appointment_change();

COMMENT ON FUNCTION notify_appointment_change() IS 'Triggers email notifications for appointment changes';
