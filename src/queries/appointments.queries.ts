/**
 * SOURCE OF TRUTH — Appointments data access
 * 
 * Toute récupération ou mutation des rendez-vous DOIT passer par ce fichier.
 * Interdiction d'accès direct à appointmentService depuis les composants.
 * 
 * Hooks disponibles:
 * - useAppointmentsQuery(params?) — lecture
 * - useCreateAppointmentMutation() — création
 * - useUpdateAppointmentMutation() — modification
 * - useDeleteAppointmentMutation() — suppression
 * 
 * @see Phase 2B migration TanStack Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointmentService';
import { Appointment } from '../types';
import { logger } from '../lib/logger';

// Types pour extensibilité future (Ajustement CTO #1)
export interface AppointmentsQueryParams {
  date?: string;
  patientId?: string;
  status?: Appointment['status'];
  // Extensible pour filtres futurs
}

// Query key factory
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (params?: AppointmentsQueryParams) => [...appointmentKeys.lists(), params] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  byDate: (date: string) => [...appointmentKeys.all, 'date', date] as const,
  byPatient: (patientId: string) => [...appointmentKeys.all, 'patient', patientId] as const,
};

// Hook principal avec signature extensible
export const useAppointmentsQuery = (params?: AppointmentsQueryParams) => {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => appointmentService.getAll(),
  });
};

// Hook pour récupérer les RDV d'un patient spécifique (Phase 3B - Pilier 1)
// Correction CTO: clé de cache robuste pour éviter collisions avec ''
export const usePatientAppointmentsQuery = (patientId: string | undefined) => {
  return useQuery({
    queryKey: patientId 
      ? appointmentKeys.byPatient(patientId) 
      : ['appointments', 'byPatient', 'none'] as const,
    queryFn: () => appointmentService.getByPatient(patientId!),
    enabled: !!patientId, // Ne s'exécute que si patientId est défini
  });
};

// Mutations avec invalidation dans onSuccess
export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Appointment, 'id'>) => appointmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
    onError: (error, variables) => {
      logger.error('Erreur création rendez-vous', { error, payload: variables });
    },
  });
};

export const useUpdateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Appointment, 'id'> }) => 
      appointmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
    onError: (error, variables) => {
      logger.error('Erreur modification rendez-vous', { error, payload: variables });
    },
  });
};

export const useDeleteAppointmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => appointmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
    onError: (error, variables) => {
      logger.error('Erreur suppression rendez-vous', { error, appointmentId: variables });
    },
  });
};
