-- Fix: Update clinic_specialties foreign key to reference specialties table
-- This migration fixes the FK constraint after renaming medical_specialties to specialties

-- Drop the old foreign key constraint
ALTER TABLE clinic_specialties 
  DROP CONSTRAINT IF EXISTS clinic_specialties_specialty_id_fkey;

-- Add new foreign key constraint pointing to specialties table
ALTER TABLE clinic_specialties 
  ADD CONSTRAINT clinic_specialties_specialty_id_fkey 
  FOREIGN KEY (specialty_id) 
  REFERENCES specialties(id) 
  ON DELETE CASCADE;
