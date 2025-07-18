
-- Activer RLS et créer des politiques pour les tables manquantes

-- Table consumable_variation_factors
ALTER TABLE consumable_variation_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access to consumable_variation_factors" 
  ON consumable_variation_factors
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Table actual_consumption_history  
ALTER TABLE actual_consumption_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access to actual_consumption_history"
  ON actual_consumption_history
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Corriger les politiques manquantes pour client_access
DROP POLICY IF EXISTS "Clients can view own access" ON client_access;

CREATE POLICY "Clients can manage own access"
  ON client_access
  FOR ALL
  USING (auth.uid()::text = id::text OR is_admin())
  WITH CHECK (auth.uid()::text = id::text OR is_admin());

CREATE POLICY "Admin full access to client_access"
  ON client_access
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Corriger les politiques pour client_activity_logs
DROP POLICY IF EXISTS "Clients can view own activity logs" ON client_activity_logs;

CREATE POLICY "Clients can view own activity logs"
  ON client_activity_logs
  FOR SELECT
  USING (client_id IN (SELECT id FROM client_access WHERE auth.uid()::text = id::text) OR is_admin());

CREATE POLICY "System can insert activity logs"
  ON client_activity_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin full access to activity logs"
  ON client_activity_logs
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Corriger les politiques pour client_sessions
DROP POLICY IF EXISTS "Clients can view own sessions" ON client_sessions;

CREATE POLICY "Clients can manage own sessions"
  ON client_sessions
  FOR ALL
  USING (client_id IN (SELECT id FROM client_access WHERE auth.uid()::text = id::text) OR is_admin())
  WITH CHECK (client_id IN (SELECT id FROM client_access WHERE auth.uid()::text = id::text) OR is_admin());

-- Sécuriser les fonctions existantes avec search_path
CREATE OR REPLACE FUNCTION public.update_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified_at = now();
  NEW.last_modified_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.create_client_access_for_patient()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.client_access (
    patient_id,
    email,
    password_hash,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    encode(digest(NEW.phone || '-temp', 'sha256'), 'hex'),
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Ajouter des politiques pour les triggers manquants
CREATE OR REPLACE FUNCTION public.create_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= NEW.min_quantity THEN
    INSERT INTO public.system_notifications (
      type,
      title,
      message,
      priority,
      product_id,
      metadata
    ) VALUES (
      'stock_alert',
      'Stock faible: ' || NEW.name,
      'Le produit "' || NEW.name || '" a un stock de ' || NEW.quantity || ' unités (minimum: ' || NEW.min_quantity || ')',
      CASE 
        WHEN NEW.quantity = 0 THEN 'urgent'
        WHEN NEW.quantity <= NEW.min_quantity * 0.5 THEN 'high'
        ELSE 'medium'
      END,
      NEW.id,
      jsonb_build_object(
        'current_stock', NEW.quantity,
        'min_stock', NEW.min_quantity,
        'suggested_reorder', NEW.min_quantity * 3
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer les triggers manquants
DROP TRIGGER IF EXISTS stock_alert_trigger ON products;
CREATE TRIGGER stock_alert_trigger
  AFTER UPDATE OF quantity ON products
  FOR EACH ROW
  EXECUTE FUNCTION create_stock_alert();

DROP TRIGGER IF EXISTS create_client_access_trigger ON patients;
CREATE TRIGGER create_client_access_trigger
  AFTER INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION create_client_access_for_patient();
