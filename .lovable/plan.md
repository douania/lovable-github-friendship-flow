

# PHASE 2B — Cohérence Data & Fluidité (TanStack Query)
## Plan d'exécution avec ajustements CTO intégrés

---

## Ajustements obligatoires intégrés

| # | Ajustement CTO | Implémentation |
|---|----------------|----------------|
| 1 | Query keys extensibles | `usePatientsQuery(params?: PatientsQueryParams)` |
| 2 | getErrorMessage() obligatoire | `<ErrorBanner description={getErrorMessage(queryError)} />` |
| 3 | DevTools DEV uniquement | `{import.meta.env.DEV && <ReactQueryDevtools />}` |

---

## Fichiers modifiés (scope strict)

| # | Action | Fichier |
|---|--------|---------|
| 1 | MODIFIER | `package.json` |
| 2 | CRÉER | `src/lib/queryClient.ts` |
| 3 | MODIFIER | `src/main.tsx` |
| 4 | CRÉER | `src/queries/patients.queries.ts` |
| 5 | CRÉER | `src/queries/appointments.queries.ts` |
| 6 | MODIFIER | `src/components/modules/Patients.tsx` |
| 7 | MODIFIER | `src/components/modules/Appointments.tsx` |

**Total: 3 créés + 4 modifiés = 7 fichiers**

---

## Etape 1 : Dépendances

### package.json

```text
dependencies:
+ "@tanstack/react-query": "^5.60.0"

devDependencies:
+ "@tanstack/react-query-devtools": "^5.60.0"
```

---

## Etape 2 : QueryClient global

### Fichier: src/lib/queryClient.ts (CRÉER)

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 60 secondes
      gcTime: 5 * 60 * 1000,       // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

---

## Etape 3 : Provider dans main.tsx

### Fichier: src/main.tsx (MODIFIER)

```text
AVANT:
├── import React, ReactDOM, App, AuthProvider
├── console.log (à remplacer par logger.debug)
└── <React.StrictMode><AuthProvider><App /></AuthProvider></React.StrictMode>

APRÈS:
├── + import { QueryClientProvider } from '@tanstack/react-query'
├── + import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
├── + import { queryClient } from './lib/queryClient'
├── + import { logger } from './lib/logger'
├── console.log → logger.debug
└── <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </React.StrictMode>
```

**Ajustement CTO #3 appliqué:** DevTools uniquement en DEV

---

## Etape 4 : Hooks Query pour Patients

### Fichier: src/queries/patients.queries.ts (CRÉER)

```typescript
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
```

**Ajustement CTO #1 appliqué:** Signature `usePatientsQuery(params?)` extensible

---

## Etape 5 : Hooks Query pour Appointments

### Fichier: src/queries/appointments.queries.ts (CRÉER)

```typescript
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
```

---

## Etape 6 : Migration Patients.tsx

### Fichier: src/components/modules/Patients.tsx (MODIFIER)

```text
SUPPRIMER:
├── const [patients, setPatients] = useState<Patient[]>([])
├── const [loading, setLoading] = useState(true)
├── const [error, setError] = useState<string | null>(null)
├── loadPatients() function
├── useEffect pour charger les patients
├── setPatients() dans handleSavePatient
└── setPatients() dans handleDeletePatient

AJOUTER:
├── import { usePatientsQuery, useCreatePatientMutation, 
│            useUpdatePatientMutation, useDeletePatientMutation } 
│            from '../../queries/patients.queries'
├── import { getErrorMessage } from '../../lib/errorMessage'
│
├── const { 
│     data: patients = [], 
│     isLoading: loading, 
│     isError, 
│     error: queryError 
│   } = usePatientsQuery()
│
├── const createMutation = useCreatePatientMutation()
├── const updateMutation = useUpdatePatientMutation()
└── const deleteMutation = useDeletePatientMutation()

MODIFIER handleSavePatient:
  AVANT: 
    await patientService.create() + setPatients()
    await patientService.update() + setPatients()
  APRÈS: 
    await createMutation.mutateAsync(patientData)
    await updateMutation.mutateAsync({ id: editingPatient.id, data: patientData })

MODIFIER handleDeletePatient:
  AVANT: await patientService.delete() + setPatients()
  APRÈS: await deleteMutation.mutateAsync(patientId)

MODIFIER ErrorBanner (Ajustement CTO #2):
  AVANT: <ErrorBanner description={error} onDismiss={() => setError(null)} />
  APRÈS: {isError && (
           <ErrorBanner 
             description={getErrorMessage(queryError)} 
             onDismiss={() => {/* optionnel: état local dismissedError */}} 
           />
         )}
```

