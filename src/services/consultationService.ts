
import { supabase } from '../lib/supabase';
import { Consultation } from '../types/consultation';

// Fonction de conversion des données de la base vers le type Consultation
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

export const consultationService = {
  // Créer une nouvelle consultation
  async create(consultation: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Consultation | null> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .insert([{
          patient_id: consultation.patientId,
          appointment_id: consultation.appointmentId || null,
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
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la consultation:', error);
        return null;
      }

      return mapDbConsultationToConsultation(data);
    } catch (error) {
      console.error('Erreur dans consultationService.create:', error);
      return null;
    }
  },

  // Obtenir toutes les consultations
  async getAll(): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('consultation_date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des consultations:', error);
        return [];
      }

      return data?.map(mapDbConsultationToConsultation) || [];
    } catch (error) {
      console.error('Erreur dans consultationService.getAll:', error);
      return [];
    }
  },

  // Obtenir une consultation par ID
  async getById(id: string): Promise<Consultation | null> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la consultation:', error);
        return null;
      }

      return mapDbConsultationToConsultation(data);
    } catch (error) {
      console.error('Erreur dans consultationService.getById:', error);
      return null;
    }
  },

  // Obtenir les consultations d'un patient
  async getByPatientId(patientId: string): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .order('consultation_date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des consultations du patient:', error);
        return [];
      }

      return data?.map(mapDbConsultationToConsultation) || [];
    } catch (error) {
      console.error('Erreur dans consultationService.getByPatientId:', error);
      return [];
    }
  },

  // Mettre à jour une consultation
  async update(id: string, updates: Partial<Consultation>): Promise<Consultation | null> {
    try {
      const updateData: any = {};
      
      if (updates.notesPreTreatment !== undefined) updateData.notes_pre_treatment = updates.notesPreTreatment;
      if (updates.notesPostTreatment !== undefined) updateData.notes_post_treatment = updates.notesPostTreatment;
      if (updates.photosBefore !== undefined) updateData.photos_before = updates.photosBefore;
      if (updates.photosAfter !== undefined) updateData.photos_after = updates.photosAfter;
      if (updates.sideEffects !== undefined) updateData.side_effects = updates.sideEffects;
      if (updates.nextAppointmentRecommended !== undefined) updateData.next_appointment_recommended = updates.nextAppointmentRecommended;
      if (updates.consentSigned !== undefined) updateData.consent_signed = updates.consentSigned;
      if (updates.satisfactionRating !== undefined) updateData.satisfaction_rating = updates.satisfactionRating;

      const { data, error } = await supabase
        .from('consultations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de la consultation:', error);
        return null;
      }

      return mapDbConsultationToConsultation(data);
    } catch (error) {
      console.error('Erreur dans consultationService.update:', error);
      return null;
    }
  },

  // Supprimer une consultation
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de la consultation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur dans consultationService.delete:', error);
      return false;
    }
  }
};
