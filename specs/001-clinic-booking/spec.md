# Feature Specification: Clinic Appointment Booking System

**Feature Branch**: `001-clinic-booking`  
**Created**: 2025-12-26  
**Status**: Draft  
**Input**: User description: "trang web này cho phép 2 đối tượng user sử dụng. 1. người cần khám bệnh, có thể đặt lịch khám theo phòng khám và khung giờ 2. phòng khám, có thể xác nhận lịch đặt khi có thông báo, sau xác nhận thì có thông báo về cho user đặt lịch. thông báo qua email. cần có login qua google để nhận mail. giao diện yêu cầu: user chọn được phòng khám ở list, filter được theo lĩnh vực khám bệnh, tại màn detail phòng khám xem được lịch làm việc của phòng khám và có form nhập lịch muốn đặt, required thông cần thiết, phòng khám xem được các yêu cầu của khách hàng và được reject hoặc approve lịch đó, xem được thông tin người đặt"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Patient Browse and Book Appointment (Priority: P1)

Patients can discover clinics by medical specialty, view clinic availability, and book appointments for their healthcare needs.

**Why this priority**: This is the core value proposition - enabling patients to access healthcare services. Without this, the platform has no purpose. This story alone delivers immediate value to both patients and clinics.

**Independent Test**: Can be fully tested by creating a patient account, browsing clinic listings, filtering by specialty, viewing a clinic's schedule, and successfully booking an appointment. Delivers value by connecting patients to healthcare providers.

**Acceptance Scenarios**:

1. **Given** a patient visits the platform, **When** they view the clinic listing page, **Then** they see all available clinics with basic information (name, specialty, location)
2. **Given** a patient is on the clinic listing page, **When** they apply a medical specialty filter (e.g., "Cardiology"), **Then** only clinics offering that specialty are displayed
3. **Given** a patient selects a specific clinic, **When** they view the clinic detail page, **Then** they see the clinic's working schedule with available time slots
4. **Given** a patient is viewing a clinic's schedule, **When** they select an available time slot and fill in required information (name, phone, email, reason for visit), **Then** the system creates a pending appointment request
5. **Given** a patient has submitted an appointment request, **When** the submission is successful, **Then** they receive a confirmation message stating "Appointment request sent, awaiting clinic confirmation"

---

### User Story 2 - Clinic Appointment Management (Priority: P2)

Clinic staff can view incoming appointment requests, review patient information, and approve or reject appointments based on availability and clinic policies.

**Why this priority**: This completes the booking workflow by allowing clinics to confirm appointments. Without clinic confirmation, all appointments remain pending and patients don't know if their booking is accepted. This is essential for the system to function but depends on P1 being completed first.

**Independent Test**: Can be tested by logging in as a clinic user, viewing pending appointment requests, reviewing patient details, and approving/rejecting requests. Delivers value by giving clinics control over their schedule.

**Acceptance Scenarios**:

1. **Given** a clinic user logs in, **When** they navigate to their appointment dashboard, **Then** they see all pending appointment requests with patient information
2. **Given** a clinic user is viewing an appointment request, **When** they click on a request, **Then** they see detailed patient information (name, contact, reason for visit, requested time)
3. **Given** a clinic user is reviewing a request, **When** they click "Approve", **Then** the appointment status changes to "Confirmed" and an email notification is sent to the patient
4. **Given** a clinic user is reviewing a request, **When** they click "Reject", **Then** the appointment status changes to "Rejected" and an email notification is sent to the patient with the rejection
5. **Given** a clinic has multiple requests for the same time slot, **When** they approve one request, **Then** other conflicting requests are automatically flagged or prevented from approval

---

### User Story 3 - Google Authentication and Email Notifications (Priority: P3)

Users (both patients and clinic staff) authenticate via Google accounts to access personalized features and receive email notifications about appointment status changes.

**Why this priority**: Authentication and notifications enhance the user experience but are not required for the basic booking flow to function. They can be added after the core booking workflow is operational. Initial testing could use a simplified auth or manual email verification.

**Independent Test**: Can be tested by implementing Google OAuth login, verifying users can sign in with their Google accounts, and confirming that email notifications are sent for appointment confirmations/rejections. Delivers value by securing user accounts and keeping users informed.

**Acceptance Scenarios**:

1. **Given** a user (patient or clinic) visits the login page, **When** they click "Sign in with Google", **Then** they are redirected to Google's authentication page
2. **Given** a user completes Google authentication, **When** they authorize the application, **Then** they are redirected back to the platform and logged in with their Google email
3. **Given** a clinic approves an appointment, **When** the approval is processed, **Then** an email is sent to the patient's registered email address with appointment confirmation details
4. **Given** a clinic rejects an appointment, **When** the rejection is processed, **Then** an email is sent to the patient's registered email address with rejection notification
5. **Given** a patient submits an appointment request, **When** the submission is successful, **Then** the clinic receives an email notification about the new pending request

---

### Edge Cases

- What happens when a patient tries to book an appointment for a past date or time?
- How does the system handle a time slot that becomes unavailable while a patient is filling out the booking form?
- What happens if a clinic tries to approve multiple appointments for the same time slot?
- How does the system handle patients who don't have a Google account for authentication?
- What happens when email notifications fail to send (network error, invalid email)?
- How does the system prevent double-booking if two clinic staff members approve conflicting appointments simultaneously?
- What happens when a patient or clinic cancels/modifies an already confirmed appointment?
- How does the system handle clinics that have irregular schedules or last-minute schedule changes?

