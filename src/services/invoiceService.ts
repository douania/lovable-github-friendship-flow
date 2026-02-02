
import { supabase } from '../integrations/supabase/client';
import { Invoice } from '../types';

export const invoiceService = {
  async generateInvoiceNumber(): Promise<string> {
    try {
      const currentYear = new Date().getFullYear();
      
      const { data, error } = await supabase
        .from('invoices')
        .select('id')
        .like('id', `FAC-${currentYear}-%`)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = parseInt(data[0].id.split('-')[2]);
        nextNumber = lastNumber + 1;
      }
      
      return `FAC-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      throw error;
    }
  },

  async getAll(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(invoice => ({
        id: invoice.id,
        patientId: invoice.patient_id,
        treatmentIds: invoice.treatment_ids || [],
        amount: invoice.amount,
        status: invoice.status as Invoice['status'],
        paymentMethod: invoice.payment_method as Invoice['paymentMethod'],
        quoteId: invoice.quote_id || undefined,
        createdAt: invoice.created_at || '',
        paidAt: invoice.paid_at || undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  async getAllInvoices(): Promise<Invoice[]> {
    return this.getAll();
  },

  async getByStatus(status: 'paid' | 'partial' | 'unpaid'): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(invoice => ({
        id: invoice.id,
        patientId: invoice.patient_id,
        treatmentIds: invoice.treatment_ids || [],
        amount: invoice.amount,
        status: invoice.status as Invoice['status'],
        paymentMethod: invoice.payment_method as Invoice['paymentMethod'],
        createdAt: invoice.created_at || '',
        paidAt: invoice.paid_at || undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching invoices by status:', error);
      throw error;
    }
  },

  async getByPatient(patientId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(invoice => ({
        id: invoice.id,
        patientId: invoice.patient_id,
        treatmentIds: invoice.treatment_ids || [],
        amount: invoice.amount,
        status: invoice.status as Invoice['status'],
        paymentMethod: invoice.payment_method as Invoice['paymentMethod'],
        createdAt: invoice.created_at || '',
        paidAt: invoice.paid_at || undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching invoices by patient:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Invoice | null> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        patientId: data.patient_id,
        treatmentIds: data.treatment_ids || [],
        amount: data.amount,
        status: data.status as Invoice['status'],
        paymentMethod: data.payment_method as Invoice['paymentMethod'],
        createdAt: data.created_at || '',
        paidAt: data.paid_at || undefined
      };
    } catch (error) {
      console.error('Error fetching invoice by ID:', error);
      throw error;
    }
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      const invoiceNumber = await this.generateInvoiceNumber();
      
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          id: invoiceNumber,
          patient_id: invoiceData.patientId,
          treatment_ids: invoiceData.treatmentIds,
          amount: invoiceData.amount,
          status: invoiceData.status,
          payment_method: invoiceData.paymentMethod,
          quote_id: invoiceData.quoteId || null,
          paid_at: invoiceData.paidAt || null
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        patientId: data.patient_id,
        treatmentIds: data.treatment_ids || [],
        amount: data.amount,
        status: data.status as Invoice['status'],
        paymentMethod: data.payment_method as Invoice['paymentMethod'],
        quoteId: data.quote_id || undefined,
        createdAt: data.created_at || '',
        paidAt: data.paid_at || undefined
      };
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  async create(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    return this.createInvoice(invoiceData);
  },

  async updateInvoice(id: string, invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          patient_id: invoiceData.patientId,
          treatment_ids: invoiceData.treatmentIds,
          amount: invoiceData.amount,
          status: invoiceData.status,
          payment_method: invoiceData.paymentMethod,
          paid_at: invoiceData.paidAt || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        patientId: data.patient_id,
        treatmentIds: data.treatment_ids || [],
        amount: data.amount,
        status: data.status as Invoice['status'],
        paymentMethod: data.payment_method as Invoice['paymentMethod'],
        createdAt: data.created_at || '',
        paidAt: data.paid_at || undefined
      };
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  async update(id: string, invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    return this.updateInvoice(id, invoiceData);
  },

  async deleteInvoice(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    return this.deleteInvoice(id);
  },

  async getTotalRevenue(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'paid');

      if (error) throw error;
      return data?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0;
    } catch (error) {
      console.error('Error calculating total revenue:', error);
      throw error;
    }
  },

  async getMonthlyRevenue(): Promise<number> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'paid')
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;
      return data?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0;
    } catch (error) {
      console.error('Error calculating monthly revenue:', error);
      throw error;
    }
  },

  // Phase 3B: Créer une facture à partir d'un devis accepté
  async createFromQuote(quoteId: string): Promise<Invoice> {
    try {
      // 1. Récupérer le devis
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .maybeSingle();
      
      if (quoteError) throw quoteError;
      if (!quote) throw new Error('Devis introuvable');
      if (quote.status !== 'accepted') {
        const error = new Error('QUOTE_NOT_ACCEPTED');
        throw error;
      }
      
      // 2. Créer la facture avec référence au devis
      // NOTE CTO: treatment_items utilise treatmentId comme clé normalisée.
      // Fallback soinId maintenu pour rétrocompatibilité données existantes.
      // TODO Phase 4: Migrer toutes les données vers treatmentId uniquement.
      const treatmentItems = quote.treatment_items as Array<{ treatmentId?: string; soinId?: string }>;
      const treatmentIds = treatmentItems?.map((item) => {
        const id = item.treatmentId || item.soinId;
        if (!id) {
          console.warn('treatment_items contient un item sans treatmentId ni soinId:', item);
        }
        return id;
      }).filter((id): id is string => !!id) || [];
      
      const invoiceData: Omit<Invoice, 'id'> = {
        patientId: quote.patient_id,
        treatmentIds,
        amount: quote.total_amount,
        status: 'unpaid',
        paymentMethod: 'cash',
        quoteId: quoteId,
        createdAt: new Date().toISOString()
      };
      
      return this.createInvoice(invoiceData);
    } catch (error) {
      console.error('Error creating invoice from quote:', error);
      throw error;
    }
  }
};
