
import { useState, useEffect } from 'react';
import { patientService } from '../services/patientService';
import { Patient } from '../types';
import { logger } from '../lib/logger';

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
      logger.error('Error fetching patients', err);
      setError('Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (patientData: Omit<Patient, 'id'>) => {
    try {
      const newPatient = await patientService.create(patientData);
      setPatients(prev => [newPatient, ...prev]);
      return newPatient;
    } catch (err) {
      logger.error('Error creating patient', err);
      throw err;
    }
  };

  const updatePatient = async (id: string, patientData: Omit<Patient, 'id'>) => {
    try {
      const updatedPatient = await patientService.update(id, patientData);
      setPatients(prev => 
        prev.map(patient => patient.id === id ? updatedPatient : patient)
      );
      return updatedPatient;
    } catch (err) {
      logger.error('Error updating patient', err);
      throw err;
    }
  };

  const deletePatient = async (id: string) => {
    try {
      await patientService.delete(id);
      setPatients(prev => prev.filter(patient => patient.id !== id));
    } catch (err) {
      logger.error('Error deleting patient', err);
      throw err;
    }
  };

  const searchPatients = async (searchTerm: string) => {
    try {
      setError(null);
      const results = await patientService.search(searchTerm);
      return results;
    } catch (err) {
      logger.error('Error searching patients', err);
      setError('Erreur lors de la recherche');
      return [];
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    refetch: fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients
  };
};
