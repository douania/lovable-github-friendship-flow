
import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/appointmentService';
import { Appointment } from '../types';
import { useCache } from './useCache';

export const useCachedAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    loading,
    fetchWithCache,
    invalidateByPattern,
    clear: clearCache
  } = useCache<Appointment[]>([], {
    ttl: 5 * 60 * 1000, // 5 minutes pour les RDV (plus fréquents)
    persist: false, // Pas de persistance pour les RDV (données sensibles)
    key: 'appointments'
  });

  const fetchAppointments = useCallback(async (forceRefresh = false) => {
    console.log('Fetching appointments with cache...');
    try {
      const data = await fetchWithCache(
        'appointments_list',
        () => appointmentService.getAll(),
        forceRefresh
      );
      setAppointments(data);
      setError(null);
      console.log('Appointments loaded from cache:', data.length);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Erreur lors du chargement des rendez-vous');
    }
  }, [fetchWithCache]);

  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      console.log('Creating appointment and invalidating cache...');
      const newAppointment = await appointmentService.create(appointmentData);
      
      // Invalider tout le cache des RDV
      invalidateByPattern(/^appointments_/);
      await fetchAppointments(true);
      
      return newAppointment;
    } catch (err) {
      console.error('Error creating appointment:', err);
      throw err;
    }
  }, [invalidateByPattern, fetchAppointments]);

  const updateAppointment = useCallback(async (id: string, appointmentData: Omit<Appointment, 'id'>) => {
    try {
      console.log('Updating appointment and invalidating cache...');
      const updatedAppointment = await appointmentService.update(id, appointmentData);
      
      // Invalider tout le cache des RDV
      invalidateByPattern(/^appointments_/);
      await fetchAppointments(true);
      
      return updatedAppointment;
    } catch (err) {
      console.error('Error updating appointment:', err);
      throw err;
    }
  }, [invalidateByPattern, fetchAppointments]);

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      console.log('Deleting appointment and invalidating cache...');
      await appointmentService.delete(id);
      
      // Invalider tout le cache des RDV
      invalidateByPattern(/^appointments_/);
      await fetchAppointments(true);
    } catch (err) {
      console.error('Error deleting appointment:', err);
      throw err;
    }
  }, [invalidateByPattern, fetchAppointments]);

  const getAppointmentsByDate = useCallback(async (date: string, useCache = true) => {
    try {
      if (useCache) {
        return await fetchWithCache(
          `appointments_date_${date}`,
          () => appointmentService.getByDate(date)
        );
      } else {
        return await appointmentService.getByDate(date);
      }
    } catch (err) {
      console.error('Error fetching appointments by date:', err);
      throw err;
    }
  }, [fetchWithCache]);

  const getAppointmentsByPatient = useCallback(async (patientId: string, useCache = true) => {
    try {
      if (useCache) {
        return await fetchWithCache(
          `appointments_patient_${patientId}`,
          () => appointmentService.getByPatient(patientId)
        );
      } else {
        return await appointmentService.getByPatient(patientId);
      }
    } catch (err) {
      console.error('Error fetching appointments by patient:', err);
      throw err;
    }
  }, [fetchWithCache]);

  // Précharger les données au montage
  useEffect(() => {
    console.log('useCachedAppointments useEffect triggered');
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getAppointmentsByPatient,
    clearCache
  };
};
