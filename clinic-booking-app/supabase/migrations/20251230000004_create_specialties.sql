-- Migration: Create medical_specialties table with seed data
-- Description: Categories for filtering clinics by medical domain
-- Depends on: None

CREATE TABLE medical_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookups
CREATE INDEX idx_specialties_slug ON medical_specialties(slug);

-- Seed initial specialties
INSERT INTO medical_specialties (name, slug, description, icon) VALUES
  ('Cardiology', 'cardiology', 'Heart and cardiovascular system', 'heart'),
  ('Pediatrics', 'pediatrics', 'Medical care for infants, children, and adolescents', 'baby'),
  ('Dermatology', 'dermatology', 'Skin, hair, and nail conditions', 'skin'),
  ('General Practice', 'general-practice', 'Primary healthcare and routine check-ups', 'stethoscope'),
  ('Dentistry', 'dentistry', 'Oral health and dental care', 'tooth'),
  ('Orthopedics', 'orthopedics', 'Bones, joints, ligaments, and muscles', 'bone'),
  ('Ophthalmology', 'ophthalmology', 'Eye and vision care', 'eye'),
  ('Neurology', 'neurology', 'Brain and nervous system disorders', 'brain'),
  ('Obstetrics & Gynecology', 'obstetrics-gynecology', 'Women''s reproductive health', 'female'),
  ('Psychiatry', 'psychiatry', 'Mental health and behavioral disorders', 'brain-circuit');

-- RLS Policies
ALTER TABLE medical_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view specialties"
  ON medical_specialties FOR SELECT
  TO PUBLIC
  USING (true);

COMMENT ON TABLE medical_specialties IS 'Medical specialty categories for clinic filtering';
