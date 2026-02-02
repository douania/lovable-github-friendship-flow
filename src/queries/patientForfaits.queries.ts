/**
 * Phase 3D - TanStack Query hooks for patient forfaits
 * 
 * Hooks disponibles:
 * - usePatientForfaitsQuery(patientId) — tous les forfaits d'un patient
 * - useActivePatientForfaitsQuery(patientId) — forfaits actifs uniquement
 * - useSellForfaitMutation() — vendre un forfait
 * - useDecrementSessionMutation() — utiliser une séance
 * - useCancelPatientForfaitMutation() — annuler un forfait
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientForfaitService, SellForfaitInput } from '../services/patientForfaitService';
import { logger } from '../lib/logger';

// Query key factory
export const patientForfaitKeys = {
  all: ['patientForfaits'] as const,
  lists: () => [...patientForfaitKeys.all, 'list'] as const,
  byPatient: (patientId: string) => [...patientForfaitKeys.all, 'patient', patientId] as const,
  activeByPatient: (patientId: string) => [...patientForfaitKeys.all, 'patient', patientId, 'active'] as const,
  detail: (id: string) => [...patientForfaitKeys.all, 'detail', id] as const,
};

/**
 * Hook pour récupérer tous les forfaits d'un patient
 */
export const usePatientForfaitsQuery = (patientId: string | undefined) => {
  return useQuery({
    queryKey: patientId 
      ? patientForfaitKeys.byPatient(patientId) 
      : ['patientForfaits', 'byPatient', 'none'] as const,
    queryFn: () => patientForfaitService.getByPatientId(patientId!),
    enabled: !!patientId,
  });
};

/**
 * Hook pour récupérer uniquement les forfaits actifs d'un patient
 * Utilisé dans le modal de completion pour choisir le forfait à décrémenter
 */
export const useActivePatientForfaitsQuery = (patientId: string | undefined) => {
  return useQuery({
    queryKey: patientId 
      ? patientForfaitKeys.activeByPatient(patientId) 
      : ['patientForfaits', 'activeByPatient', 'none'] as const,
    queryFn: () => patientForfaitService.getActiveByPatientId(patientId!),
    enabled: !!patientId,
  });
};

/**
 * Hook pour récupérer un forfait patient par son ID
 */
export const usePatientForfaitQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: id 
      ? patientForfaitKeys.detail(id) 
      : ['patientForfaits', 'detail', 'none'] as const,
    queryFn: () => patientForfaitService.getById(id!),
    enabled: !!id,
  });
};

/**
 * Mutation pour vendre un forfait à un patient
 */
export const useSellForfaitMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: SellForfaitInput) => patientForfaitService.sellForfait(input),
    onSuccess: (data) => {
      // Invalider les listes de forfaits du patient
      queryClient.invalidateQueries({ 
        queryKey: patientForfaitKeys.byPatient(data.patientId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: patientForfaitKeys.activeByPatient(data.patientId) 
      });
    },
    onError: (error, variables) => {
      logger.error('Erreur lors de la vente du forfait', { error, input: variables });
    },
  });
};

/**
 * Mutation pour décrémenter une séance d'un forfait
 */
export const useDecrementSessionMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (patientForfaitId: string) => 
      patientForfaitService.decrementSession(patientForfaitId),
    onSuccess: (data) => {
      // Invalider les listes du patient
      queryClient.invalidateQueries({ 
        queryKey: patientForfaitKeys.byPatient(data.patientId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: patientForfaitKeys.activeByPatient(data.patientId) 
      });
      // Invalider le détail
      queryClient.invalidateQueries({ 
        queryKey: patientForfaitKeys.detail(data.id) 
      });
    },
    onError: (error, patientForfaitId) => {
      logger.error('Erreur lors de la décrémentation', { error, patientForfaitId });
    },
  });
};

/**
 * Mutation pour annuler un forfait patient
 */
export const useCancelPatientForfaitMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      patientForfaitService.cancel(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: patientForfaitKeys.byPatient(data.patientId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: patientForfaitKeys.activeByPatient(data.patientId) 
      });
    },
    onError: (error, variables) => {
      logger.error('Erreur lors de l\'annulation du forfait', { error, id: variables.id });
    },
  });
};
