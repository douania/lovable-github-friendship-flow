
import { supabase } from '../lib/supabase';
import { AvailabilitySlot } from '../types/consultation';

// Fonction pour convertir les données de la DB vers le type AvailabilitySlot
const mapDbSlotToSlot = (dbSlot: any): AvailabilitySlot => ({
  id: dbSlot.id,
  practitionerId: dbSlot.practitioner_id,
  dayOfWeek: dbSlot.day_of_week,
  startTime: dbSlot.start_time,
  endTime: dbSlot.end_time,
  durationMinutes: dbSlot.duration_minutes,
  isAvailable: dbSlot.is_available,
  createdAt: dbSlot.created_at
});

export const availabilityService = {
  // Récupérer les créneaux d'un praticien
  async getAvailabilitySlots(practitionerId: string): Promise<AvailabilitySlot[]> {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('practitioner_id', practitionerId)
        .order('day_of_week')
        .order('start_time');

      if (error) {
        console.error('Erreur lors de la récupération des créneaux:', error);
        throw error;
      }

      return data?.map(mapDbSlotToSlot) || [];
    } catch (error) {
      console.error('Erreur dans getAvailabilitySlots:', error);
      throw error;
    }
  },

  // Créer un nouveau créneau
  async createSlot(slotData: Omit<AvailabilitySlot, 'id' | 'createdAt'>): Promise<AvailabilitySlot> {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .insert([{
          practitioner_id: slotData.practitionerId,
          day_of_week: slotData.dayOfWeek,
          start_time: slotData.startTime,
          end_time: slotData.endTime,
          duration_minutes: slotData.durationMinutes,
          is_available: slotData.isAvailable
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du créneau:', error);
        throw error;
      }

      return mapDbSlotToSlot(data);
    } catch (error) {
      console.error('Erreur dans createSlot:', error);
      throw error;
    }
  },

  // Générer les créneaux disponibles pour une date donnée
  async getAvailableTimeSlots(practitionerId: string, date: string): Promise<string[]> {
    try {
      const dayOfWeek = new Date(date).getDay();
      
      const { data: slots, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('practitioner_id', practitionerId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (error) {
        console.error('Erreur lors de la récupération des créneaux disponibles:', error);
        throw error;
      }

      // Générer tous les créneaux possibles
      const availableSlots: string[] = [];
      
      for (const slot of slots || []) {
        const startTime = new Date(`2000-01-01T${slot.start_time}`);
        const endTime = new Date(`2000-01-01T${slot.end_time}`);
        
        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
          const timeString = currentTime.toTimeString().substring(0, 5);
          availableSlots.push(timeString);
          currentTime.setMinutes(currentTime.getMinutes() + slot.duration_minutes);
        }
      }

      // Vérifier les rendez-vous existants pour cette date
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('time')
        .eq('date', date);

      if (appointmentsError) {
        console.error('Erreur lors de la vérification des rendez-vous:', appointmentsError);
        return availableSlots;
      }

      // Filtrer les créneaux déjà pris
      const bookedTimes = appointments?.map(apt => apt.time) || [];
      return availableSlots.filter(time => !bookedTimes.includes(time));
      
    } catch (error) {
      console.error('Erreur dans getAvailableTimeSlots:', error);
      throw error;
    }
  }
};
