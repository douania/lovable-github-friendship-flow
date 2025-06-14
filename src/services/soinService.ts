
import { supabase } from '../lib/supabase';
import { Soin, Forfait, Appareil, Zone } from '../types';

// Fonction pour convertir les données de la DB vers le type Soin
const mapDbSoinToSoin = (dbSoin: any, appareil?: Appareil, zone?: Zone): Soin => ({
  id: dbSoin.id,
  nom: dbSoin.nom,
  description: dbSoin.description || '',
  appareilId: dbSoin.appareil_id,
  zoneId: dbSoin.zone_id,
  duree: dbSoin.duree,
  prix: dbSoin.prix,
  contreIndications: dbSoin.contre_indications || [],
  conseilsPostTraitement: dbSoin.conseils_post_traitement || [],
  expectedConsumables: dbSoin.expected_consumables || [],
  isActive: dbSoin.is_active,
  createdAt: dbSoin.created_at,
  appareil: appareil,
  zone: zone
});

// Fonction pour convertir le type Soin vers les données de la DB
const mapSoinToDbSoin = (soin: Omit<Soin, 'id'>) => ({
  nom: soin.nom,
  description: soin.description,
  appareil_id: soin.appareilId,
  zone_id: soin.zoneId,
  duree: soin.duree,
  prix: soin.prix,
  contre_indications: soin.contreIndications,
  conseils_post_traitement: soin.conseilsPostTraitement,
  expected_consumables: soin.expectedConsumables,
  is_active: soin.isActive
});

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
  createdAt: dbForfait.created_at
});

// Fonction pour convertir le type Forfait vers les données de la DB
const mapForfaitToDbForfait = (forfait: Omit<Forfait, 'id' | 'createdAt'>) => ({
  nom: forfait.nom,
  description: forfait.description,
  soin_ids: forfait.soinIds,
  prix_total: forfait.prixTotal,
  prix_reduit: forfait.prixReduit,
  nb_seances: forfait.nbSeances,
  validite_mois: forfait.validiteMois,
  is_active: forfait.isActive,
  ordre: forfait.ordre
});

export const soinService = {
  // Récupérer tous les soins avec leurs appareils et zones
  async getAllSoins(): Promise<Soin[]> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .select(`
          *,
          appareils(*),
          zones(*)
        `)
        .eq('is_active', true)
        .order('nom', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des soins:', error);
        throw error;
      }

      return data?.map(soin => mapDbSoinToSoin(soin, soin.appareils, soin.zones)) || [];
    } catch (error) {
      console.error('Erreur dans getAllSoins:', error);
      throw error;
    }
  },

  // Alias pour getAllSoins (pour compatibilité)
  async getAllActive(): Promise<Soin[]> {
    return this.getAllSoins();
  },

  // Récupérer un soin par ID
  async getSoinById(id: string): Promise<Soin | null> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .select(`
          *,
          appareils(*),
          zones(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erreur lors de la récupération du soin:', error);
        throw error;
      }

      return data ? mapDbSoinToSoin(data, data.appareils, data.zones) : null;
    } catch (error) {
      console.error('Erreur dans getSoinById:', error);
      throw error;
    }
  },

  // Créer un nouveau soin
  async createSoin(soinData: Omit<Soin, 'id'>): Promise<Soin> {
    try {
      const dbSoin = mapSoinToDbSoin(soinData);
      
      const { data, error } = await supabase
        .from('soins')
        .insert([dbSoin])
        .select(`
          *,
          appareils(*),
          zones(*)
        `)
        .single();

      if (error) {
        console.error('Erreur lors de la création du soin:', error);
        throw error;
      }

      return mapDbSoinToSoin(data, data.appareils, data.zones);
    } catch (error) {
      console.error('Erreur dans createSoin:', error);
      throw error;
    }
  },

  // Alias pour createSoin (pour compatibilité)
  async create(soinData: Omit<Soin, 'id'>): Promise<Soin> {
    return this.createSoin(soinData);
  },

  // Mettre à jour un soin
  async updateSoin(id: string, soinData: Omit<Soin, 'id'>): Promise<Soin> {
    try {
      const dbSoin = mapSoinToDbSoin(soinData);
      
      const { data, error } = await supabase
        .from('soins')
        .update(dbSoin)
        .eq('id', id)
        .select(`
          *,
          appareils(*),
          zones(*)
        `)
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du soin:', error);
        throw error;
      }

      return mapDbSoinToSoin(data, data.appareils, data.zones);
    } catch (error) {
      console.error('Erreur dans updateSoin:', error);
      throw error;
    }
  },

  // Alias pour updateSoin (pour compatibilité)
  async update(id: string, soinData: Omit<Soin, 'id'>): Promise<Soin> {
    return this.updateSoin(id, soinData);
  },

  // Supprimer un soin
  async deleteSoin(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('soins')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du soin:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans deleteSoin:', error);
      throw error;
    }
  },

  // Récupérer tous les forfaits
  async getAllForfaits(): Promise<Forfait[]> {
    try {
      const { data, error } = await supabase
        .from('forfaits')
        .select('*')
        .eq('is_active', true)
        .order('ordre', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des forfaits:', error);
        throw error;
      }

      return data?.map(mapDbForfaitToForfait) || [];
    } catch (error) {
      console.error('Erreur dans getAllForfaits:', error);
      throw error;
    }
  },

  // Créer un nouveau forfait
  async createForfait(forfaitData: Omit<Forfait, 'id' | 'createdAt'>): Promise<Forfait> {
    try {
      const dbForfait = mapForfaitToDbForfait(forfaitData);
      
      const { data, error } = await supabase
        .from('forfaits')
        .insert([dbForfait])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du forfait:', error);
        throw error;
      }

      return mapDbForfaitToForfait(data);
    } catch (error) {
      console.error('Erreur dans createForfait:', error);
      throw error;
    }
  },

  // Mettre à jour un forfait
  async updateForfait(id: string, forfaitData: Omit<Forfait, 'id' | 'createdAt'>): Promise<Forfait> {
    try {
      const dbForfait = mapForfaitToDbForfait(forfaitData);
      
      const { data, error } = await supabase
        .from('forfaits')
        .update(dbForfait)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du forfait:', error);
        throw error;
      }

      return mapDbForfaitToForfait(data);
    } catch (error) {
      console.error('Erreur dans updateForfait:', error);
      throw error;
    }
  },

  // Supprimer un forfait
  async deleteForfait(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('forfaits')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du forfait:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans deleteForfait:', error);
      throw error;
    }
  }
};
