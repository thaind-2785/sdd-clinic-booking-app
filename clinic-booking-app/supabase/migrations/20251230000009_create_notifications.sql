-- Migration: Create notifications table
-- Description: Tracks email notifications sent to users
-- Depends on: 20251230000008_create_appointments.sql

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'appointment_created',
    'appointment_confirmed',
    'appointment_rejected',
    'appointment_reminder'
  )),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  error_message TEXT
);

-- Index for troubleshooting and queries
CREATE INDEX idx_notifications_status ON notifications(delivery_status, sent_at);
CREATE INDEX idx_notifications_appointment ON notifications(appointment_id);
CREATE INDEX idx_notifications_email ON notifications(recipient_email);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT
  USING (
    recipient_email = (SELECT email FROM users WHERE id = auth.uid())
  );

COMMENT ON TABLE notifications IS 'Email notification delivery tracking';
