
# PHASE 2A — Stabilisation Architecture & Logique
## Plan d'exécution validé avec ajustements

---

## Résumé des ajustements intégrés

| Contrainte | Application |
|------------|-------------|
| Scope STRICT | 11 fichiers uniquement (listés ci-dessous) |
| errorMessage.ts | Créé, utilisé UNIQUEMENT dans Patients.tsx et Appointments.tsx |
| ErrorBanner | Statique, AUCUNE animation |
| UI | Identique visuellement (sauf affichage erreur) |
| Supabase | AUCUNE modification logique métier |

---

## Fichiers modifiés (scope strict)

| # | Action | Fichier |
|---|--------|---------|
| 1 | CRÉER | `src/lib/errorMessage.ts` |
| 2 | CRÉER | `src/components/ui/ErrorBanner.tsx` |
| 3 | MODIFIER | `src/hooks/useAppointments.ts` |
| 4 | MODIFIER | `src/hooks/usePatients.ts` |
| 5 | MODIFIER | `src/hooks/useCachedPatients.ts` |
| 6 | MODIFIER | `src/hooks/useCachedAppointments.ts` |
| 7 | MODIFIER | `src/services/appointmentService.ts` |
| 8 | MODIFIER | `src/services/patientService.ts` |
| 9 | MODIFIER | `src/components/modules/Patients.tsx` |
| 10 | MODIFIER | `src/components/modules/Appointments.tsx` |
| 11 | MODIFIER | `src/components/ui/ErrorBoundary.tsx` |

**Total: 2 créés + 9 modifiés = 11 fichiers**

---

## Étape 1 : Créer errorMessage.ts

**Fichier:** `src/lib/errorMessage.ts`

```text
Fonction: getErrorMessage(error: unknown): string

Mapping des codes Supabase:
┌─────────────────────────────────┬────────────────────────────────────────┐
│ Code/Condition                  │ Message utilisateur (FR)               │
├─────────────────────────────────┼────────────────────────────────────────┤
│ PGRST116                        │ Aucune donnée trouvée                  │
│ 23505                           │ Cette entrée existe déjà               │
│ 23503                           │ Impossible de supprimer (données liées)│
│ 42501                           │ Accès non autorisé                     │
│ Failed to fetch / NetworkError │ Problème de connexion réseau           │
│ TypeError                       │ Erreur technique inattendue            │
│ Défaut                          │ Une erreur s'est produite              │
└─────────────────────────────────┴────────────────────────────────────────┘
```

**Usage limité Phase 2A:** Patients.tsx + Appointments.tsx uniquement

---

## Étape 2 : Créer ErrorBanner.tsx

**Fichier:** `src/components/ui/ErrorBanner.tsx`

```text
Props:
├── title?: string        (défaut: "Erreur")
├── description: string   (message d'erreur)
├── onDismiss?: () => void
└── variant?: 'error' | 'warning' | 'info'

Style (identique à l'existant, SANS animation):
├── bg-red-50 border border-red-200 rounded-xl p-4
├── Icône AlertCircle de lucide-react
├── Bouton fermer optionnel
└── PAS de fade-in, PAS de transition
```

---

## Étape 3 : Remplacer console.log par logger

### 3.1 useAppointments.ts (8 occurrences)

| Ligne | Avant | Après |
|-------|-------|-------|
| 11 | `console.log('useAppointments hook initialized')` | `logger.debug('useAppointments hook initialized')` |
| 15 | `console.log('Fetching appointments...')` | `logger.debug('Fetching appointments...')` |
| 19 | `console.log('Appointments fetched:', data.length)` | `logger.debug('Appointments fetched', data.length)` |
| 22 | `console.error('Error fetching appointments:', err)` | `logger.error('Error fetching appointments', err)` |
| 31 | `console.log('Creating appointment:', appointmentData)` | `logger.debug('Creating appointment')` |
| 36 | `console.error('Error creating appointment:', err)` | `logger.error('Error creating appointment', err)` |
| 43 | `console.log('Updating appointment:', id)` | `logger.debug('Updating appointment', id)` |
| 50 | `console.error('Error updating appointment:', err)` | `logger.error('Error updating appointment', err)` |
| 57 | `console.log('Deleting appointment:', id)` | `logger.debug('Deleting appointment', id)` |
| 61 | `console.error('Error deleting appointment:', err)` | `logger.error('Error deleting appointment', err)` |
| 67 | `console.log('useAppointments useEffect triggered')` | `logger.debug('useAppointments useEffect triggered')` |

### 3.2 usePatients.ts (5 occurrences)

| Ligne | Avant | Après |
|-------|-------|-------|
| 18 | `console.error('Error fetching patients:', err)` | `logger.error('Error fetching patients', err)` |
| 31 | `console.error('Error creating patient:', err)` | `logger.error('Error creating patient', err)` |
| 44 | `console.error('Error updating patient:', err)` | `logger.error('Error updating patient', err)` |
| 54 | `console.error('Error deleting patient:', err)` | `logger.error('Error deleting patient', err)` |
| 65 | `console.error('Error searching patients:', err)` | `logger.error('Error searching patients', err)` |

