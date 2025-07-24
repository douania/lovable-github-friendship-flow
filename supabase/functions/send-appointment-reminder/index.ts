import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupérer les rendez-vous des prochaines 24h
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { data: appointments, error } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        patients (
          first_name,
          last_name,
          email,
          phone
        ),
        treatments (
          name
        )
      `)
      .eq('status', 'scheduled')
      .eq('date', tomorrow.toISOString().split('T')[0]);

    if (error) throw error;

    // Créer des notifications pour chaque rendez-vous
    for (const appointment of appointments || []) {
      const { error: notifError } = await supabaseClient
        .from('system_notifications')
        .insert({
          type: 'appointment_reminder',
          title: 'Rappel de rendez-vous - Demain',
          message: `Rendez-vous avec ${appointment.patients.first_name} ${appointment.patients.last_name} à ${appointment.time} pour ${appointment.treatments.name}`,
          priority: 'high',
          appointment_id: appointment.id,
          patient_id: appointment.patient_id,
          scheduled_for: new Date().toISOString(),
          metadata: {
            patient_name: `${appointment.patients.first_name} ${appointment.patients.last_name}`,
            patient_email: appointment.patients.email,
            patient_phone: appointment.patients.phone,
            appointment_date: appointment.date,
            appointment_time: appointment.time,
            treatment_name: appointment.treatments.name
          }
        });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: appointments?.length || 0,
        message: `${appointments?.length || 0} rappels créés`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});