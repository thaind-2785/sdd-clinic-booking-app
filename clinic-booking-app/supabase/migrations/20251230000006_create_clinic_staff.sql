-- Migration: Create clinic_staff table
-- Description: Links clinic staff users to their clinics with role information
-- Depends on: 20251230000001_create_users.sql, 20251230000003_create_clinics.sql

CREATE TABLE clinic_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'receptionist' CHECK (role IN ('admin', 'receptionist')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, clinic_id)
);

-- Indexes
CREATE INDEX idx_clinic_staff_user ON clinic_staff(user_id);
CREATE INDEX idx_clinic_staff_clinic ON clinic_staff(clinic_id);

-- RLS Policies
ALTER TABLE clinic_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own clinics"
  ON clinic_staff FOR SELECT
  USING (user_id = auth.uid());

-- Now update clinics table policies to allow staff updates
DROP POLICY IF EXISTS "Clinic staff can update own clinic" ON clinics;
CREATE POLICY "Clinic staff can update own clinic"
  ON clinics FOR UPDATE
  USING (id IN (
    SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
  ))
  WITH CHECK (id IN (
    SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
  ));

-- Update clinic_specialties policies
DROP POLICY IF EXISTS "Clinic staff can manage specialties" ON clinic_specialties;
CREATE POLICY "Clinic staff can manage specialties"
  ON clinic_specialties FOR ALL
  USING (clinic_id IN (
    SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
  ));

COMMENT ON TABLE clinic_staff IS 'Junction table linking staff users to clinics';
