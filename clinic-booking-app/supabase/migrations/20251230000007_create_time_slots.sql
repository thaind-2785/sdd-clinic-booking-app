-- Migration: Create time_slots table
-- Description: Bookable time slots in clinic schedules
-- Depends on: 20251230000003_create_clinics.sql

CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinic_id, date, start_time)
);

-- Indexes for common queries
CREATE INDEX idx_time_slots_clinic_date ON time_slots(clinic_id, date)
  WHERE is_available = true;
CREATE INDEX idx_time_slots_availability ON time_slots(is_available, date)
  WHERE is_available = true;

-- RLS Policies
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available slots"
  ON time_slots FOR SELECT
  USING (is_available = true);

CREATE POLICY "Clinic staff can view all clinic slots"
  ON time_slots FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
  ));

CREATE POLICY "Clinic staff can manage slots"
  ON time_slots FOR ALL
  USING (clinic_id IN (
    SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
  ));

COMMENT ON TABLE time_slots IS 'Available appointment time slots for each clinic';
