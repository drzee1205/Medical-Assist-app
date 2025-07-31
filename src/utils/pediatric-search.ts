import type { PediatricCondition, PediatricDrug, PediatricTopic } from '@/lib/supabase'

// Search result types
export interface PediatricSearchResult {
  id: string
  title: string
  type: 'condition' | 'drug' | 'topic'
  category: string
  description: string
  relevanceScore: number
  ageGroups?: string[]
  chapter?: string
}

// Advanced search filters
export interface AdvancedSearchFilters {
  categories?: string[]
  ageGroups?: string[]
  chapters?: string[]
  tags?: string[]
  contentType?: ('condition' | 'drug' | 'topic')[]
  sortBy?: 'relevance' | 'title' | 'category' | 'chapter'
  sortOrder?: 'asc' | 'desc'
}

// Convert database results to unified search results
export function convertToSearchResults(
  conditions: PediatricCondition[],
  drugs: PediatricDrug[],
  topics: PediatricTopic[],
  query: string
): PediatricSearchResult[] {
  const results: PediatricSearchResult[] = []

  // Convert conditions
  conditions.forEach(condition => {
    results.push({
      id: condition.id,
      title: condition.title,
      type: 'condition',
      category: condition.category,
      description: condition.description,
      relevanceScore: calculateRelevanceScore(query, condition.title, condition.description),
      ageGroups: condition.age_groups,
      chapter: condition.chapter
    })
  })

  // Convert drugs
  drugs.forEach(drug => {
    results.push({
      id: drug.id,
      title: drug.name,
      type: 'drug',
      category: drug.category,
      description: `${drug.generic_name ? `(${drug.generic_name}) ` : ''}${drug.indications.slice(0, 2).join(', ')}`,
      relevanceScore: calculateRelevanceScore(query, drug.name, drug.indications.join(' ')),
      chapter: 'Medications'
    })
  })

  // Convert topics
  topics.forEach(topic => {
    results.push({
      id: topic.id,
      title: topic.title,
      type: 'topic',
      category: topic.category,
      description: topic.content.substring(0, 200) + '...',
      relevanceScore: calculateRelevanceScore(query, topic.title, topic.content),
      chapter: topic.chapter
    })
  })

  return results
}

// Calculate relevance score for search results
function calculateRelevanceScore(query: string, title: string, content: string): number {
  const queryLower = query.toLowerCase()
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()

  let score = 0

  // Exact title match gets highest score
  if (titleLower === queryLower) {
    score += 100
  } else if (titleLower.includes(queryLower)) {
    score += 50
  }

  // Title word matches
  const queryWords = queryLower.split(' ').filter(word => word.length > 2)
  queryWords.forEach(word => {
    if (titleLower.includes(word)) {
      score += 20
    }
    if (contentLower.includes(word)) {
      score += 5
    }
  })

  // Boost score for medical terms
  const medicalTerms = ['pediatric', 'child', 'infant', 'newborn', 'adolescent']
  medicalTerms.forEach(term => {
    if (queryLower.includes(term) && (titleLower.includes(term) || contentLower.includes(term))) {
      score += 15
    }
  })

  return score
}

// Sort search results
export function sortSearchResults(
  results: PediatricSearchResult[],
  sortBy: 'relevance' | 'title' | 'category' | 'chapter' = 'relevance',
  sortOrder: 'asc' | 'desc' = 'desc'
): PediatricSearchResult[] {
  return [...results].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'relevance':
        comparison = a.relevanceScore - b.relevanceScore
        break
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'category':
        comparison = a.category.localeCompare(b.category)
        break
      case 'chapter':
        comparison = (a.chapter || '').localeCompare(b.chapter || '')
        break
    }

    return sortOrder === 'desc' ? -comparison : comparison
  })
}

// Filter search results
export function filterSearchResults(
  results: PediatricSearchResult[],
  filters: AdvancedSearchFilters
): PediatricSearchResult[] {
  return results.filter(result => {
    // Filter by categories
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(result.category)) {
        return false
      }
    }

    // Filter by age groups
    if (filters.ageGroups && filters.ageGroups.length > 0 && result.ageGroups) {
      const hasMatchingAgeGroup = filters.ageGroups.some(ageGroup =>
        result.ageGroups!.includes(ageGroup)
      )
      if (!hasMatchingAgeGroup) {
        return false
      }
    }

    // Filter by chapters
    if (filters.chapters && filters.chapters.length > 0) {
      if (!result.chapter || !filters.chapters.includes(result.chapter)) {
        return false
      }
    }

    // Filter by content type
    if (filters.contentType && filters.contentType.length > 0) {
      if (!filters.contentType.includes(result.type)) {
        return false
      }
    }

    return true
  })
}

