# Data Model: Clinic Appointment Booking System

**Feature**: 001-clinic-booking  
**Date**: 2025-12-26  
**Source**: Derived from [spec.md](spec.md) Key Entities section

## Entity Relationship Diagram (Conceptual)

```
┌─────────────┐         ┌──────────────┐
│    User     │◄────────│   Patient    │
│             │         │              │
│ - id (PK)   │         │ - phone      │
│ - google_id │         │ - preferences│
│ - email     │         └──────────────┘
│ - name      │                │
│ - role      │                │
│ - created   │                │ creates
└──────┬──────┘                │
       │                       ▼
       │ belongs to    ┌──────────────────┐
       │               │   Appointment    │
       │               │                  │
       │               │ - id (PK)        │
       │               │ - patient_id (FK)│
       │               │ - clinic_id (FK) │
       │               │ - time_slot_id   │
       │               │ - reason         │
       │               │ - status         │
       │               │ - created_at     │
       │               │ - updated_at     │
       │               │ - approved_by    │
       │               └────────┬─────────┘
       │                        │
       │ manages                │ belongs to
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│ ClinicStaff  │         │    Clinic    │
│              │         │              │
│ - user_id(FK)│         │ - id (PK)    │
│ - clinic_id  │◄────────│ - name       │
│ - role       │         │ - address    │
└──────────────┘         │ - specialties│
                         │ - contact    │
                         └──────┬───────┘
                                │
                                │ has
                                ▼
                         ┌──────────────┐
                         │  TimeSlot    │
                         │              │
                         │ - id (PK)    │
                         │ - clinic_id  │
                         │ - date       │
                         │ - start_time │
                         │ - end_time   │
                         │ - is_available
                         └──────────────┘

┌──────────────────┐
│ MedicalSpecialty │
│                  │
│ - id (PK)        │
│ - name           │
│ - description    │
└──────────────────┘
       ▲
       │ many-to-many
       │
       │
┌──────────────────┐
│ ClinicSpecialty  │ (junction table)
│                  │
│ - clinic_id (FK) │
│ - specialty_id   │
└──────────────────┘

┌──────────────────┐
│  Notification    │
│                  │
│ - id (PK)        │
│ - recipient_email│
│ - type           │
│ - appointment_id │
│ - sent_at        │
│ - delivery_status│
└──────────────────┘
```

---

## Entities

### 1. User (Base Entity)

**Purpose**: Represents any authenticated user in the system (both patients and clinic staff)

**Attributes**:
- `id` (UUID, PK): Primary identifier
- `google_id` (String, Unique, Not Null): Google OAuth subject ID
- `email` (String, Unique, Not Null): User's email from Google
- `name` (String, Not Null): Display name
- `avatar_url` (String, Nullable): Profile picture URL from Google
- `role` (Enum: 'patient' | 'clinic_staff', Not Null): User type
- `created_at` (Timestamp, Not Null): Account creation timestamp
- `updated_at` (Timestamp, Not Null): Last update timestamp

**Validation Rules**:
- Email must be valid format (validated by Supabase Auth)
- Google ID must be unique (enforced by unique constraint)
- Role must be either 'patient' or 'clinic_staff'

**Relationships**:
- One-to-One with Patient (if role = 'patient')
- One-to-Many with ClinicStaff (if role = 'clinic_staff', can work at multiple clinics)
- One-to-Many with Appointment (as patient or approver)

**State Transitions**: N/A (static profile)

