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

    // Tables à sauvegarder
    const tables = [
      'patients', 'appointments', 'treatments', 'products', 
      'consultations', 'invoices', 'quotes', 'soins', 'forfaits',
      'appareils', 'zones', 'consumption_reports', 'stock_alerts'
    ];

    const backupData: any = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {}
    };

    let totalRecords = 0;

    // Sauvegarder chaque table
    for (const table of tables) {
      try {
        const { data, error } = await supabaseClient
          .from(table)
          .select('*');
          
        if (!error && data) {
          backupData.data[table] = data;
          totalRecords += data.length;
        }
      } catch (tableError) {
        console.warn(`Erreur lors de la sauvegarde de ${table}:`, tableError);
      }
    }

    // Enregistrer la métadonnée de sauvegarde
    const backupId = crypto.randomUUID();
    const filename = `backup_auto_${new Date().toISOString().split('T')[0]}_${backupId.slice(0, 8)}.json`;
    
    const metadata = {
      id: backupId,
      filename,
      size: JSON.stringify(backupData).length,
      tables,
      recordCount: totalRecords,
      createdAt: new Date().toISOString(),
      type: 'automatic'
    };

    // Créer une notification de sauvegarde réussie
    await supabaseClient
      .from('system_notifications')
      .insert({
        type: 'system_maintenance',
        title: 'Sauvegarde automatique effectuée',
        message: `Sauvegarde automatique créée avec succès: ${totalRecords} enregistrements sauvegardés`,
        priority: 'low',
        metadata: {
          backup_id: backupId,
          filename,
          record_count: totalRecords,
          tables_count: tables.length
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        backupId,
        filename,
        totalRecords,
        tablesCount: tables.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Erreur sauvegarde automatique:', error);
    
    // Créer une notification d'erreur
    try {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      await supabaseClient
        .from('system_notifications')
        .insert({
          type: 'system_maintenance',
          title: 'Erreur de sauvegarde automatique',
          message: `La sauvegarde automatique a échoué: ${error.message}`,
          priority: 'high',
          metadata: { error: error.message }
        });
    } catch (notifError) {
      console.error('Erreur notification:', notifError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});