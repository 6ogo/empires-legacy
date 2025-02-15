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
      achievements: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: number
          points: number
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: number
          points?: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: number
          points?: number
          title?: string
        }
        Relationships: []
      }
      combat_history: {
        Row: {
          action: string
          attacker: string | null
          damage_dealt: number
          defender: string | null
          game_id: number | null
          id: string
          result: string
          territory_from: string
          territory_to: string
          timestamp: string | null
          units_lost: number
        }
        Insert: {
          action: string
          attacker?: string | null
          damage_dealt: number
          defender?: string | null
          game_id?: number | null
          id?: string
          result: string
          territory_from: string
          territory_to: string
          timestamp?: string | null
          units_lost: number
        }
        Update: {
          action?: string
          attacker?: string | null
          damage_dealt?: number
          defender?: string | null
          game_id?: number | null
          id?: string
          result?: string
          territory_from?: string
          territory_to?: string
          timestamp?: string | null
          units_lost?: number
        }
        Relationships: [
          {
            foreignKeyName: "combat_history_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_stats: {
        Row: {
          created_at: string
          game_id: number
          id: string
          rank: number
          resources_collected: Json
          score: number
          territories_conquered: number
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: number
          id?: string
          rank: number
          resources_collected: Json
          score: number
          territories_conquered: number
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: number
          id?: string
          rank?: number
          resources_collected?: Json
          score?: number
          territories_conquered?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_game"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_stats_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          chat_messages: Json[] | null
          created_at: string
          current_player: string
          end_time: string | null
          game_status: string
          game_summary: Json | null
          has_expanded_this_turn: boolean | null
          has_recruited_this_turn: boolean | null
          id: number
          joined_players: number
          last_action_timestamp: string | null
          last_message_timestamp: string | null
          max_players: number
          num_players: number
          phase: string
          players_info: Json[] | null
          room_id: string
          state: Json
          winner_id: string | null
        }
        Insert: {
          chat_messages?: Json[] | null
          created_at?: string
          current_player: string
          end_time?: string | null
          game_status?: string
          game_summary?: Json | null
          has_expanded_this_turn?: boolean | null
          has_recruited_this_turn?: boolean | null
          id?: number
          joined_players?: number
          last_action_timestamp?: string | null
          last_message_timestamp?: string | null
          max_players?: number
          num_players?: number
          phase: string
          players_info?: Json[] | null
          room_id?: string
          state: Json
          winner_id?: string | null
        }
        Update: {
          chat_messages?: Json[] | null
          created_at?: string
          current_player?: string
          end_time?: string | null
          game_status?: string
          game_summary?: Json | null
          has_expanded_this_turn?: boolean | null
          has_recruited_this_turn?: boolean | null
          id?: number
          joined_players?: number
          last_action_timestamp?: string | null
          last_message_timestamp?: string | null
          max_players?: number
          num_players?: number
          phase?: string
          players_info?: Json[] | null
          room_id?: string
          state?: Json
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_credentials: {
        Row: {
          created_at: string
          email: string
          id: number
          last_used_at: string | null
          password: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          last_used_at?: string | null
          password: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          last_used_at?: string | null
          password?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: Json[] | null
          avatar_url: string | null
          created_at: string
          domination_wins: number | null
          economic_wins: number | null
          email_verified: boolean | null
          id: string
          is_anonymous: boolean | null
          is_guest: boolean | null
          last_login: string | null
          last_username_change: string | null
          level: number | null
          preferences: Json | null
          total_games_played: number | null
          total_gametime: number | null
          total_wins: number | null
          turnstile_verified: boolean | null
          username: string | null
          verified: boolean | null
          xp: number | null
        }
        Insert: {
          achievements?: Json[] | null
          avatar_url?: string | null
          created_at?: string
          domination_wins?: number | null
          economic_wins?: number | null
          email_verified?: boolean | null
          id: string
          is_anonymous?: boolean | null
          is_guest?: boolean | null
          last_login?: string | null
          last_username_change?: string | null
          level?: number | null
          preferences?: Json | null
          total_games_played?: number | null
          total_gametime?: number | null
          total_wins?: number | null
          turnstile_verified?: boolean | null
          username?: string | null
          verified?: boolean | null
          xp?: number | null
        }
        Update: {
          achievements?: Json[] | null
          avatar_url?: string | null
          created_at?: string
          domination_wins?: number | null
          economic_wins?: number | null
          email_verified?: boolean | null
          id?: string
          is_anonymous?: boolean | null
          is_guest?: boolean | null
          last_login?: string | null
          last_username_change?: string | null
          level?: number | null
          preferences?: Json | null
          total_games_played?: number | null
          total_gametime?: number | null
          total_wins?: number | null
          turnstile_verified?: boolean | null
          username?: string | null
          verified?: boolean | null
          xp?: number | null
        }
        Relationships: []
      }
      unit_states: {
        Row: {
          created_at: string | null
          current_damage: number
          current_health: number
          game_id: number | null
          id: string
          max_damage: number
          max_health: number
          needs_restoration: boolean | null
          territory_id: string
          unit_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_damage: number
          current_health: number
          game_id?: number | null
          id?: string
          max_damage: number
          max_health: number
          needs_restoration?: boolean | null
          territory_id: string
          unit_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_damage?: number
          current_health?: number
          game_id?: number | null
          id?: string
          max_damage?: number
          max_health?: number
          needs_restoration?: boolean | null
          territory_id?: string
          unit_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_states_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: number | null
          earned_at: string | null
          id: string
          progress: number | null
          user_id: string | null
        }
        Insert: {
          achievement_id?: number | null
          earned_at?: string | null
          id?: string
          progress?: number | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: number | null
          earned_at?: string | null
          id?: string
          progress?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_profane: {
        Args: {
          text_to_check: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
