

# PHASE 3C — DOCUMENT DE VALIDATION MÉTIER

## Contexte de l'Audit

Phase 3C : Validation des flux réels et cohérence métier du cabinet esthétique Skin 101.

**Données de test disponibles :**
- 5 patients
- 6 rendez-vous (1 terminé)
- 1 consultation
- 1 devis (non accepté)
- 0 factures
- 6 forfaits (catalogue)
- 0 patient_forfaits (aucun forfait vendu)

---

## SCÉNARIO A — Acte Simple Facturé

### Flux Analysé

```text
Patient → RDV → Terminer → Modal completion → Facture
```

### Résultat : ✅ FONCTIONNEL (avec frictions mineures)

| Étape | Statut | Observation |
|-------|--------|-------------|
| Création patient | ✅ OK | TanStack Query, formulaire complet |
| Création RDV | ✅ OK | Sélection patient + traitement |
| RDV → Terminé | ✅ OK | Modal avec choix de raison |
| Choix "Créer la facture" | ✅ OK | `completionReason = 'invoiced'` |
| Facture créée | ✅ OK | `invoiceService.create()` appelé |
| États cohérents | ✅ OK | RDV completed, facture unpaid |

### Friction UX Identifiée

**⚠️ FU-A1 : Consultation non créée automatiquement**

Quand un RDV est terminé, aucune consultation n'est créée automatiquement.
Le médecin doit aller manuellement dans le module Consultations.

**Impact :** Double saisie potentielle, oubli de documentation médicale.

**Décision :** Accepter pour Phase 3C (non bloquant), corriger en Phase 4/UX.

---

## SCÉNARIO B — Acte Inclus dans un Forfait

### Flux Attendu

```text
Vente forfait → patient_forfaits → RDV → Terminer → "Inclus dans forfait" → Décrémentation
```

### Résultat : ❌ NON IMPLÉMENTÉ

| Étape | Statut | Observation |
|-------|--------|-------------|
| Vente forfait | ❌ ABSENT | Aucune UI pour vendre un forfait à un patient |
| Table patient_forfaits | ✅ OK | Structure DB correcte |
| remaining_sessions | ✅ OK | Colonne présente |
| Décrémentation | ❌ ABSENT | Aucun service `patientForfaitService` |
| Choix "Inclus dans forfait" | ⚠️ PARTIEL | Option visible mais non fonctionnelle |

### Lacune Critique Identifiée

**❌ LC-B1 : Absence du flux de vente de forfait**

La table `patient_forfaits` existe mais :
- Aucun service TypeScript pour la gérer
- Aucune UI pour "vendre" un forfait à un patient
- Aucune logique de décrémentation des séances
- Le choix `included_in_forfait` ne décrémente rien

**Impact :** Le scénario forfait est impossible à exécuter.

**Décision :** À implémenter en Phase 3D (priorité haute).

---

## SCÉNARIO C — Acte Gratuit / Retouche

### Flux Analysé

```text
RDV → Terminer → "Gratuit" → Pas de facture
```

### Résultat : ✅ FONCTIONNEL

| Étape | Statut | Observation |
|-------|--------|-------------|
| RDV terminé | ✅ OK | Modal affiché |
| Choix "Gratuit" | ✅ OK | `completionReason = 'free'` |
| Aucune facture créée | ✅ OK | Condition `if (reason === 'invoiced')` |
| Toast confirmation | ✅ OK | "Raison enregistrée: Gratuit" |
| Stats non impactées | ✅ OK | Facture non créée = pas de revenus parasites |

### Observation

Le système accepte correctement les actes gratuits sans créer d'anomalie comptable.

---

## SCÉNARIO D — Facturation Différée

### Flux Analysé

```text
RDV → Terminer → "Facturer plus tard" → Facture créée ultérieurement
```

### Résultat : ⚠️ PARTIELLEMENT FONCTIONNEL

| Étape | Statut | Observation |
|-------|--------|-------------|
| Choix "Facturer plus tard" | ✅ OK | `completionReason = 'pending_invoice'` |
| RDV marqué | ✅ OK | `completion_reason` sauvegardé en DB |
| Traçabilité | ⚠️ FAIBLE | Pas de filtre UI pour retrouver ces RDV |
| Création facture ultérieure | ⚠️ MANUEL | Faisable via module Factures, mais sans lien au RDV |

### Friction UX Identifiée

**⚠️ FU-D1 : Pas de vue "RDV en attente de facturation"**

Quand `completionReason = 'pending_invoice'`, le médecin n'a aucun moyen simple de :
- Lister tous les RDV en attente de facturation
- Créer la facture directement depuis le RDV

