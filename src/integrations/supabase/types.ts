export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appareils: {
        Row: {
          created_at: string | null
          description: string | null
          icone: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          nom: string
          ordre: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icone?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          nom: string
          ordre?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icone?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          nom?: string
          ordre?: number | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          actual_consumption: Json | null
          consumed_products: Json | null
          consumption_variance: Json | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          patient_id: string
          status: string
          time: string
          treatment_id: string
        }
        Insert: {
          actual_consumption?: Json | null
          consumed_products?: Json | null
          consumption_variance?: Json | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          patient_id: string
          status?: string
          time: string
          treatment_id: string
        }
        Update: {
          actual_consumption?: Json | null
          consumed_products?: Json | null
          consumption_variance?: Json | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string
          time?: string
          treatment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      consumption_reports: {
        Row: {
          actual_quantity: number
          appointment_id: string | null
          cost_impact: number | null
          created_at: string | null
          expected_quantity: number
          id: string
          product_id: string | null
          report_date: string | null
          soin_id: string | null
          variance_percentage: number | null
          variance_quantity: number | null
        }
        Insert: {
          actual_quantity?: number
          appointment_id?: string | null
          cost_impact?: number | null
          created_at?: string | null
          expected_quantity?: number
          id?: string
          product_id?: string | null
          report_date?: string | null
          soin_id?: string | null
          variance_percentage?: number | null
          variance_quantity?: number | null
        }
        Update: {
          actual_quantity?: number
          appointment_id?: string | null
          cost_impact?: number | null
          created_at?: string | null
          expected_quantity?: number
          id?: string
          product_id?: string | null
          report_date?: string | null
          soin_id?: string | null
          variance_percentage?: number | null
          variance_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consumption_reports_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumption_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumption_reports_soin_id_fkey"
            columns: ["soin_id"]
            isOneToOne: false
            referencedRelation: "soins"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_analysis: {
        Row: {
          actual_cost: number | null
          analysis_period_end: string
          analysis_period_start: string
          cost_variance: number | null
          cost_variance_percentage: number | null
          created_at: string | null
          expected_cost: number | null
          id: string
          optimization_suggestions: Json | null
          profit_margin: number | null
          soin_id: string | null
          total_sessions: number | null
        }
        Insert: {
          actual_cost?: number | null
          analysis_period_end: string
          analysis_period_start: string
          cost_variance?: number | null
          cost_variance_percentage?: number | null
          created_at?: string | null
          expected_cost?: number | null
          id?: string
          optimization_suggestions?: Json | null
          profit_margin?: number | null
          soin_id?: string | null
          total_sessions?: number | null
        }
        Update: {
          actual_cost?: number | null
          analysis_period_end?: string
          analysis_period_start?: string
          cost_variance?: number | null
          cost_variance_percentage?: number | null
          created_at?: string | null
          expected_cost?: number | null
          id?: string
          optimization_suggestions?: Json | null
          profit_margin?: number | null
          soin_id?: string | null
          total_sessions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_analysis_soin_id_fkey"
            columns: ["soin_id"]
            isOneToOne: false
            referencedRelation: "soins"
            referencedColumns: ["id"]
          },
        ]
      }
      forfaits: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_modified_at: string | null
          last_modified_by: string | null
          nb_seances: number
          nom: string
          ordre: number | null
          prix_reduit: number
          prix_total: number
          soin_ids: string[] | null
          validite_mois: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_modified_at?: string | null
          last_modified_by?: string | null
          nb_seances?: number
          nom: string
          ordre?: number | null
          prix_reduit?: number
          prix_total?: number
          soin_ids?: string[] | null
          validite_mois?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_modified_at?: string | null
          last_modified_by?: string | null
          nb_seances?: number
          nom?: string
          ordre?: number | null
          prix_reduit?: number
          prix_total?: number
          soin_ids?: string[] | null
          validite_mois?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          paid_at: string | null
          patient_id: string
          payment_method: string
          status: string
          treatment_ids: string[]
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id: string
          paid_at?: string | null
          patient_id: string
          payment_method?: string
          status?: string
          treatment_ids?: string[]
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          patient_id?: string
          payment_method?: string
          status?: string
          treatment_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          contraindications: string[] | null
          created_at: string | null
          date_of_birth: string
          email: string
          first_name: string
          id: string
          last_name: string
          last_visit: string | null
          medical_history: string | null
          phone: string
          skin_type: string | null
        }
        Insert: {
          contraindications?: string[] | null
          created_at?: string | null
          date_of_birth: string
          email: string
          first_name: string
          id?: string
          last_name: string
          last_visit?: string | null
          medical_history?: string | null
          phone: string
          skin_type?: string | null
        }
        Update: {
          contraindications?: string[] | null
          created_at?: string | null
          date_of_birth?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          last_visit?: string | null
          medical_history?: string | null
          phone?: string
          skin_type?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          expiry_date: string | null
          id: string
          last_restocked: string
          min_quantity: number
          name: string
          quantity: number
          supplier: string | null
          unit_price: number
        }
        Insert: {
          category: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          last_restocked?: string
          min_quantity?: number
          name: string
          quantity?: number
          supplier?: string | null
          unit_price?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          last_restocked?: string
          min_quantity?: number
          name?: string
          quantity?: number
          supplier?: string | null
          unit_price?: number
        }
        Relationships: []
      }
      soins: {
        Row: {
          appareil_id: string
          conseils_post_traitement: string[] | null
          contre_indications: string[] | null
          created_at: string | null
          description: string | null
          duree: number
          expected_consumables: Json | null
          id: string
          is_active: boolean | null
          last_modified_at: string | null
          last_modified_by: string | null
          nom: string
          prix: number
          zone_id: string
        }
        Insert: {
          appareil_id: string
          conseils_post_traitement?: string[] | null
          contre_indications?: string[] | null
          created_at?: string | null
          description?: string | null
          duree?: number
          expected_consumables?: Json | null
          id?: string
          is_active?: boolean | null
          last_modified_at?: string | null
          last_modified_by?: string | null
          nom: string
          prix?: number
          zone_id: string
        }
        Update: {
          appareil_id?: string
          conseils_post_traitement?: string[] | null
          contre_indications?: string[] | null
          created_at?: string | null
          description?: string | null
          duree?: number
          expected_consumables?: Json | null
          id?: string
          is_active?: boolean | null
          last_modified_at?: string | null
          last_modified_by?: string | null
          nom?: string
          prix?: number
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "soins_appareil_id_fkey"
            columns: ["appareil_id"]
            isOneToOne: false
            referencedRelation: "appareils"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soins_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          current_value: number | null
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          product_id: string | null
          severity: string
          suggested_action: string | null
          threshold_value: number | null
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          current_value?: number | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          product_id?: string | null
          severity?: string
          suggested_action?: string | null
          threshold_value?: number | null
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          current_value?: number | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          product_id?: string | null
          severity?: string
          suggested_action?: string | null
          threshold_value?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      treatments: {
        Row: {
          aftercare: string[] | null
          category: string
          contraindications: string[] | null
          created_at: string | null
          description: string | null
          duration: number
          id: string
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          aftercare?: string[] | null
          category: string
          contraindications?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean | null
          name: string
          price?: number
        }
        Update: {
          aftercare?: string[] | null
          category?: string
          contraindications?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          nom: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_consumption_variance: {
        Args: { appointment_id_param: string }
        Returns: Json
      }
      generate_smart_alerts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_id_by_email: {
        Args: { email_address: string }
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: { required_role: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
