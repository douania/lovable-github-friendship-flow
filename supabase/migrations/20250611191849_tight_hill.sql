/*
  # Add new fields to products table

  1. New Columns
    - `selling_price` (integer, optional) - Prix de vente conseillé
    - `unit` (text, optional) - Unité de mesure

  2. New Column for soins table
    - `expected_consumables` (jsonb, default '[]') - Consommables attendus par séance
*/

-- Add new columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'selling_price'
  ) THEN
    ALTER TABLE products ADD COLUMN selling_price INTEGER;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'unit'
  ) THEN
    ALTER TABLE products ADD COLUMN unit TEXT;
  END IF;
END $$;

-- Add expected_consumables column to soins table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'soins' AND column_name = 'expected_consumables'
  ) THEN
    ALTER TABLE soins ADD COLUMN expected_consumables JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add index for efficient querying of expected consumables
CREATE INDEX IF NOT EXISTS idx_soins_expected_consumables ON soins USING GIN (expected_consumables);

-- Add comment to explain the structure
COMMENT ON COLUMN soins.expected_consumables IS 'Array of objects containing productId and quantity expected per session. Format: [{"productId": "uuid", "quantity": number}]';