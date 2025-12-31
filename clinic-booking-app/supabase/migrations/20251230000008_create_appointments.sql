-- Migration: Create appointments table
-- Description: Booking requests and confirmed appointments
-- Depends on: 20251230000002_create_patients.sql, 20251230000003_create_clinics.sql, 20251230000007_create_time_slots.sql

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(user_id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  reason_for_visit TEXT NOT NULL CHECK (length(reason_for_visit) >= 10),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_clinic_status ON appointments(clinic_id, status);
CREATE INDEX idx_appointments_time_slot ON appointments(time_slot_id);

-- Trigger to update updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own appointments"
  ON appointments FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Patients create appointments"
  ON appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid() AND status = 'Pending');

CREATE POLICY "Clinic staff view clinic appointments"
  ON appointments FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
  ));

CREATE POLICY "Clinic staff update clinic appointments"
  ON appointments FOR UPDATE
  USING (clinic_id IN (
    SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
  ))
  WITH CHECK (
    status IN ('Confirmed', 'Rejected') AND
    approved_by = auth.uid()
  );

COMMENT ON TABLE appointments IS 'Patient appointment bookings with approval workflow';
