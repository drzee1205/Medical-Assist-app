import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { 
  PediatricCondition, 
  PediatricDrug, 
  PediatricTopic, 
  PediatricReference 
} from '@/lib/supabase'

interface SearchFilters {
  category?: string
  ageGroup?: string
  chapter?: string
  tags?: string[]
}

interface SearchResults {
  conditions: PediatricCondition[]
  drugs: PediatricDrug[]
  topics: PediatricTopic[]
  total: number
}

export function usePediatricKnowledge() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search across all pediatric knowledge
  const searchKnowledge = useCallback(async (
    query: string, 
    filters: SearchFilters = {},
    limit: number = 20
  ): Promise<SearchResults> => {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not available')
    }

    setLoading(true)
    setError(null)

    try {
      const searchTerm = `%${query.toLowerCase()}%`
      
      // Search conditions
      let conditionsQuery = supabase!
        .from('pediatric_conditions')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},symptoms.cs.{${query}}`)
        .limit(Math.ceil(limit / 3))

      if (filters.category) {
        conditionsQuery = conditionsQuery.eq('category', filters.category)
      }
      if (filters.ageGroup) {
        conditionsQuery = conditionsQuery.contains('age_groups', [filters.ageGroup])
      }
      if (filters.chapter) {
        conditionsQuery = conditionsQuery.eq('chapter', filters.chapter)
      }

      // Search drugs
      let drugsQuery = supabase!
        .from('pediatric_drugs')
        .select('*')
        .or(`name.ilike.${searchTerm},generic_name.ilike.${searchTerm},indications.cs.{${query}}`)
        .limit(Math.ceil(limit / 3))

      if (filters.category) {
        drugsQuery = drugsQuery.eq('category', filters.category)
      }

      // Search topics
      let topicsQuery = supabase!
        .from('pediatric_topics')
        .select('*')
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm},key_points.cs.{${query}}`)
        .limit(Math.ceil(limit / 3))

      if (filters.category) {
        topicsQuery = topicsQuery.eq('category', filters.category)
      }
      if (filters.chapter) {
        topicsQuery = topicsQuery.eq('chapter', filters.chapter)
      }
      if (filters.tags && filters.tags.length > 0) {
        topicsQuery = topicsQuery.overlaps('tags', filters.tags)
      }

      const [conditionsResult, drugsResult, topicsResult] = await Promise.all([
        conditionsQuery,
        drugsQuery,
        topicsQuery
      ])

      if (conditionsResult.error) throw conditionsResult.error
      if (drugsResult.error) throw drugsResult.error
      if (topicsResult.error) throw topicsResult.error

      const results: SearchResults = {
        conditions: conditionsResult.data || [],
        drugs: drugsResult.data || [],
        topics: topicsResult.data || [],
        total: (conditionsResult.data?.length || 0) + 
               (drugsResult.data?.length || 0) + 
               (topicsResult.data?.length || 0)
      }

      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Get specific condition by ID
  const getCondition = useCallback(async (id: string): Promise<PediatricCondition | null> => {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not available')
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase!
        .from('pediatric_conditions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get condition'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Get specific drug by ID
  const getDrug = useCallback(async (id: string): Promise<PediatricDrug | null> => {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not available')
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase!
        .from('pediatric_drugs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get drug'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Get conditions by category
  const getConditionsByCategory = useCallback(async (
    category: string, 
    limit: number = 50
  ): Promise<PediatricCondition[]> => {
    if (!isSupabaseEnabled()) {
      throw new Error('Supabase not available')
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase!
        .from('pediatric_conditions')
        .select('*')
        .eq('category', category)
        .order('title')
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get conditions'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Get related content for AI context
  const getRelatedContent = useCallback(async (
    query: string,
    maxResults: number = 5
  ): Promise<{
    conditions: PediatricCondition[]
    drugs: PediatricDrug[]
    topics: PediatricTopic[]
  }> => {
    if (!isSupabaseEnabled()) {
      return { conditions: [], drugs: [], topics: [] }
    }

    try {
      const results = await searchKnowledge(query, {}, maxResults)
      return {
        conditions: results.conditions.slice(0, 2),
        drugs: results.drugs.slice(0, 2),
        topics: results.topics.slice(0, 2)
      }
    } catch (err) {
      console.warn('Failed to get related content:', err)
      return { conditions: [], drugs: [], topics: [] }
    }
  }, [searchKnowledge])

  // Get all available categories
  const getCategories = useCallback(async (): Promise<{
    conditionCategories: string[]
    drugCategories: string[]
    topicCategories: string[]
  }> => {
    if (!isSupabaseEnabled()) {
      return { conditionCategories: [], drugCategories: [], topicCategories: [] }
    }

    try {
      const [conditionsResult, drugsResult, topicsResult] = await Promise.all([
        supabase!.from('pediatric_conditions').select('category').distinct(),
        supabase!.from('pediatric_drugs').select('category').distinct(),
        supabase!.from('pediatric_topics').select('category').distinct()
      ])

      return {
        conditionCategories: conditionsResult.data?.map(item => item.category) || [],
        drugCategories: drugsResult.data?.map(item => item.category) || [],
        topicCategories: topicsResult.data?.map(item => item.category) || []
      }
    } catch (err) {
      console.warn('Failed to get categories:', err)
      return { conditionCategories: [], drugCategories: [], topicCategories: [] }
    }
  }, [])

  return {
    loading,
    error,
    searchKnowledge,
    getCondition,
    getDrug,
    getConditionsByCategory,
    getRelatedContent,
    getCategories,
    isSupabaseEnabled: isSupabaseEnabled()
  }
}

