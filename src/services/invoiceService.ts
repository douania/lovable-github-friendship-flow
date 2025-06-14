
import { supabase } from '../lib/supabase';
import { Invoice } from '../types';

export const invoiceService = {
  async getAll(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
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
      return data || [];
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
      return data || [];
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
      return data || null;
    } catch (error) {
      console.error('Error fetching invoice by ID:', error);
      throw error;
    }
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          patient_id: invoiceData.patientId,
          treatment_ids: invoiceData.treatmentIds,
          amount: invoiceData.amount,
          status: invoiceData.status,
          payment_method: invoiceData.paymentMethod,
          created_at: invoiceData.createdAt,
          paid_at: invoiceData.paidAt
        }])
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        patientId: data.patient_id,
        treatmentIds: data.treatment_ids,
        amount: data.amount,
        status: data.status,
        paymentMethod: data.payment_method,
        createdAt: data.created_at,
        paidAt: data.paid_at
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
          paid_at: invoiceData.paidAt
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        patientId: data.patient_id,
        treatmentIds: data.treatment_ids,
        amount: data.amount,
        status: data.status,
        paymentMethod: data.payment_method,
        createdAt: data.created_at,
        paidAt: data.paid_at
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
  }
};
