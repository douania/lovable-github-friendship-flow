
import { supabase } from '../integrations/supabase/client';
import { Quote } from '../types/consultation';

// Fonction pour convertir les données de la DB vers le type Quote
const mapDbQuoteToQuote = (dbQuote: any): Quote => ({
  id: dbQuote.id,
  quoteNumber: dbQuote.quote_number,
  patientId: dbQuote.patient_id,
  practitionerId: dbQuote.practitioner_id,
  treatmentItems: dbQuote.treatment_items || [],
  subtotal: dbQuote.subtotal,
  discountAmount: dbQuote.discount_amount || 0,
  taxAmount: dbQuote.tax_amount || 0,
  totalAmount: dbQuote.total_amount,
  status: dbQuote.status,
  validUntil: dbQuote.valid_until,
  notes: dbQuote.notes || '',
  createdAt: dbQuote.created_at,
  updatedAt: dbQuote.updated_at
});

// Fonction pour convertir le type Quote vers les données de la DB
const mapQuoteToDbQuote = (quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => ({
  quote_number: quote.quoteNumber,
  patient_id: quote.patientId,
  practitioner_id: quote.practitionerId,
  treatment_items: quote.treatmentItems as any, // Cast vers any pour compatibilité Json
  subtotal: quote.subtotal,
  discount_amount: quote.discountAmount,
  tax_amount: quote.taxAmount,
  total_amount: quote.totalAmount,
  status: quote.status,
  valid_until: quote.validUntil,
  notes: quote.notes
});

// Fonction pour convertir les mises à jour partielles
const mapPartialQuoteToDbQuote = (partialQuote: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const dbQuote: any = {};
  
  if (partialQuote.quoteNumber !== undefined) dbQuote.quote_number = partialQuote.quoteNumber;
  if (partialQuote.patientId !== undefined) dbQuote.patient_id = partialQuote.patientId;
  if (partialQuote.practitionerId !== undefined) dbQuote.practitioner_id = partialQuote.practitionerId;
  if (partialQuote.treatmentItems !== undefined) dbQuote.treatment_items = partialQuote.treatmentItems as any;
  if (partialQuote.subtotal !== undefined) dbQuote.subtotal = partialQuote.subtotal;
  if (partialQuote.discountAmount !== undefined) dbQuote.discount_amount = partialQuote.discountAmount;
  if (partialQuote.taxAmount !== undefined) dbQuote.tax_amount = partialQuote.taxAmount;
  if (partialQuote.totalAmount !== undefined) dbQuote.total_amount = partialQuote.totalAmount;
  if (partialQuote.status !== undefined) dbQuote.status = partialQuote.status;
  if (partialQuote.validUntil !== undefined) dbQuote.valid_until = partialQuote.validUntil;
  if (partialQuote.notes !== undefined) dbQuote.notes = partialQuote.notes;
  
  return dbQuote;
};

export const quoteService = {
  // Récupérer tous les devis
  async getAllQuotes(): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des devis:', error);
      throw error;
    }

    return data?.map(mapDbQuoteToQuote) || [];
  },

  // Récupérer les devis d'un patient
  async getQuotesByPatient(patientId: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des devis du patient:', error);
      throw error;
    }

    return data?.map(mapDbQuoteToQuote) || [];
  },

  // Créer un nouveau devis
  async createQuote(quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quote> {
    const dbQuote = mapQuoteToDbQuote(quoteData);
    
    const { data, error } = await supabase
      .from('quotes')
      .insert(dbQuote) // Insérer un objet unique, pas un tableau
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du devis:', error);
      throw error;
    }

    return mapDbQuoteToQuote(data);
  },

  // Mettre à jour un devis
  async updateQuote(id: string, quoteData: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Quote> {
    const dbQuote = mapPartialQuoteToDbQuote(quoteData);
    
    const { data, error } = await supabase
      .from('quotes')
      .update(dbQuote)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du devis:', error);
      throw error;
    }

    return mapDbQuoteToQuote(data);
  },

  // Générer un numéro de devis unique
  async generateQuoteNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Compter les devis du jour
    const { count } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-${month}-${day}T00:00:00`)
      .lt('created_at', `${year}-${month}-${day}T23:59:59`);

    const dailyCount = (count || 0) + 1;
    return `DEV-${year}${month}${day}-${String(dailyCount).padStart(3, '0')}`;
  }
};
