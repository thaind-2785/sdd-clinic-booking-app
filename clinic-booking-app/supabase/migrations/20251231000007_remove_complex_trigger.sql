-- Remove complex optimized trigger, use simple webhook instead

DROP TRIGGER IF EXISTS trigger_send_appointment_email ON appointments;
DROP FUNCTION IF EXISTS send_appointment_email();

-- That's it! We'll use Database Webhooks from Dashboard instead
-- Webhook will send record data to Edge Function
-- Edge Function will query DB for additional data (simpler approach)
