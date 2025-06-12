/*
  # Add consumed products tracking to appointments

  1. Schema Changes
    - Add `consumed_products` column to appointments table
    - Column stores array of objects with productId and quantity
    - Default to empty array

  2. Security
    - Update existing RLS policies to include new column
    - No additional policies needed as existing ones cover all operations

  3. Performance
    - Add GIN index for efficient querying of consumed products
*/

-- Add consumed_products column to appointments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'consumed_products'
  ) THEN
    ALTER TABLE appointments ADD COLUMN consumed_products JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add index for efficient querying of consumed products
CREATE INDEX IF NOT EXISTS idx_appointments_consumed_products ON appointments USING GIN (consumed_products);

-- Add some sample data to demonstrate the structure
COMMENT ON COLUMN appointments.consumed_products IS 'Array of objects containing productId and quantity consumed during the appointment. Format: [{"productId": "uuid", "quantity": number}]';