
-- Ajouter les politiques RLS manquantes pour les consultations
CREATE POLICY "Admin and authenticated full access to consultations" ON consultations
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can view consultations" ON consultations
  FOR SELECT TO anon
  USING (true);

-- Ajouter les politiques RLS manquantes pour les devis
CREATE POLICY "Admin and authenticated full access to quotes" ON quotes
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can view quotes" ON quotes
  FOR SELECT TO anon
  USING (true);

-- Ajouter les politiques RLS manquantes pour les créneaux de disponibilité
CREATE POLICY "Admin and authenticated full access to availability_slots" ON availability_slots
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can view availability_slots" ON availability_slots
  FOR SELECT TO anon
  USING (true);

-- Ajouter les politiques RLS manquantes pour les notifications
CREATE POLICY "Admin and authenticated full access to notifications" ON notifications
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ajouter les politiques RLS manquantes pour les profils
CREATE POLICY "Admin and authenticated full access to profiles" ON profiles
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous can view profiles" ON profiles
  FOR SELECT TO anon
  USING (true);
