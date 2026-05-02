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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          visitor_name?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_items: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["curriculum_category"]
          created_at: string
          description: string | null
          id: string
          title: string
          url: string | null
        }
        Insert: {
          active?: boolean
          category?: Database["public"]["Enums"]["curriculum_category"]
          created_at?: string
          description?: string | null
          id?: string
          title: string
          url?: string | null
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["curriculum_category"]
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      curriculum_reads: {
        Row: {
          created_at: string
          id: string
          item_id: string
          member_id: string
          points_awarded: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          member_id: string
          points_awarded?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          member_id?: string
          points_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_reads_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "curriculum_items"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_entries: {
        Row: {
          amount_naira: number
          created_at: string
          description: string
          id: string
          kind: Database["public"]["Enums"]["finance_kind"]
          occurred_on: string
          source_or_payee: string | null
        }
        Insert: {
          amount_naira?: number
          created_at?: string
          description: string
          id?: string
          kind: Database["public"]["Enums"]["finance_kind"]
          occurred_on?: string
          source_or_payee?: string | null
        }
        Update: {
          amount_naira?: number
          created_at?: string
          description?: string
          id?: string
          kind?: Database["public"]["Enums"]["finance_kind"]
          occurred_on?: string
          source_or_payee?: string | null
        }
        Relationships: []
      }
      member_signup_log: {
        Row: {
          age_group: string
          created_at: string
          error_message: string | null
          full_name: string
          gender: string
          has_pvc: string
          id: string
          lga: string
          member_id: string | null
          phone: string
          reason: string | null
          state: string
          succeeded: boolean
          user_agent: string | null
        }
        Insert: {
          age_group: string
          created_at?: string
          error_message?: string | null
          full_name: string
          gender: string
          has_pvc: string
          id?: string
          lga: string
          member_id?: string | null
          phone: string
          reason?: string | null
          state: string
          succeeded?: boolean
          user_agent?: string | null
        }
        Update: {
          age_group?: string
          created_at?: string
          error_message?: string | null
          full_name?: string
          gender?: string
          has_pvc?: string
          id?: string
          lga?: string
          member_id?: string | null
          phone?: string
          reason?: string | null
          state?: string
          succeeded?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          age_group: string
          created_at: string
          full_name: string
          gender: string
          has_pvc: string
          id: string
          lga: string
          phone: string
          reason: string | null
          state: string
        }
        Insert: {
          age_group: string
          created_at?: string
          full_name: string
          gender: string
          has_pvc: string
          id?: string
          lga: string
          phone: string
          reason?: string | null
          state: string
        }
        Update: {
          age_group?: string
          created_at?: string
          full_name?: string
          gender?: string
          has_pvc?: string
          id?: string
          lga?: string
          phone?: string
          reason?: string | null
          state?: string
        }
        Relationships: []
      }
      social_clicks: {
        Row: {
          created_at: string
          id: string
          member_id: string
          points_awarded: number
          post_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          points_awarded?: number
          post_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          points_awarded?: number
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_clicks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          active: boolean
          created_at: string
          id: string
          platform: Database["public"]["Enums"]["social_platform"]
          points: number
          title: string | null
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          platform: Database["public"]["Enums"]["social_platform"]
          points?: number
          title?: string | null
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["social_platform"]
          points?: number
          title?: string | null
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      curriculum_category:
        | "leadership"
        | "politics"
        | "governance"
        | "life"
        | "civic_education"
      finance_kind: "income" | "expenditure"
      social_platform: "x" | "instagram" | "facebook" | "youtube"
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
      curriculum_category: [
        "leadership",
        "politics",
        "governance",
        "life",
        "civic_education",
      ],
      finance_kind: ["income", "expenditure"],
      social_platform: ["x", "instagram", "facebook", "youtube"],
    },
  },
} as const
