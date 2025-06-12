/*
  # Fix RLS policies for soins table to allow authenticated operations

  1. Security Changes
    - Ensure proper RLS policies exist for authenticated users on soins table
    - Allow all CRUD operations for authenticated users
    - Maintain existing anon policies

  2. Notes
    - This fixes the "new row violates row-level security policy" error
    - Policies are recreated to ensure they work correctly
*/

-- First, let's check and recreate the policies for authenticated users
-- Drop existing authenticated policies if they exist
DROP POLICY IF EXISTS "Allow authenticated to view soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated to insert soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated to update soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated to delete soins" ON soins;

-- Create comprehensive policies for authenticated users
CREATE POLICY "Allow authenticated to view soins"
  ON soins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated to insert soins"
  ON soins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to update soins"
  ON soins
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete soins"
  ON soins
  FOR DELETE
  TO authenticated
  USING (true);

-- Also ensure anon policies exist (recreate them to be safe)
DROP POLICY IF EXISTS "Allow anon to view soins" ON soins;
CREATE POLICY "Allow anon to view soins"
  ON soins
  FOR SELECT
  TO anon
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE soins ENABLE ROW LEVEL SECURITY;