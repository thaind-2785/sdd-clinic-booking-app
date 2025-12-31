-- Migration: Create clinics table
-- Description: Healthcare facilities offering medical services
-- Depends on: None

CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT,
  working_hours JSONB NOT NULL DEFAULT '{
    "mon": {"open": "09:00", "close": "17:00"},
    "tue": {"open": "09:00", "close": "17:00"},
    "wed": {"open": "09:00", "close": "17:00"},
    "thu": {"open": "09:00", "close": "17:00"},
    "fri": {"open": "09:00", "close": "17:00"},
    "sat": {"open": "09:00", "close": "13:00"},
    "sun": {"open": null, "close": null}
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, city)
);

-- Indexes for common queries
CREATE INDEX idx_clinics_city ON clinics(city);
CREATE INDEX idx_clinics_active ON clinics(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active clinics"
  ON clinics FOR SELECT
  USING (is_active = true);

-- Clinic staff can update (policy refined after clinic_staff table created)

COMMENT ON TABLE clinics IS 'Healthcare facilities registered in the system';
