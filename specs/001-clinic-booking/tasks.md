# Tasks: Clinic Appointment Booking System

**Input**: Design documents from `/specs/001-clinic-booking/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api-spec.yaml ✓

**Tests**: Not explicitly requested in spec, but constitution requires 80% coverage. Tests included per constitution V.

**Organization**: Tasks grouped by user story (P1, P2, P3) to enable independent implementation and testing.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Include exact file paths

## Path Conventions

Using Next.js full-stack structure from plan.md:
- **App Router**: `app/` (routes + API)
- **Components**: `components/`
- **Business logic**: `lib/`
- **Database**: `supabase/migrations/`
- **Tests**: `tests/unit/`, `tests/integration/`, `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Next.js project with TypeScript, Tailwind, and Supabase

- [X] T001 Initialize Next.js 14+ project with TypeScript and App Router in clinic-booking-app/
- [X] T002 [P] Configure Tailwind CSS 3.x with mobile-first breakpoints in tailwind.config.ts
- [X] T003 [P] Install and configure Supabase Client 2.x dependencies in package.json
- [X] T004 [P] Create Supabase local development config in supabase/config.toml
- [X] T005 [P] Configure ESLint and Prettier for code quality in .eslintrc.json and .prettierrc
- [X] T006 [P] Setup Vitest for unit testing in vitest.config.ts
- [X] T007 [P] Setup Playwright for E2E testing in playwright.config.ts
- [X] T008 Create environment variables template in .env.example
- [X] T009 [P] Configure Vercel deployment settings in vercel.json
- [X] T010 [P] Setup GitHub Actions CI/CD workflow in .github/workflows/ci.yml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [X] T011 Create Supabase migration for users table in supabase/migrations/001_create_users.sql
- [X] T012 Create Supabase migration for patients table in supabase/migrations/002_create_patients.sql
- [X] T013 Create Supabase migration for clinics table in supabase/migrations/003_create_clinics.sql
- [X] T014 Create Supabase migration for medical_specialties table with seed data in supabase/migrations/004_create_specialties.sql
- [X] T015 Create Supabase migration for clinic_specialties junction table in supabase/migrations/005_create_clinic_specialties.sql
- [X] T016 Create Supabase migration for clinic_staff table in supabase/migrations/006_create_clinic_staff.sql
- [X] T017 Create Supabase migration for time_slots table in supabase/migrations/007_create_time_slots.sql
- [X] T018 Create Supabase migration for appointments table in supabase/migrations/008_create_appointments.sql
- [X] T019 Create Supabase migration for notifications table in supabase/migrations/009_create_notifications.sql
- [X] T020 Create Supabase migration for appointment_audit table with triggers in supabase/migrations/010_create_audit.sql
- [X] T021 Create Supabase migration for RLS policies on all tables in supabase/migrations/011_enable_rls.sql
- [X] T022 Create double-booking prevention trigger function in supabase/migrations/012_prevent_double_booking.sql

### Authentication Foundation

- [X] T023 Configure Supabase Auth with Google OAuth provider in supabase/config.toml
- [X] T024 Create Supabase client singleton in lib/supabase/client.ts
- [X] T025 Create server-side Supabase client in lib/supabase/server.ts
- [X] T026 Implement auth context provider in lib/auth/AuthProvider.tsx
- [X] T027 Create auth middleware for protected routes in middleware.ts

### Shared UI Components (Tailwind + Accessibility)

- [X] T028 [P] Create base Button component with WCAG AA compliance in components/ui/Button.tsx
- [X] T029 [P] Create Input component with validation states in components/ui/Input.tsx
- [X] T030 [P] Create Select dropdown component in components/ui/Select.tsx
- [X] T031 [P] Create Modal component with focus trap in components/ui/Modal.tsx
- [X] T032 [P] Create Toast notification component in components/ui/Toast.tsx
- [X] T033 [P] Create Loading spinner component in components/ui/Loading.tsx
- [X] T034 [P] Create Card component for clinic listings in components/ui/Card.tsx

### Validation & Types

- [X] T035 [P] Generate TypeScript types from Supabase schema in lib/supabase/database.types.ts
- [X] T036 [P] Create Zod schemas for appointment validation in lib/validations/appointment.ts
- [X] T037 [P] Create Zod schemas for user profile validation in lib/validations/user.ts
- [X] T038 [P] Create shared TypeScript types in lib/types/index.ts

### Layout & Navigation

