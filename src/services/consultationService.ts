
import { supabase } from '../integrations/supabase/client';
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
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des consultations:', error);
      throw error;
    }

    return data?.map(mapDbConsultationToConsultation) || [];
  },

  // Récupérer les consultations d'un patient
  async getConsultationsByPatient(patientId: string): Promise<Consultation[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des consultations du patient:', error);
      throw error;
    }

    return data?.map(mapDbConsultationToConsultation) || [];
  },

  // Créer une nouvelle consultation
  async createConsultation(consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Consultation> {
    const dbConsultation = mapConsultationToDbConsultation(consultationData);
    
    const { data, error } = await supabase
      .from('consultations')
      .insert(dbConsultation)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la consultation:', error);
      throw error;
    }

    return mapDbConsultationToConsultation(data);
  },

  // Mettre à jour une consultation
  async updateConsultation(id: string, consultationData: Partial<Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Consultation> {
    const dbConsultation: any = {};
    
    if (consultationData.patientId !== undefined) dbConsultation.patient_id = consultationData.patientId;
    if (consultationData.appointmentId !== undefined) dbConsultation.appointment_id = consultationData.appointmentId;
    if (consultationData.soinId !== undefined) dbConsultation.soin_id = consultationData.soinId;
    if (consultationData.practitionerId !== undefined) dbConsultation.practitioner_id = consultationData.practitionerId;
    if (consultationData.consultationDate !== undefined) dbConsultation.consultation_date = consultationData.consultationDate;
    if (consultationData.notesPreTreatment !== undefined) dbConsultation.notes_pre_treatment = consultationData.notesPreTreatment;
    if (consultationData.notesPostTreatment !== undefined) dbConsultation.notes_post_treatment = consultationData.notesPostTreatment;
    if (consultationData.photosBefore !== undefined) dbConsultation.photos_before = consultationData.photosBefore;
    if (consultationData.photosAfter !== undefined) dbConsultation.photos_after = consultationData.photosAfter;
    if (consultationData.sideEffects !== undefined) dbConsultation.side_effects = consultationData.sideEffects;
    if (consultationData.nextAppointmentRecommended !== undefined) dbConsultation.next_appointment_recommended = consultationData.nextAppointmentRecommended;
    if (consultationData.consentSigned !== undefined) dbConsultation.consent_signed = consultationData.consentSigned;
    if (consultationData.satisfactionRating !== undefined) dbConsultation.satisfaction_rating = consultationData.satisfactionRating;
    
    const { data, error } = await supabase
      .from('consultations')
      .update(dbConsultation)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la consultation:', error);
      throw error;
    }

    return mapDbConsultationToConsultation(data);
  }
};