### 3.3 useCachedPatients.ts (7 occurrences)

| Ligne | Type | Action |
|-------|------|--------|
| 32 | error | `logger.error` |
| 47 | error | `logger.error` |
| 62 | error | `logger.error` |
| 75 | error | `logger.error` |
| 90 | error | `logger.error` |
| 107 | error | `logger.error` |

### 3.4 useCachedAppointments.ts (12 occurrences)

| Ligne | Type | Action |
|-------|------|--------|
| 23 | log | `logger.debug` |
| 32 | error | `logger.error` |
| 34 | log | `logger.debug` |
| 41 | log | `logger.debug` |
| 50 | error | `logger.error` |
| 57 | log | `logger.debug` |
| 66 | error | `logger.error` |
| 73 | log | `logger.debug` |
| 80 | error | `logger.error` |
| 96 | error | `logger.error` |
| 112 | error | `logger.error` |
| 119 | log | `logger.debug` |

### 3.5 appointmentService.ts (12 occurrences)

| Ligne | Type | Action |
|-------|------|--------|
| 41 | error | `logger.error` |
| 47 | error | `logger.error` |
| 62 | error | `logger.error` |
| 68 | error | `logger.error` |
| 84 | error | `logger.error` |
| 90 | error | `logger.error` |
| 108 | error | `logger.error` |
| 114 | error | `logger.error` |
| 131 | error | `logger.error` |
| 137 | error | `logger.error` |
| 155 | error | `logger.error` |
| 161 | error | `logger.error` |
| 177 | error | `logger.error` |
| 183 | error | `logger.error` |
| 197 | error | `logger.error` |
| 201 | error | `logger.error` |

### 3.6 patientService.ts (6 occurrences)

| Ligne | Type | Action |
|-------|------|--------|
| 29 | error | `logger.error` |
| 64 | error | `logger.error` |
| 110 | error | `logger.error` |
| 153 | error | `logger.error` |
| 167 | error | `logger.error` |
| 196 | error | `logger.error` |

### 3.7 ErrorBoundary.tsx (1 occurrence)

| Ligne | Avant | Après |
|-------|-------|-------|
| 24 | `console.error('Error caught by boundary:', error)` | `logger.error('Error caught by boundary', error)` |

---

## Étape 4 : Intégrer ErrorBanner

### 4.1 Patients.tsx

**Avant (lignes 191-201):**
```tsx
{error && (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
    <p className="text-red-800 text-sm">{error}</p>
    <button onClick={() => setError(null)} className="...">
      Fermer
    </button>
  </div>
)}
```

**Après:**
```tsx
{error && (
  <ErrorBanner
    description={error}
    onDismiss={() => setError(null)}
  />
)}
```

**Également:** Remplacer `console.error` par `logger.error` aux lignes 45, 81, 110

### 4.2 Appointments.tsx

**Avant (lignes 216-220):**
```tsx
{error && (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
    <p className="text-red-800 text-sm">{error}</p>
  </div>
)}
```

**Après:**
```tsx
{error && (
  <ErrorBanner
    description={error}
    onDismiss={() => /* reset error in hook */}
  />
)}
```

**Également:** Remplacer `console.error` par `logger.error` aux lignes 41, 114, 129, 153, 191

---

## Tests manuels à effectuer

| # | Scénario | Vérification |
|---|----------|--------------|
| 1 | Charger liste patients | Liste affichée, aucun `console.log` visible en prod |
| 2 | Créer un nouveau patient | Toast succès, patient ajouté |
| 3 | Charger les rendez-vous | Liste affichée correctement |
| 4 | Simuler erreur réseau | ErrorBanner avec message "Problème de connexion" |
| 5 | Console en mode DEV | Logs formatés `[DEBUG]`, `[ERROR]` |
| 6 | Console en mode PROD | AUCUN log debug visible |
| 7 | Vérifier UI inchangée | Layout identique partout |

---

## Critères d'acceptation

- [ ] Aucun `console.log` visible en production
- [ ] Erreurs affichées via ErrorBanner cohérent
- [ ] ErrorBanner statique (pas d'animation)
- [ ] errorMessage.ts utilisé uniquement dans Patients.tsx et Appointments.tsx
- [ ] Aucune régression fonctionnelle
- [ ] UI strictement identique (hors messages d'erreur)
- [ ] Aucune modification Supabase / logique métier

---

## Architecture respectée

```text
services/       → Appels Supabase + mapping + logger.error
hooks/          → État fetching + logger.debug/error
modules/        → Orchestration UI + ErrorBanner
lib/            → Utilitaires (logger, errorMessage)
components/ui/  → Composants réutilisables (ErrorBanner)
```

