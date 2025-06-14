
import { supabase } from '../integrations/supabase/client';
import { Soin, Appareil, Zone } from '../types';

export const soinService = {
  async getAll(): Promise<Soin[]> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .select(`
          *,
          appareils:appareil_id(*),
          zones:zone_id(*)
        `)
        .eq('is_active', true)
        .order('nom');

      if (error) throw error;
      
      return data?.map(soin => ({
        id: soin.id,
        appareilId: soin.appareil_id,
        zoneId: soin.zone_id,
        nom: soin.nom,
        description: soin.description || '',
        duree: soin.duree,
        prix: soin.prix,
        contreIndications: soin.contre_indications || [],
        conseilsPostTraitement: soin.conseils_post_traitement || [],
        expectedConsumables: soin.expected_consumables || [],
        isActive: soin.is_active || true,
        createdAt: soin.created_at || '',
        appareil: soin.appareils ? {
          id: soin.appareils.id,
          nom: soin.appareils.nom,
          description: soin.appareils.description || '',
          icone: soin.appareils.icone || '',
          imageUrl: soin.appareils.image_url || '',
          isActive: soin.appareils.is_active || true,
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
    } catch (error) {
      console.error('Error fetching soins:', error);
      throw error;
    }
  },

  async getAllSoins(): Promise<Soin[]> {
    return this.getAll();
  },

  async getById(id: string): Promise<Soin | null> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .select(`
          *,
          appareils:appareil_id(*),
          zones:zone_id(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        appareilId: data.appareil_id,
        zoneId: data.zone_id,
        nom: data.nom,
        description: data.description || '',
        duree: data.duree,
        prix: data.prix,
        contreIndications: data.contre_indications || [],
        conseilsPostTraitement: data.conseils_post_traitement || [],
        expectedConsumables: data.expected_consumables || [],
        isActive: data.is_active || true,
        createdAt: data.created_at || '',
        appareil: data.appareils ? {
          id: data.appareils.id,
          nom: data.appareils.nom,
          description: data.appareils.description || '',
          icone: data.appareils.icone || '',
          imageUrl: data.appareils.image_url || '',
          isActive: data.appareils.is_active || true,
          ordre: data.appareils.ordre || 0,
          createdAt: data.appareils.created_at || ''
        } : undefined,
        zone: data.zones ? {
          id: data.zones.id,
          nom: data.zones.nom,
          description: data.zones.description || '',
          createdAt: data.zones.created_at || ''
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching soin by ID:', error);
      throw error;
    }
  },

  async getSoinById(id: string): Promise<Soin | null> {
    return this.getById(id);
  },

  async create(soinData: Omit<Soin, 'id'>): Promise<Soin> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .insert([{
          appareil_id: soinData.appareilId,
          zone_id: soinData.zoneId,
          nom: soinData.nom,
          description: soinData.description,
          duree: soinData.duree,
          prix: soinData.prix,
          contre_indications: soinData.contreIndications,
          conseils_post_traitement: soinData.conseilsPostTraitement,
          expected_consumables: soinData.expectedConsumables,
          is_active: soinData.isActive
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        appareilId: data.appareil_id,
        zoneId: data.zone_id,
        nom: data.nom,
        description: data.description || '',
        duree: data.duree,
        prix: data.prix,
        contreIndications: data.contre_indications || [],
        conseilsPostTraitement: data.conseils_post_traitement || [],
        expectedConsumables: data.expected_consumables || [],
        isActive: data.is_active || true,
        createdAt: data.created_at || ''
      };
    } catch (error) {
      console.error('Error creating soin:', error);
      throw error;
    }
  },

  async update(id: string, soinData: Omit<Soin, 'id'>): Promise<Soin> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .update({
          appareil_id: soinData.appareilId,
          zone_id: soinData.zoneId,
          nom: soinData.nom,
          description: soinData.description,
          duree: soinData.duree,
          prix: soinData.prix,
          contre_indications: soinData.contreIndications,
          conseils_post_traitement: soinData.conseilsPostTraitement,
          expected_consumables: soinData.expectedConsumables,
          is_active: soinData.isActive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        appareilId: data.appareil_id,
        zoneId: data.zone_id,
        nom: data.nom,
        description: data.description || '',
        duree: data.duree,
        prix: data.prix,
        contreIndications: data.contre_indications || [],
        conseilsPostTraitement: data.conseils_post_traitement || [],
        expectedConsumables: data.expected_consumables || [],
        isActive: data.is_active || true,
        createdAt: data.created_at || ''
      };
    } catch (error) {
      console.error('Error updating soin:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('soins')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting soin:', error);
      throw error;
    }
  },

  async getAppareils(): Promise<Appareil[]> {
    try {
      const { data, error } = await supabase
        .from('appareils')
        .select('*')
        .eq('is_active', true)
        .order('ordre');

      if (error) throw error;
      
      return data?.map(appareil => ({
        id: appareil.id,
        nom: appareil.nom,
        description: appareil.description || '',
        icone: appareil.icone || '',
        imageUrl: appareil.image_url || '',
        isActive: appareil.is_active || true,
        ordre: appareil.ordre || 0,
        createdAt: appareil.created_at || ''
      })) || [];
    } catch (error) {
      console.error('Error fetching appareils:', error);
      throw error;
    }
  },

  async getZones(): Promise<Zone[]> {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .order('nom');

      if (error) throw error;
      
      return data?.map(zone => ({
        id: zone.id,
        nom: zone.nom,
        description: zone.description || '',
        createdAt: zone.created_at || ''
      })) || [];
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    }
  }
};