## Requirements *(mandatory)*

### Functional Requirements

**User Management & Authentication:**
- **FR-001**: System MUST support two distinct user roles: Patient and Clinic Staff
- **FR-002**: System MUST authenticate users via Google OAuth 2.0
- **FR-003**: System MUST associate each user account with a Google email address for notifications
- **FR-004**: Patients MUST be able to create and manage their profile with contact information

**Clinic Discovery & Information:**
- **FR-005**: System MUST display a searchable list of all registered clinics
- **FR-006**: System MUST allow filtering clinics by medical specialty (e.g., Cardiology, Pediatrics, Dermatology)
- **FR-007**: Each clinic listing MUST show basic information: clinic name, specialties, location
- **FR-008**: Clinic detail page MUST display the clinic's working schedule showing available and booked time slots
- **FR-009**: System MUST prevent patients from viewing other patients' appointment information

**Appointment Booking (Patient Side):**
- **FR-010**: Patients MUST be able to select an available time slot from a clinic's schedule
- **FR-011**: Appointment booking form MUST require: patient name, phone number, email, and reason for visit
- **FR-012**: System MUST validate all required fields before submitting an appointment request
- **FR-013**: System MUST create appointments in "Pending" status until clinic approval
- **FR-014**: System MUST display confirmation message to patient after successful appointment submission
- **FR-015**: System MUST prevent booking appointments for past dates or times

**Appointment Management (Clinic Side):**
- **FR-016**: Clinic staff MUST be able to view all pending appointment requests for their clinic
- **FR-017**: Clinic staff MUST be able to view patient details for each appointment request (name, contact, reason)
- **FR-018**: Clinic staff MUST be able to approve appointment requests, changing status to "Confirmed"
- **FR-019**: Clinic staff MUST be able to reject appointment requests, changing status to "Rejected"
- **FR-020**: System MUST prevent double-booking by blocking approval of conflicting appointments for the same time slot
- **FR-021**: Clinic staff MUST be able to view confirmed appointments in their schedule

**Email Notifications:**
- **FR-022**: System MUST send email notification to patient when their appointment request is submitted
- **FR-023**: System MUST send email notification to clinic when a new appointment request is received
- **FR-024**: System MUST send email notification to patient when their appointment is approved by clinic
- **FR-025**: System MUST send email notification to patient when their appointment is rejected by clinic
- **FR-026**: Email notifications MUST include relevant appointment details (date, time, clinic name, patient name)
- **FR-027**: System MUST handle email delivery failures gracefully without blocking appointment operations

**Data Integrity & Security:**
- **FR-028**: System MUST log all appointment status changes (created, approved, rejected) with timestamp and user
- **FR-029**: System MUST encrypt patient personal information at rest
- **FR-030**: System MUST implement role-based access control (patients cannot access clinic management functions)
- **FR-031**: System MUST ensure atomic transactions for appointment approval to prevent race conditions

### Key Entities

- **User**: Represents any system user; attributes include Google ID, email, name, role (Patient/Clinic Staff), created date
- **Patient**: Extends User; additional attributes include phone number, medical history preference, notification preferences
- **Clinic**: Represents a healthcare facility; attributes include clinic name, address, specialties offered (array), working hours, contact information, associated staff users
- **Medical Specialty**: Categories for filtering clinics; examples include Cardiology, Pediatrics, Dermatology, General Practice, Dentistry
- **Appointment**: Represents a booking request or confirmed appointment; attributes include patient reference, clinic reference, requested date/time, reason for visit, status (Pending/Confirmed/Rejected), created timestamp, approved/rejected by (staff user), approval/rejection timestamp
- **Time Slot**: Represents availability in clinic schedule; attributes include clinic reference, date, start time, end time, is_available flag, appointment reference if booked
- **Notification**: Email notification record; attributes include recipient email, notification type, appointment reference, sent timestamp, delivery status

## Success Criteria *(mandatory)*

### Measurable Outcomes

**User Experience & Performance:**
- **SC-001**: Patients can complete the appointment booking flow (from clinic selection to submission) in under 3 minutes
- **SC-002**: Clinic listing page loads with all clinics displayed in under 2 seconds
- **SC-003**: Specialty filter applies and updates clinic list in under 500 milliseconds
- **SC-004**: 90% of patients successfully complete their first appointment booking without assistance or errors

**System Reliability & Accuracy:**
- **SC-005**: Zero double-booking incidents (no two appointments confirmed for same clinic time slot)
- **SC-006**: System maintains 99.9% uptime during business hours (8 AM - 8 PM)
- **SC-007**: 95% of email notifications delivered within 2 minutes of appointment status change
- **SC-008**: All appointment state transitions are logged with 100% accuracy for audit trail

**Business Value & Adoption:**
- **SC-009**: At least 100 appointments successfully booked and confirmed within first month of launch
- **SC-010**: Clinic staff respond to (approve/reject) appointment requests within average of 4 hours during business hours
- **SC-011**: 80% patient satisfaction rating for ease of booking process
- **SC-012**: 70% of pending appointments result in confirmed bookings (not rejected)

**Security & Compliance:**
- **SC-013**: 100% of user authentication attempts use Google OAuth (no security bypasses)
- **SC-014**: All patient personal information encrypted at rest with zero data breaches
- **SC-015**: Role-based access control enforced with zero unauthorized access incidents
- **SC-016**: All appointment modifications logged with timestamp and user identity for compliance
