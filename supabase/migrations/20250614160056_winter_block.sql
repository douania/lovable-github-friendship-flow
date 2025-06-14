/*
  # Update user roles constraint

  1. Changes
    - Drop existing role constraint on user_roles table
    - Add new constraint that includes 'user' role in addition to existing roles
    - This allows users to have 'admin', 'praticien', 'staff', or 'user' roles

  2. Security
    - Maintains data integrity by enforcing valid role values
    - Expands allowed roles to include basic 'user' role
*/

-- Update role constraint to include all valid roles
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
CHECK (role = ANY (ARRAY['admin'::text, 'praticien'::text, 'staff'::text, 'user'::text]));