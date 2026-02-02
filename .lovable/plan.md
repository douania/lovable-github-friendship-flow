

# PHASE 2D.1 — Patch UX (scope strict)

## Résultat de l'audit

| Fichier | Problème identifié | Statut |
|---------|-------------------|--------|
| `AppointmentForm.tsx` | Bouton submit sans `disabled` | ✅ **DÉJÀ CORRIGÉ** (ligne 328) |
| `Patients.tsx` | Hover actif sur bouton disabled | ⚠️ **À CORRIGER** (ligne 315) |

---

## Scope final : 1 seul fichier

| Fichier | Modification |
|---------|-------------|
| `src/components/modules/Patients.tsx` | Neutraliser hover quand disabled |

**AppointmentForm.tsx n'a PAS besoin de modification** — le patch a déjà été appliqué lors de la Phase 2D.

---

## Correction Patients.tsx

### Ligne 315 — Bouton Supprimer

```text
AVANT:
className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

APRÈS:
className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
```

### Explication technique

- `disabled:hover:bg-red-100` : quand le bouton est `disabled`, le hover revient à la couleur de base (`bg-red-100`)
- Cela neutralise visuellement l'effet hover sans changer le comportement
- Pattern Tailwind standard et propre

---

## Diff attendu

```diff
--- a/src/components/modules/Patients.tsx
+++ b/src/components/modules/Patients.tsx
@@ -312,7 +312,7 @@ const Patients: React.FC = () => {
             <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100 p-6">
               <button
                 onClick={() => handleDeletePatient(selectedPatient.id)}
                 disabled={deleteMutation.isPending}
-                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
+                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
               </button>
```

---

## Validation

| Test | Résultat attendu |
|------|------------------|
| Bouton Supprimer au repos | Fond `bg-red-100` |
| Bouton Supprimer hover (actif) | Fond `bg-red-200` |
| Bouton Supprimer disabled | Fond `bg-red-100` + opacité 50% |
| Bouton Supprimer disabled + hover | Fond reste `bg-red-100` (pas de changement) |

---

## Note

AppointmentForm.tsx était mentionné dans la demande mais l'audit montre que les corrections ont déjà été appliquées lors de la Phase 2D. Seul Patients.tsx nécessite ce micro-patch.

