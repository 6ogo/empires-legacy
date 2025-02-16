
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string
          status: 'upcoming' | 'signups' | 'verification' | 'in_progress' | 'completed'
          stage: 'country' | 'regional' | 'continental' | 'world'
          region_id: string
          start_time: string
          signup_start_time: string
          verification_start_time: string
          max_players: number
          current_players: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          status?: 'upcoming' | 'signups' | 'verification' | 'in_progress' | 'completed'
          stage: 'country' | 'regional' | 'continental' | 'world'
          region_id: string
          start_time: string
          signup_start_time: string
          verification_start_time: string
          max_players: number
          current_players?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status?: 'upcoming' | 'signups' | 'verification' | 'in_progress' | 'completed'
          stage?: 'country' | 'regional' | 'continental' | 'world'
          region_id?: string
          start_time?: string
          signup_start_time?: string
          verification_start_time?: string
          max_players?: number
          current_players?: number
          updated_at?: string
        }
      }
      tournament_players: {
        Row: {
          id: string
          tournament_id: string
          user_id: string
          status: string
          signup_time: string
          verification_time: string | null
          eliminated: boolean
          position: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          user_id: string
          status: string
          signup_time: string
          verification_time?: string | null
          eliminated?: boolean
          position?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          tournament_id?: string
          user_id?: string
          status?: string
          signup_time?: string
          verification_time?: string | null
          eliminated?: boolean
          position?: number | null
          updated_at?: string
        }
      }
    }
  }
}