- [X] T039 Create root layout with navigation header in app/layout.tsx
- [X] T040 Create auth layout group in app/(auth)/layout.tsx
- [X] T041 Create patient layout group in app/(patient)/layout.tsx
- [X] T042 Create clinic staff layout group in app/(clinic)/layout.tsx
- [X] T043 [P] Create navigation component with role-based links in components/Navigation.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Patient Browse and Book Appointment (Priority: P1) 🎯 MVP

**Goal**: Enable patients to discover clinics by specialty, view availability, and submit booking requests

**Independent Test**: Patient can browse clinics → filter by specialty → view clinic detail → select time slot → submit appointment → see confirmation message

### Tests for User Story 1 (Constitution V: 80% coverage required)

- [X] T044 [P] [US1] Contract test for GET /api/v1/clinics in tests/integration/api/clinics.test.ts
- [X] T045 [P] [US1] Contract test for GET /api/v1/clinics/[id] in tests/integration/api/clinics-detail.test.ts
- [X] T046 [P] [US1] Contract test for POST /api/v1/appointments in tests/integration/api/appointments.test.ts
- [X] T047 [P] [US1] Unit test for clinic filtering logic in tests/unit/lib/clinics.test.ts
- [X] T048 [P] [US1] Unit test for time slot availability check in tests/unit/lib/appointments.test.ts
- [X] T049 [P] [US1] E2E test for complete booking flow in tests/e2e/patient-booking.spec.ts

### API Routes for User Story 1

- [X] T050 [P] [US1] Implement GET /api/v1/specialties endpoint in app/api/v1/specialties/route.ts
- [X] T051 [P] [US1] Implement GET /api/v1/clinics with specialty filter in app/api/v1/clinics/route.ts
- [X] T052 [US1] Implement GET /api/v1/clinics/[clinicId] with time slots in app/api/v1/clinics/[clinicId]/route.ts
- [X] T053 [US1] Implement POST /api/v1/appointments with validation in app/api/v1/appointments/route.ts

### Database Queries for User Story 1

- [X] T054 [P] [US1] Create clinic listing query with RLS in lib/supabase/queries/clinics.ts
- [X] T055 [P] [US1] Create clinic detail query with specialties join in lib/supabase/queries/clinics.ts
- [X] T056 [P] [US1] Create time slots availability query in lib/supabase/queries/time-slots.ts
- [X] T057 [US1] Create appointment creation mutation with transaction in lib/supabase/queries/appointments.ts

### UI Components for User Story 1

- [X] T058 [P] [US1] Create SpecialtyFilter dropdown component in components/clinic/SpecialtyFilter.tsx
- [X] T059 [P] [US1] Create ClinicCard display component in components/clinic/ClinicCard.tsx
- [X] T060 [P] [US1] Create ClinicList container component in components/clinic/ClinicList.tsx
- [X] T061 [P] [US1] Create TimeSlotSelector calendar component in components/appointment/TimeSlotSelector.tsx
- [X] T062 [US1] Create AppointmentForm with Zod validation in components/appointment/AppointmentForm.tsx

### Pages for User Story 1

- [X] T063 [US1] Create landing page with CTA in app/page.tsx
- [X] T064 [US1] Create clinic listing page with SSR in app/(patient)/clinics/page.tsx
- [X] T065 [US1] Create clinic detail page with dynamic route in app/(patient)/clinics/[clinicId]/page.tsx
- [X] T066 [US1] Create patient dashboard showing appointments in app/(patient)/dashboard/page.tsx

### Business Logic for User Story 1

- [X] T067 [P] [US1] Implement specialty filtering utility in lib/utils/filter-clinics.ts
- [X] T068 [P] [US1] Implement date/time validation for appointments in lib/utils/validate-timeslot.ts
- [X] T069 [US1] Implement appointment booking workflow in lib/services/appointment-service.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (MVP!)

---

## Phase 4: User Story 2 - Clinic Appointment Management (Priority: P2)

**Goal**: Enable clinic staff to view pending requests, review patient details, and approve/reject appointments

**Independent Test**: Clinic staff can log in → view pending requests → review patient details → approve appointment → patient receives email

### Tests for User Story 2

- [ ] T070 [P] [US2] Contract test for POST /api/v1/appointments/[id]/approve in tests/integration/api/approve.test.ts
- [ ] T071 [P] [US2] Contract test for POST /api/v1/appointments/[id]/reject in tests/integration/api/reject.test.ts
- [ ] T072 [P] [US2] Unit test for double-booking prevention in tests/unit/lib/double-booking.test.ts
- [ ] T073 [P] [US2] Unit test for RLS policy enforcement in tests/unit/lib/rls-policies.test.ts
- [X] T074 [P] [US2] E2E test for approve workflow in tests/e2e/clinic-approve.spec.ts
- [ ] T075 [P] [US2] E2E test for reject workflow in tests/e2e/clinic-reject.spec.ts

