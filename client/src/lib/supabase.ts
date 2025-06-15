import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pezchazchhnmygpdgzma.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: 'free' | 'active' | 'canceled' | 'past_due'
          cards_generated: number
          games_played: number
          total_score: number
        }
        Insert: {
          id?: string
          email: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'free' | 'active' | 'canceled' | 'past_due'
          cards_generated?: number
          games_played?: number
          total_score?: number
        }
        Update: {
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'free' | 'active' | 'canceled' | 'past_due'
          cards_generated?: number
          games_played?: number
          total_score?: number
        }
      }
      father_cards: {
        Row: {
          id: string
          user_id: string
          dad_name: string
          dad_info: any
          card_content: any
          created_at: string
          view_count: number
        }
        Insert: {
          id?: string
          user_id: string
          dad_name: string
          dad_info: any
          card_content: any
          view_count?: number
        }
        Update: {
          dad_name?: string
          dad_info?: any
          card_content?: any
          view_count?: number
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          game_type: 'emoji-match' | 'emoji-memory' | 'trivia' | 'catch-ball'
          score: number
          duration_seconds: number | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_type: 'emoji-match' | 'emoji-memory' | 'trivia' | 'catch-ball'
          score?: number
          duration_seconds?: number | null
          completed?: boolean
        }
        Update: {
          score?: number
          duration_seconds?: number | null
          completed?: boolean
        }
      }
      trivia_questions: {
        Row: {
          id: string
          category: string
          question: string
          correct_answer: string
          incorrect_answers: string[]
          difficulty: 'easy' | 'medium' | 'hard'
          created_at: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data?: any
        }
      }
    }
    Functions: {
      get_random_trivia: {
        Args: { category_filter?: string }
        Returns: {
          id: string
          category: string
          question: string
          correct_answer: string
          incorrect_answers: string[]
          difficulty: string
        }[]
      }
    }
  }
}