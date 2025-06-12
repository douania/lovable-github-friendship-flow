import { supabase } from '../lib/supabase';
import { Patient } from '../types';

// Fonction pour convertir les données de la DB vers le type Patient
const mapDbPatientToPatient = (dbPatient: any): Patient => ({
  id: dbPatient.id,
  firstName: dbPatient.first_name,
  lastName: dbPatient.last_name,
  email: dbPatient.email,
  phone: dbPatient.phone,
  dateOfBirth: dbPatient.date_of_birth,
  skinType: dbPatient.skin_type,
  medicalHistory: dbPatient.medical_history,
  contraindications: dbPatient.contraindications || [],
  createdAt: dbPatient.created_at,
  lastVisit: dbPatient.last_visit
});

// Fonction pour convertir le type Patient vers les données de la DB
const mapPatientToDbPatient = (patient: Omit<Patient, 'id'>) => ({
  first_name: patient.firstName,
  last_name: patient.lastName,
  email: patient.email,
  phone: patient.phone,
  date_of_birth: patient.dateOfBirth,
  skin_type: patient.skinType,
  medical_history: patient.medicalHistory,
  contraindications: patient.contraindications,
  created_at: patient.createdAt,
  last_visit: patient.lastVisit || null
});

export const patientService = {
  // Récupérer tous les patients
  async getAll(): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des patients:', error);
        throw error;
      }

      return data?.map(mapDbPatientToPatient) || [];
    } catch (error) {
      console.error('Erreur dans getAll patients:', error);
      throw error;
    }
  },

  // Récupérer un patient par ID
  async getById(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Patient non trouvé
        }
        console.error('Erreur lors de la récupération du patient:', error);
        throw error;
      }

      return data ? mapDbPatientToPatient(data) : null;
    } catch (error) {
      console.error('Erreur dans getById patient:', error);
      throw error;
    }
  },

  // Créer un nouveau patient
  async create(patientData: Omit<Patient, 'id'>): Promise<Patient> {
    try {
      const dbPatient = mapPatientToDbPatient(patientData);
      
      const { data, error } = await supabase
        .from('patients')
        .insert([dbPatient])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du patient:', error);
        throw error;
      }

      return mapDbPatientToPatient(data);
    } catch (error) {
      console.error('Erreur dans create patient:', error);
      throw error;
    }
  },

  // Mettre à jour un patient
  async update(id: string, patientData: Omit<Patient, 'id'>): Promise<Patient> {
    try {
      const dbPatient = mapPatientToDbPatient(patientData);
      
      const { data, error } = await supabase
        .from('patients')
        .update(dbPatient)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du patient:', error);
        throw error;
      }

      return mapDbPatientToPatient(data);
    } catch (error) {
      console.error('Erreur dans update patient:', error);
      throw error;
    }
  },

  // Supprimer un patient
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du patient:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans delete patient:', error);
      throw error;
    }
  },

  // Rechercher des patients
  async search(searchTerm: string): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la recherche de patients:', error);
        throw error;
      }

      return data?.map(mapDbPatientToPatient) || [];
    } catch (error) {
      console.error('Erreur dans search patients:', error);
      throw error;
    }
  }
};