# Research: Clinic Appointment Booking System

**Feature**: 001-clinic-booking  
**Date**: 2025-12-26  
**Purpose**: Document technology choices and best practices for Next.js/TypeScript/Supabase stack

## Technology Stack Decisions

### Decision 1: Next.js 14+ with App Router

**Chosen**: Next.js 14.x with App Router (app directory)

**Rationale**:
- **Full-stack in one codebase**: Eliminates need for separate frontend/backend repos, simplifying deployment to Vercel
- **Server Components**: Reduces client-side JavaScript, improving performance (SC-002: <2s page load)
- **API Routes**: Built-in API layer for appointment CRUD, authentication, notifications
- **TypeScript native**: First-class TypeScript support matches project requirement
- **Route groups**: Enable role-based layouts for patient vs clinic staff without URL changes
- **Streaming & Suspense**: Incremental loading for clinic listings improves perceived performance

**Alternatives Considered**:
- **Separate React + Express backend**: Rejected due to increased complexity (two deployments, CORS setup, duplicate TypeScript configs)
- **Next.js Pages Router**: Rejected because App Router offers better performance with Server Components and more flexible routing
- **Remix**: Rejected due to less mature ecosystem and Vercel is optimized for Next.js

**Best Practices**:
- Use Server Components by default, Client Components only when needed (interactivity, hooks)
- Implement route handlers in `app/api/` following REST conventions
- Use route groups `(patient)`, `(clinic)`, `(auth)` for role-based layouts
- Leverage `loading.tsx` and `error.tsx` for better UX
- Use middleware for authentication checks before route rendering

---

### Decision 2: TypeScript 5.3+ Strict Mode

**Chosen**: TypeScript 5.3+ with strict mode enabled

**Rationale**:
- **Type safety for healthcare data**: Prevents runtime errors when handling patient information (FR-029 security requirement)
- **Better DX**: IntelliSense and autocomplete reduce bugs during development
- **Zod integration**: TypeScript types can be inferred from Zod schemas for form validation
- **Supabase types**: Auto-generated types from database schema ensure type safety end-to-end
- **Constitution alignment**: Supports testing principle (V) by catching errors at compile time

**Best Practices**:
- Generate Supabase types: `supabase gen types typescript --local > lib/supabase/database.types.ts`
- Use Zod for runtime validation, infer TypeScript types: `z.infer<typeof schema>`
- Define strict types for API responses to catch breaking changes early
- Use discriminated unions for appointment status: `type Status = 'Pending' | 'Confirmed' | 'Rejected'`
- Avoid `any`, use `unknown` when type is truly unknown and narrow with type guards

---

### Decision 3: Supabase for Database + Auth + Realtime

**Chosen**: Supabase (PostgreSQL 15+ with Row Level Security, Auth, Edge Functions)

**Rationale**:
- **PostgreSQL RLS**: Row Level Security enforces patient privacy at database level (Constitution I: NON-NEGOTIABLE)
- **Google OAuth built-in**: Native support for FR-002 authentication requirement
- **Realtime subscriptions**: Clinic dashboard can auto-update when new appointments arrive
- **Edge Functions**: Serverless functions for email notifications (FR-022-FR-027)
- **TypeScript SDK**: First-class client library with type safety
- **Transaction support**: ACID compliance for double-booking prevention (FR-020, Constitution III)
- **Audit logging**: Can use triggers to auto-populate audit table (FR-028)

**Alternatives Considered**:
- **Vercel Postgres + NextAuth**: Rejected because requires more manual setup for RLS, realtime, and email triggers
- **Firebase**: Rejected due to less mature SQL support and vendor lock-in concerns
- **Prisma + raw PostgreSQL**: Rejected because Supabase provides more out-of-box features (auth, realtime, edge functions)

**Best Practices**:
- Define RLS policies for every table: patients see only their data, clinics see only their appointments
- Use database transactions for appointment approval to prevent race conditions
- Create Supabase Edge Functions for email notifications (Deno runtime)
- Use Supabase local development: `supabase start` for offline testing
- Store only hashed tokens, never plaintext passwords (OAuth only, but important for future)
- Use database migrations for schema changes: `supabase migration new <name>`

---

### Decision 4: Tailwind CSS 3.x for Styling

**Chosen**: Tailwind CSS 3.x with mobile-first approach

**Rationale**:
- **Mobile-first responsive**: Aligns with Constitution II requirement (60%+ mobile users)
- **Utility-first**: Rapid prototyping while maintaining consistency
- **Accessibility utilities**: Built-in screen reader classes, focus states for WCAG 2.1 AA
- **Dark mode support**: Easy to add for future enhancement
- **Small bundle size**: PurgeCSS removes unused styles, improving SC-002 (<2s page load)
- **Next.js integration**: Official Tailwind plugin for Next.js

