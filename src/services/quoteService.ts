
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

export const quoteService = {
  // Récupérer tous les devis
  async getAllQuotes(): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des devis:', error);
        throw error;
      }

      return data?.map(mapDbQuoteToQuote) || [];
    } catch (error) {
      console.error('Erreur dans getAllQuotes:', error);
      throw error;
    }
  },

  // Récupérer les devis d'un patient
  async getQuotesByPatient(patientId: string): Promise<Quote[]> {
    try {
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
    } catch (error) {
      console.error('Erreur dans getQuotesByPatient:', error);
      throw error;
    }
  },

  // Créer un nouveau devis
  async createQuote(quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quote> {
    try {
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
    } catch (error) {
      console.error('Erreur dans createQuote:', error);
      throw error;
    }
  },

  // Mettre à jour un devis
  async updateQuote(id: string, quoteData: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Quote> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .update(quoteData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du devis:', error);
        throw error;
      }

      return mapDbQuoteToQuote(data);
    } catch (error) {
      console.error('Erreur dans updateQuote:', error);
      throw error;
    }
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
