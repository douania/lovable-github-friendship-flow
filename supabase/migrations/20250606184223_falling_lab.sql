/*
  # Fix RLS policies for appointments table

  1. Security Changes
    - Update existing RLS policies on `appointments` table to allow anonymous access
    - This enables the application to work with the anonymous Supabase key
    - Policies updated: SELECT, INSERT, UPDATE, DELETE for anon role

  2. Notes
    - This configuration matches the pattern used for the `patients` table
    - All operations on appointments table will be allowed for anonymous users
    - Also maintains policies for authenticated users for future compatibility
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Allow all operations on appointments" ON appointments;

-- Create new policies that allow anonymous access
CREATE POLICY "Allow anon to view appointments"
  ON appointments
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert appointments"
  ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update appointments"
  ON appointments
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete appointments"
  ON appointments
  FOR DELETE
  TO anon
  USING (true);

-- Also allow authenticated users (for future use)
CREATE POLICY "Allow authenticated to view appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated to insert appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (true);