### API Routes for User Story 2

- [X] T076 [P] [US2] Implement GET /api/v1/appointments?status=Pending in app/api/v1/appointments/route.ts
- [X] T077 [US2] Implement POST /api/v1/appointments/[id]/approve in app/api/v1/appointments/[appointmentId]/approve/route.ts
- [X] T078 [US2] Implement POST /api/v1/appointments/[id]/reject in app/api/v1/appointments/[appointmentId]/reject/route.ts

### Database Queries for User Story 2

- [X] T079 [P] [US2] Create clinic appointments query with RLS in lib/supabase/queries/clinic-appointments.ts
- [X] T080 [US2] Create appointment approval mutation with time slot update in lib/supabase/queries/appointments.ts
- [X] T081 [US2] Create appointment rejection mutation with time slot release in lib/supabase/queries/appointments.ts

### UI Components for User Story 2

- [X] T082 [P] [US2] Create AppointmentRequestCard component in components/clinic/AppointmentRequestCard.tsx
- [X] T083 [P] [US2] Create PatientInfoDisplay component in components/clinic/PatientInfoDisplay.tsx
- [X] T084 [US2] Create AppointmentActions approve/reject buttons in components/clinic/AppointmentActions.tsx
- [X] T085 [P] [US2] Create StatusBadge component for appointment status in components/appointment/StatusBadge.tsx

### Pages for User Story 2

- [X] T086 [US2] Create clinic dashboard with pending requests in app/(clinic)/clinic-dashboard/page.tsx
- [X] T087 [US2] Create appointment detail modal/page in app/(clinic)/appointments/[appointmentId]/page.tsx

### Business Logic for User Story 2

- [X] T088 [US2] Implement double-booking check before approval in lib/utils/double-booking.ts
- [X] T089 [US2] Implement RLS authorization check for clinic staff in lib/middleware/auth.ts
- [X] T090 [US2] Implement optimistic UI updates for approve/reject in lib/hooks/useOptimisticAppointment.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - complete booking flow functional!

---

## Phase 5: User Story 3 - Google Authentication and Email Notifications (Priority: P3)

**Goal**: Secure user authentication via Google OAuth and automated email notifications for all appointment events

**Independent Test**: User can sign in with Google → receive JWT → appointments trigger emails → verify delivery

### Tests for User Story 3

- [ ] T091 [P] [US3] E2E test for Google OAuth login flow in tests/e2e/auth-google.spec.ts
- [ ] T092 [P] [US3] Integration test for email notification Edge Function in tests/integration/notifications.test.ts
- [ ] T093 [P] [US3] Unit test for JWT token validation in tests/unit/lib/auth.test.ts
- [ ] T094 [P] [US3] Unit test for email template rendering in tests/unit/lib/email-templates.test.ts

### Authentication Implementation

- [ ] T095 [US3] Implement Google OAuth callback handler in app/api/auth/callback/route.ts
- [ ] T096 [US3] Create sign-in page with Google button in app/(auth)/login/page.tsx
- [ ] T097 [US3] Implement sign-out functionality in app/api/auth/signout/route.ts
- [ ] T098 [P] [US3] Create useAuth hook for client components in lib/hooks/useAuth.ts
- [ ] T099 [P] [US3] Create ProtectedRoute wrapper component in components/auth/ProtectedRoute.tsx

### Email Notification Implementation

- [ ] T100 [P] [US3] Create email templates for appointment created in supabase/functions/send-email/templates/appointment-created.html
- [ ] T101 [P] [US3] Create email templates for appointment confirmed in supabase/functions/send-email/templates/appointment-confirmed.html
- [ ] T102 [P] [US3] Create email templates for appointment rejected in supabase/functions/send-email/templates/appointment-rejected.html
- [ ] T103 [US3] Implement Supabase Edge Function for email sending in supabase/functions/send-email/index.ts
- [ ] T104 [US3] Create database trigger to invoke email function on appointment changes in supabase/migrations/013_email_triggers.sql
- [ ] T105 [US3] Implement email delivery status tracking in lib/services/notification-service.ts

### Integration for User Story 3

- [ ] T106 [US3] Update appointment creation to trigger email notification in app/api/v1/appointments/route.ts
- [ ] T107 [US3] Update appointment approval to trigger email notification in app/api/v1/appointments/[appointmentId]/approve/route.ts
- [ ] T108 [US3] Update appointment rejection to trigger email notification in app/api/v1/appointments/[appointmentId]/reject/route.ts
- [ ] T109 [US3] Add email notification status to patient dashboard in app/(patient)/dashboard/page.tsx

