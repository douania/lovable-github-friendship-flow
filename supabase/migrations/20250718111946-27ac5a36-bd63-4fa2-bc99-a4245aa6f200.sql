-- Désactiver temporairement le trigger problématique
DROP TRIGGER IF EXISTS create_client_access_trigger ON patients;

-- Créer un patient de test
INSERT INTO public.patients (
  first_name,
  last_name,
  email,
  phone,
  date_of_birth,
  skin_type,
  medical_history,
  contraindications
) VALUES (
  'Marie',
  'Dupont',
  'marie.dupont@test.com',
  '+33612345678',
  '1985-03-15',
  'Peau mixte',
  'Aucun antécédent particulier',
  '{}'
) ON CONFLICT (email) DO NOTHING;

-- Créer manuellement l'accès client avec un hash simple
DO $$
DECLARE
  patient_uuid UUID;
BEGIN
  -- Récupérer l'ID du patient
  SELECT id INTO patient_uuid 
  FROM public.patients 
  WHERE email = 'marie.dupont@test.com' 
  LIMIT 1;
  
  IF patient_uuid IS NOT NULL THEN
    -- Créer l'accès client manuellement
    INSERT INTO public.client_access (
      patient_id,
      email,
      password_hash,
      is_active
    ) VALUES (
      patient_uuid,
      'marie.dupont@test.com',
      '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', -- hash de "password"
      true
    ) ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;