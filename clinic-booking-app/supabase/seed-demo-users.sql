-- Create demo users for testing authentication
-- Password: demo123 (bcrypt hashed by Supabase Auth)

-- This is just seed data for the users table
-- Actual auth credentials will be created via Supabase Auth UI or sign up

-- Demo Patient User
-- To create: Sign up on /login with email: demo@example.com, password: demo123

-- Demo Clinic Staff User (create manually via SQL after first sign up)
-- UPDATE users SET role = 'clinic_staff' WHERE email = 'staff@example.com';
-- INSERT INTO clinic_staff (user_id, clinic_id, role) VALUES (...);

-- For now, comment out - users will be created via sign up flow
COMMENT ON TABLE users IS 'Demo users will be created via sign up at /login';
