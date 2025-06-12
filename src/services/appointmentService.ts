import { supabase } from '../lib/supabase';
import { Appointment } from '../types';

// Fonction pour convertir les données de la DB vers le type Appointment
const mapDbAppointmentToAppointment = (dbAppointment: any): Appointment => ({
  id: dbAppointment.id,
  patientId: dbAppointment.patient_id,
  treatmentId: dbAppointment.treatment_id,
  date: dbAppointment.date,
  time: dbAppointment.time,
  status: dbAppointment.status,
  notes: dbAppointment.notes || '',
  consumedProducts: dbAppointment.consumed_products || [],
  createdAt: dbAppointment.created_at
});

// Fonction pour convertir le type Appointment vers les données de la DB
const mapAppointmentToDbAppointment = (appointment: Omit<Appointment, 'id'>) => ({
  patient_id: appointment.patientId,
  treatment_id: appointment.treatmentId,
  date: appointment.date,
  time: appointment.time,
  status: appointment.status,
  notes: appointment.notes || '',
  consumed_products: appointment.consumedProducts || [],
  created_at: appointment.createdAt
});

export const appointmentService = {
  // Récupérer tous les rendez-vous
  async getAll(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        throw error;
      }

      return data?.map(mapDbAppointmentToAppointment) || [];
    } catch (error) {
      console.error('Erreur dans getAll appointments:', error);
      throw error;
    }
  },

  // Récupérer les rendez-vous par date
  async getByDate(date: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', date)
        .order('time', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des rendez-vous par date:', error);
        throw error;
      }

      return data?.map(mapDbAppointmentToAppointment) || [];
    } catch (error) {
      console.error('Erreur dans getByDate appointments:', error);
      throw error;
    }
  },

  // Récupérer les rendez-vous d'un patient
  async getByPatient(patientId: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false })
        .order('time', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des rendez-vous du patient:', error);
        throw error;
      }

      return data?.map(mapDbAppointmentToAppointment) || [];
    } catch (error) {
      console.error('Erreur dans getByPatient appointments:', error);
      throw error;
    }
  },

  // Récupérer un rendez-vous par ID
  async getById(id: string): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erreur lors de la récupération du rendez-vous:', error);
        throw error;
      }

      return data ? mapDbAppointmentToAppointment(data) : null;
    } catch (error) {
      console.error('Erreur dans getById appointment:', error);
      throw error;
    }
  },

  // Créer un nouveau rendez-vous
  async create(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    try {
      const dbAppointment = mapAppointmentToDbAppointment(appointmentData);
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([dbAppointment])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du rendez-vous:', error);
        throw error;
      }

      return mapDbAppointmentToAppointment(data);
    } catch (error) {
      console.error('Erreur dans create appointment:', error);
      throw error;
    }
  },

  // Mettre à jour un rendez-vous
  async update(id: string, appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    try {
      const dbAppointment = mapAppointmentToDbAppointment(appointmentData);
      
      const { data, error } = await supabase
        .from('appointments')
        .update(dbAppointment)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du rendez-vous:', error);
        throw error;
      }

      return mapDbAppointmentToAppointment(data);
    } catch (error) {
      console.error('Erreur dans update appointment:', error);
      throw error;
    }
  },

  // Mettre à jour le statut d'un rendez-vous
  async updateStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        throw error;
      }

      return mapDbAppointmentToAppointment(data);
    } catch (error) {
      console.error('Erreur dans updateStatus appointment:', error);
      throw error;
    }
  },

  // Supprimer un rendez-vous
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du rendez-vous:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans delete appointment:', error);
      throw error;
    }
  }
};