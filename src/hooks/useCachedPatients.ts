
import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';
import { Patient } from '../types';
import { useCache } from './useCache';
import { logger } from '../lib/logger';

export const useCachedPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const {
    loading,
    fetchWithCache,
    invalidateByPattern,
    clear: clearCache
  } = useCache<Patient[]>([], {
    ttl: 10 * 60 * 1000, // 10 minutes pour les patients
    persist: true,
    key: 'patients'
  });

  const fetchPatients = useCallback(async (forceRefresh = false) => {
    try {
      const data = await fetchWithCache(
        'patients_list',
        () => patientService.getAll(),
        forceRefresh
      );
      setPatients(data);
      setError(null);
    } catch (err) {
      logger.error('Error fetching patients', err);
      setError('Erreur lors du chargement des patients');
    }
  }, [fetchWithCache]);

  const createPatient = useCallback(async (patientData: Omit<Patient, 'id'>) => {
    try {
      const newPatient = await patientService.create(patientData);
      
      // Invalider le cache et recharger
      invalidateByPattern(/^patients_/);
      await fetchPatients(true);
      
      return newPatient;
    } catch (err) {
      logger.error('Error creating patient', err);
      throw err;
    }
  }, [invalidateByPattern, fetchPatients]);

  const updatePatient = useCallback(async (id: string, patientData: Omit<Patient, 'id'>) => {
    try {
      const updatedPatient = await patientService.update(id, patientData);
      
      // Invalider le cache et recharger
      invalidateByPattern(/^patients_/);
      await fetchPatients(true);
      
      return updatedPatient;
    } catch (err) {
      logger.error('Error updating patient', err);
      throw err;
    }
  }, [invalidateByPattern, fetchPatients]);

  const deletePatient = useCallback(async (id: string) => {
    try {
      await patientService.delete(id);
      
      // Invalider le cache et recharger
      invalidateByPattern(/^patients_/);
      await fetchPatients(true);
    } catch (err) {
      logger.error('Error deleting patient', err);
      throw err;
    }
  }, [invalidateByPattern, fetchPatients]);

  const searchPatients = useCallback(async (searchTerm: string) => {
    try {
      if (!searchTerm.trim()) {
        return patients;
      }
      
      // Pour la recherche, on utilise toujours des données fraîches
      const results = await patientService.search(searchTerm);
      return results;
    } catch (err) {
      logger.error('Error searching patients', err);
      setError('Erreur lors de la recherche');
      return [];
    }
  }, [patients]);

  const getPatientById = useCallback(async (id: string, useCache = true) => {
    try {
      if (useCache) {
        return await fetchWithCache(
          `patient_${id}`,
          () => patientService.getById(id)
        );
      } else {
        return await patientService.getById(id);
      }
    } catch (err) {
      logger.error('Error fetching patient', err);
      throw err;
    }
  }, [fetchWithCache]);

  // Précharger les données au montage
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    error,
    refetch: fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    getPatientById,
    clearCache
  };
};
