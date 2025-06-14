import { supabase } from '../integrations/supabase/client';
import { Quote } from '../types/consultation';

export const quoteService = {
  async getAllQuotes(): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des devis:', error);
      throw error;
    }

    return data?.map(quote => ({
      id: quote.id,
      quoteNumber: quote.quote_number,
      patientId: quote.patient_id,
      practitionerId: quote.practitioner_id || undefined,
      treatmentItems: Array.isArray(quote.treatment_items) 
        ? (quote.treatment_items as any[]).map((item: any) => ({
            soinId: item.soinId || '',
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            total: item.total || 0
          }))
        : [],
      subtotal: quote.subtotal,
      discountAmount: quote.discount_amount || 0,
      taxAmount: quote.tax_amount || 0,
      totalAmount: quote.total_amount,
      status: quote.status as Quote['status'],
      validUntil: quote.valid_until || undefined,
      notes: quote.notes || '',
      createdAt: quote.created_at || '',
      updatedAt: quote.updated_at || ''
    })) || [];
  },

  async createQuote(quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quote | null> {
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        quote_number: quoteData.quoteNumber,
        patient_id: quoteData.patientId,
        practitioner_id: quoteData.practitionerId || null,
        treatment_items: quoteData.treatmentItems as any,
        subtotal: quoteData.subtotal,
        discount_amount: quoteData.discountAmount,
        tax_amount: quoteData.taxAmount,
        total_amount: quoteData.totalAmount,
        status: quoteData.status,
        valid_until: quoteData.validUntil || null,
        notes: quoteData.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du devis:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      quoteNumber: data.quote_number,
      patientId: data.patient_id,
      practitionerId: data.practitioner_id || undefined,
      treatmentItems: Array.isArray(data.treatment_items) 
        ? (data.treatment_items as any[]).map((item: any) => ({
            soinId: item.soinId || '',
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            total: item.total || 0
          }))
        : [],
      subtotal: data.subtotal,
      discountAmount: data.discount_amount || 0,
      taxAmount: data.tax_amount || 0,
      totalAmount: data.total_amount,
      status: data.status as Quote['status'],
      validUntil: data.valid_until || undefined,
      notes: data.notes || '',
      createdAt: data.created_at || '',
      updatedAt: data.updated_at || ''
    };
  },

  async updateQuote(id: string, quoteData: Partial<Quote>): Promise<Quote | null> {
    const updateData: any = {};
    
    if (quoteData.quoteNumber) updateData.quote_number = quoteData.quoteNumber;
    if (quoteData.patientId) updateData.patient_id = quoteData.patientId;
    if (quoteData.practitionerId !== undefined) updateData.practitioner_id = quoteData.practitionerId || null;
    if (quoteData.treatmentItems) updateData.treatment_items = quoteData.treatmentItems as any;
    if (quoteData.subtotal !== undefined) updateData.subtotal = quoteData.subtotal;
    if (quoteData.discountAmount !== undefined) updateData.discount_amount = quoteData.discountAmount;
    if (quoteData.taxAmount !== undefined) updateData.tax_amount = quoteData.taxAmount;
    if (quoteData.totalAmount !== undefined) updateData.total_amount = quoteData.totalAmount;
    if (quoteData.status) updateData.status = quoteData.status;
    if (quoteData.validUntil !== undefined) updateData.valid_until = quoteData.validUntil || null;
    if (quoteData.notes !== undefined) updateData.notes = quoteData.notes;

    const { data, error } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du devis:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      quoteNumber: data.quote_number,
      patientId: data.patient_id,
      practitionerId: data.practitioner_id || undefined,
      treatmentItems: Array.isArray(data.treatment_items) 
        ? (data.treatment_items as any[]).map((item: any) => ({
            soinId: item.soinId || '',
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            total: item.total || 0
          }))
        : [],
      subtotal: data.subtotal,
      discountAmount: data.discount_amount || 0,
      taxAmount: data.tax_amount || 0,
      totalAmount: data.total_amount,
      status: data.status as Quote['status'],
      validUntil: data.valid_until || undefined,
      notes: data.notes || '',
      createdAt: data.created_at || '',
      updatedAt: data.updated_at || ''
    };
  },

  async generateQuoteNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Obtenir le dernier numéro de devis du jour
    const { data, error } = await supabase
      .from('quotes')
      .select('quote_number')
      .ilike('quote_number', `DEV-${year}${month}${day}-%`)
      .order('quote_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erreur lors de la génération du numéro de devis:', error);
    }

    let sequenceNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].quote_number;
      const lastSequence = parseInt(lastNumber.split('-')[2]) || 0;
      sequenceNumber = lastSequence + 1;
    }

    return `DEV-${year}${month}${day}-${String(sequenceNumber).padStart(4, '0')}`;
  }
};
