import { supabase } from '../integrations/supabase/client';
import { Forfait } from '../types';

// Fonction pour convertir les données de la DB vers le type Forfait
const mapDbForfaitToForfait = (dbForfait: any): Forfait => ({
  id: dbForfait.id,
  nom: dbForfait.nom,
  description: dbForfait.description || '',
  soinIds: dbForfait.soin_ids || [],
  prixTotal: dbForfait.prix_total,
  prixReduit: dbForfait.prix_reduit,
  nbSeances: dbForfait.nb_seances,
  validiteMois: dbForfait.validite_mois,
  isActive: dbForfait.is_active,
  ordre: dbForfait.ordre,
  createdAt: dbForfait.created_at || ''
});

// Fonction pour convertir le type Forfait vers les données de la DB
const mapForfaitToDbForfait = (forfait: Omit<Forfait, 'id'>) => ({
  nom: forfait.nom,
  description: forfait.description,
  soin_ids: forfait.soinIds,
  prix_total: forfait.prixTotal,
  prix_reduit: forfait.prixReduit,
  nb_seances: forfait.nbSeances,
  validite_mois: forfait.validiteMois,
  is_active: forfait.isActive,
  ordre: forfait.ordre,
  created_at: forfait.createdAt
});

export const forfaitService = {
  // Récupérer tous les forfaits
  async getAll(): Promise<Forfait[]> {
    try {
      const { data, error } = await supabase
        .from('forfaits')
        .select('*')
        .order('ordre', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des forfaits:', error);
        throw error;
      }

      return data?.map(mapDbForfaitToForfait) || [];
    } catch (error) {
      console.error('Erreur dans getAll forfaits:', error);
      throw error;
    }
  },

  // Récupérer les forfaits actifs
  async getActive(): Promise<Forfait[]> {
    try {
      const { data, error } = await supabase
        .from('forfaits')
        .select('*')
        .eq('is_active', true)
        .order('ordre', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des forfaits actifs:', error);
        throw error;
      }

      return data?.map(mapDbForfaitToForfait) || [];
    } catch (error) {
      console.error('Erreur dans getActive forfaits:', error);
      throw error;
    }
  },

  // Récupérer un forfait par ID avec ses soins
  async getById(id: string): Promise<Forfait | null> {
    try {
      const { data, error } = await supabase
        .from('forfaits')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erreur lors de la récupération du forfait:', error);
        throw error;
      }

      if (!data) return null;

      const forfait = mapDbForfaitToForfait(data);

      // Récupérer les soins associés
      if (forfait.soinIds.length > 0) {
        const { data: soinsData, error: soinsError } = await supabase
          .from('soins')
          .select(`
            *,
            appareils (*),
            zones (*)
          `)
          .in('id', forfait.soinIds);

        if (soinsError) {
          console.error('Erreur lors de la récupération des soins du forfait:', soinsError);
        } else {
          forfait.soins = soinsData?.map(soin => ({
            id: soin.id,
            appareilId: soin.appareil_id,
            zoneId: soin.zone_id,
            nom: soin.nom,
            description: soin.description || '',
            duree: soin.duree,
            prix: soin.prix,
            contreIndications: soin.contre_indications || [],
            conseilsPostTraitement: soin.conseils_post_traitement || [],
            isActive: soin.is_active || false,
            createdAt: soin.created_at || '',
            appareil: soin.appareils ? {
              id: soin.appareils.id,
              nom: soin.appareils.nom,
              description: soin.appareils.description || '',
              icone: soin.appareils.icone || '',
              imageUrl: soin.appareils.image_url || '',
              isActive: soin.appareils.is_active || false,
              ordre: soin.appareils.ordre || 0,
              createdAt: soin.appareils.created_at || ''
            } : undefined,
            zone: soin.zones ? {
              id: soin.zones.id,
              nom: soin.zones.nom,
              description: soin.zones.description || '',
              createdAt: soin.zones.created_at || ''
            } : undefined
          })) || [];
        }
      }

      return forfait;
    } catch (error) {
      console.error('Erreur dans getById forfait:', error);
      throw error;
    }
  },

  // Créer un nouveau forfait
  async create(forfaitData: Omit<Forfait, 'id'>): Promise<Forfait> {
    try {
      const dbForfait = mapForfaitToDbForfait(forfaitData);
      
      const { data, error } = await supabase
        .from('forfaits')
        .insert([{
          ...dbForfait,
          last_modified_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du forfait:', error);
        throw error;
      }

      return mapDbForfaitToForfait(data);
    } catch (error) {
      console.error('Erreur dans create forfait:', error);
      throw error;
    }
  },

  // Mettre à jour un forfait
  async update(id: string, forfaitData: Omit<Forfait, 'id'>): Promise<Forfait> {
    try {
      const dbForfait = mapForfaitToDbForfait(forfaitData);
      
      const { data, error } = await supabase
        .from('forfaits')
        .update({
          ...dbForfait,
          last_modified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du forfait:', error);
        throw error;
      }

      return mapDbForfaitToForfait(data);
    } catch (error) {
      console.error('Erreur dans update forfait:', error);
      throw error;
    }
  },

  // Supprimer un forfait (avec protection FK RESTRICT si utilisé par des patients)
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('forfaits')
        .delete()
        .eq('id', id);

      if (error) {
        // Détecter si c'est une erreur de FK RESTRICT (forfait utilisé)
        if (error.code === '23503') { // FK violation
          const businessError = new Error('FORFAIT_IN_USE');
          (businessError as any).meta = { forfaitId: id };
          throw businessError;
        }
        console.error('Erreur lors de la suppression du forfait:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans delete forfait:', error);
      throw error;
    }
  },

  // Récupérer les forfaits qui contiennent un soin spécifique
  async getBySoinId(soinId: string): Promise<Forfait[]> {
    try {
      const { data, error } = await supabase
        .from('forfaits')
        .select('*')
        .contains('soin_ids', [soinId])
        .eq('is_active', true)
        .order('ordre', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des forfaits par soin:', error);
        throw error;
      }

      return data?.map(mapDbForfaitToForfait) || [];
    } catch (error) {
      console.error('Erreur dans getBySoinId forfaits:', error);
      throw error;
    }
  },

  // Calculer le prix total des soins d'un forfait
  async calculateTotalPrice(soinIds: string[]): Promise<number> {
    try {
      if (soinIds.length === 0) return 0;

      const { data, error } = await supabase
        .from('soins')
        .select('prix')
        .in('id', soinIds);

      if (error) {
        console.error('Erreur lors du calcul du prix total:', error);
        throw error;
      }

      return data?.reduce((total, soin) => total + soin.prix, 0) || 0;
    } catch (error) {
      console.error('Erreur dans calculateTotalPrice:', error);
      throw error;
    }
  },

  // Calculer le prix total des soins d'un forfait
  async calculateForfaitValue(forfaitId: string): Promise<number> {
    try {
      const { data: forfait, error } = await supabase
        .from('forfaits')
        .select('soin_ids')
        .eq('id', forfaitId)
        .single();

      if (error) throw error;

      if (!forfait?.soin_ids?.length) return 0;

      const { data: soins, error: soinsError } = await supabase
        .from('soins')
        .select('prix')
        .in('id', forfait.soin_ids);

      if (soinsError) throw soinsError;

      return soins?.reduce((total: number, soin: any) => total + soin.prix, 0) || 0;
    } catch (error) {
      console.error('Error calculating forfait value:', error);
      throw error;
    }
  }
};
