@@ .. @@
-- Update role constraint to include all valid roles
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
-CHECK (role = ANY (ARRAY['admin'::text, 'praticien'::text, 'staff'::text]));
+CHECK (role = ANY (ARRAY['admin'::text, 'praticien'::text, 'staff'::text, 'user'::text]));