**Checkpoint**: All user stories should now be independently functional - full system operational!

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories + production readiness

### Performance Optimization

- [ ] T110 [P] Implement Server Components for clinic listings in app/(patient)/clinics/page.tsx
- [ ] T111 [P] Add React Suspense boundaries for loading states in app/(patient)/clinics/loading.tsx
- [ ] T112 [P] Optimize images with Next.js Image component in components/clinic/ClinicCard.tsx
- [ ] T113 [P] Implement client-side caching for specialty filter in lib/hooks/useFilteredClinics.ts
- [ ] T114 [P] Add database indexes for performance in supabase/migrations/014_add_indexes.sql

### Error Handling & Resilience

- [ ] T115 [P] Create global error boundary in app/error.tsx
- [ ] T116 [P] Create not-found page in app/not-found.tsx
- [ ] T117 [P] Implement retry logic for failed email notifications in lib/services/notification-service.ts
- [ ] T118 [P] Add graceful degradation for unavailable time slots in components/appointment/TimeSlotSelector.tsx

### Security Hardening

- [ ] T119 [P] Implement rate limiting middleware in middleware.ts
- [ ] T120 [P] Add CSRF protection for API routes in lib/middleware/csrf.ts
- [ ] T121 [P] Audit and test all RLS policies in tests/integration/security/rls.test.ts
- [ ] T122 [P] Implement input sanitization for user-generated content in lib/utils/sanitize.ts

### Accessibility & UX

- [ ] T123 [P] Add ARIA labels to all interactive elements across components/
- [ ] T124 [P] Implement keyboard navigation for time slot selector in components/appointment/TimeSlotSelector.tsx
- [ ] T125 [P] Ensure color contrast meets WCAG AA in tailwind.config.ts
- [ ] T126 [P] Add loading skeletons for better perceived performance in components/ui/Skeleton.tsx

### Testing & Quality

- [ ] T127 [P] Achieve 80% unit test coverage for lib/ directory
- [ ] T128 [P] Run Lighthouse audit and fix performance issues to achieve >90 score
- [ ] T129 [P] Run OWASP ZAP security scan and remediate findings
- [ ] T130 [P] Setup test data seeding script in scripts/seed.ts

### Documentation & Deployment

- [ ] T131 [P] Write README.md with setup instructions
- [ ] T132 [P] Document API endpoints in OpenAPI spec compliance check
- [ ] T133 [P] Create deployment guide for Vercel in docs/deployment.md
- [ ] T134 [P] Run quickstart.md validation (all steps work)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 and US2 but they work without it

### Within Each User Story

**For US1 (Patient Booking)**:
1. Tests (T044-T049) should be written FIRST and FAIL before implementation
2. API routes (T050-T053) can be built in parallel
3. Database queries (T054-T057) can be built in parallel with API routes
4. UI components (T058-T062) can be built in parallel once queries ready
5. Pages (T063-T066) depend on components being ready
6. Business logic (T067-T069) can be built alongside other tasks

**For US2 (Clinic Management)**:
1. Tests (T070-T075) first, ensure they fail
2. API routes (T076-T078) in parallel
3. Database queries (T079-T081) in parallel with API routes
4. UI components (T082-T085) in parallel once queries ready
5. Pages (T086-T087) depend on components
6. Business logic (T088-T090) alongside other tasks

**For US3 (Auth & Notifications)**:
1. Tests (T091-T094) first, ensure they fail
2. Authentication (T095-T099) can be built in parallel
3. Email templates (T100-T102) can be built in parallel with auth
4. Edge Function (T103-T105) after templates ready
5. Integration tasks (T106-T109) after Edge Function working

### Parallel Opportunities

Within each phase, tasks marked **[P]** can run simultaneously:

**Phase 1 (Setup)**: T002, T003, T004, T005, T006, T007, T009, T010 (8 parallel)

**Phase 2 (Foundational)**:
- Database migrations (T011-T022) must run sequentially
- Auth setup (T023-T027) sequential
- UI components (T028-T034) all parallel (7 parallel)
- Validation (T035-T038) all parallel (4 parallel)
- Layouts (T039-T043) with T043 parallel

**Phase 3 (US1)**:
- Tests (T044-T049) all parallel (6 parallel)
- API routes (T050-T051) parallel, T052-T053 sequential
- Database queries (T054-T056) parallel, T057 after
- UI components (T058-T061) parallel, T062 after
- Business logic (T067-T068) parallel

**Phase 4 (US2)**:
- Tests (T070-T075) all parallel (6 parallel)
- API routes (T076) first, then T077-T078 sequential
- Database queries (T079) parallel with T076, T080-T081 after
- UI components (T082-T083, T085) parallel

