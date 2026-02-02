-- PHASE 3B Migration 1: Ajouter quote_id sur invoices avec FK RESTRICT
ALTER TABLE invoices 
  ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES quotes(id) ON DELETE RESTRICT;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON invoices(quote_id);

-- Empêche double facturation du même devis (unique partiel)
CREATE UNIQUE INDEX IF NOT EXISTS ux_invoices_quote_id
  ON invoices(quote_id)
  WHERE quote_id IS NOT NULL;

-- PHASE 3B Migration 2: Table de liaison patient ↔ forfait
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

-- RLS pour patient_forfaits (réutilise pattern existant has_role)
ALTER TABLE patient_forfaits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff full access to patient_forfaits" ON patient_forfaits
  FOR ALL 
  USING (has_role('admin') OR has_role('praticien'))
  WITH CHECK (has_role('admin') OR has_role('praticien'));

-- PHASE 3B Migration 3: Ajouter completion_reason sur appointments (nullable)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completion_reason text 
  CHECK (completion_reason IS NULL OR completion_reason IN (
    'invoiced', 'included_in_forfait', 'free', 'pending_invoice', 'other'
  ));

-- Commentaire pour documentation
COMMENT ON COLUMN appointments.completion_reason IS 
  'Justification pour RDV terminé: invoiced=facturé, included_in_forfait=inclus forfait, free=gratuit, pending_invoice=facture à venir, other=autre';