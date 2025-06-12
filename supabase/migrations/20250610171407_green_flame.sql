/*
  # Fix RLS policies for soins table

  1. Security Updates
    - Update RLS policies for `soins` table to properly allow INSERT operations
    - Ensure authenticated users can create, read, update, and delete soins
    - Keep anon users with read-only access

  2. Changes
    - Drop existing restrictive policies
    - Add comprehensive policies for authenticated users
    - Maintain read access for anonymous users
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Allow anon to view soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated to delete soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated to insert soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated to update soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated to view soins" ON soins;

-- Create comprehensive policies for the soins table
CREATE POLICY "Allow anon to view active soins"
  ON soins
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Allow authenticated users full access to soins"
  ON soins
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled (it should already be enabled based on schema)
ALTER TABLE soins ENABLE ROW LEVEL SECURITY;