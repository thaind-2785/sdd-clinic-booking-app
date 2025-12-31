-- Migration: Verify RLS is enabled on all tables
-- Description: Safety check to ensure Row Level Security is active
-- Depends on: All previous table migrations

-- Verify RLS is enabled (already done in individual migrations, this is a safety check)
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'users',
    'patients', 
    'clinics',
    'medical_specialties',
    'clinic_specialties',
    'clinic_staff',
    'time_slots',
    'appointments',
    'notifications',
    'appointment_audit'
  ];
  has_rls boolean;
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    SELECT relrowsecurity INTO has_rls FROM pg_class WHERE relname = tbl LIMIT 1;
    IF NOT COALESCE(has_rls, false) THEN
      RAISE EXCEPTION 'RLS not enabled on table: %', tbl;
    END IF;
    RAISE NOTICE 'RLS verified on table: %', tbl;
  END LOOP;
END $$;

-- Create a function to help test RLS policies
CREATE OR REPLACE FUNCTION test_rls_as_user(user_uuid UUID, query TEXT)
RETURNS SETOF JSON AS $$
BEGIN
  EXECUTE format('SET LOCAL request.jwt.claim.sub = %L', user_uuid);
  RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION test_rls_as_user IS 'Helper function for testing RLS policies in development';
