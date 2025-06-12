import { supabase } from '../lib/supabase';
import { Invoice } from '../types';

// Fonction pour convertir les données de la DB vers le type Invoice
const mapDbInvoiceToInvoice = (dbInvoice: any): Invoice => ({
  id: dbInvoice.id,
  patientId: dbInvoice.patient_id,
  treatmentIds: dbInvoice.treatment_ids || [],
  amount: dbInvoice.amount,
  status: dbInvoice.status,
  paymentMethod: dbInvoice.payment_method,
  createdAt: dbInvoice.created_at,
  paidAt: dbInvoice.paid_at
});

// Fonction pour convertir le type Invoice vers les données de la DB
const mapInvoiceToDbInvoice = (invoice: Omit<Invoice, 'id'>) => ({
  patient_id: invoice.patientId,
  treatment_ids: invoice.treatmentIds,
  amount: invoice.amount,
  status: invoice.status,
  payment_method: invoice.paymentMethod,
  created_at: invoice.createdAt,
  paid_at: invoice.paidAt || null
});

export const invoiceService = {
  // Récupérer toutes les factures
  async getAll(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des factures:', error);
        throw error;
      }

      return data?.map(mapDbInvoiceToInvoice) || [];
    } catch (error) {
      console.error('Erreur dans getAll invoices:', error);
      throw error;
    }
  },

  // Récupérer les factures par statut
  async getByStatus(status: Invoice['status']): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des factures par statut:', error);
        throw error;
      }

      return data?.map(mapDbInvoiceToInvoice) || [];
    } catch (error) {
      console.error('Erreur dans getByStatus invoices:', error);
      throw error;
    }
  },

  // Récupérer les factures d'un patient
  async getByPatient(patientId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des factures du patient:', error);
        throw error;
      }

      return data?.map(mapDbInvoiceToInvoice) || [];
    } catch (error) {
      console.error('Erreur dans getByPatient invoices:', error);
      throw error;
    }
  },

  // Récupérer une facture par ID
  async getById(id: string): Promise<Invoice | null> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erreur lors de la récupération de la facture:', error);
        throw error;
      }

      return data ? mapDbInvoiceToInvoice(data) : null;
    } catch (error) {
      console.error('Erreur dans getById invoice:', error);
      throw error;
    }
  },

  // Créer une nouvelle facture
  async create(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      const dbInvoice = mapInvoiceToDbInvoice(invoiceData);
      
      // Générer un ID personnalisé pour la facture
      const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
      
      const { data, error } = await supabase
        .from('invoices')
        .insert([{ ...dbInvoice, id: invoiceId }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la facture:', error);
        throw error;
      }

      return mapDbInvoiceToInvoice(data);
    } catch (error) {
      console.error('Erreur dans create invoice:', error);
      throw error;
    }
  },

  // Mettre à jour une facture
  async update(id: string, invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      const dbInvoice = mapInvoiceToDbInvoice(invoiceData);
      
      const { data, error } = await supabase
        .from('invoices')
        .update(dbInvoice)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de la facture:', error);
        throw error;
      }

      return mapDbInvoiceToInvoice(data);
    } catch (error) {
      console.error('Erreur dans update invoice:', error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une facture
  async updateStatus(id: string, status: Invoice['status']): Promise<Invoice> {
    try {
      const updateData: any = { status };
      
      // Si la facture est marquée comme payée, ajouter la date de paiement
      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du statut de la facture:', error);
        throw error;
      }

      return mapDbInvoiceToInvoice(data);
    } catch (error) {
      console.error('Erreur dans updateStatus invoice:', error);
      throw error;
    }
  },

  // Supprimer une facture
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de la facture:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans delete invoice:', error);
      throw error;
    }
  },

  // Calculer les statistiques de revenus
  async getRevenueStats(): Promise<{
    totalRevenue: number;
    paidRevenue: number;
    pendingRevenue: number;
    monthlyRevenue: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('amount, status, created_at');

      if (error) {
        console.error('Erreur lors du calcul des statistiques:', error);
        throw error;
      }

      const invoices = data || [];
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const stats = invoices.reduce((acc, invoice) => {
        const invoiceDate = new Date(invoice.created_at);
        const isCurrentMonth = invoiceDate.getMonth() === currentMonth && 
                              invoiceDate.getFullYear() === currentYear;

        acc.totalRevenue += invoice.amount;
        
        if (invoice.status === 'paid') {
          acc.paidRevenue += invoice.amount;
          if (isCurrentMonth) {
            acc.monthlyRevenue += invoice.amount;
          }
        } else {
          acc.pendingRevenue += invoice.amount;
        }

        return acc;
      }, {
        totalRevenue: 0,
        paidRevenue: 0,
        pendingRevenue: 0,
        monthlyRevenue: 0
      });

      return stats;
    } catch (error) {
      console.error('Erreur dans getRevenueStats:', error);
      throw error;
    }
  }
};