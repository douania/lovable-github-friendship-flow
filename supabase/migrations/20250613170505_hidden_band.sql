/*
  # Add admin user and update role system

  1. New Features
    - Insert admin user sodatrasn@gmail.com with admin role
    - Update role system to support admin privileges
    - Add admin-specific policies

  2. Security
    - Admin users have full access to all tables
    - Maintain existing RLS for non-admin users
    - Add admin role validation
*/

-- Insert admin user if not exists (will be linked when user signs up)
INSERT INTO users (email, role) 
VALUES ('sodatrasn@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Update user_roles table to include admin role
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
CHECK (role = ANY (ARRAY['admin'::text, 'praticien'::text, 'staff'::text]));

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION has_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update all table policies to allow admin full access

-- Patients policies
DROP POLICY IF EXISTS "Allow anon to delete patients" ON patients;
DROP POLICY IF EXISTS "Allow anon to insert patients" ON patients;
DROP POLICY IF EXISTS "Allow anon to update patients" ON patients;
DROP POLICY IF EXISTS "Allow anon to view patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated to delete patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated to insert patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated to update patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated to view patients" ON patients;

CREATE POLICY "Admin full access to patients" ON patients
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can manage patients" ON patients
  FOR ALL TO authenticated
  USING (NOT is_admin() OR is_admin())
  WITH CHECK (NOT is_admin() OR is_admin());

CREATE POLICY "Anonymous can view patients" ON patients
  FOR SELECT TO anon
  USING (true);

-- Treatments policies
DROP POLICY IF EXISTS "Allow all operations on treatments" ON treatments;
DROP POLICY IF EXISTS "Allow anon to view treatments" ON treatments;

CREATE POLICY "Admin full access to treatments" ON treatments
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can manage treatments" ON treatments
  FOR ALL TO authenticated
  USING (NOT is_admin() OR is_admin())
  WITH CHECK (NOT is_admin() OR is_admin());

CREATE POLICY "Anonymous can view treatments" ON treatments
  FOR SELECT TO anon
  USING (true);

-- Appointments policies
DROP POLICY IF EXISTS "Allow anon to delete appointments" ON appointments;
DROP POLICY IF EXISTS "Allow anon to insert appointments" ON appointments;
DROP POLICY IF EXISTS "Allow anon to update appointments" ON appointments;
DROP POLICY IF EXISTS "Allow anon to view appointments" ON appointments;
DROP POLICY IF EXISTS "Allow authenticated to delete appointments" ON appointments;
DROP POLICY IF EXISTS "Allow authenticated to insert appointments" ON appointments;
DROP POLICY IF EXISTS "Allow authenticated to update appointments" ON appointments;
DROP POLICY IF EXISTS "Allow authenticated to view appointments" ON appointments;

CREATE POLICY "Admin full access to appointments" ON appointments
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can manage appointments" ON appointments
  FOR ALL TO authenticated
  USING (NOT is_admin() OR is_admin())
  WITH CHECK (NOT is_admin() OR is_admin());

-- Invoices policies
DROP POLICY IF EXISTS "Allow all operations on invoices" ON invoices;

CREATE POLICY "Admin full access to invoices" ON invoices
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can manage invoices" ON invoices
  FOR ALL TO authenticated
  USING (NOT is_admin() OR is_admin())
  WITH CHECK (NOT is_admin() OR is_admin());

-- Products policies
DROP POLICY IF EXISTS "Allow all operations on products" ON products;

CREATE POLICY "Admin full access to products" ON products
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL TO authenticated
  USING (NOT is_admin() OR is_admin())
  WITH CHECK (NOT is_admin() OR is_admin());

-- Appareils policies
DROP POLICY IF EXISTS "Allow anon to view appareils" ON appareils;
DROP POLICY IF EXISTS "Allow authenticated to delete appareils" ON appareils;
DROP POLICY IF EXISTS "Allow authenticated to insert appareils" ON appareils;
DROP POLICY IF EXISTS "Allow authenticated to update appareils" ON appareils;
DROP POLICY IF EXISTS "Allow authenticated to view appareils" ON appareils;

CREATE POLICY "Admin full access to appareils" ON appareils
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can manage appareils" ON appareils
  FOR ALL TO authenticated
  USING (NOT is_admin() OR is_admin())
  WITH CHECK (NOT is_admin() OR is_admin());

CREATE POLICY "Anonymous can view appareils" ON appareils
  FOR SELECT TO anon
  USING (true);

-- Zones policies
DROP POLICY IF EXISTS "Allow anon to view zones" ON zones;
DROP POLICY IF EXISTS "Allow authenticated to delete zones" ON zones;
DROP POLICY IF EXISTS "Allow authenticated to insert zones" ON zones;
DROP POLICY IF EXISTS "Allow authenticated to update zones" ON zones;
DROP POLICY IF EXISTS "Allow authenticated to view zones" ON zones;

CREATE POLICY "Admin full access to zones" ON zones
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can manage zones" ON zones
  FOR ALL TO authenticated
  USING (NOT is_admin() OR is_admin())
  WITH CHECK (NOT is_admin() OR is_admin());

CREATE POLICY "Anonymous can view zones" ON zones
  FOR SELECT TO anon
  USING (true);

-- Soins policies
DROP POLICY IF EXISTS "Allow anon to view soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users to delete soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users to insert soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users to select soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users to update soins" ON soins;

CREATE POLICY "Admin full access to soins" ON soins
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can manage soins" ON soins
  FOR ALL TO authenticated
  USING (NOT is_admin() OR is_admin())
  WITH CHECK (NOT is_admin() OR is_admin());

CREATE POLICY "Anonymous can view soins" ON soins
  FOR SELECT TO anon
  USING (true);

-- Forfaits policies
DROP POLICY IF EXISTS "Allow anon to view forfaits" ON forfaits;
DROP POLICY IF EXISTS "Allow authenticated to delete forfaits" ON forfaits;
DROP POLICY IF EXISTS "Allow authenticated to insert forfaits" ON forfaits;
DROP POLICY IF EXISTS "Allow authenticated to update forfaits" ON forfaits;
DROP POLICY IF EXISTS "Allow authenticated to view forfaits" ON forfaits;

CREATE POLICY "Admin full access to forfaits" ON forfaits
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can manage forfaits" ON forfaits
  FOR ALL TO authenticated
  USING (NOT is_admin() OR is_admin())
  WITH CHECK (NOT is_admin() OR is_admin());

CREATE POLICY "Anonymous can view forfaits" ON forfaits
  FOR SELECT TO anon
  USING (true);

-- Consumption reports policies
DROP POLICY IF EXISTS "Allow authenticated users to delete consumption reports" ON consumption_reports;
DROP POLICY IF EXISTS "Allow authenticated users to insert consumption reports" ON consumption_reports;
DROP POLICY IF EXISTS "Allow authenticated users to update consumption reports" ON consumption_reports;
DROP POLICY IF EXISTS "Allow authenticated users to view consumption reports" ON consumption_reports;

CREATE POLICY "Admin full access to consumption reports" ON consumption_reports
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can manage consumption reports" ON consumption_reports
  FOR ALL TO authenticated
  USING (NOT is_admin() OR is_admin())
  WITH CHECK (NOT is_admin() OR is_admin());

-- Stock alerts policies
DROP POLICY IF EXISTS "Allow authenticated users to delete stock alerts" ON stock_alerts;
DROP POLICY IF EXISTS "Allow authenticated users to insert stock alerts" ON stock_alerts;
DROP POLICY IF EXISTS "Allow authenticated users to update stock alerts" ON stock_alerts;
DROP POLICY IF EXISTS "Allow authenticated users to view stock alerts" ON stock_alerts;

CREATE POLICY "Admin full access to stock alerts" ON stock_alerts
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can manage stock alerts" ON stock_alerts
  FOR ALL TO authenticated
  USING (NOT is_admin() OR is_admin())
  WITH CHECK (NOT is_admin() OR is_admin());

-- Cost analysis policies
DROP POLICY IF EXISTS "Allow authenticated users to delete cost analysis" ON cost_analysis;
DROP POLICY IF EXISTS "Allow authenticated users to insert cost analysis" ON cost_analysis;
DROP POLICY IF EXISTS "Allow authenticated users to update cost analysis" ON cost_analysis;
DROP POLICY IF EXISTS "Allow authenticated users to view cost analysis" ON cost_analysis;

CREATE POLICY "Admin full access to cost analysis" ON cost_analysis
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can manage cost analysis" ON cost_analysis
  FOR ALL TO authenticated
  USING (NOT is_admin() OR is_admin())
  WITH CHECK (NOT is_admin() OR is_admin());

-- Update user_roles policies to be simpler
DROP POLICY IF EXISTS "Users can delete their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

CREATE POLICY "Admin full access to user roles" ON user_roles
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Trigger to automatically create user record when someone signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'sodatrasn@gmail.com' THEN 'admin'
      ELSE 'praticien'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    role = CASE 
      WHEN NEW.email = 'sodatrasn@gmail.com' THEN 'admin'
      ELSE users.role
    END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update existing user if they exist
UPDATE users SET role = 'admin' WHERE email = 'sodatrasn@gmail.com';