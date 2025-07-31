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

// Nelson's Book of Pediatrics Knowledge Base Types
export interface PediatricCondition {
  id: string
  title: string
  category: string
  subcategory?: string
  description: string
  symptoms: string[]
  diagnosis: string
  treatment: string
  complications?: string[]
  prognosis?: string
  age_groups: string[] // e.g., ['newborn', 'infant', 'toddler', 'child', 'adolescent']
  icd_codes?: string[]
  references: string[]
  chapter: string
  page_number?: number
  created_at: string
  updated_at: string
}

export interface PediatricDrug {
  id: string
  name: string
  generic_name?: string
  category: string
  indications: string[]
  contraindications: string[]
  dosage_pediatric: string
  dosage_by_age: {
    age_group: string
    dosage: string
    route: string
    frequency: string
  }[]
  side_effects: string[]
  warnings: string[]
  interactions?: string[]
  monitoring?: string[]
  references: string[]
  created_at: string
  updated_at: string
}

export interface PediatricTopic {
  id: string
  title: string
  category: string
  content: string
  key_points: string[]
  related_conditions: string[] // IDs of related conditions
  related_drugs: string[] // IDs of related drugs
  chapter: string
  section: string
  page_number?: number
  tags: string[]
  references: string[]
  created_at: string
  updated_at: string
}

export interface PediatricReference {
  id: string
  title: string
  authors: string[]
  journal?: string
  year: number
  doi?: string
  pmid?: string
  url?: string
  citation: string
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
      pediatric_conditions: {
        Row: PediatricCondition
        Insert: Omit<PediatricCondition, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PediatricCondition, 'id' | 'created_at' | 'updated_at'>>
      }
      pediatric_drugs: {
        Row: PediatricDrug
        Insert: Omit<PediatricDrug, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PediatricDrug, 'id' | 'created_at' | 'updated_at'>>
      }
      pediatric_topics: {
        Row: PediatricTopic
        Insert: Omit<PediatricTopic, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PediatricTopic, 'id' | 'created_at' | 'updated_at'>>
      }
      pediatric_references: {
        Row: PediatricReference
        Insert: Omit<PediatricReference, 'id' | 'created_at'>
        Update: Partial<Omit<PediatricReference, 'id' | 'created_at'>>
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
