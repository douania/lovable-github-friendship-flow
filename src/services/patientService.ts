
import { supabase } from '../lib/supabase';
import { Patient } from '../types';

export const patientService = {
  async getAll(): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(patient => ({
        id: patient.id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.date_of_birth,
        skinType: patient.skin_type,
        medicalHistory: patient.medical_history,
        contraindications: patient.contraindications,
        createdAt: patient.created_at,
        lastVisit: patient.last_visit
      })) || [];
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  async getAllPatients(): Promise<Patient[]> {
    return this.getAll();
  },

  async getById(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.date_of_birth,
        skinType: data.skin_type,
        medicalHistory: data.medical_history,
        contraindications: data.contraindications,
        createdAt: data.created_at,
        lastVisit: data.last_visit
      };
    } catch (error) {
      console.error('Error fetching patient by ID:', error);
      throw error;
    }
  },

  async getPatientById(id: string): Promise<Patient | null> {
    return this.getById(id);
  },

  async create(patientData: Omit<Patient, 'id'>): Promise<Patient> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([{
          first_name: patientData.firstName,
          last_name: patientData.lastName,
          email: patientData.email,
          phone: patientData.phone,
          date_of_birth: patientData.dateOfBirth,
          skin_type: patientData.skinType,
          medical_history: patientData.medicalHistory,
          contraindications: patientData.contraindications,
          last_visit: patientData.lastVisit || null
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.date_of_birth,
        skinType: data.skin_type,
        medicalHistory: data.medical_history,
        contraindications: data.contraindications,
        createdAt: data.created_at,
        lastVisit: data.last_visit
      };
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  async update(id: string, patientData: Omit<Patient, 'id'>): Promise<Patient> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update({
          first_name: patientData.firstName,
          last_name: patientData.lastName,
          email: patientData.email,
          phone: patientData.phone,
          date_of_birth: patientData.dateOfBirth,
          skin_type: patientData.skinType,
          medical_history: patientData.medicalHistory,
          contraindications: patientData.contraindications,
          last_visit: patientData.lastVisit || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.date_of_birth,
        skinType: data.skin_type,
        medicalHistory: data.medical_history,
        contraindications: data.contraindications,
        createdAt: data.created_at,
        lastVisit: data.last_visit
      };
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  },

  async search(searchTerm: string): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(patient => ({
        id: patient.id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.date_of_birth,
        skinType: patient.skin_type,
        medicalHistory: patient.medical_history,
        contraindications: patient.contraindications,
        createdAt: patient.created_at,
        lastVisit: patient.last_visit
      })) || [];
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }
};
