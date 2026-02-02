

# Correction Phase 2A — Alignement ErrorBanner Appointments.tsx

## Problème identifié

Le composant `Appointments.tsx` utilise `ErrorBanner` sans `onDismiss`, créant une incohérence UX avec `Patients.tsx` où l'utilisateur peut fermer le message d'erreur.

## Solution proposée

Ajouter un état local `dismissedError` pour gérer le dismiss sans modifier le hook `useAppointments` (respect du scope Phase 2A).

## Fichier modifié

| # | Fichier | Action |
|---|---------|--------|
| 1 | `src/components/modules/Appointments.tsx` | Ajouter état local + onDismiss |

## Changements techniques

### Appointments.tsx

```text
AVANT (ligne 218-222):
{error && (
  <ErrorBanner
    description={error}
  />
)}

APRÈS:
// Nouvel état local (ligne ~35)
const [dismissedError, setDismissedError] = useState<string | null>(null);

// Reset du dismissed quand l'erreur change
React.useEffect(() => {
  if (error !== dismissedError) {
    setDismissedError(null);
  }
}, [error]);

// Affichage conditionnel (ligne ~218)
{error && error !== dismissedError && (
  <ErrorBanner
    description={error}
    onDismiss={() => setDismissedError(error)}
  />
)}
```

## Logique

1. On garde un état `dismissedError` qui mémorise la dernière erreur fermée
2. Si une nouvelle erreur différente arrive, on la réaffiche
3. Si l'utilisateur ferme, on mémorise cette erreur comme "vue"
4. Pas de modification du hook `useAppointments`

## Ce qui ne change PAS

- Hook `useAppointments` (scope strict)
- Logique métier Supabase
- UI visuelle (sauf bouton fermer maintenant visible)
- Autres fichiers

## Test manuel

| # | Scénario | Résultat attendu |
|---|----------|------------------|
| 1 | Erreur réseau sur Appointments | ErrorBanner avec bouton X |
| 2 | Clic sur X | ErrorBanner disparaît |
| 3 | Nouvelle erreur différente | ErrorBanner réapparaît |
| 4 | Même erreur après refetch | Reste masqué |

## Diff attendu

```diff
--- a/src/components/modules/Appointments.tsx
+++ b/src/components/modules/Appointments.tsx
@@ -33,6 +33,14 @@ const Appointments: React.FC = () => {
   const [appointmentForInvoice, setAppointmentForInvoice] = useState<Appointment | null>(null);
   const { toast } = useToast();
 
+  const [dismissedError, setDismissedError] = useState<string | null>(null);
+
+  // Reset du dismissed quand une nouvelle erreur arrive
+  React.useEffect(() => {
+    if (error && error !== dismissedError) {
+      setDismissedError(null);
+    }
+  }, [error, dismissedError]);
+
   // Charger les traitements au montage
   React.useEffect(() => {
@@ -218,9 +226,10 @@ const Appointments: React.FC = () => {
       </div>
 
-      {error && (
+      {error && error !== dismissedError && (
         <ErrorBanner
           description={error}
+          onDismiss={() => setDismissedError(error)}
         />
       )}
```

