import { supabase } from '../integrations/supabase/client';
import { Appareil } from '../types';

// Fonction pour convertir les données de la DB vers le type Appareil
const mapDbAppareilToAppareil = (dbAppareil: any): Appareil => ({
  id: dbAppareil.id,
  nom: dbAppareil.nom,
  description: dbAppareil.description,
  icone: dbAppareil.icone,
  imageUrl: dbAppareil.image_url,
  isActive: dbAppareil.is_active,
  ordre: dbAppareil.ordre,
  createdAt: dbAppareil.created_at
});

export const appareilService = {
  // Récupérer tous les appareils actifs
  async getActive(): Promise<Appareil[]> {
    try {
      const { data, error } = await supabase
        .from('appareils')
        .select('*')
        .eq('is_active', true)
        .order('ordre', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des appareils:', error);
        throw error;
      }

      return data?.map(mapDbAppareilToAppareil) || [];
    } catch (error) {
      console.error('Erreur dans getActive appareils:', error);
      throw error;
    }
  },

  // Récupérer un appareil par ID
  async getById(id: string): Promise<Appareil | null> {
    try {
      const { data, error } = await supabase
        .from('appareils')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erreur lors de la récupération de l\'appareil:', error);
        throw error;
      }

      return data ? mapDbAppareilToAppareil(data) : null;
    } catch (error) {
      console.error('Erreur dans getById appareil:', error);
      throw error;
    }
  }
};
