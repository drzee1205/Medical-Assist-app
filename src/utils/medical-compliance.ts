import { supabase, isSupabaseEnabled } from '@/lib/supabase'

// Medical compliance utilities
export const medicalCompliance = {
  // Anonymize data for analytics (remove potential PHI)
  anonymizeForAnalytics: (message: string): string => {
    return message
      // Remove Social Security Numbers
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b\d{9}\b/g, '[SSN]')
      // Remove phone numbers
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
      .replace(/\(\d{3}\)\s?\d{3}[-.]?\d{4}/g, '[PHONE]')
      // Remove email addresses
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      // Remove potential names (basic pattern)
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]')
      // Remove dates of birth patterns
      .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[DATE]')
      .replace(/\b\d{1,2}-\d{1,2}-\d{4}\b/g, '[DATE]')
      // Remove medical record numbers (common patterns)
      .replace(/\bMRN:?\s*\d+/gi, '[MRN]')
      .replace(/\b\d{6,12}\b/g, '[ID]') // Generic long numbers
  },

  // Validate that messages don't contain obvious PHI
  validateMessage: (message: string): { isValid: boolean; warnings: string[] } => {
    const warnings: string[] = []
    
    // Check for SSN patterns
    if (/\b\d{3}-\d{2}-\d{4}\b/.test(message) || /\b\d{9}\b/.test(message)) {
      warnings.push('Message may contain Social Security Number')
    }
    
    // Check for phone numbers
    if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(message) || /\(\d{3}\)\s?\d{3}[-.]?\d{4}/.test(message)) {
      warnings.push('Message may contain phone number')
    }
    
    // Check for email addresses
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(message)) {
      warnings.push('Message may contain email address')
    }

    // Check for potential names (very basic)
    if (/\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(message)) {
      warnings.push('Message may contain personal names')
    }

    // Check for dates
    if (/\b\d{1,2}\/\d{1,2}\/\d{4}\b/.test(message) || /\b\d{1,2}-\d{1,2}-\d{4}\b/.test(message)) {
      warnings.push('Message may contain specific dates')
    }

    return {
      isValid: warnings.length === 0,
      warnings
    }
  },

  // Log usage analytics (anonymized)
  logUsage: async (
    userId: string | null,
    queryType: string,
    sessionId: string,
    responseQuality?: number
  ) => {
    if (!isSupabaseEnabled()) return

    try {
      await supabase!.from('usage_analytics').insert({
        user_id: userId, // Can be null for anonymous usage
        query_type: queryType,
        response_quality: responseQuality,
        session_id: sessionId
      })
    } catch (error) {
      console.error('Error logging usage analytics:', error)
    }
  },

  // Create audit log entry
  createAuditLog: async (
    action: string,
    details: {
      userId?: string
      conversationId?: string
      messageId?: string
      metadata?: any
    }
  ) => {
    // In production, this should go to a dedicated audit logging service
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      userAgent: navigator.userAgent,
      ip: 'client' // In production, log actual IP server-side
    }
    
    console.log('MEDICAL_AUDIT:', auditEntry)
    
    // Could also store in Supabase audit table if needed
    // await supabase.from('audit_logs').insert(auditEntry)
  },

  // Generate session ID for analytics
  generateSessionId: (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Classify medical query type
  classifyQueryType: (message: string): string => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('symptom') || lowerMessage.includes('feel') || 
        lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
      return 'symptoms'
    }
    
    if (lowerMessage.includes('medication') || lowerMessage.includes('drug') || 
        lowerMessage.includes('prescription') || lowerMessage.includes('pill')) {
      return 'medication'
    }
    
    if (lowerMessage.includes('treatment') || lowerMessage.includes('therapy') || 
        lowerMessage.includes('cure') || lowerMessage.includes('heal')) {
      return 'treatment'
    }
    
    if (lowerMessage.includes('diagnosis') || lowerMessage.includes('condition') || 
        lowerMessage.includes('disease') || lowerMessage.includes('disorder')) {
      return 'diagnosis'
    }
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || 
        lowerMessage.includes('911') || lowerMessage.includes('er')) {
      return 'emergency'
    }
    
    if (lowerMessage.includes('prevention') || lowerMessage.includes('avoid') || 
        lowerMessage.includes('protect') || lowerMessage.includes('vaccine')) {
      return 'prevention'
    }
    
    return 'general'
  }
}

// Data retention utilities
export const dataRetention = {
  // Delete old conversations (for privacy compliance)
  deleteOldConversations: async (userId: string, daysOld: number = 90) => {
    if (!isSupabaseEnabled()) return

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    try {
      await supabase!
        .from('medical_conversations')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', cutoffDate.toISOString())
    } catch (error) {
      console.error('Error deleting old conversations:', error)
    }
  },

  // Export user data (for GDPR compliance)
  exportUserData: async (userId: string) => {
    if (!isSupabaseEnabled()) return null

    try {
      const [profileResult, conversationsResult] = await Promise.all([
        supabase!.from('profiles').select('*').eq('id', userId).single(),
        supabase!.from('medical_conversations').select(`
          *,
          medical_messages (*)
        `).eq('user_id', userId)
      ])

      return {
        profile: profileResult.data,
        conversations: conversationsResult.data,
        exportDate: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error exporting user data:', error)
      return null
    }
  },

  // Delete all user data (for GDPR right to be forgotten)
  deleteAllUserData: async (userId: string) => {
    if (!isSupabaseEnabled()) return false

    try {
      // First get conversation IDs for this user
      const { data: conversations } = await supabase!
        .from('medical_conversations')
        .select('id')
        .eq('user_id', userId)
      
      const conversationIds = conversations?.map(c => c.id) || []
      
      // Delete in order due to foreign key constraints
      if (conversationIds.length > 0) {
        await supabase!.from('medical_messages').delete().in('conversation_id', conversationIds)
      }
      
      await supabase!.from('medical_conversations').delete().eq('user_id', userId)
      await supabase!.from('usage_analytics').delete().eq('user_id', userId)
      await supabase!.from('profiles').delete().eq('id', userId)
      
      return true
    } catch (error) {
      console.error('Error deleting user data:', error)
      return false
    }
  }
}