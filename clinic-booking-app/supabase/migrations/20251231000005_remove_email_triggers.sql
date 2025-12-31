-- Migration: Remove email triggers that require pg_net extension
-- Description: Email notifications will be handled by API routes instead of database triggers
-- This avoids dependency on pg_net extension which may not be available

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_notify_appointment_created ON appointments;
DROP TRIGGER IF EXISTS trigger_notify_appointment_updated ON appointments;

-- Drop function
DROP FUNCTION IF EXISTS notify_appointment_change();

COMMENT ON TABLE appointments IS 'Email notifications handled by API routes, not database triggers';
