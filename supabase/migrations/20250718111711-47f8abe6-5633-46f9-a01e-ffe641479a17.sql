-- Corriger la fonction de création d'accès client
-- Il faut activer l'extension pgcrypto pour digest

-- Activer l'extension pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Corriger la fonction
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