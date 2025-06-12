/*
  # Fix RLS policies for soins table

  1. Security Changes
    - Drop ALL existing policies on soins table to avoid conflicts
    - Create clean, simple policies for both anon and authenticated users
    - Ensure authenticated users have full access to all operations
    - Allow anon users to view soins

  2. Policy Structure
    - Simple policies without complex conditions
    - Separate policies for each operation type
    - Clear permissions for authenticated users
*/

-- Drop ALL existing policies on soins table to start fresh
DROP POLICY IF EXISTS "Allow anon to view active soins" ON soins;
DROP POLICY IF EXISTS "Allow anon to view soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users full access to soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated to view soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated to insert soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated to update soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated to delete soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users to select soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users to insert soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users to update soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users to delete soins" ON soins;

-- Create new policies for anon users
CREATE POLICY "Allow anon to view soins"
  ON soins
  FOR SELECT
  TO anon
  USING (true);

-- Create new policies for authenticated users
CREATE POLICY "Allow authenticated users to select soins"
  ON soins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert soins"
  ON soins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update soins"
  ON soins
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete soins"
  ON soins
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE soins ENABLE ROW LEVEL SECURITY;