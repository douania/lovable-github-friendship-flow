/*
  # Configuration administrateur pour sodatrasn@gmail.com

  1. Fonctions utilitaires
    - Fonction pour vérifier si l'utilisateur est admin
    - Fonction pour vérifier les rôles utilisateur
  
  2. Mise à jour des politiques RLS
    - Accès complet pour les administrateurs
    - Maintien des permissions existantes pour les autres utilisateurs
  
  3. Trigger automatique
    - Attribution automatique du rôle admin pour sodatrasn@gmail.com
*/

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific role
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

CREATE POLICY "Admin and authenticated full access to patients" ON patients
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can view patients" ON patients
  FOR SELECT TO anon
  USING (true);

-- Treatments policies
DROP POLICY IF EXISTS "Allow all operations on treatments" ON treatments;
DROP POLICY IF EXISTS "Allow anon to view treatments" ON treatments;

CREATE POLICY "Admin and authenticated full access to treatments" ON treatments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

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

CREATE POLICY "Admin and authenticated full access to appointments" ON appointments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can view appointments" ON appointments
  FOR SELECT TO anon
  USING (true);

-- Invoices policies
DROP POLICY IF EXISTS "Allow all operations on invoices" ON invoices;

CREATE POLICY "Admin and authenticated full access to invoices" ON invoices
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Products policies
DROP POLICY IF EXISTS "Allow all operations on products" ON products;

CREATE POLICY "Admin and authenticated full access to products" ON products
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Appareils policies
DROP POLICY IF EXISTS "Allow anon to view appareils" ON appareils;
DROP POLICY IF EXISTS "Allow authenticated to delete appareils" ON appareils;
DROP POLICY IF EXISTS "Allow authenticated to insert appareils" ON appareils;
DROP POLICY IF EXISTS "Allow authenticated to update appareils" ON appareils;
DROP POLICY IF EXISTS "Allow authenticated to view appareils" ON appareils;

CREATE POLICY "Admin and authenticated full access to appareils" ON appareils
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can view appareils" ON appareils
  FOR SELECT TO anon
  USING (true);

-- Zones policies
DROP POLICY IF EXISTS "Allow anon to view zones" ON zones;
DROP POLICY IF EXISTS "Allow authenticated to delete zones" ON zones;
DROP POLICY IF EXISTS "Allow authenticated to insert zones" ON zones;
DROP POLICY IF EXISTS "Allow authenticated to update zones" ON zones;
DROP POLICY IF EXISTS "Allow authenticated to view zones" ON zones;

CREATE POLICY "Admin and authenticated full access to zones" ON zones
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can view zones" ON zones
  FOR SELECT TO anon
  USING (true);

-- Soins policies
DROP POLICY IF EXISTS "Allow anon to view soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users to delete soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users to insert soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users to select soins" ON soins;
DROP POLICY IF EXISTS "Allow authenticated users to update soins" ON soins;

CREATE POLICY "Admin and authenticated full access to soins" ON soins
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can view soins" ON soins
  FOR SELECT TO anon
  USING (true);

-- Forfaits policies
DROP POLICY IF EXISTS "Allow anon to view forfaits" ON forfaits;
DROP POLICY IF EXISTS "Allow authenticated to delete forfaits" ON forfaits;
DROP POLICY IF EXISTS "Allow authenticated to insert forfaits" ON forfaits;
DROP POLICY IF EXISTS "Allow authenticated to update forfaits" ON forfaits;
DROP POLICY IF EXISTS "Allow authenticated to view forfaits" ON forfaits;

CREATE POLICY "Admin and authenticated full access to forfaits" ON forfaits
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can view forfaits" ON forfaits
  FOR SELECT TO anon
  USING (true);

-- Consumption reports policies
DROP POLICY IF EXISTS "Allow authenticated users to delete consumption reports" ON consumption_reports;
DROP POLICY IF EXISTS "Allow authenticated users to insert consumption reports" ON consumption_reports;
DROP POLICY IF EXISTS "Allow authenticated users to update consumption reports" ON consumption_reports;
DROP POLICY IF EXISTS "Allow authenticated users to view consumption reports" ON consumption_reports;

CREATE POLICY "Admin and authenticated full access to consumption reports" ON consumption_reports
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Stock alerts policies
DROP POLICY IF EXISTS "Allow authenticated users to delete stock alerts" ON stock_alerts;
DROP POLICY IF EXISTS "Allow authenticated users to insert stock alerts" ON stock_alerts;
DROP POLICY IF EXISTS "Allow authenticated users to update stock alerts" ON stock_alerts;
DROP POLICY IF EXISTS "Allow authenticated users to view stock alerts" ON stock_alerts;

CREATE POLICY "Admin and authenticated full access to stock alerts" ON stock_alerts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Cost analysis policies
DROP POLICY IF EXISTS "Allow authenticated users to delete cost analysis" ON cost_analysis;
DROP POLICY IF EXISTS "Allow authenticated users to insert cost analysis" ON cost_analysis;
DROP POLICY IF EXISTS "Allow authenticated users to update cost analysis" ON cost_analysis;
DROP POLICY IF EXISTS "Allow authenticated users to view cost analysis" ON cost_analysis;

CREATE POLICY "Admin and authenticated full access to cost analysis" ON cost_analysis
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update user_roles policies
DROP POLICY IF EXISTS "Users can delete their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

CREATE POLICY "Admin full access to user roles" ON user_roles
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view and manage their own role" ON user_roles
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

-- Function to get user ID by email (for manual admin assignment)
CREATE OR REPLACE FUNCTION get_user_id_by_email(email_address text)
RETURNS uuid AS $$
DECLARE
  user_uuid uuid;
BEGIN
  SELECT id INTO user_uuid FROM auth.users WHERE email = email_address;
  RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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