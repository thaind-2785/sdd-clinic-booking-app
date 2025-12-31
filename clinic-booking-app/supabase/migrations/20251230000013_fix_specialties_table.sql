-- Fix: Rename medical_specialties to specialties
-- This migration fixes the naming mismatch

-- Drop old table if exists
DROP TABLE IF EXISTS medical_specialties CASCADE;

-- Create specialties table with correct name
CREATE TABLE IF NOT EXISTS specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for name lookups
CREATE INDEX IF NOT EXISTS idx_specialties_name ON specialties(name);

-- RLS Policies
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view specialties" ON specialties;
CREATE POLICY "Anyone can view specialties"
  ON specialties FOR SELECT
  TO PUBLIC
  USING (true);

COMMENT ON TABLE specialties IS 'Medical specialty categories for clinic filtering';
