-- Migration: Simplify time_slots RLS policy
-- Description: Replace complex subquery policy with simple authenticated user policy
-- Depends on: 20251231000015_fix_timeslot_rls.sql

-- Drop the complex policy that may not work correctly
DROP POLICY IF EXISTS "Patients can view time slots in their appointments" ON time_slots;

-- Add simple policy: all authenticated users can view all time slots
-- This is reasonable because time slot info is not sensitive
CREATE POLICY "Authenticated users can view all time slots"
  ON time_slots FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON POLICY "Authenticated users can view all time slots" ON time_slots 
  IS 'Allows all authenticated users to view time slots for browsing and appointment details';
