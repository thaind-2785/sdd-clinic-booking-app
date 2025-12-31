# Quickstart: Clinic Appointment Booking System

**Feature**: 001-clinic-booking  
**Date**: 2025-12-26  
**Purpose**: Step-by-step guide to set up, run, and test the application locally

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: v18.17.0 or higher
- **npm** or **pnpm**: Latest version
- **Git**: For cloning the repository
- **Supabase CLI**: Install globally with `npm install -g supabase`
- **Google OAuth Credentials**: Create a project at [Google Cloud Console](https://console.cloud.google.com)
- **Code Editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Playwright Test for VS Code

---

## 1. Project Setup

### Clone Repository

```bash
git clone <repository-url>
cd clinic-booking-app
```

### Install Dependencies

```bash
npm install
# or
pnpm install
```

**Expected output**: Dependencies installed successfully, no peer dependency warnings

---

## 2. Supabase Local Setup

### Start Supabase Local Development

```bash
supabase start
```

**Expected output**:
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: <your-jwt-secret>
        anon key: <your-anon-key>
service_role key: <your-service-role-key>
```

**Important**: Save the `anon key` and `service_role key` for environment variables.

### Run Database Migrations

```bash
supabase db reset
```

**Expected output**: Database reset complete, all migrations applied

**Verification**:
1. Open Supabase Studio: http://localhost:54323
2. Navigate to **Table Editor**
3. Verify tables exist: `users`, `patients`, `clinics`, `appointments`, `time_slots`, `medical_specialties`, `notifications`, `appointment_audit`

---

## 3. Environment Configuration

### Create `.env.local` File

In the project root, create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:54321/auth/v1/callback` (Supabase local)
   - `http://localhost:3000/auth/callback` (Next.js callback)
7. Copy **Client ID** and **Client Secret** to `.env.local`

### Configure Supabase Auth Providers

```bash
# Update supabase/config.toml
[auth.external.google]
enabled = true
client_id = "<your-google-client-id>"
secret = "<your-google-client-secret>"
redirect_uri = "http://localhost:54321/auth/v1/callback"
```

Restart Supabase after config changes:

```bash
supabase stop
supabase start
```

---

## 4. Seed Test Data

### Run Seed Script

```bash
npm run seed
# or
npx tsx scripts/seed.ts
```

**Expected output**:
```
✓ Seeded 5 medical specialties
✓ Seeded 3 clinics
✓ Seeded 10 time slots
✓ Seeded 2 test users (1 patient, 1 clinic staff)
Seed complete!
```

**Verification** (in Supabase Studio):
- `medical_specialties` table: 5 rows (Cardiology, Pediatrics, Dermatology, General Practice, Dentistry)
- `clinics` table: 3 rows (test clinics)
- `time_slots` table: 10+ rows (future dates, is_available = true)
- `users` table: 2 rows (patient + staff)

---

## 5. Run Development Server

### Start Next.js Dev Server

```bash
npm run dev
```

**Expected output**:
```
  ▲ Next.js 14.x
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### Verify Application is Running

1. Open browser: http://localhost:3000
2. You should see the landing page
3. Check browser console: No errors

---

## 6. Test User Journeys

### Journey 1: Patient Browse and Book Appointment (P1)

**Test**: Complete appointment booking flow

1. **Navigate to homepage**: http://localhost:3000
2. **Click "Sign in with Google"**: Authenticate via Google OAuth
3. **Select "I'm a Patient"** (or click patient role link)
4. **Browse clinics**: http://localhost:3000/clinics
   - **Verify**: See list of 3 clinics
   - **Expected**: Clinic names, specialties, locations displayed
5. **Apply specialty filter**: Select "Cardiology" from dropdown
   - **Verify**: Only cardiology clinics shown (within 500ms - SC-003)
   - **Performance check**: Open DevTools > Network tab, filter should complete in <500ms
6. **Click on a clinic**: View detail page
   - **Verify**: Clinic info, working hours, available time slots displayed
   - **Expected**: Time slots for next 7 days, green = available
7. **Select a time slot**: Click on available slot (e.g., "Dec 27, 10:00 AM")
   - **Verify**: Booking form appears
8. **Fill booking form**:
   - **Reason for visit**: "Regular checkup for blood pressure monitoring" (min 10 chars)
   - **Verify**: Phone and email pre-filled from profile
9. **Submit appointment request**: Click "Request Appointment"
   - **Expected**: Success message "Appointment request sent, awaiting clinic confirmation"
   - **Verify**: Redirected to patient dashboard showing pending appointment
10. **Check email notification** (Inbucket: http://localhost:54324):
    - **Verify**: Email sent to patient with appointment details
    - **Subject**: "Appointment Request Submitted"
11. **Performance**: Entire flow should complete in <3 minutes (SC-001)

**Pass Criteria**:
- ✅ All steps complete without errors
- ✅ Appointment created in database (status = 'Pending')
- ✅ Patient received email notification
- ✅ Performance targets met (<3 min total, <500ms filter, <2s page loads)

---

### Journey 2: Clinic Staff Manage Appointments (P2)

**Test**: Approve and reject appointment requests

1. **Sign out**: Click user menu > Sign out
2. **Sign in as clinic staff**:
   - Use test clinic staff account (from seed data)
   - Or create new Google account and assign clinic_staff role in Supabase Studio
3. **Navigate to clinic dashboard**: http://localhost:3000/clinic/dashboard
   - **Verify**: See pending appointment requests
   - **Expected**: Appointment from Journey 1 appears
4. **Click on pending appointment**: View details
   - **Verify**: Patient name, phone, email, reason for visit displayed
   - **Security check**: Other patients' appointments NOT visible
5. **Approve appointment**: Click "Approve" button
   - **Expected**: Success message "Appointment confirmed"
   - **Verify**: Status changes to "Confirmed"
   - **Verify**: Time slot marked as unavailable (is_available = false in DB)
6. **Check patient email** (Inbucket):
   - **Verify**: Patient received "Appointment Confirmed" email
   - **Subject**: "Your Appointment is Confirmed"
   - **Body**: Includes date, time, clinic name
7. **Create another appointment** (as patient, different slot)
8. **Sign back in as clinic staff**
9. **Reject the new appointment**: Click "Reject" button
   - **Optional**: Add rejection reason "Clinic is fully booked that day"
   - **Expected**: Status changes to "Rejected"
   - **Verify**: Time slot becomes available again (is_available = true)
10. **Check patient email**:
    - **Verify**: Patient received "Appointment Rejected" email

**Pass Criteria**:
- ✅ Clinic staff can view only their clinic's appointments (RLS works)
- ✅ Approve/reject changes appointment status correctly
- ✅ Time slot availability updates correctly
- ✅ Email notifications sent for both actions
- ✅ No double-booking: Cannot approve two appointments for same slot

---

### Journey 3: Google Authentication (P3)

**Test**: OAuth login and session management

1. **Sign out**: Clear session
2. **Navigate to protected page**: http://localhost:3000/clinics/bookings
   - **Expected**: Redirected to login page
3. **Click "Sign in with Google"**:
   - **Expected**: Redirected to Google OAuth consent screen
4. **Authorize application**:
   - **Expected**: Redirected back to app, logged in
   - **Verify**: User email displayed in header
5. **Check Supabase Studio**:
   - **Verify**: User record created in `users` table
   - **Verify**: `google_id`, `email`, `name`, `avatar_url` populated
6. **Idle for 15 minutes**:
   - **Expected**: Session timeout, redirected to login (security requirement)
7. **Sign in again**:
   - **Expected**: Fast re-authentication (Google remembers consent)

**Pass Criteria**:
- ✅ Google OAuth flow works end-to-end
- ✅ User data synced to database
- ✅ Session persists across page refreshes
- ✅ Session expires after inactivity (Constitution I requirement)

---

## 7. Run Automated Tests

### Unit Tests

```bash
npm run test:unit
```

**Expected output**:
```
 ✓ tests/unit/lib/appointments.test.ts (10)
 ✓ tests/unit/lib/validations.test.ts (8)
 ✓ tests/unit/components/AppointmentForm.test.tsx (5)

Test Files: 3 passed (3)
     Tests: 23 passed (23)
  Duration: 1.2s
```

**Target**: 80% code coverage (Constitution V requirement)

### Integration Tests

```bash
npm run test:integration
```

**Expected output**:
```
 ✓ tests/integration/api/appointments.test.ts (12)
 ✓ tests/integration/api/clinics.test.ts (6)

Test Files: 2 passed (2)
     Tests: 18 passed (18)
  Duration: 3.5s
```

**Verification**: API routes work with Supabase local DB

### E2E Tests

```bash
npm run test:e2e
```

**Expected output**:
```
Running 3 tests using 1 worker

  ✓ tests/e2e/booking.spec.ts:5:1 › patient can book appointment (15s)
  ✓ tests/e2e/clinic-management.spec.ts:5:1 › clinic staff can approve appointment (12s)
  ✓ tests/e2e/clinic-management.spec.ts:15:1 › clinic staff can reject appointment (10s)

  3 passed (37s)
```

**Target**: All critical user journeys pass (SC-004: 90% success rate)

---

## 8. Performance Verification

### Lighthouse Audit

```bash
npm run lighthouse
```

**Expected metrics** (Constitution II & SC-002, SC-003):
- **Performance**: ≥90
- **Accessibility**: ≥90 (WCAG 2.1 AA)
- **First Contentful Paint**: <2s
- **Time to Interactive**: <3s

### Manual Performance Checks

1. **Page load timing**:
   - Open DevTools > Performance tab
   - Reload http://localhost:3000/clinics
   - **Verify**: DOMContentLoaded < 2s (SC-002)

2. **Filter response timing**:
   - Open http://localhost:3000/clinics
   - Apply specialty filter
   - Open DevTools > Network tab
   - **Verify**: Filter response < 500ms (SC-003)

3. **Booking flow timing**:
   - Start timer
   - Complete entire booking flow (Journey 1)
   - **Verify**: Total time < 3 minutes (SC-001)

---

## 9. Security Verification

### Row Level Security (RLS)

**Test**: Patients cannot see other patients' appointments

1. **Sign in as Patient A**: Create appointment
2. **Copy appointment ID** from database (Supabase Studio)
3. **Sign out, sign in as Patient B**
4. **Try to access Patient A's appointment**:
   ```bash
   curl -H "Authorization: Bearer <patient-b-jwt>" \
     http://localhost:3000/api/v1/appointments/<patient-a-appointment-id>
   ```
   - **Expected**: 403 Forbidden or empty response
   - **Verify**: RLS policy blocks access

**Test**: Clinic staff cannot manage other clinics' appointments

1. **Create two clinics with different staff**
2. **Sign in as Clinic A staff**
3. **Try to approve Clinic B's appointment** via API
   - **Expected**: 403 Forbidden
   - **Verify**: RLS policy enforces clinic_id check

### OWASP Top 10 Checks

Run automated security scan:

```bash
npm run security-scan
```

**Expected**: No high/critical vulnerabilities

---

## 10. Database Verification

### Check Data Integrity

Open Supabase Studio: http://localhost:54323

1. **Appointments table**:
   - **Verify**: No duplicate appointments for same time_slot_id
   - **Verify**: approved_by is always clinic staff from same clinic
   - **Query**:
     ```sql
     SELECT * FROM appointments
     WHERE status = 'Confirmed'
     AND time_slot_id IN (
       SELECT time_slot_id FROM appointments
       GROUP BY time_slot_id HAVING COUNT(*) > 1
     );
     ```
   - **Expected**: 0 rows (no double-booking)

2. **Audit log**:
   - **Verify**: All appointment status changes logged
   - **Query**:
     ```sql
     SELECT * FROM appointment_audit
     ORDER BY changed_at DESC
     LIMIT 10;
     ```
   - **Expected**: Rows for each approve/reject action

3. **Notifications**:
   - **Verify**: Notifications sent for all status changes
   - **Query**:
     ```sql
     SELECT delivery_status, COUNT(*)
     FROM notifications
     GROUP BY delivery_status;
     ```
   - **Expected**: delivery_status = 'sent' for all notifications

---

## 11. Deployment Readiness

### Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Lighthouse score ≥90 for Performance & Accessibility
- [ ] No console errors in browser
- [ ] Environment variables documented in `.env.example`
- [ ] Database migrations reviewed and tested
- [ ] RLS policies verified
- [ ] API rate limiting configured
- [ ] Error handling tested (try invalid inputs)
- [ ] Email notifications working (check Inbucket)
- [ ] Google OAuth configured for production domain

### Deploy to Vercel

```bash
vercel login
vercel --prod
```

**Post-Deployment**:
1. Set environment variables in Vercel dashboard
2. Link Supabase production project
3. Run database migrations on production
4. Test production OAuth flow
5. Monitor Vercel Analytics for Web Vitals

---

## Troubleshooting

### Issue: Supabase not starting

**Solution**:
```bash
supabase stop
docker system prune -a
supabase start
```

### Issue: Google OAuth redirect error

**Solution**:
- Check authorized redirect URIs in Google Cloud Console
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
- Ensure Supabase Auth provider configured correctly

### Issue: RLS policy blocking legitimate access

**Solution**:
- Check user's role in `users` table
- Verify `clinic_staff` entry exists for staff users
- Review RLS policies in Supabase Studio > Authentication > Policies

### Issue: Email notifications not sending

**Solution**:
- Check Supabase Edge Functions logs
- Verify Inbucket is running: http://localhost:54324
- For production, configure email provider (SendGrid, Resend, etc.)

---

## Success Criteria Verification

Use this checklist to verify all success criteria from spec.md:

### User Experience & Performance
- [ ] SC-001: Booking flow <3 minutes ✓ (tested in Journey 1)
- [ ] SC-002: Clinic listing page loads <2s ✓ (Lighthouse)
- [ ] SC-003: Specialty filter <500ms ✓ (DevTools Network tab)
- [ ] SC-004: 90% booking success rate ✓ (E2E tests passing)

### System Reliability
- [ ] SC-005: Zero double-booking ✓ (database query confirms)
- [ ] SC-006: 99.9% uptime ✓ (requires production monitoring)
- [ ] SC-007: 95% emails delivered <2 min ✓ (check notification delivery_status)
- [ ] SC-008: 100% audit log accuracy ✓ (appointment_audit table populated)

### Security & Compliance
- [ ] SC-013: 100% Google OAuth ✓ (no password login)
- [ ] SC-014: PHI encrypted at rest ✓ (Supabase encryption enabled)
- [ ] SC-015: RLS enforced ✓ (security tests passing)
- [ ] SC-016: All modifications logged ✓ (audit table verified)

---

## Next Steps

After successful local testing:

1. **Create Production Environment**:
   - Set up production Supabase project
   - Configure production Google OAuth credentials
   - Set up email provider (SendGrid, Resend, etc.)

2. **Deploy to Vercel**:
   - Connect GitHub repository
   - Configure environment variables
   - Enable preview deployments for PRs

3. **Monitoring**:
   - Set up Vercel Analytics
   - Configure Supabase Database Performance Insights
   - Set up error tracking (Sentry, LogRocket)

4. **Post-MVP Enhancements**:
   - Multi-language support (i18n)
   - PWA capabilities (offline mode)
   - Appointment reminders (24h before)
   - Clinic schedule management UI
   - Patient appointment history

---

**Congratulations!** 🎉 You've successfully set up and tested the Clinic Appointment Booking System. The application is ready for production deployment.
