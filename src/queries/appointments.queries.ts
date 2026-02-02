import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointmentService';
import { Appointment } from '../types';

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

// Mutations avec invalidation dans onSuccess
export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Appointment, 'id'>) => appointmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
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
  });
};

export const useDeleteAppointmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => appointmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};
