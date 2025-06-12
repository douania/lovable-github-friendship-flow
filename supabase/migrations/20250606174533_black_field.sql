/*
  # Compléter le catalogue des soins

  1. Données complètes
    - Créer tous les soins pour chaque combinaison appareil/zone
    - Ajouter des forfaits réalistes
    - Prix et durées cohérents

  2. Soins par appareil
    - BTL Emface: zones faciales
    - BTL Exion RF: zones corporelles et faciales
    - BTL Emsella: zones périnéales
    - Peelings: zones faciales et corporelles
    - Injections: zones spécifiques
    - PRP/Mésothérapie: zones de régénération

  3. Forfaits attractifs
    - Forfaits par appareil
    - Forfaits combinés
    - Différents niveaux de prix
*/

-- Insérer tous les soins pour BTL Emface (zones faciales)
INSERT INTO soins (appareil_id, zone_id, nom, description, duree, prix, contre_indications, conseils_post_traitement) 
SELECT 
  a.id as appareil_id,
  z.id as zone_id,
  'Emface ' || z.nom as nom,
  'Stimulation musculaire faciale ciblée sur ' || LOWER(z.nom) || ' pour un lifting naturel et non-invasif' as description,
  20 as duree,
  CASE 
    WHEN z.nom LIKE '%front%' THEN 120000
    WHEN z.nom LIKE '%joues%' THEN 150000
    WHEN z.nom LIKE '%complet%' THEN 200000
    WHEN z.nom LIKE '%cou%' THEN 100000
    WHEN z.nom LIKE '%yeux%' THEN 80000
    ELSE 120000
  END as prix,
  ARRAY['Grossesse', 'Implants métalliques dans la zone', 'Pacemaker', 'Épilepsie'] as contre_indications,
  ARRAY['Éviter les massages intenses 24h', 'Hydratation recommandée', 'Protection solaire'] as conseils_post_traitement
FROM appareils a, zones z 
WHERE a.nom = 'BTL Emface' 
AND z.nom IN ('Zone front (frontalis)', 'Zone joues (zygomatique)', 'Visage complet', 'Cou', 'Visage + cou', 'Contour des yeux');

-- Insérer tous les soins pour BTL Exion RF
INSERT INTO soins (appareil_id, zone_id, nom, description, duree, prix, contre_indications, conseils_post_traitement) 
SELECT 
  a.id as appareil_id,
  z.id as zone_id,
  'Exion RF ' || z.nom as nom,
  'Radiofréquence monopolaire pour le raffermissement et remodelage de ' || LOWER(z.nom) as description,
  CASE 
    WHEN z.nom LIKE '%complet%' OR z.nom LIKE '%décolleté%' THEN 45
    WHEN z.nom LIKE '%cou%' THEN 30
    ELSE 35
  END as duree,
  CASE 
    WHEN z.nom LIKE '%complet%' THEN 180000
    WHEN z.nom LIKE '%décolleté%' THEN 220000
    WHEN z.nom LIKE '%cou%' THEN 120000
    WHEN z.nom LIKE '%mains%' THEN 80000
    ELSE 150000
  END as prix,
  ARRAY['Grossesse', 'Implants métalliques', 'Cancer actif', 'Troubles de coagulation'] as contre_indications,
  ARRAY['Éviter exposition solaire 48h', 'Hydratation intensive', 'Pas de sauna 72h'] as conseils_post_traitement
FROM appareils a, zones z 
WHERE a.nom = 'BTL Exion RF' 
AND z.nom IN ('Visage complet', 'Cou', 'Décolleté', 'Visage + cou', 'Visage + cou + décolleté', 'Mains');

-- Insérer tous les soins pour BTL Emsella
INSERT INTO soins (appareil_id, zone_id, nom, description, duree, prix, contre_indications, conseils_post_traitement) 
SELECT 
  a.id as appareil_id,
  z.id as zone_id,
  'Emsella ' || z.nom as nom,
  'Rééducation périnéale par stimulation électromagnétique pour ' || LOWER(z.nom) as description,
  30 as duree,
  CASE 
    WHEN z.nom LIKE '%femme%' THEN 75000
    WHEN z.nom LIKE '%homme%' THEN 75000
    ELSE 75000
  END as prix,
  ARRAY['Grossesse', 'Implants métalliques pelviens', 'Stimulateur cardiaque', 'Cancer pelvien'] as contre_indications,
  ARRAY['Hydratation recommandée', 'Éviter efforts intenses 24h', 'Exercices de Kegel complémentaires'] as conseils_post_traitement
