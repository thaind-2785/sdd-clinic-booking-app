-- Migration: Allow clinic staff to view patient data for appointments
-- Description: Clinic staff need to see patient information for appointments at their clinic

-- Allow clinic staff to view patients who have appointments at their clinic
CREATE POLICY "Clinic staff can view their patients"
  ON patients FOR SELECT
  USING (
    user_id IN (
      SELECT a.patient_id 
      FROM appointments a
      JOIN clinic_staff cs ON a.clinic_id = cs.clinic_id
      WHERE cs.user_id = auth.uid()
    )
  );

-- Allow clinic staff to view user data for their patients
CREATE POLICY "Clinic staff can view patient user data"
  ON users FOR SELECT
  USING (
    id IN (
      SELECT a.patient_id 
      FROM appointments a
      JOIN clinic_staff cs ON a.clinic_id = cs.clinic_id
      WHERE cs.user_id = auth.uid()
    )
    OR id = auth.uid()  -- Can always view own data
  );

COMMENT ON POLICY "Clinic staff can view their patients" ON patients IS 'Allows clinic staff to view patient records for appointments at their clinic';
COMMENT ON POLICY "Clinic staff can view patient user data" ON users IS 'Allows clinic staff to view user data for patients with appointments at their clinic';
