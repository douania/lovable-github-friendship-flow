
-- Créer une table pour les notifications système
CREATE TABLE public.system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('stock_alert', 'appointment_reminder', 'payment_due', 'system_maintenance', 'appointment_confirmation')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_system_notifications_user_id ON public.system_notifications(target_user_id);
CREATE INDEX idx_system_notifications_type ON public.system_notifications(type);
CREATE INDEX idx_system_notifications_priority ON public.system_notifications(priority);
CREATE INDEX idx_system_notifications_read ON public.system_notifications(is_read);
CREATE INDEX idx_system_notifications_scheduled ON public.system_notifications(scheduled_for);

-- RLS policies pour les notifications
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Policy pour voir ses propres notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.system_notifications 
  FOR SELECT 
  USING (target_user_id = auth.uid());

-- Policy pour marquer ses notifications comme lues
CREATE POLICY "Users can update their own notifications" 
  ON public.system_notifications 
  FOR UPDATE 
  USING (target_user_id = auth.uid());

-- Policy pour les fonctions système (insert/delete)
CREATE POLICY "System can manage notifications" 
  ON public.system_notifications 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Créer une table pour les préférences de notification
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  stock_alerts BOOLEAN DEFAULT TRUE,
  appointment_reminders BOOLEAN DEFAULT TRUE,
  payment_alerts BOOLEAN DEFAULT TRUE,
  marketing_notifications BOOLEAN DEFAULT FALSE,
  reminder_hours_before INTEGER DEFAULT 24 CHECK (reminder_hours_before >= 1 AND reminder_hours_before <= 168),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pour les préférences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their notification preferences" 
  ON public.notification_preferences 
  FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fonction pour créer des alertes de stock automatiques
CREATE OR REPLACE FUNCTION create_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une alerte si le stock est en dessous du minimum
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
$$ LANGUAGE plpgsql;

-- Trigger pour les alertes de stock
CREATE TRIGGER stock_alert_trigger
  AFTER UPDATE OF quantity ON products
  FOR EACH ROW
  EXECUTE FUNCTION create_stock_alert();

-- Fonction pour créer des rappels de rendez-vous
CREATE OR REPLACE FUNCTION create_appointment_reminders()
RETURNS void AS $$
DECLARE
  appointment_record RECORD;
  reminder_time TIMESTAMPTZ;
  user_prefs RECORD;
BEGIN
  -- Parcourir tous les rendez-vous programmés dans les prochaines 48h
  FOR appointment_record IN 
    SELECT a.*, p.first_name, p.last_name, p.email
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.status = 'scheduled'
    AND a.date >= CURRENT_DATE
    AND a.date <= CURRENT_DATE + INTERVAL '2 days'
  LOOP
    -- Obtenir les préférences de l'utilisateur (par défaut 24h avant)
    SELECT COALESCE(reminder_hours_before, 24) as hours_before
    INTO user_prefs
    FROM notification_preferences
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    -- Calculer l'heure du rappel
    reminder_time := (appointment_record.date || ' ' || appointment_record.time)::TIMESTAMP - 
                    INTERVAL '1 hour' * COALESCE(user_prefs.hours_before, 24);
    
    -- Créer la notification de rappel si elle n'existe pas déjà
    INSERT INTO public.system_notifications (
      type,
      title,
      message,
      priority,
      patient_id,
      appointment_id,
      scheduled_for,
      metadata
    )
    SELECT 
      'appointment_reminder',
      'Rappel de rendez-vous',
      'Rendez-vous avec ' || appointment_record.first_name || ' ' || appointment_record.last_name || 
      ' le ' || to_char(appointment_record.date, 'DD/MM/YYYY') || ' à ' || appointment_record.time,
      'medium',
      appointment_record.patient_id,
      appointment_record.id,
      reminder_time,
      jsonb_build_object(
        'patient_name', appointment_record.first_name || ' ' || appointment_record.last_name,
        'patient_email', appointment_record.email,
        'appointment_date', appointment_record.date,
        'appointment_time', appointment_record.time
      )
    WHERE NOT EXISTS (
      SELECT 1 FROM public.system_notifications 
      WHERE appointment_id = appointment_record.id 
      AND type = 'appointment_reminder'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;
