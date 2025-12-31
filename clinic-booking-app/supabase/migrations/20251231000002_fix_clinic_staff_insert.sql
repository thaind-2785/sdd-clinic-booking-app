-- Migration: Add INSERT policy for clinic_staff
-- Description: Allow users to insert their own clinic_staff record during signup

-- Add INSERT policy for clinic_staff
CREATE POLICY "Users can insert own clinic staff record"
  ON clinic_staff FOR INSERT
  WITH CHECK (auth.uid() = user_id);
