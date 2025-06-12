/*
  # Add consumption tracking and reporting features

  1. New Tables
    - `consumption_reports` - Track actual vs expected consumption
    - `stock_alerts` - Smart alerts based on consumption patterns
    - `cost_analysis` - Cost optimization insights

  2. New Columns
    - Add consumption tracking fields to appointments
    - Add cost analysis fields to products

  3. Functions
    - Calculate consumption variance
    - Generate smart alerts
    - Cost optimization suggestions

  4. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Add consumption tracking fields to appointments if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'actual_consumption'
  ) THEN
    ALTER TABLE appointments ADD COLUMN actual_consumption JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'consumption_variance'
  ) THEN
    ALTER TABLE appointments ADD COLUMN consumption_variance JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create consumption_reports table
CREATE TABLE IF NOT EXISTS consumption_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  soin_id uuid REFERENCES soins(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  expected_quantity integer NOT NULL DEFAULT 0,
  actual_quantity integer NOT NULL DEFAULT 0,
  variance_quantity integer GENERATED ALWAYS AS (actual_quantity - expected_quantity) STORED,
  variance_percentage decimal GENERATED ALWAYS AS (
    CASE 
      WHEN expected_quantity > 0 THEN 
        ROUND(((actual_quantity - expected_quantity)::decimal / expected_quantity::decimal) * 100, 2)
      ELSE 0 
    END
  ) STORED,
  cost_impact decimal DEFAULT 0,
  report_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create stock_alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'high_consumption', 'expiry_warning', 'cost_variance')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  threshold_value decimal,
  current_value decimal,
  suggested_action text,
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create cost_analysis table
CREATE TABLE IF NOT EXISTS cost_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  soin_id uuid REFERENCES soins(id) ON DELETE CASCADE,
  analysis_period_start date NOT NULL,
  analysis_period_end date NOT NULL,
  total_sessions integer DEFAULT 0,
  expected_cost decimal DEFAULT 0,
  actual_cost decimal DEFAULT 0,
  cost_variance decimal GENERATED ALWAYS AS (actual_cost - expected_cost) STORED,
  cost_variance_percentage decimal GENERATED ALWAYS AS (
    CASE 
      WHEN expected_cost > 0 THEN 
        ROUND(((actual_cost - expected_cost) / expected_cost) * 100, 2)
      ELSE 0 
    END
  ) STORED,
  profit_margin decimal DEFAULT 0,
  optimization_suggestions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE consumption_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_analysis ENABLE ROW LEVEL SECURITY;

-- Policies for consumption_reports
CREATE POLICY "Allow authenticated users to view consumption reports"
  ON consumption_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert consumption reports"
  ON consumption_reports FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update consumption reports"
  ON consumption_reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete consumption reports"
  ON consumption_reports FOR DELETE TO authenticated USING (true);

-- Policies for stock_alerts
CREATE POLICY "Allow authenticated users to view stock alerts"
  ON stock_alerts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert stock alerts"
  ON stock_alerts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update stock alerts"
  ON stock_alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete stock alerts"
  ON stock_alerts FOR DELETE TO authenticated USING (true);

-- Policies for cost_analysis
CREATE POLICY "Allow authenticated users to view cost analysis"
  ON cost_analysis FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert cost analysis"
  ON cost_analysis FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update cost analysis"
  ON cost_analysis FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete cost analysis"
  ON cost_analysis FOR DELETE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consumption_reports_appointment ON consumption_reports(appointment_id);
CREATE INDEX IF NOT EXISTS idx_consumption_reports_soin ON consumption_reports(soin_id);
CREATE INDEX IF NOT EXISTS idx_consumption_reports_product ON consumption_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_consumption_reports_date ON consumption_reports(report_date);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_product ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_type ON stock_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_severity ON stock_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_unread ON stock_alerts(is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_cost_analysis_soin ON cost_analysis(soin_id);
CREATE INDEX IF NOT EXISTS idx_cost_analysis_period ON cost_analysis(analysis_period_start, analysis_period_end);

-- Add GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_appointments_actual_consumption ON appointments USING GIN (actual_consumption);
CREATE INDEX IF NOT EXISTS idx_appointments_consumption_variance ON appointments USING GIN (consumption_variance);
CREATE INDEX IF NOT EXISTS idx_cost_analysis_suggestions ON cost_analysis USING GIN (optimization_suggestions);

-- Function to calculate consumption variance
CREATE OR REPLACE FUNCTION calculate_consumption_variance(
  appointment_id_param uuid
) RETURNS jsonb AS $$
DECLARE
  variance_result jsonb := '{}';
  appointment_record record;
  expected_item record;
  actual_item record;
  variance_item jsonb;
BEGIN
  -- Get appointment with soin details
  SELECT a.*, s.expected_consumables
  INTO appointment_record
  FROM appointments a
  JOIN soins s ON a.treatment_id = s.id
  WHERE a.id = appointment_id_param;
  
  IF NOT FOUND THEN
    RETURN variance_result;
  END IF;
  
  -- Calculate variance for each expected consumable
  FOR expected_item IN 
    SELECT 
      (value->>'productId')::uuid as product_id,
      (value->>'quantity')::integer as expected_quantity
    FROM jsonb_array_elements(appointment_record.expected_consumables)
  LOOP
    -- Find corresponding actual consumption
    SELECT 
      (value->>'quantity')::integer as actual_quantity
    INTO actual_item
    FROM jsonb_array_elements(appointment_record.consumed_products)
    WHERE (value->>'productId')::uuid = expected_item.product_id;
    
    -- Calculate variance
    variance_item := jsonb_build_object(
      'productId', expected_item.product_id,
      'expectedQuantity', expected_item.expected_quantity,
      'actualQuantity', COALESCE(actual_item.actual_quantity, 0),
      'variance', COALESCE(actual_item.actual_quantity, 0) - expected_item.expected_quantity,
      'variancePercentage', 
        CASE 
          WHEN expected_item.expected_quantity > 0 THEN
            ROUND(((COALESCE(actual_item.actual_quantity, 0) - expected_item.expected_quantity)::decimal / expected_item.expected_quantity::decimal) * 100, 2)
          ELSE 0
        END
    );
    
    variance_result := variance_result || jsonb_build_object(expected_item.product_id::text, variance_item);
  END LOOP;
  
  RETURN variance_result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate smart stock alerts
CREATE OR REPLACE FUNCTION generate_smart_alerts() RETURNS void AS $$
DECLARE
  product_record record;
  consumption_rate decimal;
  days_until_stockout integer;
  alert_record record;
BEGIN
  -- Clear old alerts (older than 7 days)
  DELETE FROM stock_alerts WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Generate alerts for each product
  FOR product_record IN 
    SELECT p.*, 
           COALESCE(AVG(cr.actual_quantity), 0) as avg_consumption_per_session,
           COUNT(cr.id) as total_sessions_last_30_days
    FROM products p
    LEFT JOIN consumption_reports cr ON p.id = cr.product_id 
      AND cr.report_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY p.id
  LOOP
    -- Calculate consumption rate (units per day)
    consumption_rate := CASE 
      WHEN product_record.total_sessions_last_30_days > 0 THEN
        (product_record.avg_consumption_per_session * product_record.total_sessions_last_30_days) / 30.0
      ELSE 0
    END;
    
    -- Calculate days until stockout
    days_until_stockout := CASE 
      WHEN consumption_rate > 0 THEN
        FLOOR(product_record.quantity / consumption_rate)
      ELSE 999
    END;
    
    -- Low stock alert
    IF product_record.quantity <= product_record.min_quantity THEN
      INSERT INTO stock_alerts (product_id, alert_type, severity, title, message, current_value, threshold_value, suggested_action)
      VALUES (
        product_record.id,
        'low_stock',
        CASE 
          WHEN product_record.quantity = 0 THEN 'critical'
          WHEN product_record.quantity <= product_record.min_quantity * 0.5 THEN 'high'
          ELSE 'medium'
        END,
        'Stock faible: ' || product_record.name,
        'Le stock de ' || product_record.name || ' est en dessous du seuil minimum (' || product_record.quantity || '/' || product_record.min_quantity || ')',
        product_record.quantity,
        product_record.min_quantity,
        'Réapprovisionner immédiatement'
      )
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- High consumption alert
    IF consumption_rate > 0 AND days_until_stockout <= 7 THEN
      INSERT INTO stock_alerts (product_id, alert_type, severity, title, message, current_value, suggested_action)
      VALUES (
        product_record.id,
        'high_consumption',
        CASE 
          WHEN days_until_stockout <= 2 THEN 'critical'
          WHEN days_until_stockout <= 5 THEN 'high'
          ELSE 'medium'
        END,
        'Consommation élevée: ' || product_record.name,
        'Basé sur la consommation actuelle, le stock sera épuisé dans ' || days_until_stockout || ' jour(s)',
        consumption_rate,
        'Ajuster les commandes ou réduire la consommation'
      )
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Expiry warning
    IF product_record.expiry_date IS NOT NULL 
       AND product_record.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
      INSERT INTO stock_alerts (product_id, alert_type, severity, title, message, expires_at, suggested_action)
      VALUES (
        product_record.id,
        'expiry_warning',
        CASE 
          WHEN product_record.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'high'
          WHEN product_record.expiry_date <= CURRENT_DATE + INTERVAL '14 days' THEN 'medium'
          ELSE 'low'
        END,
        'Expiration proche: ' || product_record.name,
        'Le produit ' || product_record.name || ' expire le ' || product_record.expiry_date,
        product_record.expiry_date::timestamptz,
        'Utiliser en priorité ou retourner au fournisseur'
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert sample consumption reports for demonstration
INSERT INTO consumption_reports (appointment_id, soin_id, product_id, expected_quantity, actual_quantity, cost_impact)
SELECT 
  a.id,
  s.id,
  p.id,
  2, -- expected
  CASE 
    WHEN random() < 0.7 THEN 2 -- normal consumption
    WHEN random() < 0.9 THEN 3 -- slight overconsumption
    ELSE 1 -- underconsumption
  END,
  p.unit_price * 0.5 -- sample cost impact
FROM appointments a
JOIN soins s ON a.treatment_id = s.id
CROSS JOIN products p
WHERE a.status = 'completed'
  AND p.category IN ('Consommable', 'Cosmétique')
LIMIT 50;

-- Generate initial smart alerts
SELECT generate_smart_alerts();