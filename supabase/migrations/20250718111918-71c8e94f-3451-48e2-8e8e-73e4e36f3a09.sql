-- Créer des données de test pour le portail client

-- 1. Créer un patient de test
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

-- 2. Créer quelques rendez-vous de test
DO $$
DECLARE
  patient_uuid UUID;
  treatment_uuid UUID;
BEGIN
  -- Récupérer l'ID du patient de test
  SELECT id INTO patient_uuid 
  FROM public.patients 
  WHERE email = 'marie.dupont@test.com' 
  LIMIT 1;
  
  -- Récupérer un traitement existant ou en créer un
  SELECT id INTO treatment_uuid 
  FROM public.treatments 
  LIMIT 1;
  
  IF treatment_uuid IS NULL THEN
    INSERT INTO public.treatments (name, description, price, duration, category)
    VALUES ('Soin du visage', 'Soin hydratant et purifiant', 8500, 60, 'Soins visage')
    RETURNING id INTO treatment_uuid;
  END IF;
  
  -- Créer des rendez-vous de test seulement si le patient existe
  IF patient_uuid IS NOT NULL AND treatment_uuid IS NOT NULL THEN
    -- Rendez-vous futur 1
    INSERT INTO public.appointments (
      patient_id,
      treatment_id,
      date,
      time,
      status,
      notes
    ) VALUES (
      patient_uuid,
      treatment_uuid,
      CURRENT_DATE + INTERVAL '7 days',
      '14:00',
      'scheduled',
      'Premier rendez-vous de test'
    ) ON CONFLICT DO NOTHING;
    
    -- Rendez-vous futur 2  
    INSERT INTO public.appointments (
      patient_id,
      treatment_id,
      date,
      time,
      status,
      notes
    ) VALUES (
      patient_uuid,
      treatment_uuid,
      CURRENT_DATE + INTERVAL '14 days',
      '10:30',
      'scheduled',
      'Deuxième rendez-vous de test'
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;