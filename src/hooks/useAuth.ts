import { useState, useEffect } from 'react'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    if (!isSupabaseEnabled()) {
      setAuthState({ user: null, loading: false, isAuthenticated: false })
      return
    }

    // Get initial session
    supabase!.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
      }
      setAuthState({
        user: session?.user ?? null,
        loading: false,
        isAuthenticated: !!session?.user
      })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event)
        setAuthState({
          user: session?.user ?? null,
          loading: false,
          isAuthenticated: !!session?.user
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (!isSupabaseEnabled()) {
      throw new Error('Authentication not available')
    }

    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.fullName || '',
          medical_license: metadata?.medicalLicense || '',
          organization: metadata?.organization || ''
        }
      }
    })

    if (error) throw error
    return data
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseEnabled()) {
      throw new Error('Authentication not available')
    }

    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (!isSupabaseEnabled()) {
      return { error: null }
    }

    const { error } = await supabase!.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseEnabled()) {
      throw new Error('Authentication not available')
    }

    const { error } = await supabase!.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isSupabaseEnabled: isSupabaseEnabled()
  }
}