**Alternatives Considered**:
- **CSS Modules**: Rejected due to more verbose syntax and harder to maintain design system
- **Styled Components**: Rejected due to runtime performance overhead
- **Chakra UI**: Rejected because Tailwind offers more control and smaller bundle size

**Best Practices**:
- Define design tokens in `tailwind.config.ts`: colors, spacing, typography
- Use `@layer components` for reusable component classes
- Create custom plugins for clinic-specific design patterns
- Use `group` and `peer` utilities for complex hover/focus states
- Ensure color contrast meets WCAG AA: use tools like `tailwindcss-accessibility`
- Mobile-first: write base styles for mobile, use `md:`, `lg:` breakpoints for larger screens

---

### Decision 5: Vercel for Deployment

**Chosen**: Vercel platform with auto-deployment from GitHub

**Rationale**:
- **Optimized for Next.js**: Built by the Next.js team, zero-config deployment
- **Serverless functions**: API routes auto-deploy as serverless functions (no server management)
- **Edge network**: Global CDN improves SC-002 (<2s page load) for international users
- **Preview deployments**: Every PR gets a unique URL for testing
- **Environment variables**: Secure management of Supabase keys, OAuth secrets
- **Analytics built-in**: Web Vitals tracking to monitor SC-002, SC-003 performance targets
- **Free tier sufficient for MVP**: 100GB bandwidth, unlimited hobby projects

**Alternatives Considered**:
- **AWS Amplify**: Rejected due to more complex setup and vendor lock-in
- **Netlify**: Rejected because Vercel has better Next.js integration and Edge Functions
- **Self-hosted VPS**: Rejected due to maintenance overhead and slower iteration

**Best Practices**:
- Use environment variables for secrets: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- Enable Vercel Analytics to track Web Vitals and user flows
- Configure custom domains with HTTPS (automatic via Vercel)
- Use preview deployments for stakeholder reviews before production merge
- Set up Vercel Speed Insights to monitor <2s, <500ms targets
- Use Vercel Cron for scheduled tasks (e.g., appointment reminders)

---

## Architecture Patterns

### Pattern 1: Server Actions for Mutations

**Decision**: Use Next.js Server Actions for form submissions and data mutations

**Rationale**:
- **Progressive enhancement**: Forms work without JavaScript (accessibility)
- **Type-safe**: Server Actions are TypeScript functions, catch errors at compile time
- **Simplified data flow**: No need to manually create API routes for every form
- **Built-in revalidation**: `revalidatePath()` auto-updates UI after mutations

**Implementation**:
```typescript
// app/actions/appointments.ts
'use server'

export async function createAppointment(formData: FormData) {
  const data = appointmentSchema.parse(Object.fromEntries(formData))
  const supabase = createServerClient()
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert(data)
    .select()
  revalidatePath('/clinics/[id]')
  return { appointment, error }
}
```

---

### Pattern 2: Row Level Security for Authorization

**Decision**: Use Supabase RLS policies instead of application-layer authorization

**Rationale**:
- **Security by default**: Even if application code has bugs, database enforces access control
- **Constitution I compliance**: Patient data protected at lowest level (NON-NEGOTIABLE)
- **Performance**: Database-level filtering more efficient than app-level

**Implementation**:
```sql
-- Patients can only see their own appointments
CREATE POLICY "Patients view own appointments"
ON appointments FOR SELECT
USING (auth.uid() = patient_id);

-- Clinic staff can only see their clinic's appointments
CREATE POLICY "Clinic staff view clinic appointments"
ON appointments FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid()
  )
);
```

---

### Pattern 3: Optimistic UI Updates with Revalidation

**Decision**: Use optimistic updates for better UX, with server revalidation

**Rationale**:
- **Immediate feedback**: User sees changes instantly (SC-003: <500ms filter)
- **Data consistency**: Server revalidation ensures UI matches database
- **Rollback on error**: Failed mutations revert UI state

**Implementation**:
```typescript
// Client component using useOptimistic
const [optimisticAppointments, addOptimistic] = useOptimistic(
  appointments,
  (state, newAppointment) => [...state, newAppointment]
)

async function handleSubmit(formData) {
  addOptimistic(formData) // Immediate UI update
  const result = await createAppointment(formData) // Server validation
  if (result.error) {
    // Optimistic update auto-reverts
    toast.error(result.error.message)
  }
}
```

---

## Testing Strategy

### Unit Testing with Vitest

**Tools**: Vitest + React Testing Library

**Scope**:
- Business logic in `lib/` (appointment validation, time slot calculation)
- Utility functions (date formatting, email validation)
- React components (form validation, error states)
- Target: 80% coverage (Constitution V requirement)

