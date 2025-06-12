/*
  # Fix RLS policies for patients table

  1. Security Changes
    - Update existing RLS policies on `patients` table to allow anonymous access
    - This enables the application to work with the anonymous Supabase key
    - Policies updated: SELECT, INSERT, UPDATE, DELETE for anon role

  2. Notes
    - This configuration is suitable for development and single-user clinic systems
    - For production with multiple users, consider implementing proper authentication
    - All operations on patients table will be allowed for anonymous users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated users to insert patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated users to update patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated users to delete patients" ON patients;

-- Create new policies that allow anonymous access
CREATE POLICY "Allow anon to view patients"
  ON patients
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert patients"
  ON patients
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update patients"
  ON patients
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete patients"
  ON patients
  FOR DELETE
  TO anon
  USING (true);

-- Also allow authenticated users (for future use)
CREATE POLICY "Allow authenticated to view patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated to insert patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to update patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete patients"
  ON patients
  FOR DELETE
  TO authenticated
  USING (true);