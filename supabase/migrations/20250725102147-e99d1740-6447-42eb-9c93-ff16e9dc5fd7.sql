-- Fix remaining function search path issues

CREATE OR REPLACE FUNCTION public.generate_smart_alerts()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.calculate_consumption_variance(appointment_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
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
$function$;