-- Migration: Disable problematic auth.users trigger
-- Description: The on_auth_user_created trigger is causing signup failures
-- We'll rely on the application or other mechanisms to create users records

-- Drop the trigger that creates public.users from auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function as well
DROP FUNCTION IF EXISTS handle_new_auth_user();

COMMENT ON TABLE users IS 'Users table - records should be created via application logic or alternative triggers';
