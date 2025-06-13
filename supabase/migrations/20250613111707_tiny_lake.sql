/*
  # Add expected_consumables column to soins table

  1. Changes
    - Add `expected_consumables` column to `soins` table
    - Column type: JSONB to store array of objects with productId and quantity
    - Default value: empty array
    - Nullable: true for backward compatibility

  2. Security
    - No RLS changes needed as existing policies will apply to the new column
*/

-- Add the expected_consumables column to the soins table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'soins' AND column_name = 'expected_consumables'
  ) THEN
    ALTER TABLE soins ADD COLUMN expected_consumables JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add a comment to document the column structure
COMMENT ON COLUMN soins.expected_consumables IS 'Array of objects containing productId and quantity expected to be consumed during the treatment. Format: [{"productId": "uuid", "quantity": number}]';

-- Create an index on the expected_consumables column for better query performance
CREATE INDEX IF NOT EXISTS idx_soins_expected_consumables ON soins USING gin (expected_consumables);