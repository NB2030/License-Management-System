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
      admin_access_codes: {
        Row: {
          access_code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          total_uses: number | null
        }
        Insert: {
          access_code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          total_uses?: number | null
        }
        Update: {
          access_code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          total_uses?: number | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          access_code_used: string | null
          created_at: string | null
          id: string
          password_changed: boolean | null
          user_id: string
        }
        Insert: {
          access_code_used?: string | null
          created_at?: string | null
          id?: string
          password_changed?: boolean | null
          user_id: string
        }
        Update: {
          access_code_used?: string | null
          created_at?: string | null
          id?: string
          password_changed?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          app_key: string
          app_secret: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          app_key: string
          app_secret: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          app_key?: string
          app_secret?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      kofi_orders: {
        Row: {
          amount: string
          created_at: string | null
          currency: string | null
          email: string
          from_name: string | null
          id: string
          is_first_subscription_payment: boolean | null
          is_public: boolean | null
          is_subscription_payment: boolean | null
          kofi_transaction_id: string | null
          license_id: string | null
          message: string | null
          message_id: string
          processed: boolean | null
          shipping: Json | null
          shop_items: Json | null
          tier_name: string | null
          timestamp: string
          type: string
          url: string | null
          user_id: string | null
          verification_token: string
        }
        Insert: {
          amount: string
          created_at?: string | null
          currency?: string | null
          email: string
          from_name?: string | null
          id?: string
          is_first_subscription_payment?: boolean | null
          is_public?: boolean | null
          is_subscription_payment?: boolean | null
          kofi_transaction_id?: string | null
          license_id?: string | null
          message?: string | null
          message_id: string
          processed?: boolean | null
          shipping?: Json | null
          shop_items?: Json | null
          tier_name?: string | null
          timestamp: string
          type: string
          url?: string | null
          user_id?: string | null
          verification_token: string
        }
        Update: {
          amount?: string
          created_at?: string | null
          currency?: string | null
          email?: string
          from_name?: string | null
          id?: string
          is_first_subscription_payment?: boolean | null
          is_public?: boolean | null
          is_subscription_payment?: boolean | null
          kofi_transaction_id?: string | null
          license_id?: string | null
          message?: string | null
          message_id?: string
          processed?: boolean | null
          shipping?: Json | null
          shop_items?: Json | null
          tier_name?: string | null
          timestamp?: string
          type?: string
          url?: string | null
          user_id?: string | null
          verification_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "kofi_orders_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          application_id: string | null
          created_at: string | null
          created_by: string | null
          current_activations: number
          duration_days: number
          id: string
          is_active: boolean | null
          license_key: string
          max_activations: number
          notes: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_activations?: number
          duration_days?: number
          id?: string
          is_active?: boolean | null
          license_key: string
          max_activations?: number
          notes?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_activations?: number
          duration_days?: number
          id?: string
          is_active?: boolean | null
          license_key?: string
          max_activations?: number
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_tiers: {
        Row: {
          amount: number
          application_id: string | null
          created_at: string | null
          days_per_dollar: number | null
          duration_days: number
          id: string
          is_active: boolean | null
          is_flexible_pricing: boolean | null
          name: string
          product_identifier: string | null
          tier_type: Database["public"]["Enums"]["pricing_tier_type"]
        }
        Insert: {
          amount: number
          application_id?: string | null
          created_at?: string | null
          days_per_dollar?: number | null
          duration_days: number
          id?: string
          is_active?: boolean | null
          is_flexible_pricing?: boolean | null
          name: string
          product_identifier?: string | null
          tier_type?: Database["public"]["Enums"]["pricing_tier_type"]
        }
        Update: {
          amount?: number
          application_id?: string | null
          created_at?: string | null
          days_per_dollar?: number | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          is_flexible_pricing?: boolean | null
          name?: string
          product_identifier?: string | null
          tier_type?: Database["public"]["Enums"]["pricing_tier_type"]
        }
        Relationships: [
          {
            foreignKeyName: "pricing_tiers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_licenses: {
        Row: {
          activated_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          last_validated: string | null
          license_id: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          last_validated?: string | null
          license_id: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_validated?: string | null
          license_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_licenses_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_licenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_account: {
        Args: { user_uuid: string }
        Returns: Json
      }
      generate_app_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_app_secret: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      validate_app_credentials: {
        Args: { p_app_key: string; p_app_secret: string }
        Returns: {
          application_id: string
          application_name: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      pricing_tier_type: "donation" | "product"
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
      pricing_tier_type: ["donation", "product"],
    },
  },
} as const
