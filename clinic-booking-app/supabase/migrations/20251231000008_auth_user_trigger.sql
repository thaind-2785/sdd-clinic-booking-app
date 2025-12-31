-- Migration: Auto-create public.users record when auth.users is created
-- Description: Sync auth.users to public.users automatically

-- Function to handle new auth user
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from user metadata, default to 'patient'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
  
  -- Insert into public.users table (without google_id)
  INSERT INTO public.users (id, email, name, role, google_id, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    user_role,
    NULL, -- Always NULL for email/password signup
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    name = COALESCE(EXCLUDED.name, public.users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and continue (don't block auth signup)
    RAISE WARNING 'Error in handle_new_auth_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_auth_user();

COMMENT ON FUNCTION handle_new_auth_user IS 'Automatically creates public.users record when auth.users is created, reads role from metadata';
