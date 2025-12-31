# Local Testing Setup Guide

## Prerequisites Check

### 1. Install Docker (Required for Supabase Local)

```bash
# Check if Docker is installed
which docker

# If not installed, download from:
# https://www.docker.com/products/docker-desktop/
```

### 2. Setup Environment Variables

Create `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start

# Or use Supabase Cloud (faster for testing):
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-cloud-anon-key
```

### 3. Start Supabase Local

```bash
# Start Supabase (requires Docker running)
npx supabase start

# This will output:
# - API URL: http://localhost:54321
# - Anon key: eyJhbG...
# - Service role key: eyJhbG...
# - Studio URL: http://localhost:54323

# Check status
npx supabase status
```

### 4. Run Database Migrations

```bash
# Apply all migrations
npx supabase db reset

# Or manually:
npx supabase migration up
```

### 5. Seed Test Data (Optional)

Create `supabase/seed.sql` to populate test data:
- Test clinics with specialties
- Test time slots
- Test users (patient + clinic staff)

### 6. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## Alternative: Use Supabase Cloud

If Docker installation is slow, use Supabase Cloud:

1. Go to https://supabase.com
2. Create new project
3. Copy Project URL and anon key
4. Run migrations:
   ```bash
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```
5. Add to `.env.local`
6. Start dev server: `npm run dev`

## Testing Checklist

### Phase 3: Patient Booking Flow
- [ ] Landing page loads (http://localhost:3000)
- [ ] Browse clinics page (/clinics)
- [ ] Filter by specialty works
- [ ] Click clinic shows detail page
- [ ] Time slot selection works
- [ ] Book appointment creates record
- [ ] Patient dashboard shows appointments (/patient/dashboard)

### Phase 4: Clinic Staff Flow
- [ ] Login as clinic staff
- [ ] Clinic dashboard loads (/clinic/dashboard)
- [ ] See pending appointments
- [ ] Filter tabs work (Pending/Confirmed/Rejected/All)
- [ ] Click appointment shows detail page
- [ ] Approve appointment:
  - [ ] Modal appears
  - [ ] Confirmation updates status to Confirmed
  - [ ] Time slot marked unavailable
  - [ ] Appointment disappears from Pending tab
- [ ] Reject appointment:
  - [ ] Modal with reason textarea appears
  - [ ] Validation requires 10+ characters
  - [ ] Rejection updates status to Rejected
  - [ ] Time slot released (is_available = true)
- [ ] Double-booking prevention:
  - [ ] Cannot approve if slot already taken
  - [ ] Error message shows "Time slot already booked"

### Database Checks
- [ ] Open Supabase Studio (http://localhost:54323)
- [ ] Verify tables exist:
  - users, patients, clinics, clinic_staff
  - specialties, clinic_specialties
  - time_slots, appointments
- [ ] Check RLS policies enabled
- [ ] Test data populated

## Common Issues

### "Cannot connect to Docker daemon"
→ Docker Desktop not running. Start Docker first.

### "Migration already applied"
→ Use `npx supabase db reset` to reset database.

### "Module not found" errors
→ Run `npm install` to ensure all dependencies installed.

### TypeScript errors
→ Run `npm run type-check` to verify all types are correct.

### Port 3000 already in use
→ Kill existing process: `lsof -ti:3000 | xargs kill -9`

## Quick Start (Supabase Cloud - No Docker)

```bash
# 1. Create .env.local with Supabase Cloud credentials
echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key" >> .env.local

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open browser
open http://localhost:3000
```

## Next Steps After Testing

✅ If everything works → Continue to Phase 5 (Google OAuth + Notifications)
❌ If bugs found → Fix issues before proceeding
