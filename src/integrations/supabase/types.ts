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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      behaviors: {
        Row: {
          action_description: string
          alignment_score: number | null
          created_at: string
          deputy_id: string
          id: string
          intent_id: string
          notes: string | null
          resources_used: number
          result_score: number | null
          time_spent: number
        }
        Insert: {
          action_description: string
          alignment_score?: number | null
          created_at?: string
          deputy_id: string
          id?: string
          intent_id: string
          notes?: string | null
          resources_used?: number
          result_score?: number | null
          time_spent?: number
        }
        Update: {
          action_description?: string
          alignment_score?: number | null
          created_at?: string
          deputy_id?: string
          id?: string
          intent_id?: string
          notes?: string | null
          resources_used?: number
          result_score?: number | null
          time_spent?: number
        }
        Relationships: [
          {
            foreignKeyName: "behaviors_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "strategic_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      bet_allocations: {
        Row: {
          bet_id: string
          coins: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          bet_id: string
          coins?: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          bet_id?: string
          coins?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bet_allocations_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "strategic_bets"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          auto_headhunting: boolean | null
          city: string | null
          created_at: string
          education_level: string | null
          experience_range: string | null
          id: string
          industry: string | null
          job_title: string | null
          name: string
          progress: number
          skills: string[] | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_headhunting?: boolean | null
          city?: string | null
          created_at?: string
          education_level?: string | null
          experience_range?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          name: string
          progress?: number
          skills?: string[] | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_headhunting?: boolean | null
          city?: string | null
          created_at?: string
          education_level?: string | null
          experience_range?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          name?: string
          progress?: number
          skills?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      candidates: {
        Row: {
          campaign_id: string
          candidate_temperature: string | null
          created_at: string
          education: string | null
          email: string | null
          experience: string | null
          green_flags: string[] | null
          id: string
          last_company: string | null
          layer_scores: Json | null
          location: string | null
          match_score: number | null
          name: string | null
          phone: string | null
          raw_data: Json | null
          recommendation: string | null
          red_flags: string[] | null
          skills: string | null
          status: string
          title: string | null
        }
        Insert: {
          campaign_id: string
          candidate_temperature?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          experience?: string | null
          green_flags?: string[] | null
          id?: string
          last_company?: string | null
          layer_scores?: Json | null
          location?: string | null
          match_score?: number | null
          name?: string | null
          phone?: string | null
          raw_data?: Json | null
          recommendation?: string | null
          red_flags?: string[] | null
          skills?: string | null
          status?: string
          title?: string | null
        }
        Update: {
          campaign_id?: string
          candidate_temperature?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          experience?: string | null
          green_flags?: string[] | null
          id?: string
          last_company?: string | null
          layer_scores?: Json | null
          location?: string | null
          match_score?: number | null
          name?: string | null
          phone?: string | null
          raw_data?: Json | null
          recommendation?: string | null
          red_flags?: string[] | null
          skills?: string | null
          status?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      compass_user_roles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["compass_role"]
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["compass_role"]
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["compass_role"]
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      decision_journals: {
        Row: {
          behavior_id: string
          created_at: string
          id: string
          rejected_options: string
          risk_prediction: string
          supporting_data: string
        }
        Insert: {
          behavior_id: string
          created_at?: string
          id?: string
          rejected_options: string
          risk_prediction: string
          supporting_data: string
        }
        Update: {
          behavior_id?: string
          created_at?: string
          id?: string
          rejected_options?: string
          risk_prediction?: string
          supporting_data?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_journals_behavior_id_fkey"
            columns: ["behavior_id"]
            isOneToOne: true
            referencedRelation: "behaviors"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          download_count: number
          file_path: string | null
          id: string
          is_active: boolean
          name: string
          payment_link: string | null
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          download_count?: number
          file_path?: string | null
          id?: string
          is_active?: boolean
          name: string
          payment_link?: string | null
          price?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          download_count?: number
          file_path?: string | null
          id?: string
          is_active?: boolean
          name?: string
          payment_link?: string | null
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      intent_assignments: {
        Row: {
          created_at: string
          id: string
          intent_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          intent_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          intent_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intent_assignments_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "strategic_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          title: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          title?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          title?: string | null
        }
        Relationships: []
      }
      scenario_responses: {
        Row: {
          answer: string
          created_at: string
          id: string
          scenario_id: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          scenario_id: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          scenario_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_responses_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          category: string
          ceo_answer: string | null
          ceo_id: string | null
          created_at: string
          id: string
          intent_id: string | null
          is_active: boolean
          option_a: string
          option_b: string
          option_c: string
          question: string
        }
        Insert: {
          category?: string
          ceo_answer?: string | null
          ceo_id?: string | null
          created_at?: string
          id?: string
          intent_id?: string | null
          is_active?: boolean
          option_a: string
          option_b: string
          option_c: string
          question: string
        }
        Update: {
          category?: string
          ceo_answer?: string | null
          ceo_id?: string | null
          created_at?: string
          id?: string
          intent_id?: string | null
          is_active?: boolean
          option_a?: string
          option_b?: string
          option_c?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "strategic_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      strategic_bets: {
        Row: {
          ceo_id: string
          created_at: string
          goal_description: string | null
          goal_title: string
          id: string
          year: number
        }
        Insert: {
          ceo_id: string
          created_at?: string
          goal_description?: string | null
          goal_title: string
          id?: string
          year?: number
        }
        Update: {
          ceo_id?: string
          created_at?: string
          goal_description?: string | null
          goal_title?: string
          id?: string
          year?: number
        }
        Relationships: []
      }
      strategic_intents: {
        Row: {
          ceo_id: string
          created_at: string
          description: string
          id: string
          status: string
          strategic_weight: number
          title: string
          tolerance_zone: number
          updated_at: string
        }
        Insert: {
          ceo_id: string
          created_at?: string
          description: string
          id?: string
          status?: string
          strategic_weight?: number
          title: string
          tolerance_zone?: number
          updated_at?: string
        }
        Update: {
          ceo_id?: string
          created_at?: string
          description?: string
          id?: string
          status?: string
          strategic_weight?: number
          title?: string
          tolerance_zone?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          credits: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          id: string
          product_id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          id?: string
          product_id: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          id?: string
          product_id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "digital_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      deduct_credits: { Args: { amount: number }; Returns: boolean }
      get_user_credits: { Args: never; Returns: number }
      has_compass_role: {
        Args: {
          _role: Database["public"]["Enums"]["compass_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_ceo: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      compass_role: "ceo" | "deputy" | "manager"
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
      app_role: ["admin", "moderator", "user"],
      compass_role: ["ceo", "deputy", "manager"],
    },
  },
} as const