**Impact :** Risque d'oubli de facturation.

**Décision :** Accepter pour Phase 3C (workaround manuel possible), améliorer en Phase UX.

---

## COHÉRENCE INTER-MODULES

### Vérifications Effectuées

| Relation | Statut | Détail |
|----------|--------|--------|
| RDV → Consultation | ⚠️ OPTIONNEL | `appointmentId` linkable mais non automatique |
| Consultation → Devis | ❌ ABSENT | Aucun lien direct |
| Devis → Facture | ✅ OK | `quote_id` sur invoices, bouton conversion |
| Forfait vendu → RDV | ❌ ABSENT | Pas de lien patient_forfaits ↔ appointments |
| Produits consommés → Inventaire | ✅ OK | `processConsumedProducts()` décrémente le stock |
| Acte gratuit → Analytics | ✅ OK | Pas d'impact sur revenus |

### Incohérence Critique

**❌ IC-1 : Analytics utilise des données mockées**

Le module `Analytics.tsx` (lignes 33-57) utilise des données en dur :
```typescript
const monthlyRevenue = 3200000;
const topTreatments = [
  { name: 'Laser CO2 Fractionné', revenue: 900000, count: 6, growth: 20 },
  // ...
];
```

**Impact :** Les statistiques affichées ne reflètent pas la réalité.

**Décision :** À corriger en Phase 4 Analytics (non bloquant pour flux patient).

---

## RÉSUMÉ DES LACUNES

### Bloquantes pour Production

| ID | Description | Priorité | Phase Cible |
|----|-------------|----------|-------------|
| LC-B1 | Service patient_forfaits absent | HAUTE | Phase 3D |
| IC-1 | Analytics mockées | MOYENNE | Phase 4 |

### Non Bloquantes (Frictions UX)

| ID | Description | Priorité | Phase Cible |
|----|-------------|----------|-------------|
| FU-A1 | Consultation non auto-créée | BASSE | Phase UX |
| FU-D1 | Pas de vue "pending_invoice" | BASSE | Phase UX |

---

## ARCHITECTURE TECHNIQUE VALIDÉE

### Points Positifs Confirmés

1. **TanStack Query** utilisé correctement (Patients, Appointments)
2. **Mapping DB ↔ TS** cohérent (`snake_case` ↔ `camelCase`)
3. **CompletionReason** bien typé et sauvegardé
4. **Protection FK RESTRICT** fonctionnelle (quotes, forfaits)
5. **Modal completion** avec bouton désactivé si pas de choix (correction CTO appliquée)
6. **Traçabilité devis → facture** via `quote_id`

### Points à Améliorer

1. **Consultations.tsx** et **Invoices.tsx** n'utilisent pas TanStack Query (direct service calls)
2. **Dashboard.tsx** utilise des services directs (pas de hooks)
3. **Analytics.tsx** entièrement mocké

---

## RECOMMANDATIONS PHASE 3D

### Priorité 1 : Flux Forfait Patient

Créer `src/services/patientForfaitService.ts` :
- `sellForfait(patientId, forfaitId)` : crée un `patient_forfaits`
- `decrementSession(patientForfaitId)` : décrémente `remaining_sessions`
- `getPatientForfaits(patientId)` : liste les forfaits actifs du patient

Modifier le flux `included_in_forfait` :
- Afficher les forfaits actifs du patient
- Permettre de sélectionner lequel utiliser
- Décrémenter automatiquement

### Priorité 2 : Vue Patient Enrichie

Dans la fiche patient, afficher :
- Forfaits actifs (séances restantes)
- RDV en attente de facturation
- Historique des consultations

### Priorité 3 : Analytics Réelles

Remplacer les données mockées par des requêtes Supabase réelles.

---

## CRITÈRES DE FIN DE PHASE 3C

| Critère | Statut |
|---------|--------|
| Scénario A (facturé) passe | ✅ OUI |
| Scénario B (forfait) passe | ❌ NON (service absent) |
| Scénario C (gratuit) passe | ✅ OUI |
| Scénario D (différé) passe | ⚠️ PARTIEL |
| Médecin comprend le flux | ⚠️ UX à améliorer |
| Aucune correction structurelle | ✅ Correctif ciblé forfait |
| Liste priorisée des corrections | ✅ Ce document |

---

## VERDICT PHASE 3C

**Statut : ⚠️ PARTIELLEMENT VALIDÉE**

3 scénarios sur 4 fonctionnent. Le scénario Forfait nécessite l'implémentation du service `patientForfaitService` avant validation complète.

**Prochaine étape recommandée :**

→ **Phase 3D : Implémentation du flux forfait patient** (service + UI de vente + décrémentation)

