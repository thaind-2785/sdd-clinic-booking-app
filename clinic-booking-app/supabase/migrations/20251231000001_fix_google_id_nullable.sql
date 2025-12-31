-- Migration: Fix google_id to be nullable
-- Description: Allow google_id to be NULL for email/password users

ALTER TABLE users 
ALTER COLUMN google_id DROP NOT NULL;

-- Update existing empty string values to NULL
UPDATE users 
SET google_id = NULL 
WHERE google_id = '';
