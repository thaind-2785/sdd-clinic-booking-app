-- Migration: Remove UNIQUE constraint from google_id
-- Description: Allow multiple NULL values for google_id (email/password users)

-- Drop UNIQUE constraint on google_id
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_google_id_key;

-- Add partial UNIQUE index (only for non-NULL values)
CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_unique 
ON users(google_id) 
WHERE google_id IS NOT NULL;

COMMENT ON INDEX users_google_id_unique IS 'Unique constraint on google_id, allowing multiple NULLs';
