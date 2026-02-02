
# PHASE 2C — Cleanup & Verrouillage Architecture Data
## Plan d'exécution avec correction ExcelReporting

---

## Résultat d'audit — Usages hooks legacy

| Fichier | Hook legacy | Statut |
|---------|-------------|--------|
| `src/hooks/usePatients.ts` | Définition | A SUPPRIMER |
| `src/hooks/useAppointments.ts` | Définition | A SUPPRIMER |
| `src/components/modules/ExcelReporting.tsx` | `usePatients`, `useAppointments` | USAGE ACTIF |
| `src/components/modules/Patients.tsx` | - | Migré (OK) |
| `src/components/modules/Appointments.tsx` | - | Migré (OK) |

**Décision:** ExcelReporting.tsx doit être migré vers TanStack Query AVANT de pouvoir supprimer les hooks legacy.

---

## Fichiers modifiés (scope ajusté)

| # | Action | Fichier | Raison |
|---|--------|---------|--------|
| 1 | MODIFIER | `src/components/modules/ExcelReporting.tsx` | Migration vers hooks Query |
| 2 | MODIFIER | `src/queries/patients.queries.ts` | Ajout commentaire architectural |
| 3 | MODIFIER | `src/queries/appointments.queries.ts` | Ajout commentaire architectural |
| 4 | SUPPRIMER | `src/hooks/usePatients.ts` | Plus aucun usage |
| 5 | SUPPRIMER | `src/hooks/useAppointments.ts` | Plus aucun usage |

**Total: 3 modifiés + 2 supprimés = 5 fichiers**

---

## Etape 1 : Migration ExcelReporting.tsx

### Modifications

```text
AVANT (lignes 3-4, 15-16):
import { usePatients } from '../../hooks/usePatients';
import { useAppointments } from '../../hooks/useAppointments';
...
const { patients } = usePatients();
const { appointments } = useAppointments();

APRÈS:
import { usePatientsQuery } from '../../queries/patients.queries';
import { useAppointmentsQuery } from '../../queries/appointments.queries';
...
const { data: patients = [] } = usePatientsQuery();
const { data: appointments = [] } = useAppointmentsQuery();
```

### Impact

- UI identique (seul le data-fetching change)
- Bénéficie du cache 60s de TanStack Query
- Cohérence avec Patients.tsx et Appointments.tsx

---

## Etape 2 : Verrouillage architectural

### Fichier: src/queries/patients.queries.ts

Ajouter en tête de fichier:
```typescript
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
```

### Fichier: src/queries/appointments.queries.ts

Ajouter en tête de fichier:
```typescript
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
```

---

## Etape 3 : Suppression hooks legacy

### Après confirmation que ExcelReporting est migré

```text
SUPPRIMER:
├── src/hooks/usePatients.ts (66 lignes)
└── src/hooks/useAppointments.ts (77 lignes)
```

### Vérification finale

Recherche dans le codebase:
- `from '../../hooks/usePatients'` → 0 résultat
- `from '../../hooks/useAppointments'` → 0 résultat

---

## Etape 4 : Nettoyage imports morts

### Patients.tsx

Vérifier et supprimer:
- Imports non utilisés (déjà OK après Phase 2B)
- États obsolètes (déjà nettoyé)

### Appointments.tsx  

Vérifier et supprimer:
- Imports non utilisés (déjà OK après Phase 2B)
- États obsolètes (déjà nettoyé)

**Note:** Ces fichiers ont déjà été nettoyés en Phase 2B, cette étape est une vérification.

---

## Architecture finale après Phase 2C

```text
SUPPRIMÉ:
├── src/hooks/usePatients.ts ❌
└── src/hooks/useAppointments.ts ❌

SOURCE OF TRUTH:
├── src/queries/patients.queries.ts ✅ (verrouillé)
└── src/queries/appointments.queries.ts ✅ (verrouillé)

CONSOMMATEURS:
├── src/components/modules/Patients.tsx → usePatientsQuery
├── src/components/modules/Appointments.tsx → useAppointmentsQuery + usePatientsQuery
└── src/components/modules/ExcelReporting.tsx → usePatientsQuery + useAppointmentsQuery
```

