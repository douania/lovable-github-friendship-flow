
-- Redéfinition sécurisée de la fonction : search_path fixé, sécurité invoker
CREATE OR REPLACE FUNCTION public.calculate_consumption_variance(
  appointment_id_param uuid
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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
