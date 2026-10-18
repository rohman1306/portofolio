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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      cash_balance: {
        Row: {
          amount: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_balance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          asal: string
          biaya: number
          catatan_insight: string
          created_at: string
          id: string
          kategori: string
          link: string
          nama: string
          penyedia: string
          rating: number | null
          status: string
          tanggal_beli: string
          urutan_beli: number | null
          user_id: string
        }
        Insert: {
          asal?: string
          biaya?: number
          catatan_insight?: string
          created_at?: string
          id?: string
          kategori?: string
          link?: string
          nama: string
          penyedia: string
          rating?: number | null
          status: string
          tanggal_beli: string
          urutan_beli?: number | null
          user_id: string
        }
        Update: {
          asal?: string
          biaya?: number
          catatan_insight?: string
          created_at?: string
          id?: string
          kategori?: string
          link?: string
          nama?: string
          penyedia?: string
          rating?: number | null
          status?: string
          tanggal_beli?: string
          urutan_beli?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          created_at: string
          id: string
          label: string
          storage_path: string
          trade_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string
          storage_path: string
          trade_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          storage_path?: string
          trade_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          deadline: string | null
          id: string
          kategori: string
          nama: string
          progress_saat_ini: number
          status: string
          target_nilai: number
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          id?: string
          kategori: string
          nama: string
          progress_saat_ini?: number
          status: string
          target_nilai: number
          user_id: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          id?: string
          kategori?: string
          nama?: string
          progress_saat_ini?: number
          status?: string
          target_nilai?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      holdings: {
        Row: {
          catatan: string
          created_at: string
          exchange: string
          harga_beli_rata2: number
          id: string
          jumlah_unit: number
          kategori: string
          nama_aset: string
          nilai_saat_ini: number
          tanggal_beli: string
          ticker: string
          updated_at: string
          user_id: string
        }
        Insert: {
          catatan?: string
          created_at?: string
          exchange?: string
          harga_beli_rata2: number
          id?: string
          jumlah_unit: number
          kategori: string
          nama_aset: string
          nilai_saat_ini: number
          tanggal_beli: string
          ticker: string
          updated_at?: string
          user_id: string
        }
        Update: {
          catatan?: string
          created_at?: string
          exchange?: string
          harga_beli_rata2?: number
          id?: string
          jumlah_unit?: number
          kategori?: string
          nama_aset?: string
          nilai_saat_ini?: number
          tanggal_beli?: string
          ticker?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email?: string
          id: string
          name?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          catatan: string
          created_at: string
          gambar: string[] | null
          harga_entry: number
          harga_exit: number | null
          id: string
          instrumen: string
          lot_size: number
          pnl: number | null
          stop_loss: number | null
          take_profit: number | null
          tanggal_entry: string
          tanggal_exit: string | null
          tipe_posisi: string
          updated_at: string
          user_id: string
        }
        Insert: {
          catatan?: string
          created_at?: string
          gambar?: string[] | null
          harga_entry: number
          harga_exit?: number | null
          id?: string
          instrumen: string
          lot_size: number
          pnl?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          tanggal_entry: string
          tanggal_exit?: string | null
          tipe_posisi: string
          updated_at?: string
          user_id: string
        }
        Update: {
          catatan?: string
          created_at?: string
          gambar?: string[] | null
          harga_entry?: number
          harga_exit?: number | null
          id?: string
          instrumen?: string
          lot_size?: number
          pnl?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          tanggal_entry?: string
          tanggal_exit?: string | null
          tipe_posisi?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          avg_price_after: number | null
          avg_price_after_currency: string | null
          avg_price_before: number | null
          created_at: string | null
          display_currency: string
          harga_per_unit: number
          harga_per_unit_currency: string
          holding_id: string
          id: string
          is_withdrawn: boolean | null
          jumlah_unit: number
          pnl: number | null
          pnl_percent: number | null
          tanggal: string
          total_display: number
          total_idr: number
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_price_after?: number | null
          avg_price_after_currency?: string | null
          avg_price_before?: number | null
          created_at?: string | null
          display_currency?: string
          harga_per_unit: number
          harga_per_unit_currency?: string
          holding_id: string
          id?: string
          is_withdrawn?: boolean | null
          jumlah_unit: number
          pnl?: number | null
          pnl_percent?: number | null
          tanggal: string
          total_display: number
          total_idr: number
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_price_after?: number | null
          avg_price_after_currency?: string | null
          avg_price_before?: number | null
          created_at?: string | null
          display_currency?: string
          harga_per_unit?: number
          harga_per_unit_currency?: string
          holding_id?: string
          id?: string
          is_withdrawn?: boolean | null
          jumlah_unit?: number
          pnl?: number | null
          pnl_percent?: number | null
          tanggal?: string
          total_display?: number
          total_idr?: number
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_holding_id_fkey"
            columns: ["holding_id"]
            isOneToOne: false
            referencedRelation: "holdings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
