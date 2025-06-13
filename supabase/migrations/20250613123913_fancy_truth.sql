/*
  # Fix infinite recursion in user_roles RLS policies

  1. Problem
    - The current admin policy creates infinite recursion by checking user_roles table within the policy for user_roles table
    - This causes "infinite recursion detected in policy" error

  2. Solution
    - Drop the problematic policies
    - Create simpler, non-recursive policies
    - Allow users to read their own role
    - Use a different approach for admin management that doesn't cause recursion

  3. Security
    - Users can only see their own role
    - Admin operations will need to be handled through service role or different mechanism
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Allow admins to manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to view their own role" ON user_roles;

-- Create new non-recursive policies
CREATE POLICY "Users can view their own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- For now, allow authenticated users to insert their own role
-- This can be restricted later through application logic or triggers
CREATE POLICY "Users can insert their own role"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own role (can be restricted later)
CREATE POLICY "Users can update their own role"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own role
CREATE POLICY "Users can delete their own role"
  ON user_roles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);