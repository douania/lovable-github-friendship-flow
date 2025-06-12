/*
  # Create Treatment Catalog Tables

  1. New Tables
    - `appareils` - Medical equipment/devices
      - `id` (uuid, primary key)
      - `nom` (text, equipment name)
      - `description` (text, description)
      - `icone` (text, icon/emoji)
      - `image_url` (text, optional image)
      - `is_active` (boolean, default true)
      - `ordre` (integer, display order)
      - `created_at` (timestamptz)
    
    - `zones` - Body zones/areas
      - `id` (uuid, primary key)
      - `nom` (text, zone name)
      - `description` (text, description)
      - `created_at` (timestamptz)
    
    - `soins` - Treatments (equipment + zone combinations)
      - `id` (uuid, primary key)
      - `appareil_id` (uuid, foreign key to appareils)
      - `zone_id` (uuid, foreign key to zones)
      - `nom` (text, treatment name)
      - `description` (text, description)
      - `duree` (integer, duration in minutes)
      - `prix` (integer, price in FCFA)
      - `contre_indications` (text array)
      - `conseils_post_traitement` (text array)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
    
    - `forfaits` - Treatment packages
      - `id` (uuid, primary key)
      - `soin_id` (uuid, foreign key to soins)
      - `nb_seances` (integer, number of sessions)
      - `prix_total` (integer, total price)
      - `prix_unitaire` (integer, price per session)
      - `remarque` (text, notes/remarks)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and anonymous users
    - Anonymous users can view active items
    - Authenticated users can manage all items

  3. Performance
    - Add indexes for common queries
    - Foreign key indexes for joins
*/

-- Create appareils table
CREATE TABLE IF NOT EXISTS appareils (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  description text DEFAULT '',
  icone text DEFAULT '',
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  ordre integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create zones table
CREATE TABLE IF NOT EXISTS zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create soins table
CREATE TABLE IF NOT EXISTS soins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appareil_id uuid NOT NULL REFERENCES appareils(id) ON DELETE CASCADE,
  zone_id uuid NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  nom text NOT NULL,
  description text DEFAULT '',
  duree integer NOT NULL DEFAULT 30,
  prix integer NOT NULL DEFAULT 0,
  contre_indications text[] DEFAULT '{}',
  conseils_post_traitement text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(appareil_id, zone_id)
);

-- Create forfaits table
CREATE TABLE IF NOT EXISTS forfaits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  soin_id uuid NOT NULL REFERENCES soins(id) ON DELETE CASCADE,
  nb_seances integer NOT NULL,
  prix_total integer NOT NULL,
  prix_unitaire integer NOT NULL,
  remarque text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE appareils ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE soins ENABLE ROW LEVEL SECURITY;
ALTER TABLE forfaits ENABLE ROW LEVEL SECURITY;

-- Policies for appareils
CREATE POLICY "Allow anon to view appareils" ON appareils FOR SELECT TO anon USING (true);
CREATE POLICY "Allow authenticated to view appareils" ON appareils FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated to insert appareils" ON appareils FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated to update appareils" ON appareils FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to delete appareils" ON appareils FOR DELETE TO authenticated USING (true);

-- Policies for zones
CREATE POLICY "Allow anon to view zones" ON zones FOR SELECT TO anon USING (true);
CREATE POLICY "Allow authenticated to view zones" ON zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated to insert zones" ON zones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated to update zones" ON zones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to delete zones" ON zones FOR DELETE TO authenticated USING (true);

-- Policies for soins
CREATE POLICY "Allow anon to view soins" ON soins FOR SELECT TO anon USING (true);
CREATE POLICY "Allow authenticated to view soins" ON soins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated to insert soins" ON soins FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated to update soins" ON soins FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to delete soins" ON soins FOR DELETE TO authenticated USING (true);

-- Policies for forfaits
CREATE POLICY "Allow anon to view forfaits" ON forfaits FOR SELECT TO anon USING (true);
CREATE POLICY "Allow authenticated to view forfaits" ON forfaits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated to insert forfaits" ON forfaits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated to update forfaits" ON forfaits FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to delete forfaits" ON forfaits FOR DELETE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_soins_appareil ON soins(appareil_id);
CREATE INDEX IF NOT EXISTS idx_soins_zone ON soins(zone_id);
CREATE INDEX IF NOT EXISTS idx_forfaits_soin ON forfaits(soin_id);
CREATE INDEX IF NOT EXISTS idx_appareils_active ON appareils(is_active);
CREATE INDEX IF NOT EXISTS idx_soins_active ON soins(is_active);
CREATE INDEX IF NOT EXISTS idx_forfaits_active ON forfaits(is_active);

-- Insert sample data for appareils
INSERT INTO appareils (nom, description, icone, ordre) VALUES
('BTL Emface', 'Technologie de stimulation musculaire faciale pour le lifting non-invasif', '💪', 1),
('BTL Exion RF', 'Radiofréquence monopolaire pour le remodelage corporel et facial', '⚡', 2),
('BTL Emsella', 'Chaise de rééducation périnéale par stimulation électromagnétique', '🪑', 3),
('Peelings Chimiques', 'Exfoliation chimique contrôlée pour améliorer la texture cutanée', '🧪', 4),
('Injections Esthétiques', 'Acide hyaluronique et skin boosters pour le volume et l''hydratation', '💉', 5),
('PRP & Mésothérapie', 'Plasma riche en plaquettes et mésothérapie pour la régénération', '🩸', 6);

-- Insert sample data for zones
INSERT INTO zones (nom, description) VALUES
('Zone front (frontalis)', 'Muscle frontal pour le traitement des rides horizontales'),
('Zone joues (zygomatique)', 'Muscles zygomatiques pour le lifting des joues'),
('Visage complet', 'Traitement global du visage'),
('Cou', 'Zone cervicale pour le raffermissement'),
('Décolleté', 'Zone du décolleté pour le rajeunissement'),
('Visage + cou', 'Traitement combiné visage et cou'),
('Visage + cou + décolleté', 'Traitement complet haut du corps'),
('Contour des yeux', 'Zone périorbitaire délicate'),
('Contour des lèvres', 'Zone péribuccale'),
('Mains', 'Dos des mains pour le rajeunissement'),
('Périnée femme', 'Plancher pelvien féminin'),
('Périnée homme', 'Plancher pelvien masculin'),
('Cuir chevelu', 'Zone capillaire pour la stimulation'),
('Lèvres', 'Zone labiale pour l''augmentation'),
('Pommettes', 'Zone malaire pour le volume'),
('Sillons nasogéniens', 'Plis nasogéniens'),
('Cernes', 'Zone sous-orbitaire'),
('Menton', 'Zone mentonnière'),
('Ovale du visage', 'Contour facial pour le remodelage');