-- Migration: Comprehensive fix for google_id nullable and unique constraints
-- Description: Ensures google_id can be NULL and has proper unique constraint
-- This is a comprehensive fix that handles all edge cases

-- Step 1: Drop all existing constraints on google_id
DO $$ 
BEGIN
    -- Drop the NOT NULL constraint if it exists
    ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'google_id was already nullable or error: %', SQLERRM;
END $$;

-- Step 2: Drop any existing unique constraints/indexes
DO $$ 
BEGIN
    -- Drop the unique constraint created during table creation
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_google_id_key;
    
    -- Drop any existing unique index
    DROP INDEX IF EXISTS users_google_id_unique;
    DROP INDEX IF EXISTS users_google_id_key;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraints already dropped or error: %', SQLERRM;
END $$;

-- Step 3: Clean up data - set empty strings to NULL
UPDATE users 
SET google_id = NULL 
WHERE google_id = '' OR google_id IS NULL;

-- Step 4: Create a partial unique index (allows multiple NULLs)
CREATE UNIQUE INDEX users_google_id_unique 
ON users(google_id) 
WHERE google_id IS NOT NULL;

-- Step 5: Verify the schema
DO $$
DECLARE
  col_nullable TEXT;
BEGIN
  SELECT 
    CASE WHEN c.is_nullable = 'YES' THEN 'YES' ELSE 'NO' END
  INTO col_nullable
  FROM information_schema.columns c
  WHERE c.table_schema = 'public' 
    AND c.table_name = 'users' 
    AND c.column_name = 'google_id';
  
  RAISE NOTICE 'google_id is_nullable: %', col_nullable;
  
  IF col_nullable = 'NO' THEN
    RAISE EXCEPTION 'google_id is still NOT NULL after migration!';
  END IF;
END $$;

COMMENT ON COLUMN users.google_id IS 'Google OAuth ID - NULL for email/password users, unique for Google OAuth users';
COMMENT ON INDEX users_google_id_unique IS 'Partial unique index on google_id - allows multiple NULLs for email/password users';
