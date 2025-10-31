export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          acquisition_date: string | null
          acquisition_value: number | null
          created_at: string | null
          id: string
          identifier: string | null
          maintenance_history: Json | null
          model_year: string | null
          name: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          acquisition_date?: string | null
          acquisition_value?: number | null
          created_at?: string | null
          id?: string
          identifier?: string | null
          maintenance_history?: Json | null
          model_year?: string | null
          name: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          acquisition_date?: string | null
          acquisition_value?: number | null
          created_at?: string | null
          id?: string
          identifier?: string | null
          maintenance_history?: Json | null
          model_year?: string | null
          name?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cash_movements: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          payment_method: string | null
          proof_url: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          proof_url?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          proof_url?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          document: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          address: string | null
          admission_date: string | null
          cpf: string
          created_at: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          pis: string | null
          position: string
          rg: string | null
          salary: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          cpf: string
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          pis?: string | null
          position: string
          rg?: string | null
          salary?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          cpf?: string
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          pis?: string | null
          position?: string
          rg?: string | null
          salary?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          created_by: string | null
          date: string
          description: string
          id: string
          notes: string | null
          payment_method: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description: string
          id?: string
          notes?: string | null
          payment_method?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string | null
          document_url: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          supplier_id: string | null
          supplier_name: string | null
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          location: string | null
          material_name: string
          minimum_quantity: number | null
          notes: string | null
          quantity: number | null
          supplier: string | null
          unit: string | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          material_name: string
          minimum_quantity?: number | null
          notes?: string | null
          quantity?: number | null
          supplier?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          material_name?: string
          minimum_quantity?: number | null
          notes?: string | null
          quantity?: number | null
          supplier?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      production_orders: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          order_name: string
          product_id: string | null
          product_name: string | null
          quantity_to_produce: number | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          order_name: string
          product_id?: string | null
          product_name?: string | null
          quantity_to_produce?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          order_name?: string
          product_id?: string | null
          product_name?: string | null
          quantity_to_produce?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          barcode: string | null
          category: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          image_url_2: string | null
          name: string
          price: number
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          barcode?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          image_url_2?: string | null
          name: string
          price: number
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          barcode?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          image_url_2?: string | null
          name?: string
          price?: number
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          discount: number | null
          id: string
          items: Json
          notes: string | null
          payment_method: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          discount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: string | null
          total_amount: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          discount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: string | null
          total_amount?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          client_name: string | null
          created_at: string | null
          hourly_rate: number | null
          hours_worked: number | null
          id: string
          machine_name: string | null
          notes: string | null
          service_date: string | null
          service_name: string
          service_type: string | null
          status: string | null
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          client_name?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          hours_worked?: number | null
          id?: string
          machine_name?: string | null
          notes?: string | null
          service_date?: string | null
          service_name: string
          service_type?: string | null
          status?: string | null
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          client_name?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          hours_worked?: number | null
          id?: string
          machine_name?: string | null
          notes?: string | null
          service_date?: string | null
          service_name?: string
          service_type?: string | null
          status?: string | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          cep: string | null
          city: string | null
          cnpj: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          inscricao_estadual: string | null
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          inscricao_estadual?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          inscricao_estadual?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
