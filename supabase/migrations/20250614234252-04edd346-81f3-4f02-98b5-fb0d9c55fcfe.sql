
-- D'abord, ajouter la colonne 'unit' manquante
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'unité';
ALTER TABLE products ADD COLUMN IF NOT EXISTS selling_price INTEGER;

-- Maintenant ajouter les autres colonnes pour les paramètres avancés
ALTER TABLE products ADD COLUMN IF NOT EXISTS usage_type TEXT DEFAULT 'fixed';
ALTER TABLE products ADD COLUMN IF NOT EXISTS base_units_per_session DECIMAL DEFAULT 1.0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_variations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS storage_conditions TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS batch_number TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_prescription_required BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS administration_method TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS concentration TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS volume_per_unit DECIMAL;

-- Ajouter des commentaires pour documenter les champs
COMMENT ON COLUMN products.unit IS 'Unité de mesure du produit (unité, ml, mg, etc.)';
COMMENT ON COLUMN products.selling_price IS 'Prix de vente conseillé aux clients';
COMMENT ON COLUMN products.usage_type IS 'Type d''utilisation: fixed (quantité fixe), variable (selon facteurs), zone_based (selon zone)';
COMMENT ON COLUMN products.base_units_per_session IS 'Quantité de base utilisée par séance';
COMMENT ON COLUMN products.unit_variations IS 'Variations selon facteurs: [{"factor": "zone", "value": "visage", "units": 20}]';
COMMENT ON COLUMN products.storage_conditions IS 'Conditions de stockage (température, humidité, etc.)';
COMMENT ON COLUMN products.batch_number IS 'Numéro de lot pour traçabilité';
COMMENT ON COLUMN products.is_prescription_required IS 'Nécessite une prescription médicale';
COMMENT ON COLUMN products.administration_method IS 'Méthode d''administration (injection, topique, oral, etc.)';
COMMENT ON COLUMN products.concentration IS 'Concentration du produit (ex: 100U/vial pour Botox)';
COMMENT ON COLUMN products.volume_per_unit IS 'Volume par unité en ml';

-- Créer une table pour les facteurs de variation détaillés
CREATE TABLE IF NOT EXISTS consumable_variation_factors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  factor_type TEXT NOT NULL, -- 'zone', 'age', 'skin_type', 'severity', 'experience', 'session_number'
  factor_value TEXT NOT NULL,
  base_units DECIMAL DEFAULT 0,
  multiplier DECIMAL DEFAULT 1.0,
  min_units DECIMAL DEFAULT 0,
  max_units DECIMAL DEFAULT 999,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_variation_factors_product ON consumable_variation_factors(product_id);
CREATE INDEX IF NOT EXISTS idx_variation_factors_type ON consumable_variation_factors(factor_type);

-- Créer une table pour l'historique de consommation réelle
CREATE TABLE IF NOT EXISTS actual_consumption_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  soin_id UUID REFERENCES soins(id),
  patient_age INTEGER,
  treatment_zone TEXT,
  skin_type TEXT,
  units_used DECIMAL NOT NULL,
  cost_per_unit DECIMAL,
  total_cost DECIMAL,
  variance_from_expected DECIMAL,
  notes TEXT,
  practitioner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour l'historique
CREATE INDEX IF NOT EXISTS idx_consumption_history_appointment ON actual_consumption_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_consumption_history_product ON actual_consumption_history(product_id);
CREATE INDEX IF NOT EXISTS idx_consumption_history_date ON actual_consumption_history(created_at);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_variation_factors_updated_at ON consumable_variation_factors;
CREATE TRIGGER update_variation_factors_updated_at
    BEFORE UPDATE ON consumable_variation_factors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Exemples de données pour illustrer le système (Botox) - maintenant que toutes les colonnes existent
DO $$
DECLARE
    botox_product_id UUID;
BEGIN
    -- Insérer un produit Botox exemple s'il n'existe pas
    INSERT INTO products (name, category, quantity, min_quantity, unit_price, unit, supplier, usage_type, base_units_per_session, concentration, administration_method, storage_conditions, is_prescription_required)
    VALUES ('Botox Allergan 100U', 'Médicament', 5, 2, 35000, 'unité', 'Allergan', 'variable', 20, '100U/vial', 'injection', 'Réfrigéré 2-8°C', true)
    ON CONFLICT DO NOTHING
    RETURNING id INTO botox_product_id;
    
    -- Si le produit existait déjà, récupérer son ID
    IF botox_product_id IS NULL THEN
        SELECT id INTO botox_product_id FROM products WHERE name ILIKE '%botox%' AND category = 'Médicament' LIMIT 1;
    END IF;
    
    -- Ajouter des facteurs de variation si le produit existe
    IF botox_product_id IS NOT NULL THEN
        INSERT INTO consumable_variation_factors (product_id, factor_type, factor_value, base_units, notes) VALUES
        (botox_product_id, 'zone', 'front', 15, 'Front - rides horizontales'),
        (botox_product_id, 'zone', 'glabelle', 20, 'Ride du lion - entre sourcils'),
        (botox_product_id, 'zone', 'crow_feet', 12, 'Pattes d''oie - coin des yeux'),
        (botox_product_id, 'zone', 'full_face', 45, 'Visage complet'),
        (botox_product_id, 'age', '25-35', 0.8, 'Patients jeunes - traitement préventif'),
        (botox_product_id, 'age', '36-50', 1.0, 'Patients d''âge moyen - dose standard'),
        (botox_product_id, 'age', '50+', 1.2, 'Patients matures - rides prononcées'),
        (botox_product_id, 'skin_type', 'fine', 0.9, 'Peau fine - dose réduite'),
        (botox_product_id, 'skin_type', 'épaisse', 1.1, 'Peau épaisse - dose augmentée')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