// Generate search suggestions based on partial input
export function generateSearchSuggestions(input: string): string[] {
  const commonPediatricTerms = [
    'fever in children',
    'pediatric asthma',
    'infant feeding',
    'childhood vaccines',
    'growth charts',
    'developmental milestones',
    'newborn care',
    'pediatric emergencies',
    'child nutrition',
    'adolescent health',
    'pediatric medications',
    'childhood infections',
    'infant sleep',
    'toddler behavior',
    'school health',
    'pediatric allergies',
    'child safety',
    'immunizations',
    'pediatric dermatology',
    'childhood obesity'
  ]

  const inputLower = input.toLowerCase()
  return commonPediatricTerms
    .filter(term => term.includes(inputLower))
    .slice(0, 8)
}

// Extract age information from query
export function extractAgeFromQuery(query: string): string | null {
  const agePatterns = [
    /(\d+)\s*(year|yr)s?\s*old/i,
    /(\d+)\s*(month|mo)s?\s*old/i,
    /(\d+)\s*(week|wk)s?\s*old/i,
    /(\d+)\s*(day)s?\s*old/i,
    /(newborn|infant|baby|toddler|child|adolescent|teenager)/i
  ]

  for (const pattern of agePatterns) {
    const match = query.match(pattern)
    if (match) {
      return match[0]
    }
  }

  return null
}

// Map age to appropriate age group
export function mapAgeToGroup(ageString: string): string[] {
  const ageLower = ageString.toLowerCase()
  
  if (ageLower.includes('newborn') || ageLower.includes('0') && ageLower.includes('day')) {
    return ['newborn']
  }
  if (ageLower.includes('infant') || ageLower.includes('baby')) {
    return ['infant']
  }
  if (ageLower.includes('toddler')) {
    return ['toddler']
  }
  if (ageLower.includes('child') || ageLower.includes('kid')) {
    return ['preschool', 'school']
  }
  if (ageLower.includes('adolescent') || ageLower.includes('teenager') || ageLower.includes('teen')) {
    return ['adolescent']
  }

  // Parse numeric ages
  const yearMatch = ageString.match(/(\d+)\s*year/i)
  if (yearMatch) {
    const years = parseInt(yearMatch[1])
    if (years < 1) return ['infant']
    if (years <= 3) return ['toddler']
    if (years <= 5) return ['preschool']
    if (years <= 12) return ['school']
    return ['adolescent']
  }

  const monthMatch = ageString.match(/(\d+)\s*month/i)
  if (monthMatch) {
    const months = parseInt(monthMatch[1])
    if (months <= 12) return ['infant']
    if (months <= 36) return ['toddler']
    return ['preschool']
  }

  return []
}

// Highlight search terms in text
export function highlightSearchTerms(text: string, searchTerms: string[]): string {
  let highlightedText = text
  
  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi')
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>')
  })
  
  return highlightedText
}

// Get popular search categories
export const popularCategories = [
  'Infectious Diseases',
  'Respiratory Disorders',
  'Gastrointestinal Disorders',
  'Neurological Disorders',
  'Cardiovascular Disorders',
  'Endocrine Disorders',
  'Dermatology',
  'Emergency Medicine',
  'Nutrition',
  'Growth and Development',
  'Immunizations',
  'Behavioral Health'
]

// Get common pediatric age groups for filtering
export const commonAgeGroups = [
  { key: 'newborn', label: 'Newborn (0-28 days)' },
  { key: 'infant', label: 'Infant (1-12 months)' },
  { key: 'toddler', label: 'Toddler (1-3 years)' },
  { key: 'preschool', label: 'Preschool (3-5 years)' },
  { key: 'school', label: 'School Age (5-12 years)' },
  { key: 'adolescent', label: 'Adolescent (12-18 years)' }
]