**Ajustement CTO #2 appliqué:** `getErrorMessage(queryError)` obligatoire

---

## Etape 7 : Migration Appointments.tsx

### Fichier: src/components/modules/Appointments.tsx (MODIFIER)

```text
SUPPRIMER:
├── import { useAppointments } from '../../hooks/useAppointments'
├── const { appointments, loading, error, refetch, 
│           updateAppointment, createAppointment } = useAppointments()
└── refetch() call dans handleSaveAppointment

AJOUTER:
├── import { useAppointmentsQuery, useCreateAppointmentMutation,
│            useUpdateAppointmentMutation } 
│            from '../../queries/appointments.queries'
├── import { getErrorMessage } from '../../lib/errorMessage'
│
├── const { 
│     data: appointments = [], 
│     isLoading: loading, 
│     isError, 
│     error: queryError 
│   } = useAppointmentsQuery()
│
├── const createMutation = useCreateAppointmentMutation()
└── const updateMutation = useUpdateAppointmentMutation()

MODIFIER handleSaveAppointment:
  AVANT: 
    await updateAppointment() / await createAppointment()
    refetch()
  APRÈS: 
    await updateMutation.mutateAsync({ id, data })
    await createMutation.mutateAsync(data)
    // Pas de refetch, invalidation automatique

MODIFIER updateAppointmentStatus:
  AVANT: await updateAppointment()
  APRÈS: await updateMutation.mutateAsync({ id, data })

MODIFIER ErrorBanner (Ajustement CTO #2):
  AVANT: 
    {error && error !== dismissedError && (
      <ErrorBanner description={error} onDismiss={...} />
    )}
  APRÈS: 
    {isError && getErrorMessage(queryError) !== dismissedError && (
      <ErrorBanner 
        description={getErrorMessage(queryError)} 
        onDismiss={() => setDismissedError(getErrorMessage(queryError))} 
      />
    )}
```

---

## Architecture finale

```text
┌─────────────────────────────────────────────────────────────────┐
│                         main.tsx                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              QueryClientProvider                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │                  AuthProvider                       │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │                    App                        │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  {DEV && <ReactQueryDevtools />}                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Data Flow:
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   Component    │────▶│  TanStack      │────▶│   Service      │
│  (Patients)    │     │  Query Hook    │     │ (patientService)│
└────────────────┘     └────────────────┘     └────────────────┘
        │                      │                      │
        │                      ▼                      │
        │              ┌────────────────┐             │
        │              │  QueryClient   │             │
        │              │  (cache 60s)   │             │
        │              └────────────────┘             │
        │                      │                      │
        └──────────────────────┴──────────────────────┘
                               │
                               ▼
                      ┌────────────────┐
                      │   Supabase     │
                      └────────────────┘
```

---

## Tests manuels à effectuer

| # | Scénario | Résultat attendu |
|---|----------|------------------|
| 1 | Créer patient | Apparaît immédiatement sans refetch manuel |
| 2 | Modifier patient | Modification visible partout |
| 3 | Supprimer patient | Disparaît de la liste instantanément |
| 4 | Créer RDV | Liste mise à jour automatiquement |
| 5 | Modifier statut RDV | Statut mis à jour sans refresh |
| 6 | Navigation Patients → Autre → Patients | Pas de spinner si <60s |
| 7 | Couper réseau → action | ErrorBanner avec message FR via getErrorMessage() |
| 8 | DevTools en DEV | Visible, cache observable |
| 9 | DevTools en PROD | NON visible |

---

## Critères d'acceptation

- [ ] TanStack Query v5 installé
- [ ] QueryClientProvider enveloppe l'app
- [ ] ReactQueryDevtools UNIQUEMENT en DEV
- [ ] Hooks avec signature extensible (params?)
- [ ] Patients utilise hooks Query + mutations
- [ ] Appointments utilise hooks Query + mutations
- [ ] Aucun refetch() manuel après mutations
- [ ] Aucun setState local pour sync data
- [ ] Erreurs via getErrorMessage() + ErrorBanner
- [ ] UI strictement identique
- [ ] Aucun fichier hors scope

---

## Hooks legacy conservés

Les hooks existants ne sont PAS supprimés:
- `src/hooks/usePatients.ts` → conservé (rollback possible)
- `src/hooks/useAppointments.ts` → conservé (rollback possible)

Ils pourront être retirés en Phase 2C après validation complète.

