import { createClient } from '@supabase/supabase-js'

// Database Types
export interface Profile {
  id: string
  email: string
  full_name: string
  medical_license?: string
  organization?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface MedicalConversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface MedicalMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: {
    model?: string
    tokens?: number
    response_time?: number
    error?: string
  }
  created_at: string
}

export interface UsageAnalytics {
  id: string
  user_id?: string
  query_type: string
  response_quality?: number
  session_id: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      medical_conversations: {
        Row: MedicalConversation
        Insert: Omit<MedicalConversation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MedicalConversation, 'id' | 'created_at' | 'updated_at'>>
      }
      medical_messages: {
        Row: MedicalMessage
        Insert: Omit<MedicalMessage, 'id' | 'created_at'>
        Update: Partial<Omit<MedicalMessage, 'id' | 'created_at'>>
      }
      usage_analytics: {
        Row: UsageAnalytics
        Insert: Omit<UsageAnalytics, 'id' | 'created_at'>
        Update: Partial<Omit<UsageAnalytics, 'id' | 'created_at'>>
      }
    }
  }
}

// Environment validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Running in local-only mode.')
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'medassist-ai-mobile'
        }
      }
    })
  : null

// Helper functions
export const isSupabaseEnabled = () => !!supabase

export const getSupabaseErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}