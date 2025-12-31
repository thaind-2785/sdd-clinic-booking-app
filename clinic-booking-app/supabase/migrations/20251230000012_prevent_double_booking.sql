-- Migration: Double-booking prevention trigger
-- Description: Prevents time slot conflicts and manages availability (FR-020)
-- Depends on: 20251230000008_create_appointments.sql, 20251230000007_create_time_slots.sql

-- Trigger function to prevent double-booking
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
DECLARE
  slot_available BOOLEAN;
  slot_clinic_id UUID;
BEGIN
  -- Get time slot details
  SELECT is_available, clinic_id INTO slot_available, slot_clinic_id
  FROM time_slots
  WHERE id = NEW.time_slot_id;
  
  -- Validate time slot belongs to the clinic
  IF slot_clinic_id != NEW.clinic_id THEN
    RAISE EXCEPTION 'Time slot does not belong to the specified clinic';
  END IF;
  
  -- Check if trying to confirm an unavailable slot
  IF NEW.status = 'Confirmed' AND NOT slot_available THEN
    RAISE EXCEPTION 'Time slot is no longer available';
  END IF;
  
  -- Mark slot as unavailable when confirmed
  IF NEW.status = 'Confirmed' AND (OLD IS NULL OR OLD.status != 'Confirmed') THEN
    UPDATE time_slots 
    SET is_available = false 
    WHERE id = NEW.time_slot_id;
    
    RAISE NOTICE 'Time slot % marked as unavailable', NEW.time_slot_id;
  END IF;
  
  -- Free slot if rejected (only if previously pending)
  IF NEW.status = 'Rejected' AND OLD IS NOT NULL AND OLD.status = 'Pending' THEN
    UPDATE time_slots 
    SET is_available = true 
    WHERE id = NEW.time_slot_id;
    
    RAISE NOTICE 'Time slot % freed due to rejection', NEW.time_slot_id;
  END IF;
  
  -- Set approval timestamp
  IF NEW.status IN ('Confirmed', 'Rejected') AND NEW.approved_at IS NULL THEN
    NEW.approved_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on appointments
CREATE TRIGGER check_double_booking
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION prevent_double_booking();

COMMENT ON FUNCTION prevent_double_booking IS 'Ensures time slot consistency and prevents double-booking';