FROM appareils a, zones z 
WHERE a.nom = 'BTL Emsella' 
AND z.nom IN ('Périnée femme', 'Périnée homme');

-- Insérer tous les soins pour Peelings Chimiques
INSERT INTO soins (appareil_id, zone_id, nom, description, duree, prix, contre_indications, conseils_post_traitement) 
SELECT 
  a.id as appareil_id,
  z.id as zone_id,
  'Peeling ' || z.nom as nom,
  'Exfoliation chimique contrôlée pour améliorer la texture et l''éclat de ' || LOWER(z.nom) as description,
  CASE 
    WHEN z.nom LIKE '%complet%' THEN 60
    WHEN z.nom LIKE '%décolleté%' THEN 45
    ELSE 30
  END as duree,
  CASE 
    WHEN z.nom LIKE '%complet%' THEN 85000
    WHEN z.nom LIKE '%décolleté%' THEN 120000
    WHEN z.nom LIKE '%cou%' THEN 60000
    WHEN z.nom LIKE '%mains%' THEN 50000
    ELSE 70000
  END as prix,
  ARRAY['Grossesse', 'Allaitement', 'Exposition solaire récente', 'Peau irritée', 'Herpès actif'] as contre_indications,
  ARRAY['Protection solaire obligatoire 2 semaines', 'Hydratation intensive', 'Éviter gommages 1 semaine', 'Crème cicatrisante'] as conseils_post_traitement
FROM appareils a, zones z 
WHERE a.nom = 'Peelings Chimiques' 
AND z.nom IN ('Visage complet', 'Cou', 'Décolleté', 'Visage + cou', 'Mains', 'Cuir chevelu');

-- Insérer tous les soins pour Injections Esthétiques
INSERT INTO soins (appareil_id, zone_id, nom, description, duree, prix, contre_indications, conseils_post_traitement) 
SELECT 
  a.id as appareil_id,
  z.id as zone_id,
  'Injection ' || z.nom as nom,
  'Injection d''acide hyaluronique pour ' || LOWER(z.nom) || ' - Volume et hydratation' as description,
  CASE 
    WHEN z.nom LIKE '%lèvres%' THEN 30
    WHEN z.nom LIKE '%pommettes%' THEN 45
    WHEN z.nom LIKE '%sillons%' THEN 30
    WHEN z.nom LIKE '%cernes%' THEN 30
    WHEN z.nom LIKE '%menton%' THEN 30
    WHEN z.nom LIKE '%ovale%' THEN 60
    ELSE 30
  END as duree,
  CASE 
    WHEN z.nom LIKE '%lèvres%' THEN 250000
    WHEN z.nom LIKE '%pommettes%' THEN 300000
    WHEN z.nom LIKE '%sillons%' THEN 280000
    WHEN z.nom LIKE '%cernes%' THEN 320000
    WHEN z.nom LIKE '%menton%' THEN 250000
    WHEN z.nom LIKE '%ovale%' THEN 400000
    ELSE 250000
  END as prix,
  ARRAY['Grossesse', 'Allaitement', 'Allergie à l''acide hyaluronique', 'Infection locale', 'Troubles de coagulation'] as contre_indications,
  ARRAY['Éviter massage zone 24h', 'Pas d''exposition solaire 48h', 'Éviter alcool 24h', 'Glace si gonflement', 'Pas de sport intense 24h'] as conseils_post_traitement
FROM appareils a, zones z 
WHERE a.nom = 'Injections Esthétiques' 
AND z.nom IN ('Lèvres', 'Pommettes', 'Sillons nasogéniens', 'Cernes', 'Menton', 'Ovale du visage');

