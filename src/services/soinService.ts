import { supabase } from '../lib/supabase';
import { Soin, Zone, Appareil, Forfait } from '../types';

// Fonction pour convertir le type Soin vers les données de la DB
const mapSoinToDbSoin = (soin: Omit<Soin, 'id'>) => ({
  appareil_id: soin.appareilId,
  zone_id: soin.zoneId,
  nom: soin.nom,
  description: soin.description,
  duree: soin.duree,
  prix: soin.prix,
  contre_indications: soin.contreIndications,
  conseils_post_traitement: soin.conseilsPostTraitement,
  is_active: soin.isActive,
  expected_consumables: soin.expectedConsumables || [],
  created_at: soin.createdAt
});

// Fonction pour convertir les données de la DB vers le type Soin
const mapDbSoinToSoin = (dbSoin: any): Soin => ({
  id: dbSoin.id,
  appareilId: dbSoin.appareil_id,
  zoneId: dbSoin.zone_id,
  nom: dbSoin.nom,
  description: dbSoin.description,
  duree: dbSoin.duree,
  prix: dbSoin.prix,
  contreIndications: dbSoin.contre_indications || [],
  conseilsPostTraitement: dbSoin.conseils_post_traitement || [],
  isActive: dbSoin.is_active,
  expectedConsumables: dbSoin.expected_consumables || [],
  createdAt: dbSoin.created_at,
  // Relations
  appareil: dbSoin.appareils ? {
    id: dbSoin.appareils.id,
    nom: dbSoin.appareils.nom,
    description: dbSoin.appareils.description,
    icone: dbSoin.appareils.icone,
    imageUrl: dbSoin.appareils.image_url,
    isActive: dbSoin.appareils.is_active,
    ordre: dbSoin.appareils.ordre,
    createdAt: dbSoin.appareils.created_at
  } : undefined,
  zone: dbSoin.zones ? {
    id: dbSoin.zones.id,
    nom: dbSoin.zones.nom,
    description: dbSoin.zones.description,
    createdAt: dbSoin.zones.created_at
  } : undefined
});

// Fonction pour convertir les données de la DB vers le type Zone
const mapDbZoneToZone = (dbZone: any): Zone => ({
  id: dbZone.id,
  nom: dbZone.nom,
  description: dbZone.description,
  createdAt: dbZone.created_at
});

// Fonction pour convertir les données de la DB vers le type Forfait
const mapDbForfaitToForfait = (dbForfait: any): Forfait => ({
  id: dbForfait.id,
  soinId: dbForfait.soin_id,
  nbSeances: dbForfait.nb_seances,
  prixTotal: dbForfait.prix_total,
  prixUnitaire: dbForfait.prix_unitaire,
  remarque: dbForfait.remarque,
  isActive: dbForfait.is_active,
  createdAt: dbForfait.created_at
});

export const soinService = {
  // Récupérer les zones disponibles pour un appareil
  async getZonesByAppareil(appareilId: string): Promise<Zone[]> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .select(`
          zones (
            id,
            nom,
            description,
            created_at
          )
        `)
        .eq('appareil_id', appareilId)
        .eq('is_active', true);

      if (error) {
        console.error('Erreur lors de la récupération des zones:', error);
        throw error;
      }

      // Extraire les zones uniques
      const zones = data?.map(item => item.zones).filter(Boolean) || [];
      const uniqueZones = zones.filter((zone, index, self) => 
        index === self.findIndex(z => z.id === zone.id)
      );

      return uniqueZones.map(mapDbZoneToZone);
    } catch (error) {
      console.error('Erreur dans getZonesByAppareil:', error);
      throw error;
    }
  },

  // Récupérer un soin par appareil et zone
  async getByAppareilAndZone(appareilId: string, zoneId: string): Promise<Soin | null> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .select(`
          *,
          appareils (*),
          zones (*)
        `)
        .eq('appareil_id', appareilId)
        .eq('zone_id', zoneId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erreur lors de la récupération du soin:', error);
        throw error;
      }

      return data ? mapDbSoinToSoin(data) : null;
    } catch (error) {
      console.error('Erreur dans getByAppareilAndZone:', error);
      throw error;
    }
  },

  // Récupérer les forfaits d'un soin
  async getForfaitsBySoin(soinId: string): Promise<Forfait[]> {
    try {
      const { data, error } = await supabase
        .from('forfaits')
        .select('*')
        .eq('soin_id', soinId)
        .eq('is_active', true)
        .order('nb_seances', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des forfaits:', error);
        throw error;
      }

      return data?.map(mapDbForfaitToForfait) || [];
    } catch (error) {
      console.error('Erreur dans getForfaitsBySoin:', error);
      throw error;
    }
  },

  // Récupérer tous les soins actifs
  async getAllActive(): Promise<Soin[]> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .select(`
          *,
          appareils (*),
          zones (*)
        `)
        .eq('is_active', true)
        .order('nom', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des soins actifs:', error);
        throw error;
      }

      return data?.map(mapDbSoinToSoin) || [];
    } catch (error) {
      console.error('Erreur dans getAllActive soins:', error);
      throw error;
    }
  },

  // Récupérer un soin par ID avec ses relations
  async getById(id: string): Promise<Soin | null> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .select(`
          *,
          appareils (*),
          zones (*)
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

      return data ? mapDbSoinToSoin(data) : null;
    } catch (error) {
      console.error('Erreur dans getById soin:', error);
      throw error;
    }
  },

  // Créer un nouveau soin
  async create(soinData: Omit<Soin, 'id'>): Promise<Soin> {
    try {
      const dbSoin = mapSoinToDbSoin(soinData);
      
      const { data, error } = await supabase
        .from('soins')
        .insert([dbSoin])
        .select(`
          *,
          appareils (*),
          zones (*)
        `)
        .single();

      if (error) {
        console.error('Erreur lors de la création du soin:', error);
        throw error;
      }

      return mapDbSoinToSoin(data);
    } catch (error) {
      console.error('Erreur dans create soin:', error);
      throw error;
    }
  },

  // Mettre à jour un soin
  async update(id: string, soinData: Omit<Soin, 'id'>): Promise<Soin> {
    try {
      const dbSoin = mapSoinToDbSoin(soinData);
      
      const { data, error } = await supabase
        .from('soins')
        .update(dbSoin)
        .eq('id', id)
        .select(`
          *,
          appareils (*),
          zones (*)
        `)
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du soin:', error);
        throw error;
      }

      return mapDbSoinToSoin(data);
    } catch (error) {
      console.error('Erreur dans update soin:', error);
      throw error;
    }
  },

  // Supprimer un soin
  async delete(id: string): Promise<void> {
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
      console.error('Erreur dans delete soin:', error);
      throw error;
    }
  }
};