/*
  # Create new forfaits table structure

  1. New Table Structure
    - Drop existing forfaits table
    - Create new forfaits table with updated schema
    - `id` (uuid, primary key)
    - `nom` (text, package name)
    - `description` (text, package description)
    - `soin_ids` (uuid array, treatment IDs included)
    - `prix_total` (integer, total price without discount)
    - `prix_reduit` (integer, discounted package price)
    - `nb_seances` (integer, total number of sessions)
    - `validite_mois` (integer, validity in months)
    - `is_active` (boolean, default true)
    - `ordre` (integer, display order)
    - `created_at` (timestamptz)

  2. Security
    - Enable RLS on forfaits table
    - Add policies for authenticated and anonymous users

  3. Performance
    - Add indexes for common queries
*/

-- Drop existing forfaits table if it exists
DROP TABLE IF EXISTS forfaits CASCADE;

-- Create new forfaits table
CREATE TABLE forfaits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  description text DEFAULT '',
  soin_ids uuid[] DEFAULT '{}',
  prix_total integer NOT NULL DEFAULT 0,
  prix_reduit integer NOT NULL DEFAULT 0,
  nb_seances integer NOT NULL DEFAULT 1,
  validite_mois integer NOT NULL DEFAULT 6,
  is_active boolean DEFAULT true,
  ordre integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE forfaits ENABLE ROW LEVEL SECURITY;

-- Policies for forfaits
CREATE POLICY "Allow anon to view forfaits" ON forfaits FOR SELECT TO anon USING (true);
CREATE POLICY "Allow authenticated to view forfaits" ON forfaits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated to insert forfaits" ON forfaits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated to update forfaits" ON forfaits FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to delete forfaits" ON forfaits FOR DELETE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forfaits_active ON forfaits(is_active);
CREATE INDEX IF NOT EXISTS idx_forfaits_ordre ON forfaits(ordre);
CREATE INDEX IF NOT EXISTS idx_forfaits_soin_ids ON forfaits USING GIN(soin_ids);

-- Insert sample forfait data
INSERT INTO forfaits (nom, description, soin_ids, prix_total, prix_reduit, nb_seances, validite_mois, ordre) VALUES
('Forfait Découverte Emface', 'Découvrez la technologie Emface avec ce forfait d''initiation', '{}', 450000, 380000, 3, 3, 1),
('Forfait Rajeunissement Complet', 'Combinaison Emface + Exion RF pour un rajeunissement optimal', '{}', 800000, 650000, 6, 6, 2),
('Forfait Rééducation Périnéale', 'Programme complet Emsella pour la rééducation du plancher pelvien', '{}', 600000, 500000, 8, 4, 3);