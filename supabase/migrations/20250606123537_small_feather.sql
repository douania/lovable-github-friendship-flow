/*
  # Fix RLS policies for patients table

  1. Security Updates
    - Drop existing overly restrictive policy
    - Create proper RLS policies for authenticated users
    - Allow INSERT, SELECT, UPDATE, DELETE operations for authenticated users
    - Ensure policies work correctly with the application

  2. Policy Details
    - Allow authenticated users to perform all CRUD operations
    - Policies are permissive to allow full access for clinic management
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations on patients" ON patients;

-- Create separate policies for each operation to ensure clarity and proper functionality

-- Allow authenticated users to view all patients
CREATE POLICY "Allow authenticated users to view patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert new patients
CREATE POLICY "Allow authenticated users to insert patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update patients
CREATE POLICY "Allow authenticated users to update patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete patients
CREATE POLICY "Allow authenticated users to delete patients"
  ON patients
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled (should already be enabled but confirming)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;