---

## Diff attendu

### ExcelReporting.tsx

```diff
--- a/src/components/modules/ExcelReporting.tsx
+++ b/src/components/modules/ExcelReporting.tsx
@@ -1,6 +1,6 @@
 import React, { useState } from 'react';
 import { FileSpreadsheet, Download, Calendar, Users, TrendingUp, Package } from 'lucide-react';
-import { usePatients } from '../../hooks/usePatients';
-import { useAppointments } from '../../hooks/useAppointments';
+import { usePatientsQuery } from '../../queries/patients.queries';
+import { useAppointmentsQuery } from '../../queries/appointments.queries';
 import { useInventory } from '../../hooks/useInventory';
 
@@ -12,8 +12,8 @@ const ExcelReporting: React.FC = () => {
   });
   const [isGenerating, setIsGenerating] = useState(false);
 
-  const { patients } = usePatients();
-  const { appointments } = useAppointments();
+  const { data: patients = [] } = usePatientsQuery();
+  const { data: appointments = [] } = useAppointmentsQuery();
   const { products } = useInventory();
```

### patients.queries.ts (extrait)

```diff
--- a/src/queries/patients.queries.ts
+++ b/src/queries/patients.queries.ts
@@ -1,3 +1,18 @@
+/**
+ * SOURCE OF TRUTH — Patients data access
+ * 
+ * Toute récupération ou mutation des patients DOIT passer par ce fichier.
+ * Interdiction d'accès direct à patientService depuis les composants.
+ * 
+ * Hooks disponibles:
+ * - usePatientsQuery(params?) — lecture
+ * - useCreatePatientMutation() — création
+ * - useUpdatePatientMutation() — modification  
+ * - useDeletePatientMutation() — suppression
+ * 
+ * @see Phase 2B migration TanStack Query
+ */
 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
```

### appointments.queries.ts (extrait)

```diff
--- a/src/queries/appointments.queries.ts  
+++ b/src/queries/appointments.queries.ts
@@ -1,3 +1,18 @@
+/**
+ * SOURCE OF TRUTH — Appointments data access
+ * 
+ * Toute récupération ou mutation des rendez-vous DOIT passer par ce fichier.
+ * Interdiction d'accès direct à appointmentService depuis les composants.
+ * 
+ * Hooks disponibles:
+ * - useAppointmentsQuery(params?) — lecture
+ * - useCreateAppointmentMutation() — création
+ * - useUpdateAppointmentMutation() — modification
+ * - useDeleteAppointmentMutation() — suppression
+ * 
+ * @see Phase 2B migration TanStack Query
+ */
 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
```

---

## Tests manuels

| # | Scénario | Résultat attendu |
|---|----------|------------------|
| 1 | Aller sur Rapports Excel | Page affiche normalement |
| 2 | Générer rapport Patients | CSV téléchargé avec données |
| 3 | Générer rapport Rendez-vous | CSV téléchargé avec données |
| 4 | Créer patient → Rapports Excel | Nouveau patient visible dans aperçu |
| 5 | Modifier RDV → Rapports Excel | Données à jour |
| 6 | Rechercher "usePatients" dans VS Code | Aucun import (sauf définition Query) |

---

## Critères d'acceptation

- [ ] ExcelReporting migré vers hooks TanStack Query
- [ ] Commentaires architecturaux ajoutés aux fichiers Query
- [ ] `src/hooks/usePatients.ts` supprimé
- [ ] `src/hooks/useAppointments.ts` supprimé
- [ ] Aucun import legacy dans le codebase
- [ ] Fonctionnalité rapports Excel préservée
- [ ] UI strictement identique
- [ ] Aucun fichier hors scope modifié

---

## Note sur le scope

Cette phase inclut `ExcelReporting.tsx` car :
1. Il bloque la suppression des hooks legacy
2. La migration est triviale (2 lignes)
3. Sans cette migration, Phase 2C ne peut pas atteindre son objectif

Le CTO est informé de cet ajustement de scope.