-- Insérer tous les soins pour PRP & Mésothérapie
INSERT INTO soins (appareil_id, zone_id, nom, description, duree, prix, contre_indications, conseils_post_traitement) 
SELECT 
  a.id as appareil_id,
  z.id as zone_id,
  CASE 
    WHEN z.nom LIKE '%cuir%' THEN 'PRP Capillaire'
    ELSE 'Mésothérapie ' || z.nom
  END as nom,
  CASE 
    WHEN z.nom LIKE '%cuir%' THEN 'Plasma riche en plaquettes pour stimuler la repousse capillaire'
    ELSE 'Mésothérapie régénératrice pour ' || LOWER(z.nom) || ' - Revitalisation cellulaire'
  END as description,
  CASE 
    WHEN z.nom LIKE '%cuir%' THEN 60
    WHEN z.nom LIKE '%complet%' THEN 45
    ELSE 30
  END as duree,
  CASE 
    WHEN z.nom LIKE '%cuir%' THEN 200000
    WHEN z.nom LIKE '%complet%' THEN 150000
    WHEN z.nom LIKE '%décolleté%' THEN 180000
    WHEN z.nom LIKE '%cou%' THEN 120000
    WHEN z.nom LIKE '%mains%' THEN 100000
    ELSE 130000
  END as prix,
  ARRAY['Grossesse', 'Allaitement', 'Infection active', 'Troubles de coagulation', 'Traitement anticoagulant'] as contre_indications,
  ARRAY['Éviter lavage 12h', 'Protection solaire', 'Hydratation douce', 'Éviter produits actifs 48h'] as conseils_post_traitement
FROM appareils a, zones z 
WHERE a.nom = 'PRP & Mésothérapie' 
AND z.nom IN ('Visage complet', 'Cou', 'Décolleté', 'Visage + cou', 'Mains', 'Cuir chevelu');

-- Mettre à jour les forfaits avec des soin_ids réels
UPDATE forfaits SET 
  soin_ids = (
    SELECT ARRAY_AGG(s.id) 
    FROM soins s 
    JOIN appareils a ON s.appareil_id = a.id 
    WHERE a.nom = 'BTL Emface' 
    LIMIT 3
  ),
  prix_total = 450000
WHERE nom = 'Forfait Découverte Emface';

UPDATE forfaits SET 
  soin_ids = (
    SELECT ARRAY_AGG(s.id) 
    FROM soins s 
    JOIN appareils a ON s.appareil_id = a.id 
    WHERE a.nom IN ('BTL Emface', 'BTL Exion RF') 
    LIMIT 6
  ),
  prix_total = 900000
WHERE nom = 'Forfait Rajeunissement Complet';

UPDATE forfaits SET 
  soin_ids = (
    SELECT ARRAY_AGG(s.id) 
    FROM soins s 
    JOIN appareils a ON s.appareil_id = a.id 
    WHERE a.nom = 'BTL Emsella' 
    LIMIT 8
  ),
  prix_total = 600000
WHERE nom = 'Forfait Rééducation Périnéale';

-- Ajouter des forfaits supplémentaires
INSERT INTO forfaits (nom, description, soin_ids, prix_total, prix_reduit, nb_seances, validite_mois, ordre) VALUES
(
  'Forfait Anti-Âge Premium',
  'Combinaison complète : Emface + Exion RF + Injections pour un rajeunissement optimal',
  (SELECT ARRAY_AGG(s.id) FROM soins s JOIN appareils a ON s.appareil_id = a.id WHERE a.nom IN ('BTL Emface', 'BTL Exion RF', 'Injections Esthétiques') LIMIT 8),
  1200000,
  950000,
  8,
  8,
  4
),
(
  'Forfait Peau Parfaite',
  'Peelings + Mésothérapie pour une peau éclatante et régénérée',
  (SELECT ARRAY_AGG(s.id) FROM soins s JOIN appareils a ON s.appareil_id = a.id WHERE a.nom IN ('Peelings Chimiques', 'PRP & Mésothérapie') LIMIT 6),
  480000,
  400000,
  6,
  4,
  5
),
(
  'Forfait Jeune Maman',
  'Rééducation périnéale + raffermissement corporel post-grossesse',
  (SELECT ARRAY_AGG(s.id) FROM soins s JOIN appareils a ON s.appareil_id = a.id WHERE a.nom IN ('BTL Emsella', 'BTL Exion RF') LIMIT 10),
  750000,
  600000,
  10,
  6,
  6
);