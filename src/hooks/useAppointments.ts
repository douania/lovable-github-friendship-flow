
import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/appointmentService';
import { Appointment } from '../types';
import { logger } from '../lib/logger';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  logger.debug('useAppointments hook initialized');

  const fetchAppointments = useCallback(async () => {
    try {
      logger.debug('Fetching appointments...');
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAll();
      logger.debug('Appointments fetched', data.length);
      setAppointments(data);
    } catch (err) {
      logger.error('Error fetching appointments', err);
      setError('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      logger.debug('Creating appointment');
      const newAppointment = await appointmentService.create(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err) {
      logger.error('Error creating appointment', err);
      throw err;
    }
  }, []);

  const updateAppointment = useCallback(async (id: string, appointmentData: Omit<Appointment, 'id'>) => {
    try {
      logger.debug('Updating appointment', id);
      const updatedAppointment = await appointmentService.update(id, appointmentData);
      setAppointments(prev => 
        prev.map(app => app.id === id ? updatedAppointment : app)
      );
      return updatedAppointment;
    } catch (err) {
      logger.error('Error updating appointment', err);
      throw err;
    }
  }, []);

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      logger.debug('Deleting appointment', id);
      await appointmentService.delete(id);
      setAppointments(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      logger.error('Error deleting appointment', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    logger.debug('useAppointments useEffect triggered');
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
  };
};
