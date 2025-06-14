
import { supabase } from '../lib/supabase';
import { Soin, Forfait, Zone } from '../types';

export const soinService = {
  // Zone methods
  async getZonesByAppareil(appareilId: string): Promise<Zone[]> {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('appareil_id', appareilId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    }
  },

  async getByAppareilAndZone(appareilId: string, zoneId: string): Promise<Soin | null> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .select('*')
        .eq('appareil_id', appareilId)
        .eq('zone_id', zoneId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching soin by appareil and zone:', error);
      throw error;
    }
  },

  // Soin CRUD methods
  async getAllSoins(): Promise<Soin[]> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .select('*')
        .order('nom');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching soins:', error);
      throw error;
    }
  },

  async createSoin(soinData: Omit<Soin, 'id'>): Promise<Soin> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .insert([soinData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating soin:', error);
      throw error;
    }
  },

  async updateSoin(id: string, soinData: Omit<Soin, 'id'>): Promise<Soin> {
    try {
      const { data, error } = await supabase
        .from('soins')
        .update(soinData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating soin:', error);
      throw error;
    }
  },

  async deleteSoin(id: string): Promise<void> {
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

  // Forfait CRUD methods
  async getAllForfaits(): Promise<Forfait[]> {
    try {
      const { data, error } = await supabase
        .from('forfaits')
        .select(`
          *,
          soins:soinIds (*)
        `)
        .order('nom');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching forfaits:', error);
      throw error;
    }
  },

  async createForfait(forfaitData: Omit<Forfait, 'id' | 'created_at'>): Promise<Forfait> {
    try {
      const { data, error } = await supabase
        .from('forfaits')
        .insert([{
          ...forfaitData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating forfait:', error);
      throw error;
    }
  },

  async updateForfait(id: string, forfaitData: Omit<Forfait, 'id' | 'created_at'>): Promise<Forfait> {
    try {
      const { data, error } = await supabase
        .from('forfaits')
        .update(forfaitData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating forfait:', error);
      throw error;
    }
  },

  async deleteForfait(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('forfaits')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting forfait:', error);
      throw error;
    }
  },

  // Additional utility methods
  async getGroupedSoins(): Promise<{ [key: string]: Soin[] }> {
    try {
      const soins = await this.getAllSoins();
      const grouped = soins.reduce((acc: { [key: string]: Soin[] }, soin) => {
        const key = soin.appareilId || 'autres';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(soin);
        return acc;
      }, {});

      return grouped;
    } catch (error) {
      console.error('Error grouping soins:', error);
      throw error;
    }
  }
};
