

# PHASE 3A — Correctifs Fonctionnels BLOQUANTS (v2 AJUSTÉE CTO)

## Récapitulatif des ajustements CTO intégrés

| # | Point CTO | Ajustement appliqué |
|---|-----------|---------------------|
| 1 | Validation stock | Erreur métier standardisée `STOCK_INSUFFICIENT` avec métadonnées |
| 2 | Rapport revenus | Chargement factures **à la demande** (pas de useState/useEffect) |

---

## Correction 1 — Suppression devis (BLOQUANT)

### Fichier 1 : `src/services/quoteService.ts`

**Ajouter après ligne 172** — Nouvelle méthode `deleteQuote()`

```typescript
async deleteQuote(id: string): Promise<void> {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erreur lors de la suppression du devis:', error);
    throw error;
  }
}
```

### Fichier 2 : `src/components/modules/Quotes.tsx`

**Lignes 168-173** — Remplacer le toast placeholder par l'appel réel

```typescript
// AVANT (lignes 168-173)
try {
  console.log('Suppression du devis avec ID:', id);
  toast({
    title: 'Information',
    description: 'Fonction de suppression à implémenter.',
  });

// APRÈS
try {
  await quoteService.deleteQuote(id);
  await loadQuotes();
  toast({
    title: 'Succès',
    description: 'Devis supprimé avec succès.',
  });
```

---

## Correction 2 — Validation stock (MAJEUR) — AJUSTEMENT CTO

### Fichier : `src/services/productService.ts`

**Lignes 228-232** — Ajouter validation avec erreur métier standardisée

```typescript
// AVANT (lignes 228-232)
if (!product) {
  throw new Error('Product not found');
}

const newQuantity = Math.max(0, product.quantity - quantity);

// APRÈS
if (!product) {
  throw new Error('Produit introuvable');
}

// VALIDATION : stock suffisant (erreur métier standardisée)
if (product.quantity < quantity) {
  const error = new Error('STOCK_INSUFFICIENT');
  (error as any).meta = {
    available: product.quantity,
    requested: quantity
  };
  throw error;
}

const newQuantity = product.quantity - quantity;
```

**Avantages de l'approche CTO :**
- Permet au frontend de différencier erreur métier vs technique
- Aucun impact UI immédiat (toast existant fonctionne)
- Prépare Phase 3B proprement
- Aucun refactor requis

---

## Correction 3 — Rapport revenus Excel (MAJEUR) — AJUSTEMENT CTO

### Fichier : `src/components/modules/ExcelReporting.tsx`

**Ligne 6** — Ajouter import du service

```typescript
// AVANT
import { useToast } from '../../hooks/use-toast';

// APRÈS
import { useToast } from '../../hooks/use-toast';
import { invoiceService } from '../../services/invoiceService';
```

**Lignes 116-135** — Réécrire `generateRevenueReport()` avec chargement à la demande

```typescript
// AVANT
const generateRevenueReport = () => {
  // Simuler des données de revenus basées sur les rendez-vous
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    return aptDate >= startDate && aptDate <= endDate && apt.status === 'completed';
  });

  const revenueData = filteredAppointments.map(appointment => ({
    'Date': new Date(appointment.date).toLocaleDateString('fr-FR'),
    'Patient ID': appointment.patientId,
    'Traitement ID': appointment.treatmentId,
    'Montant estimé': '0', // À calculer depuis la base de données
    'Mode paiement': 'N/A',
    'Statut': appointment.status
  }));
  
  generateCSV(revenueData, `rapport_revenus_${dateRange.start}_${dateRange.end}`);
};

// APRÈS (chargement à la demande — ajustement CTO)
const generateRevenueReport = async () => {
  // Charger les factures uniquement au moment de la génération
  const invoices = await invoiceService.getAll();
  
  const filteredInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.createdAt);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    return invDate >= startDate && invDate <= endDate;
  });

  const revenueData = filteredInvoices.map(invoice => ({
    'Numéro facture': invoice.id,
    'Date': new Date(invoice.createdAt).toLocaleDateString('fr-FR'),
    'Patient ID': invoice.patientId,
    'Montant': invoice.amount.toLocaleString() + ' FCFA',
    'Mode paiement': invoice.paymentMethod || 'N/A',
    'Statut': invoice.status === 'paid' ? 'Payée' : invoice.status === 'partial' ? 'Partiel' : 'Impayée',
    'Date paiement': invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString('fr-FR') : '-'
  }));
  
  generateCSV(revenueData, `rapport_revenus_${dateRange.start}_${dateRange.end}`);
};
```

**Note importante :** La fonction devient `async`, ce qui est géré automatiquement par le `try/catch` dans `handleGenerateReport()` ligne 156.

---

## Récapitulatif des modifications

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `src/services/quoteService.ts` | +8 (après 172) | Ajout méthode `deleteQuote()` |
| `src/components/modules/Quotes.tsx` | 168-173 | Appel réel `quoteService.deleteQuote()` |
| `src/services/productService.ts` | 228-232 | Validation stock + erreur métier `STOCK_INSUFFICIENT` |
| `src/components/modules/ExcelReporting.tsx` | 6, 116-135 | Import invoiceService + vraies données factures (async) |

**Total : 4 fichiers, ~45 lignes modifiées**

---

## Ce qui NE change PAS

- ❌ Aucune modification UI
- ❌ Aucun nouveau composant  
- ❌ Aucune migration DB
- ❌ Aucun useState/useEffect ajouté pour les factures
- ❌ Aucun refactor structurel

---

## Critères d'acceptation Phase 3A

- [ ] Supprimer un devis supprime réellement la ligne en base
- [ ] Toast succès affiché après suppression devis
- [ ] Tentative de décrémentation > stock disponible → erreur `STOCK_INSUFFICIENT` levée
- [ ] Erreur contient métadonnées `{ available, requested }`
- [ ] Rapport revenus Excel contient les vrais montants des factures
- [ ] Chargement factures uniquement à la génération (pas au montage)
- [ ] Aucun pixel modifié
- [ ] Aucune régression Phases 2A → 2F

