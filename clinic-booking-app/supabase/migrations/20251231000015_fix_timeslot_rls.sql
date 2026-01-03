-- Migration: Fix time_slots RLS to allow viewing booked slots in appointments
-- Description: Patients should be able to see time slots in their own appointments, even if booked
-- Depends on: 20251230000007_create_time_slots.sql

-- Simplify policy: allow all authenticated users to view all time slots
-- Time slot information is not sensitive and needed for appointment details
CREATE POLICY "Authenticated users can view all time slots"
  ON time_slots FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON POLICY "Authenticated users can view all time slots" ON time_slots 
  IS 'Allows authenticated users to view all time slots for browsing and appointment details';
