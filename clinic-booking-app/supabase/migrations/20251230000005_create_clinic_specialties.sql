-- Migration: Create clinic_specialties junction table
-- Description: Links clinics to the medical specialties they offer
-- Depends on: 20251230000003_create_clinics.sql, 20251230000004_create_specialties.sql

CREATE TABLE clinic_specialties (
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES medical_specialties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (clinic_id, specialty_id)
);

-- Indexes for efficient joins
CREATE INDEX idx_clinic_specialties_clinic ON clinic_specialties(clinic_id);
CREATE INDEX idx_clinic_specialties_specialty ON clinic_specialties(specialty_id);

-- RLS Policies
ALTER TABLE clinic_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clinic specialties"
  ON clinic_specialties FOR SELECT
  TO PUBLIC
  USING (true);

-- Clinic staff can manage (policy refined after clinic_staff table created)

COMMENT ON TABLE clinic_specialties IS 'Many-to-many relationship between clinics and specialties';
