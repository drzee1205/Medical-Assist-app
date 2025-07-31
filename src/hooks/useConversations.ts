import { useState, useEffect } from 'react'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { MedicalConversation, MedicalMessage } from '@/lib/supabase'

export function useConversations(userId: string | null) {
  const [conversations, setConversations] = useState<MedicalConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseEnabled() || !userId) {
      setLoading(false)
      return
    }

    fetchConversations()
  }, [userId])

  const fetchConversations = async () => {
    if (!isSupabaseEnabled() || !userId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase!
        .from('medical_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError

      setConversations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (title: string) => {
    if (!isSupabaseEnabled() || !userId) return null

    try {
      const { data, error: createError } = await supabase!
        .from('medical_conversations')
        .insert({
          user_id: userId,
          title: title.slice(0, 100) || 'New Medical Consultation'
        })
        .select()
        .single()

      if (createError) throw createError

      setConversations(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating conversation:', err)
      throw err
    }
  }

  const updateConversation = async (id: string, updates: { title?: string }) => {
    if (!isSupabaseEnabled()) return null

    try {
      const { data, error: updateError } = await supabase!
        .from('medical_conversations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setConversations(prev =>
        prev.map(conv => conv.id === id ? data : conv)
      )
      return data
    } catch (err) {
      console.error('Error updating conversation:', err)
      throw err
    }
  }

  const deleteConversation = async (id: string) => {
    if (!isSupabaseEnabled()) return false

    try {
      const { error: deleteError } = await supabase!
        .from('medical_conversations')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setConversations(prev => prev.filter(conv => conv.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting conversation:', err)
      throw err
    }
  }

  return {
    conversations,
    loading,
    error,
    createConversation,
    updateConversation,
    deleteConversation,
    refreshConversations: fetchConversations,
    isSupabaseEnabled: isSupabaseEnabled()
  }
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<MedicalMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseEnabled() || !conversationId) {
      setLoading(false)
      return
    }

    fetchMessages()
  }, [conversationId])

  const fetchMessages = async () => {
    if (!isSupabaseEnabled() || !conversationId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase!
        .from('medical_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      setMessages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveMessage = async (
    role: 'user' | 'assistant',
    content: string,
    metadata?: MedicalMessage['metadata']
  ) => {
    if (!isSupabaseEnabled() || !conversationId) return null

    try {
      const { data, error: saveError } = await supabase!
        .from('medical_messages')
        .insert({
          conversation_id: conversationId,
          role,
          content: content.slice(0, 10000), // Limit content length
          metadata
        })
        .select()
        .single()

      if (saveError) throw saveError

      setMessages(prev => [...prev, data])
      return data
    } catch (err) {
      console.error('Error saving message:', err)
      throw err
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!isSupabaseEnabled()) return false

    try {
      const { error: deleteError } = await supabase!
        .from('medical_messages')
        .delete()
        .eq('id', messageId)

      if (deleteError) throw deleteError

      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      return true
    } catch (err) {
      console.error('Error deleting message:', err)
      throw err
    }
  }

  return {
    messages,
    loading,
    error,
    saveMessage,
    deleteMessage,
    refreshMessages: fetchMessages,
    isSupabaseEnabled: isSupabaseEnabled()
  }
}