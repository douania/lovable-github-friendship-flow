
import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/appointmentService';
import { Appointment } from '../types';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('useAppointments hook initialized');

  const fetchAppointments = useCallback(async () => {
    try {
      console.log('Fetching appointments...');
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAll();
      console.log('Appointments fetched:', data.length);
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      console.log('Creating appointment:', appointmentData);
      const newAppointment = await appointmentService.create(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err) {
      console.error('Error creating appointment:', err);
      throw err;
    }
  }, []);

  const updateAppointment = useCallback(async (id: string, appointmentData: Omit<Appointment, 'id'>) => {
    try {
      console.log('Updating appointment:', id, appointmentData);
      const updatedAppointment = await appointmentService.update(id, appointmentData);
      setAppointments(prev => 
        prev.map(app => app.id === id ? updatedAppointment : app)
      );
      return updatedAppointment;
    } catch (err) {
      console.error('Error updating appointment:', err);
      throw err;
    }
  }, []);

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      console.log('Deleting appointment:', id);
      await appointmentService.delete(id);
      setAppointments(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      console.error('Error deleting appointment:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    console.log('useAppointments useEffect triggered');
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
