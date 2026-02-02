
# PHASE 3B — Verrouillage du Modèle Métier (IMPLÉMENTÉE)

## ✅ Status: IMPLÉMENTÉE

Date d'implémentation: 2026-02-02

---

## Migrations DB Exécutées

### Migration 1: quote_id sur invoices
```sql
ALTER TABLE invoices 
  ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES quotes(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON invoices(quote_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_invoices_quote_id ON invoices(quote_id) WHERE quote_id IS NOT NULL;
```

### Migration 2: Table patient_forfaits
```sql
CREATE TABLE IF NOT EXISTS patient_forfaits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  forfait_id uuid NOT NULL REFERENCES forfaits(id) ON DELETE RESTRICT,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date NOT NULL,
  total_sessions integer NOT NULL,
  remaining_sessions integer NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'completed', 'cancelled')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- RLS avec has_role() existant
```

### Migration 3: completion_reason sur appointments
```sql
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completion_reason text 
  CHECK (completion_reason IS NULL OR completion_reason IN (
    'invoiced', 'included_in_forfait', 'free', 'pending_invoice', 'other'
  ));
```

---

## Fichiers Modifiés

| Fichier | Description |
|---------|-------------|
| `src/types/index.ts` | Ajout `CompletionReason`, `quoteId` sur Invoice, `completionReason` sur Appointment |
| `src/queries/appointments.queries.ts` | Ajout hook `usePatientAppointmentsQuery()` |
| `src/services/appointmentService.ts` | Mapping `completion_reason` |
| `src/services/invoiceService.ts` | Mapping `quote_id` + méthode `createFromQuote()` |
| `src/services/quoteService.ts` | Protection FK RESTRICT → erreur `QUOTE_ALREADY_INVOICED` |
| `src/services/forfaitService.ts` | Protection FK RESTRICT → erreur `FORFAIT_IN_USE` |
| `src/components/forms/ConsultationForm.tsx` | Sélection RDV optionnel via TanStack Query |
| `src/components/modules/Quotes.tsx` | Bouton "Convertir en facture" + gestion erreurs |
| `src/components/modules/ForfaitManagement.tsx` | Gestion erreur `FORFAIT_IN_USE` |
| `src/components/modules/Appointments.tsx` | Modal avec choix raison de completion |

---

## Critères d'Acceptation

- [x] Consultation créée depuis contexte RDV → `appointment_id` sélectionnable
- [x] Consultation manuelle → possibilité de lier un RDV du patient (hook TanStack Query)
- [x] Devis accepté → bouton "Convertir en facture" visible
- [x] Conversion devis → facture crée facture avec `quote_id` renseigné
- [x] Suppression devis déjà facturé → erreur `QUOTE_ALREADY_INVOICED` (FK RESTRICT)
- [x] Double facturation impossible (unique index partiel)
- [x] Table `patient_forfaits` créée avec RLS `has_role()`
- [x] Suppression forfait utilisé → erreur `FORFAIT_IN_USE` (FK RESTRICT)
- [x] RDV terminé → modal avec choix de raison
- [x] `completion_reason` sauvegardé en base (nullable)
- [x] Aucune régression Phases 2A → 3A

---

## Ce qui N'A PAS changé

- ❌ Aucun redesign UI global
- ❌ Aucun nouveau dashboard
- ❌ Aucune refonte de formulaires (ajouts ciblés uniquement)
- ❌ Aucun figement du catalogue des soins
- ❌ Aucune logique métier spécifique aux traitements