**Example**:
```typescript
// tests/unit/lib/appointments.test.ts
import { describe, it, expect } from 'vitest'
import { isTimeSlotAvailable } from '@/lib/appointments'

describe('isTimeSlotAvailable', () => {
  it('returns false for past dates', () => {
    const pastDate = new Date('2024-01-01')
    expect(isTimeSlotAvailable(pastDate)).toBe(false)
  })
})
```

---

### Integration Testing with Supabase Local

**Tools**: Vitest + Supabase local database

**Scope**:
- API route handlers (appointment CRUD)
- Database queries with RLS policies
- Server Actions
- Edge Functions (email triggers)

**Setup**:
```bash
# Start local Supabase
supabase start

# Run migrations
supabase db reset

# Run integration tests
vitest run tests/integration
```

---

### E2E Testing with Playwright

**Tools**: Playwright

**Scope** (Constitution V requirements):
- **Book appointment flow**: Browse clinics → filter → select slot → submit (P1)
- **Approve appointment flow**: Clinic login → view requests → approve → verify email sent (P2)
- **Reject appointment flow**: Clinic login → view requests → reject → verify email sent (P2)

**Example**:
```typescript
// tests/e2e/booking.spec.ts
test('patient can book appointment', async ({ page }) => {
  await page.goto('/clinics')
  await page.getByRole('combobox', { name: 'Specialty' }).selectOption('Cardiology')
  await page.getByRole('link', { name: 'Heart Clinic' }).click()
  await page.getByRole('button', { name: 'Dec 27, 10:00 AM' }).click()
  await page.getByRole('textbox', { name: 'Reason for visit' }).fill('Chest pain')
  await page.getByRole('button', { name: 'Request Appointment' }).click()
  await expect(page.getByText('Appointment request sent')).toBeVisible()
})
```

---

## Security Considerations

### OWASP Top 10 Addressed

1. **A01 Broken Access Control**: Supabase RLS policies enforce authorization
2. **A02 Cryptographic Failures**: HTTPS enforced by Vercel, Supabase encryption at rest
3. **A03 Injection**: Parameterized queries via Supabase client (no SQL injection)
4. **A04 Insecure Design**: Constitution check ensures security by design
5. **A05 Security Misconfiguration**: Environment variables for secrets, no hardcoded keys
6. **A06 Vulnerable Components**: Dependabot alerts + regular updates
7. **A07 Authentication Failures**: Google OAuth only, session timeout via Supabase
8. **A08 Software/Data Integrity**: Vercel deployment checksums, Supabase migrations versioned
9. **A09 Logging Failures**: Audit table + Vercel logs capture all appointment changes
10. **A10 SSRF**: Server Actions validated, no user-controlled URLs fetched

### Additional Security Measures

- **Rate limiting**: Vercel Edge Middleware + Supabase rate limits
- **CSRF protection**: Next.js Server Actions include CSRF tokens automatically
- **XSS prevention**: React escapes output by default
- **Session management**: Supabase JWT with 1-hour expiration, refresh token rotation

---

## Performance Optimization

### Achieving <2s Page Load (SC-002)

1. **Server Components**: Reduce client-side JavaScript bundle
2. **Image optimization**: Next.js `<Image>` component with lazy loading
3. **Code splitting**: Dynamic imports for heavy components
4. **Edge caching**: Vercel CDN caches static assets globally
5. **Database indexing**: Index on `clinic_id`, `appointment_date`, `status`

### Achieving <500ms Filter (SC-003)

1. **Client-side filtering**: Filter pre-loaded clinic list without server roundtrip
2. **Debounced search**: 300ms debounce on specialty filter input
3. **Optimistic UI**: Show filtered results immediately, validate on server

---

## Deployment Strategy

### CI/CD Pipeline

1. **GitHub Actions**: Run tests on every PR
   - Lint: `eslint`, `prettier`
   - Type check: `tsc --noEmit`
   - Unit tests: `vitest run`
   - E2E tests: `playwright test` (on preview deployment)
2. **Vercel auto-deploy**: Main branch → production, PRs → preview URLs
3. **Supabase migrations**: Manual review before applying to production

### Environment Setup

- **Local**: Supabase local + Next.js dev server
- **Staging**: Vercel preview + Supabase staging project
- **Production**: Vercel production + Supabase production project

---

## Summary

All technology choices align with constitution requirements and success criteria. Stack provides:

- ✅ Security: Supabase RLS + OAuth (Principle I)
- ✅ UX: Next.js performance + Tailwind mobile-first (Principle II)
- ✅ Data integrity: PostgreSQL transactions + RLS (Principle III)
- ✅ API-first: Next.js API routes + OpenAPI spec (Principle IV)
- ✅ Testing: Vitest + Playwright + 80% coverage (Principle V)

**No NEEDS CLARIFICATION remaining** - all technical decisions made and justified.
