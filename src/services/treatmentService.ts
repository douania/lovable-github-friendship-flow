import { supabase } from '../lib/supabase';
import { Treatment } from '../types';

// Fonction pour convertir les données de la DB vers le type Treatment
const mapDbTreatmentToTreatment = (dbTreatment: any): Treatment => ({
  id: dbTreatment.id,
  name: dbTreatment.name,
  description: dbTreatment.description,
  price: dbTreatment.price,
  duration: dbTreatment.duration,
  category: dbTreatment.category,
  contraindications: dbTreatment.contraindications || [],
  aftercare: dbTreatment.aftercare || [],
  isActive: dbTreatment.is_active
});

// Fonction pour convertir le type Treatment vers les données de la DB
const mapTreatmentToDbTreatment = (treatment: Omit<Treatment, 'id'>) => ({
  name: treatment.name,
  description: treatment.description,
  price: treatment.price,
  duration: treatment.duration,
  category: treatment.category,
  contraindications: treatment.contraindications,
  aftercare: treatment.aftercare,
  is_active: treatment.isActive
});

export const treatmentService = {
  // Récupérer tous les traitements
  async getAll(): Promise<Treatment[]> {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des traitements:', error);
        throw error;
      }

      return data?.map(mapDbTreatmentToTreatment) || [];
    } catch (error) {
      console.error('Erreur dans getAll treatments:', error);
      throw error;
    }
  },

  // Récupérer les traitements actifs
  async getActive(): Promise<Treatment[]> {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des traitements actifs:', error);
        throw error;
      }

      return data?.map(mapDbTreatmentToTreatment) || [];
    } catch (error) {
      console.error('Erreur dans getActive treatments:', error);
      throw error;
    }
  },

  // Récupérer un traitement par ID
  async getById(id: string): Promise<Treatment | null> {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erreur lors de la récupération du traitement:', error);
        throw error;
      }

      return data ? mapDbTreatmentToTreatment(data) : null;
    } catch (error) {
      console.error('Erreur dans getById treatment:', error);
      throw error;
    }
  },

  // Créer un nouveau traitement
  async create(treatmentData: Omit<Treatment, 'id'>): Promise<Treatment> {
    try {
      const dbTreatment = mapTreatmentToDbTreatment(treatmentData);
      
      const { data, error } = await supabase
        .from('treatments')
        .insert([dbTreatment])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du traitement:', error);
        throw error;
      }

      return mapDbTreatmentToTreatment(data);
    } catch (error) {
      console.error('Erreur dans create treatment:', error);
      throw error;
    }
  },

  // Mettre à jour un traitement
  async update(id: string, treatmentData: Omit<Treatment, 'id'>): Promise<Treatment> {
    try {
      const dbTreatment = mapTreatmentToDbTreatment(treatmentData);
      
      const { data, error } = await supabase
        .from('treatments')
        .update(dbTreatment)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du traitement:', error);
        throw error;
      }

      return mapDbTreatmentToTreatment(data);
    } catch (error) {
      console.error('Erreur dans update treatment:', error);
      throw error;
    }
  },

  // Supprimer un traitement
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('treatments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du traitement:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans delete treatment:', error);
      throw error;
    }
  },

  // Rechercher des traitements
  async search(searchTerm: string): Promise<Treatment[]> {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la recherche de traitements:', error);
        throw error;
      }

      return data?.map(mapDbTreatmentToTreatment) || [];
    } catch (error) {
      console.error('Erreur dans search treatments:', error);
      throw error;
    }
  }
};