**Supabase Implementation**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('patient', 'clinic_staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

---

### 2. Patient (extends User)

**Purpose**: Additional attributes for users with patient role

**Attributes**:
- `user_id` (UUID, PK, FK to users.id): Reference to base user
- `phone` (String, Not Null): Contact phone number
- `date_of_birth` (Date, Nullable): Birth date for age verification
- `medical_notes` (Text, Nullable): Allergies, conditions (optional, patient-provided)
- `notification_preferences` (JSONB, Default: {email: true}): How patient wants to be contacted

**Validation Rules**:
- Phone must match format: +[country code][number] or local format
- Date of birth if provided must be in the past

**Relationships**:
- One-to-One with User
- One-to-Many with Appointment (patient can have multiple appointments)

**Supabase Implementation**:
```sql
CREATE TABLE patients (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  medical_notes TEXT,
  notification_preferences JSONB DEFAULT '{"email": true}'::jsonb
);

-- RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own data"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Patients update own data"
  ON patients FOR UPDATE
  USING (auth.uid() = user_id);
```

---

### 3. Clinic

**Purpose**: Represents a healthcare facility offering medical services

**Attributes**:
- `id` (UUID, PK): Primary identifier
- `name` (String, Not Null): Clinic business name
- `address` (String, Not Null): Physical location
- `city` (String, Not Null): City for location-based filtering
- `phone` (String, Not Null): Main contact number
- `email` (String, Not Null): Contact email
- `description` (Text, Nullable): About the clinic
- `working_hours` (JSONB, Not Null): Weekly schedule {mon: {open: '09:00', close: '17:00'}, ...}
- `is_active` (Boolean, Default: true): Clinic accepting appointments
- `created_at` (Timestamp, Not Null)

**Validation Rules**:
- Name must be unique within city
- Working hours must be valid time ranges
- Email must be valid format

**Relationships**:
- One-to-Many with ClinicStaff (clinic has multiple staff members)
- One-to-Many with Appointment
- One-to-Many with TimeSlot
- Many-to-Many with MedicalSpecialty (via ClinicSpecialty junction)

**Supabase Implementation**:
```sql
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT,
  working_hours JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, city)
);

-- RLS
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active clinics"
  ON clinics FOR SELECT
  USING (is_active = true);

CREATE POLICY "Clinic staff can update own clinic"
  ON clinics FOR UPDATE
  USING (id IN (
    SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
  ));
```

---

### 4. ClinicStaff (junction entity)

**Purpose**: Links clinic staff users to their clinics with role information

**Attributes**:
- `id` (UUID, PK)
- `user_id` (UUID, FK to users.id, Not Null): Staff member
- `clinic_id` (UUID, FK to clinics.id, Not Null): Associated clinic
- `role` (Enum: 'admin' | 'receptionist', Default: 'receptionist'): Staff permission level
- `joined_at` (Timestamp, Default: NOW)

**Validation Rules**:
- User's role in users table must be 'clinic_staff'
- Unique constraint on (user_id, clinic_id) - one role per clinic per user

**Relationships**:
- Many-to-One with User
- Many-to-One with Clinic

**Supabase Implementation**:
```sql
CREATE TABLE clinic_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'receptionist' CHECK (role IN ('admin', 'receptionist')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, clinic_id)
);

-- RLS
ALTER TABLE clinic_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own clinics"
  ON clinic_staff FOR SELECT
  USING (user_id = auth.uid());
```

---

### 5. MedicalSpecialty

**Purpose**: Categories for filtering clinics by medical domain

**Attributes**:
- `id` (UUID, PK)
- `name` (String, Unique, Not Null): e.g., "Cardiology", "Pediatrics"
- `slug` (String, Unique, Not Null): URL-friendly version, e.g., "cardiology"
- `description` (Text, Nullable): Specialty description
- `icon` (String, Nullable): Icon name for UI

**Validation Rules**:
- Name must be unique
- Slug must be lowercase, alphanumeric + hyphens only

**Relationships**:
- Many-to-Many with Clinic (via ClinicSpecialty)

**Supabase Implementation**:
```sql
CREATE TABLE medical_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT
);

-- Seed data
INSERT INTO medical_specialties (name, slug) VALUES
  ('Cardiology', 'cardiology'),
  ('Pediatrics', 'pediatrics'),
  ('Dermatology', 'dermatology'),
  ('General Practice', 'general-practice'),
  ('Dentistry', 'dentistry');

-- RLS
ALTER TABLE medical_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view specialties"
  ON medical_specialties FOR SELECT
  TO PUBLIC
  USING (true);
```

---

### 6. ClinicSpecialty (junction table)

**Purpose**: Links clinics to the specialties they offer

**Attributes**:
- `clinic_id` (UUID, FK to clinics.id, Not Null)
- `specialty_id` (UUID, FK to medical_specialties.id, Not Null)
- `PRIMARY KEY (clinic_id, specialty_id)`

**Supabase Implementation**:
```sql
CREATE TABLE clinic_specialties (
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES medical_specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (clinic_id, specialty_id)
);

-- RLS
ALTER TABLE clinic_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clinic specialties"
  ON clinic_specialties FOR SELECT
  TO PUBLIC
  USING (true);
```

---

### 7. TimeSlot

**Purpose**: Represents bookable time slots in a clinic's schedule

**Attributes**:
- `id` (UUID, PK)
- `clinic_id` (UUID, FK to clinics.id, Not Null)
- `date` (Date, Not Null): Appointment date
- `start_time` (Time, Not Null): Slot start time
- `end_time` (Time, Not Null): Slot end time
- `is_available` (Boolean, Default: true): Slot bookable status
- `created_at` (Timestamp, Default: NOW)

**Validation Rules**:
- start_time must be before end_time
- date must not be in the past (enforced at application layer)
- Unique constraint on (clinic_id, date, start_time) - no overlapping slots

**Relationships**:
- Many-to-One with Clinic
- One-to-One with Appointment (if booked)

**State Transitions**:
- `is_available: true` → `is_available: false` (when appointment approved)
- `is_available: false` → `is_available: true` (when appointment rejected/canceled)

**Supabase Implementation**:
```sql
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

-- Index for common queries
CREATE INDEX idx_time_slots_clinic_date ON time_slots(clinic_id, date)
  WHERE is_available = true;

-- RLS
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available slots"
  ON time_slots FOR SELECT
  USING (is_available = true);

CREATE POLICY "Clinic staff can manage slots"
  ON time_slots FOR ALL
  USING (clinic_id IN (
    SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
  ));
```

---

### 8. Appointment

**Purpose**: Represents a booking request or confirmed appointment

**Attributes**:
- `id` (UUID, PK)
- `patient_id` (UUID, FK to patients.user_id, Not Null): Who booked
- `clinic_id` (UUID, FK to clinics.id, Not Null): Where
- `time_slot_id` (UUID, FK to time_slots.id, Not Null): When
- `reason_for_visit` (Text, Not Null): Patient's stated reason
- `status` (Enum: 'Pending' | 'Confirmed' | 'Rejected', Default: 'Pending')
- `created_at` (Timestamp, Default: NOW)
- `updated_at` (Timestamp, Default: NOW)
- `approved_by` (UUID, FK to users.id, Nullable): Clinic staff who approved/rejected
- `approved_at` (Timestamp, Nullable): When status changed

**Validation Rules**:
- Time slot must belong to the specified clinic
- Reason for visit required (min 10 characters)
- approved_by must be clinic staff member of the clinic
- Once Confirmed, cannot change to Rejected (need separate cancellation)

**Relationships**:
- Many-to-One with Patient
- Many-to-One with Clinic
- Many-to-One with TimeSlot
- Many-to-One with User (approved_by)

**State Transitions**:
```
Pending ──approve──> Confirmed
  │
  └────reject────> Rejected
```

**Business Rules**:
- FR-020: Cannot approve if time_slot.is_available = false
- FR-028: All state changes logged to audit table via trigger

**Supabase Implementation**:
```sql
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

-- Index for common queries
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_clinic_status ON appointments(clinic_id, status);

-- Trigger to prevent double-booking
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Confirmed' AND (
    SELECT is_available FROM time_slots WHERE id = NEW.time_slot_id
  ) = false THEN
    RAISE EXCEPTION 'Time slot is no longer available';
  END IF;
  
  -- Mark slot as unavailable when confirmed
  IF NEW.status = 'Confirmed' THEN
    UPDATE time_slots SET is_available = false WHERE id = NEW.time_slot_id;
  END IF;
  
  -- Free slot if rejected
  IF NEW.status = 'Rejected' AND OLD.status = 'Pending' THEN
    UPDATE time_slots SET is_available = true WHERE id = NEW.time_slot_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_double_booking
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION prevent_double_booking();

-- RLS
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
```

---

### 9. Notification

**Purpose**: Tracks email notifications sent to users

**Attributes**:
- `id` (UUID, PK)
- `recipient_email` (String, Not Null): Who receives the email
- `notification_type` (Enum, Not Null): 'appointment_created' | 'appointment_confirmed' | 'appointment_rejected' | 'appointment_reminder'
- `appointment_id` (UUID, FK to appointments.id, Not Null): Related appointment
- `sent_at` (Timestamp, Default: NOW)
- `delivery_status` (Enum: 'pending' | 'sent' | 'failed', Default: 'pending')
- `error_message` (Text, Nullable): If failed, why

**Validation Rules**:
- recipient_email must be valid format
- Cannot delete notifications (audit trail)

**Relationships**:
- Many-to-One with Appointment

**Supabase Implementation**:
```sql
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

-- Index for troubleshooting
CREATE INDEX idx_notifications_status ON notifications(delivery_status, sent_at);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT
  USING (
    recipient_email = (SELECT email FROM users WHERE id = auth.uid())
  );
```

---

## Audit Table (FR-028 Compliance)

**Purpose**: Log all appointment state changes for compliance

```sql
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

-- Trigger to auto-populate audit log
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

CREATE TRIGGER audit_appointment_changes
  AFTER UPDATE ON appointments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_appointment_changes();
```

---

## Summary

**Total Entities**: 9 (+ 1 audit table)  
**Total Tables**: 11 (including junctions and audit)

**Key Relationships**:
- Users → Patients/ClinicStaff (role-based)
- Clinics ↔ MedicalSpecialties (many-to-many)
- Appointments link Patients, Clinics, and TimeSlots
- Notifications track communication history

**Constitution Compliance**:
- ✅ Privacy (I): RLS policies enforce patient data isolation
- ✅ Data Integrity (III): Triggers prevent double-booking, audit all changes
- ✅ Testing (V): Schema designed for testability with clear validation rules

All entities ready for Supabase migration implementation.
