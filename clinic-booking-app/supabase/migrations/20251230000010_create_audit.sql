-- Migration: Create appointment_audit table with triggers
-- Description: Audit trail for appointment status changes (FR-028 compliance)
-- Depends on: 20251230000008_create_appointments.sql

CREATE TABLE appointment_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Indexes
CREATE INDEX idx_audit_appointment ON appointment_audit(appointment_id);
CREATE INDEX idx_audit_changed_at ON appointment_audit(changed_at DESC);
CREATE INDEX idx_audit_changed_by ON appointment_audit(changed_by);

-- Trigger function to auto-populate audit log
CREATE OR REPLACE FUNCTION log_appointment_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO appointment_audit (
    appointment_id,
    changed_by,
    old_status,
    new_status
  ) VALUES (
    NEW.id,
    COALESCE(NEW.approved_by, NEW.patient_id),
    OLD.status,
    NEW.status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log changes
CREATE TRIGGER audit_appointment_changes
  AFTER UPDATE ON appointments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_appointment_changes();

-- RLS Policies
ALTER TABLE appointment_audit ENABLE ROW LEVEL SECURITY;

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

COMMENT ON TABLE appointment_audit IS 'Immutable audit trail for appointment status changes';