**Phase 5 (US3)**:
- Tests (T091-T094) all parallel (4 parallel)
- Email templates (T100-T102) all parallel (3 parallel)
- Auth tasks (T098-T099) parallel

**Phase 6 (Polish)**: Most tasks parallel (23 out of 25)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T044: "Contract test for GET /api/v1/clinics in tests/integration/api/clinics.test.ts"
Task T045: "Contract test for GET /api/v1/clinics/[id] in tests/integration/api/clinics-detail.test.ts"
Task T046: "Contract test for POST /api/v1/appointments in tests/integration/api/appointments.test.ts"
Task T047: "Unit test for clinic filtering logic in tests/unit/lib/clinics.test.ts"
Task T048: "Unit test for time slot availability check in tests/unit/lib/appointments.test.ts"
Task T049: "E2E test for complete booking flow in tests/e2e/patient-booking.spec.ts"

# Launch all API route implementations together:
Task T050: "Implement GET /api/v1/specialties endpoint in app/api/v1/specialties/route.ts"
Task T051: "Implement GET /api/v1/clinics with specialty filter in app/api/v1/clinics/route.ts"

# Launch all database queries together:
Task T054: "Create clinic listing query with RLS in lib/supabase/queries/clinics.ts"
Task T055: "Create clinic detail query with specialties join in lib/supabase/queries/clinics.ts"
Task T056: "Create time slots availability query in lib/supabase/queries/time-slots.ts"

# Launch all UI components together:
Task T058: "Create SpecialtyFilter dropdown component in components/clinic/SpecialtyFilter.tsx"
Task T059: "Create ClinicCard display component in components/clinic/ClinicCard.tsx"
Task T060: "Create ClinicList container component in components/clinic/ClinicList.tsx"
Task T061: "Create TimeSlotSelector calendar component in components/appointment/TimeSlotSelector.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only - Fastest Time to Value)

1. Complete Phase 1: Setup (10 tasks)
2. Complete Phase 2: Foundational (33 tasks) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (26 tasks)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy to staging/production if ready

**Total MVP**: 69 tasks → Deliverable working product (patients can book, clinics can see pending)

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready (43 tasks)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (26 tasks)
3. Add User Story 2 → Test independently → Deploy/Demo (21 tasks)
4. Add User Story 3 → Test independently → Deploy/Demo (19 tasks)
5. Polish phase for production readiness (25 tasks)

**Checkpoints**:
- After US1: Basic booking works, patients can request appointments
- After US2: Complete workflow, clinics can approve/reject
- After US3: Full authentication + automated notifications
- After Polish: Production-grade system

### Parallel Team Strategy

With 3 developers after Foundational phase:

1. **Team completes Setup + Foundational together** (43 tasks)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (26 tasks)
   - Developer B: User Story 2 (21 tasks)
   - Developer C: User Story 3 (19 tasks)
3. Stories complete and integrate independently
4. **Team rejoins for Polish phase** (25 tasks)

---

## Task Summary

| Phase | Task Count | Can Parallelize | Critical Path |
|-------|-----------|----------------|---------------|
| Phase 1: Setup | 10 | 8 (80%) | ~1 day |
| Phase 2: Foundational | 33 | 15 (45%) | ~3 days |
| Phase 3: US1 (P1) | 26 | 18 (69%) | ~2 days |
| Phase 4: US2 (P2) | 21 | 12 (57%) | ~1.5 days |
| Phase 5: US3 (P3) | 19 | 10 (53%) | ~1.5 days |
| Phase 6: Polish | 25 | 23 (92%) | ~1 day |
| **TOTAL** | **134** | **86 (64%)** | **~10 days** |

**MVP (Setup + Foundational + US1)**: 69 tasks (~6 days single developer, ~3 days with parallelization)

**Full System (All phases)**: 134 tasks (~10 days single developer, ~5 days with team parallelization)

---

## Notes

- **[P] tasks** = different files, no dependencies → can parallelize
- **[Story] labels** map to user stories in spec.md (US1, US2, US3)
- Each user story independently completable and testable
- **Tests written FIRST** per constitution V (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies

**Constitution Compliance**:
- ✅ 80% test coverage (V): 32 test tasks across unit/integration/E2E
- ✅ Security by design (I): RLS policies, auth middleware, OWASP scan
- ✅ Accessibility (II): WCAG AA tasks in Foundational + Polish
- ✅ Data integrity (III): Double-booking prevention, atomic transactions
- ✅ API-first (IV): All features have API endpoints before UI

All tasks ready for `/speckit.implement` execution! 🚀
