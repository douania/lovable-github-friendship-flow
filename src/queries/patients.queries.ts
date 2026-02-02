/**
 * SOURCE OF TRUTH — Patients data access
 * 
 * Toute récupération ou mutation des patients DOIT passer par ce fichier.
 * Interdiction d'accès direct à patientService depuis les composants.
 * 
 * Hooks disponibles:
 * - usePatientsQuery(params?) — lecture
 * - useCreatePatientMutation() — création
 * - useUpdatePatientMutation() — modification  
 * - useDeletePatientMutation() — suppression
 * 
 * @see Phase 2B migration TanStack Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../services/patientService';
import { Patient } from '../types';

// Types pour extensibilité future (Ajustement CTO #1)
export interface PatientsQueryParams {
  searchTerm?: string;
  skinType?: string;
  // Extensible pour filtres futurs
}

// Query key factory
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (params?: PatientsQueryParams) => [...patientKeys.lists(), params] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

// Hook principal avec signature extensible
export const usePatientsQuery = (params?: PatientsQueryParams) => {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => patientService.getAll(),
  });
};

// Mutations avec invalidation dans onSuccess
export const useCreatePatientMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Patient, 'id'>) => patientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
    },
  });
};

export const useUpdatePatientMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Patient, 'id'> }) => 
      patientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
    },
  });
};

export const useDeletePatientMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => patientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
    },
  });
};
