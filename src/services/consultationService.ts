
import { supabase } from '../lib/supabase';
import { Consultation } from '../types/consultation';

// Fonction pour convertir les données de la DB vers le type Consultation
const mapDbConsultationToConsultation = (dbConsultation: any): Consultation => ({
  id: dbConsultation.id,
  patientId: dbConsultation.patient_id,
  appointmentId: dbConsultation.appointment_id,
  soinId: dbConsultation.soin_id,
  practitionerId: dbConsultation.practitioner_id,
  consultationDate: dbConsultation.consultation_date,
  notesPreTreatment: dbConsultation.notes_pre_treatment || '',
  notesPostTreatment: dbConsultation.notes_post_treatment || '',
  photosBefore: dbConsultation.photos_before || [],
  photosAfter: dbConsultation.photos_after || [],
  sideEffects: dbConsultation.side_effects || '',
  nextAppointmentRecommended: dbConsultation.next_appointment_recommended,
  consentSigned: dbConsultation.consent_signed || false,
  satisfactionRating: dbConsultation.satisfaction_rating,
  createdAt: dbConsultation.created_at,
  updatedAt: dbConsultation.updated_at
});

// Fonction pour convertir le type Consultation vers les données de la DB
const mapConsultationToDbConsultation = (consultation: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => ({
  patient_id: consultation.patientId,
  appointment_id: consultation.appointmentId,
  soin_id: consultation.soinId,
  practitioner_id: consultation.practitionerId,
  consultation_date: consultation.consultationDate,
  notes_pre_treatment: consultation.notesPreTreatment,
  notes_post_treatment: consultation.notesPostTreatment,
  photos_before: consultation.photosBefore,
  photos_after: consultation.photosAfter,
  side_effects: consultation.sideEffects,
  next_appointment_recommended: consultation.nextAppointmentRecommended,
  consent_signed: consultation.consentSigned,
  satisfaction_rating: consultation.satisfactionRating
});

export const consultationService = {
  // Récupérer toutes les consultations
  async getAllConsultations(): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('consultation_date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des consultations:', error);
        throw error;
      }

      return data?.map(mapDbConsultationToConsultation) || [];
    } catch (error) {
      console.error('Erreur dans getAllConsultations:', error);
      throw error;
    }
  },

  // Récupérer les consultations d'un patient
  async getConsultationsByPatient(patientId: string): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .order('consultation_date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des consultations du patient:', error);
        throw error;
      }

      return data?.map(mapDbConsultationToConsultation) || [];
    } catch (error) {
      console.error('Erreur dans getConsultationsByPatient:', error);
      throw error;
    }
  },

  // Créer une nouvelle consultation
  async createConsultation(consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Consultation> {
    try {
      const dbConsultation = mapConsultationToDbConsultation(consultationData);
      
      const { data, error } = await supabase
        .from('consultations')
        .insert([dbConsultation])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la consultation:', error);
        throw error;
      }

      return mapDbConsultationToConsultation(data);
    } catch (error) {
      console.error('Erreur dans createConsultation:', error);
      throw error;
    }
  },

  // Mettre à jour une consultation
  async updateConsultation(id: string, consultationData: Partial<Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Consultation> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .update(consultationData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de la consultation:', error);
        throw error;
      }

      return mapDbConsultationToConsultation(data);
    } catch (error) {
      console.error('Erreur dans updateConsultation:', error);
      throw error;
    }
  },

  // Supprimer une consultation
  async deleteConsultation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de la consultation:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans deleteConsultation:', error);
      throw error;
    }
  }
};
