import { supabase } from '../lib/supabase';

export interface PatientPhoto {
  id: string;
  patient_id: string;
  consultation_id: string | null;
  photo_type: 'before' | 'after' | 'progress';
  storage_path: string;
  photo_date: string;
  treatment_area: string | null;
  notes: string | null;
  is_visible_to_client: boolean | null;
  created_at: string | null;
}

export const photoService = {
  async getPatientPhotos(patientId: string): Promise<PatientPhoto[]> {
    const { data, error } = await supabase
      .from('patient_photos')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_visible_to_client', true)
      .order('photo_date', { ascending: false });

    if (error) throw error;
    return (data || []) as PatientPhoto[];
  },

  async getPhotoUrl(storagePath: string): Promise<string> {
    const { data } = supabase.storage
      .from('patient-photos')
      .getPublicUrl(storagePath);

    return data.publicUrl;
  },

  async uploadPhoto(
    patientId: string,
    file: File,
    photoType: 'before' | 'after' | 'progress',
    treatmentArea?: string,
    consultationId?: string
  ): Promise<PatientPhoto> {
    // Upload file to storage
    const fileName = `${patientId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('patient-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create database record
    const { data, error } = await supabase
      .from('patient_photos')
      .insert({
        patient_id: patientId,
        consultation_id: consultationId,
        photo_type: photoType,
        storage_path: fileName,
        treatment_area: treatmentArea,
      })
      .select()
      .single();

    if (error) throw error;
    return data as PatientPhoto;
  },

  async deletePhoto(photoId: string): Promise<void> {
    // Get photo to retrieve storage path
    const { data: photo, error: fetchError } = await supabase
      .from('patient_photos')
      .select('storage_path')
      .eq('id', photoId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('patient-photos')
      .remove([photo.storage_path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('patient_photos')
      .delete()
      .eq('id', photoId);

    if (dbError) throw dbError;
  },

  async updatePhotoVisibility(photoId: string, isVisible: boolean): Promise<void> {
    const { error } = await supabase
      .from('patient_photos')
      .update({ is_visible_to_client: isVisible })
      .eq('id', photoId);

    if (error) throw error;
  },
};
