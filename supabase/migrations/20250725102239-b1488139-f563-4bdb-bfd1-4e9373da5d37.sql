-- Fix the last function search path issue

CREATE OR REPLACE FUNCTION public.create_appointment_reminders()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  appointment_record RECORD;
  reminder_time TIMESTAMPTZ;
  user_prefs RECORD;
BEGIN
  -- Parcourir tous les rendez-vous programmés dans les prochaines 48h
  FOR appointment_record IN 
    SELECT a.*, p.first_name, p.last_name, p.email
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.status = 'scheduled'
    AND a.date >= CURRENT_DATE
    AND a.date <= CURRENT_DATE + INTERVAL '2 days'
  LOOP
    -- Obtenir les préférences de l'utilisateur (par défaut 24h avant)
    SELECT COALESCE(reminder_hours_before, 24) as hours_before
    INTO user_prefs
    FROM notification_preferences
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    -- Calculer l'heure du rappel
    reminder_time := (appointment_record.date || ' ' || appointment_record.time)::TIMESTAMP - 
                    INTERVAL '1 hour' * COALESCE(user_prefs.hours_before, 24);
    
    -- Créer la notification de rappel si elle n'existe pas déjà
    INSERT INTO public.system_notifications (
      type,
      title,
      message,
      priority,
      patient_id,
      appointment_id,
      scheduled_for,
      metadata
    )
    SELECT 
      'appointment_reminder',
      'Rappel de rendez-vous',
      'Rendez-vous avec ' || appointment_record.first_name || ' ' || appointment_record.last_name || 
      ' le ' || to_char(appointment_record.date, 'DD/MM/YYYY') || ' à ' || appointment_record.time,
      'medium',
      appointment_record.patient_id,
      appointment_record.id,
      reminder_time,
      jsonb_build_object(
        'patient_name', appointment_record.first_name || ' ' || appointment_record.last_name,
        'patient_email', appointment_record.email,
        'appointment_date', appointment_record.date,
        'appointment_time', appointment_record.time
      )
    WHERE NOT EXISTS (
      SELECT 1 FROM public.system_notifications 
      WHERE appointment_id = appointment_record.id 
      AND type = 'appointment_reminder'
    );
  END LOOP;
END;
$function$;