# Implementation Plan: Clinic Appointment Booking System

**Branch**: `001-clinic-booking` | **Date**: 2025-12-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-clinic-booking/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.github/agents/speckit.plan.agent.md` for the execution workflow.

## Summary

Build a two-sided healthcare booking platform enabling patients to discover and book appointments at medical clinics, and clinic staff to manage appointment requests. The system will use Next.js 14+ with App Router for full-stack development (TypeScript), Supabase for database and authentication (Google OAuth), Tailwind CSS for styling, and deploy to Vercel. Core features include clinic listing with specialty filtering, real-time availability viewing, appointment request workflow with approve/reject, and email notifications via Supabase Edge Functions.

## Technical Context

**Language/Version**: TypeScript 5.3+, JavaScript ES2022  
**Primary Dependencies**: Next.js 14+ (App Router), React 18+, Supabase Client 2.x, Tailwind CSS 3.x  
**Storage**: Supabase (PostgreSQL 15+ with Row Level Security)  
**Testing**: Vitest (unit), Playwright (E2E), Supabase local dev environment  
**Target Platform**: Web (Chrome/Safari/Edge latest), deployed to Vercel (serverless)  
**Project Type**: Web application (Next.js full-stack - frontend + API routes in single codebase)  
**Performance Goals**: <2s initial page load (SC-002), <500ms filter response (SC-003), <200ms API p95  
**Constraints**: Vercel free tier initially (512MB function memory, 10s execution limit), mobile-first responsive  
**Scale/Scope**: MVP target 100 appointments/month (SC-009), 10-20 clinics, ~500 patients, 5-10 pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Patient Privacy & Data Security (NON-NEGOTIABLE) ✅

- **OAuth2 Authentication**: Using Supabase Auth with Google OAuth ✅
- **Encryption at rest**: Supabase PostgreSQL provides transparent data encryption ✅
- **Role-based access**: Supabase RLS policies will enforce patient/clinic staff separation ✅
- **Audit logging**: Will implement via database triggers and audit table (FR-028) ✅
- **Data retention**: Supabase retention configurable, will set 7+ years for appointments ✅
- **Security incident reporting**: Application logging via Vercel Analytics + Supabase logs ✅

**STATUS**: PASS - All requirements met by chosen stack

### II. User-Centric Design ✅

- **<3 min booking flow**: Next.js App Router enables fast page transitions (SC-001) ✅
- **Mobile-responsive**: Tailwind CSS mobile-first approach ensures responsiveness ✅
- **WCAG 2.1 AA**: Will use semantic HTML, ARIA labels, keyboard navigation, color contrast ✅
- **Clear error messages**: React Hook Form validation with Tailwind error states ✅
- **Multi-language**: Next.js i18n support (deferred to post-MVP but architecture ready) ⚠️
- **Offline viewing**: Service worker for PWA capabilities (deferred to post-MVP) ⚠️

**STATUS**: PASS - Core requirements met, 2 items deferred with justification

### III. Data Integrity & Reliability ✅

- **Double-booking prevention**: PostgreSQL row-level locks + unique constraints (FR-020) ✅
- **Transactional updates**: Supabase transactions for appointment state changes ✅
- **Business rule validation**: Server-side validation in Next.js API routes + DB constraints ✅
- **Conflict resolution**: Optimistic locking with version/timestamp fields ✅
- **Daily backups**: Supabase Pro provides automated backups (upgrade path) ⚠️
- **Calendar sync accuracy**: Single source of truth in PostgreSQL ensures consistency ✅

**STATUS**: PASS - Backup requires Supabase Pro (documented upgrade path)

### IV. API-First Architecture ✅

- **RESTful API**: Next.js API routes follow REST conventions ✅
- **API for every feature**: All UI actions backed by API endpoints (separation of concerns) ✅
- **API versioning**: URL-based versioning (/api/v1/...) ✅
- **Rate limiting**: Vercel Edge Middleware + Supabase rate limiting ✅
- **API documentation**: Will generate OpenAPI spec from TypeScript types ✅
- **Contract testing**: Vitest contract tests for API routes (FR-031) ✅

**STATUS**: PASS - All requirements achievable with Next.js + Supabase

### V. Testing & Quality Assurance ✅

- **80% unit test coverage**: Vitest for business logic in lib/ and components ✅
- **Integration tests**: Supabase local DB + Vitest for booking flow tests ✅
- **E2E tests**: Playwright for critical journeys (browse, book, approve) ✅
- **Performance testing**: Lighthouse CI in GitHub Actions (<2s, <500ms targets) ✅
- **Security testing**: Dependabot + OWASP checks in CI, Supabase RLS policies reviewed ✅
- **CI/CD automation**: Vercel auto-deploy + GitHub Actions for tests ✅

**STATUS**: PASS - Comprehensive testing strategy defined

---

**OVERALL CONSTITUTION CHECK**: ✅ PASS

**Deferred Items** (documented for post-MVP):
1. Multi-language i18n (Principle II) - Architecture supports via next-i18next
2. Offline PWA capabilities (Principle II) - Service worker implementation deferred
3. Automated daily backups (Principle III) - Requires Supabase Pro upgrade ($25/mo)

**Justification**: All deferred items are post-MVP enhancements that don't block core functionality. MVP focuses on English-only, online-only experience with manual backup export capability.

## Project Structure

### Documentation (this feature)

```text
specs/001-clinic-booking/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-spec.yaml    # OpenAPI 3.0 specification
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
clinic-booking-app/          # Next.js project root
├── app/                     # Next.js App Router
│   ├── (auth)/             # Auth layout group
│   │   └── login/
│   ├── (patient)/          # Patient layout group
│   │   ├── clinics/        # Clinic listing & detail
│   │   ├── appointments/   # Patient appointment history
│   │   └── page.tsx        # Patient dashboard
│   ├── (clinic)/           # Clinic staff layout group
│   │   ├── dashboard/      # Clinic appointment management
│   │   └── page.tsx        # Clinic home
│   ├── api/                # API routes
│   │   ├── appointments/   # Appointment CRUD
│   │   ├── clinics/        # Clinic queries
│   │   └── notifications/  # Email triggers
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # Reusable React components
│   ├── ui/                 # Tailwind UI primitives
│   ├── clinic/             # Clinic-specific components
│   ├── appointment/        # Appointment components
│   └── auth/               # Auth components
├── lib/                    # Business logic & utilities
│   ├── supabase/           # Supabase client & queries
│   ├── validations/        # Zod schemas
│   ├── utils/              # Helper functions
│   └── types/              # TypeScript types
├── supabase/               # Supabase configuration
│   ├── migrations/         # SQL migrations
│   ├── functions/          # Edge Functions (email)
│   └── config.toml         # Local dev config
├── tests/
│   ├── unit/               # Vitest unit tests
│   ├── integration/        # API integration tests
│   └── e2e/                # Playwright E2E tests
├── public/                 # Static assets
├── tailwind.config.ts      # Tailwind configuration
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

**Structure Decision**: Using Next.js App Router with route groups for role-based layouts. This enables:
- Shared authentication state across all routes
- Role-specific layouts (patient vs clinic staff)
- API routes co-located with frontend for simplified deployment
- Server components for optimal performance
- Supabase folder for database schema and Edge Functions
- Clear separation: `app/` for routes, `components/` for UI, `lib/` for business logic

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations requiring justification. All constitution principles satisfied by chosen architecture.*
