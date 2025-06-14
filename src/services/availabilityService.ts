
import { supabase } from '../integrations/supabase/client';

export interface AvailabilitySlot {
  id: string;
  practitionerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isAvailable: boolean;
}

export const availabilityService = {
  // Obtenir les créneaux disponibles pour un praticien à une date donnée
  async getAvailableTimeSlots(practitionerId: string, date: string): Promise<string[]> {
    try {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      
      // Récupérer les créneaux configurés pour ce jour
      const { data: slots, error: slotsError } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('practitioner_id', practitionerId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (slotsError) {
        console.error('Erreur lors de la récupération des créneaux:', slotsError);
        return [];
      }

      if (!slots || slots.length === 0) {
        return [];
      }

      // Récupérer les rendez-vous existants pour cette date
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('time')
        .eq('date', date);

      if (appointmentsError) {
        console.error('Erreur lors de la récupération des rendez-vous:', appointmentsError);
      }

      const bookedTimes = appointments?.map(apt => apt.time) || [];

      // Générer les créneaux disponibles
      const availableSlots: string[] = [];
      
      for (const slot of slots) {
        const startTime = new Date(`2000-01-01T${slot.start_time}`);
        const endTime = new Date(`2000-01-01T${slot.end_time}`);
        const duration = slot.duration_minutes;

        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
          const timeString = currentTime.toTimeString().slice(0, 5); // HH:MM format
          
          if (!bookedTimes.includes(timeString)) {
            availableSlots.push(timeString);
          }
          
          currentTime.setMinutes(currentTime.getMinutes() + duration);
        }
      }

      return availableSlots.sort();
    } catch (error) {
      console.error('Erreur dans getAvailableTimeSlots:', error);
      return [];
    }
  },

  // Créer un créneau de disponibilité
  async createAvailabilitySlot(slot: Omit<AvailabilitySlot, 'id'>): Promise<AvailabilitySlot | null> {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .insert([{
          practitioner_id: slot.practitionerId,
          day_of_week: slot.dayOfWeek,
          start_time: slot.startTime,
          end_time: slot.endTime,
          duration_minutes: slot.durationMinutes,
          is_available: slot.isAvailable
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du créneau:', error);
        return null;
      }

      return {
        id: data.id,
        practitionerId: data.practitioner_id,
        dayOfWeek: data.day_of_week,
        startTime: data.start_time,
        endTime: data.end_time,
        durationMinutes: data.duration_minutes,
        isAvailable: data.is_available ?? true // Gérer le cas où is_available est null
      };
    } catch (error) {
      console.error('Erreur dans createAvailabilitySlot:', error);
      return null;
    }
  },

  // Obtenir tous les créneaux d'un praticien
  async getPractitionerAvailability(practitionerId: string): Promise<AvailabilitySlot[]> {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('practitioner_id', practitionerId)
        .order('day_of_week')
        .order('start_time');

      if (error) {
        console.error('Erreur lors de la récupération des disponibilités:', error);
        return [];
      }

      return data?.map(slot => ({
        id: slot.id,
        practitionerId: slot.practitioner_id,
        dayOfWeek: slot.day_of_week,
        startTime: slot.start_time,
        endTime: slot.end_time,
        durationMinutes: slot.duration_minutes,
        isAvailable: slot.is_available ?? true // Gérer le cas où is_available est null
      })) || [];
    } catch (error) {
      console.error('Erreur dans getPractitionerAvailability:', error);
      return [];
    }
  }
};
