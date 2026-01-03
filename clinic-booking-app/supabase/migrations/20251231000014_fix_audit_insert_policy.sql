-- Migration: Fix appointment_audit INSERT policy
-- Description: Allow trigger to insert audit records when appointments are updated
-- Depends on: 20251230000010_create_audit.sql

-- Drop existing SELECT policy and recreate with better naming
DROP POLICY IF EXISTS "Users can view audit logs for own appointments" ON appointment_audit;

CREATE POLICY "Users can view audit logs for own appointments"
  ON appointment_audit FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE patient_id = auth.uid()
    )
    OR
    appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN clinic_staff cs ON a.clinic_id = cs.clinic_id
      WHERE cs.user_id = auth.uid()
    )
  );

-- Add INSERT policy to allow trigger to create audit records
-- The trigger runs with the permissions of the user who updates the appointment
CREATE POLICY "Allow audit log creation on appointment updates"
  ON appointment_audit FOR INSERT
  WITH CHECK (
    -- Allow insert if the user is a patient updating their own appointment
    changed_by = auth.uid()
    OR
    -- Allow insert if the user is clinic staff for the appointment's clinic
    appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN clinic_staff cs ON a.clinic_id = cs.clinic_id
      WHERE cs.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Allow audit log creation on appointment updates" ON appointment_audit 
  IS 'Allows trigger to insert audit records when patients or clinic staff update appointments';
