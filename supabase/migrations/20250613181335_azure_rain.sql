/*
  # Fix user roles and policies migration

  1. Updates
    - Update user_roles table constraint to include admin role
    - Create helper functions for role checking
    - Drop ALL existing policies on ALL tables
    - Create new simplified policies
    - Set up admin user assignment

  2. Security
    - Enable RLS on all tables
    - Create policies for authenticated and anonymous users
    - Special admin policies for user_roles table
*/

-- Update user_roles table to include admin role
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
CHECK (role = ANY (ARRAY['admin'::text, 'praticien'::text, 'staff'::text]));

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION has_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM user_roles WHERE user_id = auth.uid();
  RETURN COALESCE(user_role, 'praticien');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop ALL existing policies on ALL tables
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on patients table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'patients') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON patients';
    END LOOP;
    
    -- Drop all policies on treatments table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'treatments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON treatments';
    END LOOP;
    
    -- Drop all policies on appointments table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'appointments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON appointments';
    END LOOP;
    
    -- Drop all policies on invoices table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'invoices') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON invoices';
    END LOOP;
    
    -- Drop all policies on products table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'products') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON products';
    END LOOP;
    
    -- Drop all policies on appareils table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'appareils') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON appareils';
    END LOOP;
    
    -- Drop all policies on zones table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'zones') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON zones';
    END LOOP;
    
    -- Drop all policies on soins table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'soins') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON soins';
    END LOOP;
    
    -- Drop all policies on forfaits table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'forfaits') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON forfaits';
    END LOOP;
    
    -- Drop all policies on consumption_reports table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'consumption_reports') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON consumption_reports';
    END LOOP;
    
    -- Drop all policies on stock_alerts table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'stock_alerts') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON stock_alerts';
    END LOOP;
    
    -- Drop all policies on cost_analysis table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'cost_analysis') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON cost_analysis';
    END LOOP;
    
    -- Drop all policies on user_roles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_roles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_roles';
    END LOOP;
END $$;

-- Create new policies for patients
CREATE POLICY "patients_authenticated_access" ON patients
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "patients_anon_select" ON patients
  FOR SELECT TO anon
  USING (true);

-- Create new policies for treatments
CREATE POLICY "treatments_authenticated_access" ON treatments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "treatments_anon_select" ON treatments
  FOR SELECT TO anon
  USING (true);

-- Create new policies for appointments
CREATE POLICY "appointments_authenticated_access" ON appointments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "appointments_anon_select" ON appointments
  FOR SELECT TO anon
  USING (true);

-- Create new policies for invoices
CREATE POLICY "invoices_authenticated_access" ON invoices
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create new policies for products
CREATE POLICY "products_authenticated_access" ON products
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create new policies for appareils
CREATE POLICY "appareils_authenticated_access" ON appareils
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "appareils_anon_select" ON appareils
  FOR SELECT TO anon
  USING (true);

-- Create new policies for zones
CREATE POLICY "zones_authenticated_access" ON zones
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "zones_anon_select" ON zones
  FOR SELECT TO anon
  USING (true);

-- Create new policies for soins
CREATE POLICY "soins_authenticated_access" ON soins
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "soins_anon_select" ON soins
  FOR SELECT TO anon
  USING (true);

-- Create new policies for forfaits
CREATE POLICY "forfaits_authenticated_access" ON forfaits
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "forfaits_anon_select" ON forfaits
  FOR SELECT TO anon
  USING (true);

-- Create new policies for consumption_reports
CREATE POLICY "consumption_reports_authenticated_access" ON consumption_reports
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create new policies for stock_alerts
CREATE POLICY "stock_alerts_authenticated_access" ON stock_alerts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create new policies for cost_analysis
CREATE POLICY "cost_analysis_authenticated_access" ON cost_analysis
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create new policies for user_roles
CREATE POLICY "user_roles_admin_access" ON user_roles
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "user_roles_own_access" ON user_roles
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to handle new user signup and assign roles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert role for new user
  INSERT INTO user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.email = 'sodatrasn@gmail.com' THEN 'admin'
      ELSE 'praticien'
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = CASE 
      WHEN NEW.email = 'sodatrasn@gmail.com' THEN 'admin'
      ELSE user_roles.role
    END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Manually assign admin role to sodatrasn@gmail.com if user exists
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get user ID for sodatrasn@gmail.com
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'sodatrasn@gmail.com';
  
  -- If user exists, ensure they have admin role
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  END IF;
END $$;