/*
  # Add user roles and audit tracking

  1. New Tables
    - `user_roles` - User role management
    - Add audit columns to soins and forfaits tables

  2. Security
    - Enable RLS on user_roles table
    - Add policies for role management

  3. Audit tracking
    - Add last_modified_at and last_modified_by columns
    - Update triggers for automatic audit tracking
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'praticien', 'staff')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles
CREATE POLICY "Allow authenticated users to view their own role"
  ON user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all roles"
  ON user_roles FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Add audit columns to soins table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'soins' AND column_name = 'last_modified_at'
  ) THEN
    ALTER TABLE soins ADD COLUMN last_modified_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'soins' AND column_name = 'last_modified_by'
  ) THEN
    ALTER TABLE soins ADD COLUMN last_modified_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Add audit columns to forfaits table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forfaits' AND column_name = 'last_modified_at'
  ) THEN
    ALTER TABLE forfaits ADD COLUMN last_modified_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forfaits' AND column_name = 'last_modified_by'
  ) THEN
    ALTER TABLE forfaits ADD COLUMN last_modified_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create function to update audit fields
CREATE OR REPLACE FUNCTION update_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified_at = now();
  NEW.last_modified_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit tracking
DROP TRIGGER IF EXISTS soins_audit_trigger ON soins;
CREATE TRIGGER soins_audit_trigger
  BEFORE UPDATE ON soins
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_fields();

DROP TRIGGER IF EXISTS forfaits_audit_trigger ON forfaits;
CREATE TRIGGER forfaits_audit_trigger
  BEFORE UPDATE ON forfaits
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_fields();

-- Insert default admin role (you'll need to replace with actual user ID)
-- This is just an example - you should set this up manually in your Supabase dashboard
-- INSERT INTO user_roles (user_id, role) VALUES ('your-user-id-here', 'admin');