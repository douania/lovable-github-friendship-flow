
import { supabase } from '../integrations/supabase/client';
import { Consultation } from '../types/consultation';

export const consultationService = {
  async getAllConsultations(): Promise<Consultation[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('consultation_date', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des consultations:', error);
      throw error;
    }

    return data?.map(consultation => ({
      id: consultation.id,
      patientId: consultation.patient_id,
      appointmentId: consultation.appointment_id || undefined,
      soinId: consultation.soin_id || '',
      practitionerId: consultation.practitioner_id || '',
      consultationDate: consultation.consultation_date,
      notesPreTreatment: consultation.notes_pre_treatment || '',
      notesPostTreatment: consultation.notes_post_treatment || '',
      photosBefore: consultation.photos_before || [],
      photosAfter: consultation.photos_after || [],
      sideEffects: consultation.side_effects || '',
      nextAppointmentRecommended: consultation.next_appointment_recommended || undefined,
      consentSigned: consultation.consent_signed || false,
      satisfactionRating: consultation.satisfaction_rating || undefined,
      createdAt: consultation.created_at || '',
      updatedAt: consultation.updated_at || ''
    })) || [];
  },

  async getConsultationsByPatient(patientId: string): Promise<Consultation[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('patient_id', patientId)
      .order('consultation_date', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des consultations du patient:', error);
      throw error;
    }

    return data?.map(consultation => ({
      id: consultation.id,
      patientId: consultation.patient_id,
      appointmentId: consultation.appointment_id || undefined,
      soinId: consultation.soin_id || '',
      practitionerId: consultation.practitioner_id || '',
      consultationDate: consultation.consultation_date,
      notesPreTreatment: consultation.notes_pre_treatment || '',
      notesPostTreatment: consultation.notes_post_treatment || '',
      photosBefore: consultation.photos_before || [],
      photosAfter: consultation.photos_after || [],
      sideEffects: consultation.side_effects || '',
      nextAppointmentRecommended: consultation.next_appointment_recommended || undefined,
      consentSigned: consultation.consent_signed || false,
      satisfactionRating: consultation.satisfaction_rating || undefined,
      createdAt: consultation.created_at || '',
      updatedAt: consultation.updated_at || ''
    })) || [];
  },

  async createConsultation(consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Consultation | null> {
    const { data, error } = await supabase
      .from('consultations')
      .insert({
        patient_id: consultationData.patientId,
        appointment_id: consultationData.appointmentId || null,
        soin_id: consultationData.soinId,
        practitioner_id: consultationData.practitionerId,
        consultation_date: consultationData.consultationDate,
        notes_pre_treatment: consultationData.notesPreTreatment,
        notes_post_treatment: consultationData.notesPostTreatment,
        photos_before: consultationData.photosBefore,
        photos_after: consultationData.photosAfter,
        side_effects: consultationData.sideEffects,
        next_appointment_recommended: consultationData.nextAppointmentRecommended || null,
        consent_signed: consultationData.consentSigned,
        satisfaction_rating: consultationData.satisfactionRating || null
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la consultation:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      patientId: data.patient_id,
      appointmentId: data.appointment_id || undefined,
      soinId: data.soin_id || '',
      practitionerId: data.practitioner_id || '',
      consultationDate: data.consultation_date,
      notesPreTreatment: data.notes_pre_treatment || '',
      notesPostTreatment: data.notes_post_treatment || '',
      photosBefore: data.photos_before || [],
      photosAfter: data.photos_after || [],
      sideEffects: data.side_effects || '',
      nextAppointmentRecommended: data.next_appointment_recommended || undefined,
      consentSigned: data.consent_signed || false,
      satisfactionRating: data.satisfaction_rating || undefined,
      createdAt: data.created_at || '',
      updatedAt: data.updated_at || ''
    };
  },

  async updateConsultation(id: string, consultationData: Partial<Consultation>): Promise<Consultation | null> {
    const updateData: any = {};
    
    if (consultationData.patientId) updateData.patient_id = consultationData.patientId;
    if (consultationData.appointmentId !== undefined) updateData.appointment_id = consultationData.appointmentId || null;
    if (consultationData.soinId) updateData.soin_id = consultationData.soinId;
    if (consultationData.practitionerId) updateData.practitioner_id = consultationData.practitionerId;
    if (consultationData.consultationDate) updateData.consultation_date = consultationData.consultationDate;
    if (consultationData.notesPreTreatment !== undefined) updateData.notes_pre_treatment = consultationData.notesPreTreatment;
    if (consultationData.notesPostTreatment !== undefined) updateData.notes_post_treatment = consultationData.notesPostTreatment;
    if (consultationData.photosBefore) updateData.photos_before = consultationData.photosBefore;
    if (consultationData.photosAfter) updateData.photos_after = consultationData.photosAfter;
    if (consultationData.sideEffects !== undefined) updateData.side_effects = consultationData.sideEffects;
    if (consultationData.nextAppointmentRecommended !== undefined) updateData.next_appointment_recommended = consultationData.nextAppointmentRecommended || null;
    if (consultationData.consentSigned !== undefined) updateData.consent_signed = consultationData.consentSigned;
    if (consultationData.satisfactionRating !== undefined) updateData.satisfaction_rating = consultationData.satisfactionRating || null;

    const { data, error } = await supabase
      .from('consultations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la consultation:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      patientId: data.patient_id,
      appointmentId: data.appointment_id || undefined,
      soinId: data.soin_id || '',
      practitionerId: data.practitioner_id || '',
      consultationDate: data.consultation_date,
      notesPreTreatment: data.notes_pre_treatment || '',
      notesPostTreatment: data.notes_post_treatment || '',
      photosBefore: data.photos_before || [],
      photosAfter: data.photos_after || [],
      sideEffects: data.side_effects || '',
      nextAppointmentRecommended: data.next_appointment_recommended || undefined,
      consentSigned: data.consent_signed || false,
      satisfactionRating: data.satisfaction_rating || undefined,
      createdAt: data.created_at || '',
      updatedAt: data.updated_at || ''
    };
  }
};
