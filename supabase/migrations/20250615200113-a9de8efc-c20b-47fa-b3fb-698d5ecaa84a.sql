
-- Créer une table pour l'accès client
CREATE TABLE public.client_access (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Activer RLS pour sécuriser l'accès
ALTER TABLE public.client_access ENABLE ROW LEVEL SECURITY;

-- Politique RLS : les clients ne peuvent voir que leurs propres données
CREATE POLICY "Clients can view own access" 
  ON public.client_access 
  FOR SELECT 
  USING (auth.uid()::text = id::text);

-- Créer une table pour les sessions client
CREATE TABLE public.client_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES client_access(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Activer RLS sur les sessions
ALTER TABLE public.client_sessions ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour les sessions
CREATE POLICY "Clients can view own sessions" 
  ON public.client_sessions 
  FOR ALL 
  USING (client_id IN (SELECT id FROM client_access WHERE auth.uid()::text = id::text));

-- Fonction pour créer un accès client automatiquement lors de la création d'un patient
CREATE OR REPLACE FUNCTION public.create_client_access_for_patient()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer un accès client avec un mot de passe temporaire
  INSERT INTO public.client_access (
    patient_id,
    email,
    password_hash,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    encode(digest(NEW.phone || '-temp', 'sha256'), 'hex'), -- Mot de passe temporaire basé sur le téléphone
    true
  );
  
  RETURN NEW;
END;
$$;

-- Trigger pour créer automatiquement l'accès client
CREATE TRIGGER create_client_access_trigger
  AFTER INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION create_client_access_for_patient();

-- Créer une table pour les logs d'activité client
CREATE TABLE public.client_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES client_access(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS pour les logs d'activité
ALTER TABLE public.client_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own activity logs" 
  ON public.client_activity_logs 
  FOR SELECT 
  USING (client_id IN (SELECT id FROM client_access WHERE auth.uid()::text = id::text));
