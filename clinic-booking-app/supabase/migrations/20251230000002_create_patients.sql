-- Migration: Create patients table
-- Description: Extended profile for users with patient role
-- Depends on: 20251230000001_create_users.sql

CREATE TABLE patients (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  medical_notes TEXT,
  notification_preferences JSONB DEFAULT '{"email": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for phone lookups
CREATE INDEX idx_patients_phone ON patients(phone);

-- RLS Policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own data"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Patients update own data"
  ON patients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can insert own data"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE patients IS 'Extended profile data for patient users';
