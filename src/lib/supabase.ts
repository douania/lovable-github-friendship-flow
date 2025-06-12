import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes. Veuillez configurer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      appareils: {
        Row: {
          id: string;
          nom: string;
          description: string;
          icone: string;
          image_url: string;
          is_active: boolean;
          ordre: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          description?: string;
          icone?: string;
          image_url?: string;
          is_active?: boolean;
          ordre?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          description?: string;
          icone?: string;
          image_url?: string;
          is_active?: boolean;
          ordre?: number;
          created_at?: string;
        };
      };
      zones: {
        Row: {
          id: string;
          nom: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          description?: string;
          created_at?: string;
        };
      };
      soins: {
        Row: {
          id: string;
          appareil_id: string;
          zone_id: string;
          nom: string;
          description: string;
          duree: number;
          prix: number;
          contre_indications: string[];
          conseils_post_traitement: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          appareil_id: string;
          zone_id: string;
          nom: string;
          description?: string;
          duree?: number;
          prix?: number;
          contre_indications?: string[];
          conseils_post_traitement?: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          appareil_id?: string;
          zone_id?: string;
          nom?: string;
          description?: string;
          duree?: number;
          prix?: number;
          contre_indications?: string[];
          conseils_post_traitement?: string[];
          is_active?: boolean;
          created_at?: string;
        };
      };
      forfaits: {
        Row: {
          id: string;
          soin_id: string;
          nb_seances: number;
          prix_total: number;
          prix_unitaire: number;
          remarque: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          soin_id: string;
          nb_seances: number;
          prix_total: number;
          prix_unitaire: number;
          remarque?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          soin_id?: string;
          nb_seances?: number;
          prix_total?: number;
          prix_unitaire?: number;
          remarque?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          date_of_birth: string;
          skin_type: string;
          medical_history: string;
          contraindications: string[];
          created_at: string;
          last_visit: string | null;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          date_of_birth: string;
          skin_type: string;
          medical_history: string;
          contraindications: string[];
          created_at?: string;
          last_visit?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          date_of_birth?: string;
          skin_type?: string;
          medical_history?: string;
          contraindications?: string[];
          created_at?: string;
          last_visit?: string | null;
        };
      };
      treatments: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          duration: number;
          category: string;
          contraindications: string[];
          aftercare: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          duration: number;
          category: string;
          contraindications: string[];
          aftercare: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          duration?: number;
          category?: string;
          contraindications?: string[];
          aftercare?: string[];
          is_active?: boolean;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          treatment_id: string;
          date: string;
          time: string;
          status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
          notes: string | null;
          consumed_products: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          treatment_id: string;
          date: string;
          time: string;
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
          notes?: string | null;
          consumed_products?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          treatment_id?: string;
          date?: string;
          time?: string;
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
          notes?: string | null;
          consumed_products?: any;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          patient_id: string;
          treatment_ids: string[];
          amount: number;
          status: 'paid' | 'partial' | 'unpaid';
          payment_method: 'cash' | 'mobile_money' | 'card' | 'bank_transfer';
          created_at: string;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          patient_id: string;
          treatment_ids: string[];
          amount: number;
          status?: 'paid' | 'partial' | 'unpaid';
          payment_method?: 'cash' | 'mobile_money' | 'card' | 'bank_transfer';
          created_at?: string;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          patient_id?: string;
          treatment_ids?: string[];
          amount?: number;
          status?: 'paid' | 'partial' | 'unpaid';
          payment_method?: 'cash' | 'mobile_money' | 'card' | 'bank_transfer';
          created_at?: string;
          paid_at?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          quantity: number;
          min_quantity: number;
          unit_price: number;
          supplier: string | null;
          expiry_date: string | null;
          last_restocked: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          quantity: number;
          min_quantity: number;
          unit_price: number;
          supplier?: string | null;
          expiry_date?: string | null;
          last_restocked: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          quantity?: number;
          min_quantity?: number;
          unit_price?: number;
          supplier?: string | null;
          expiry_date?: string | null;
          last_restocked?: string;
          created_at?: string;
        };
      };
      appareils: {
        Row: {
          id: string;
          nom: string;
          description: string;
          image_url: string;
          is_active: boolean;
          ordre: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          description?: string;
          image_url?: string;
          is_active?: boolean;
          ordre?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          description?: string;
          image_url?: string;
          is_active?: boolean;
          ordre?: number;
          created_at?: string;
        };
      };
      zones: {
        Row: {
          id: string;
          nom: string;
          description: string;
          is_active: boolean;
          ordre: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          description?: string;
          is_active?: boolean;
          ordre?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          description?: string;
          is_active?: boolean;
          ordre?: number;
          created_at?: string;
        };
      };
      soins: {
        Row: {
          id: string;
          nom: string;
          description: string;
          appareil_id: string | null;
          zone_id: string | null;
          duree: number;
          prix: number;
          is_active: boolean;
          ordre: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          description?: string;
          appareil_id?: string | null;
          zone_id?: string | null;
          duree?: number;
          prix?: number;
          is_active?: boolean;
          ordre?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          description?: string;
          appareil_id?: string | null;
          zone_id?: string | null;
          duree?: number;
          prix?: number;
          is_active?: boolean;
          ordre?: number;
          created_at?: string;
        };
      };
      forfaits: {
        Row: {
          id: string;
          nom: string;
          description: string;
          soin_ids: string[];
          prix_total: number;
          prix_reduit: number;
          nb_seances: number;
          validite_mois: number;
          is_active: boolean;
          ordre: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          description?: string;
          soin_ids?: string[];
          prix_total?: number;
          prix_reduit?: number;
          nb_seances?: number;
          validite_mois?: number;
          is_active?: boolean;
          ordre?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          description?: string;
          soin_ids?: string[];
          prix_total?: number;
          prix_reduit?: number;
          nb_seances?: number;
          validite_mois?: number;
          is_active?: boolean;
          ordre?: number;
          created_at?: string;
        };
      };
    };
  };
}