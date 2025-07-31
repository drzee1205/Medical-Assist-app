import type { PediatricCondition, PediatricDrug, PediatricTopic } from '@/lib/supabase'

interface PediatricContext {
  conditions: PediatricCondition[]
  drugs: PediatricDrug[]
  topics: PediatricTopic[]
}

// Extract medical keywords from user query
export function extractMedicalKeywords(query: string): string[] {
  const medicalTerms = [
    // Common pediatric conditions
    'fever', 'cough', 'rash', 'vomiting', 'diarrhea', 'seizure', 'asthma', 'pneumonia',
    'bronchitis', 'otitis', 'strep', 'flu', 'cold', 'allergies', 'eczema', 'constipation',
    'dehydration', 'jaundice', 'anemia', 'diabetes', 'obesity', 'growth', 'development',
    
    // Age groups
    'newborn', 'infant', 'baby', 'toddler', 'child', 'children', 'adolescent', 'teenager',
    'pediatric', 'neonatal',
    
    // Symptoms
    'pain', 'headache', 'stomach', 'abdominal', 'chest', 'breathing', 'difficulty',
    'swelling', 'bleeding', 'bruising', 'fatigue', 'weakness', 'irritability',
    
    // Body systems
    'respiratory', 'cardiac', 'gastrointestinal', 'neurological', 'dermatological',
    'musculoskeletal', 'endocrine', 'immunological'
  ]

  const queryLower = query.toLowerCase()
  return medicalTerms.filter(term => queryLower.includes(term))
}

// Determine if query is pediatric-specific
export function isPediatricQuery(query: string): boolean {
  const pediatricIndicators = [
    'child', 'children', 'baby', 'infant', 'newborn', 'toddler', 'kid', 'kids',
    'pediatric', 'paediatric', 'adolescent', 'teenager', 'teen', 'neonatal',
    'year old', 'years old', 'month old', 'months old', 'week old', 'weeks old'
  ]

  const queryLower = query.toLowerCase()
  return pediatricIndicators.some(indicator => queryLower.includes(indicator))
}

// Format pediatric context for AI prompt
export function formatPediatricContext(context: PediatricContext): string {
  if (!context.conditions.length && !context.drugs.length && !context.topics.length) {
    return ''
  }

  let contextString = '\n\n**PEDIATRIC KNOWLEDGE BASE CONTEXT:**\n'

  // Add relevant conditions
  if (context.conditions.length > 0) {
    contextString += '\n**Relevant Pediatric Conditions:**\n'
    context.conditions.forEach(condition => {
      contextString += `- **${condition.title}** (${condition.category})\n`
      contextString += `  Description: ${condition.description}\n`
      contextString += `  Age Groups: ${condition.age_groups.join(', ')}\n`
      contextString += `  Key Symptoms: ${condition.symptoms.slice(0, 3).join(', ')}\n`
      contextString += `  Treatment Overview: ${condition.treatment.substring(0, 200)}...\n\n`
    })
  }

  // Add relevant drugs
  if (context.drugs.length > 0) {
    contextString += '\n**Relevant Pediatric Medications:**\n'
    context.drugs.forEach(drug => {
      contextString += `- **${drug.name}** ${drug.generic_name ? `(${drug.generic_name})` : ''}\n`
      contextString += `  Category: ${drug.category}\n`
      contextString += `  Pediatric Dosage: ${drug.dosage_pediatric}\n`
      contextString += `  Indications: ${drug.indications.slice(0, 2).join(', ')}\n`
      if (drug.warnings.length > 0) {
        contextString += `  Key Warnings: ${drug.warnings.slice(0, 2).join(', ')}\n`
      }
      contextString += '\n'
    })
  }

  // Add relevant topics
  if (context.topics.length > 0) {
    contextString += '\n**Relevant Pediatric Topics:**\n'
    context.topics.forEach(topic => {
      contextString += `- **${topic.title}** (${topic.category})\n`
      contextString += `  Key Points: ${topic.key_points.slice(0, 3).join('; ')}\n`
      contextString += `  Content Preview: ${topic.content.substring(0, 150)}...\n\n`
    })
  }

  contextString += '\n**IMPORTANT:** Use this pediatric knowledge to provide more accurate, age-appropriate medical information. Always emphasize consulting with pediatric healthcare professionals.\n'

  return contextString
}

// Enhanced medical prompt for pediatric queries
export function createPediatricPrompt(userMessage: string, context?: PediatricContext): string {
  const basePrompt = `You are MedAssist AI, a specialized medical information assistant with access to Nelson's Textbook of Pediatrics knowledge base. You provide educational medical information with a focus on pediatric care.

CRITICAL GUIDELINES:
- Provide accurate, evidence-based pediatric medical information
- Always emphasize age-appropriate considerations
- Include specific pediatric dosing, symptoms, and treatment approaches when relevant
- Clearly state when immediate medical attention is needed
- Reference pediatric-specific guidelines and protocols
- Always recommend consulting with pediatric healthcare professionals
- Never provide definitive diagnoses - only educational information
- Be especially cautious with medication recommendations for children

PEDIATRIC-SPECIFIC CONSIDERATIONS:
- Age-appropriate symptom recognition
- Weight-based dosing calculations
- Developmental considerations
- Age-specific normal values and ranges
- Pediatric emergency warning signs
- Growth and development factors
- Family-centered care approaches

${context ? formatPediatricContext(context) : ''}

RESPONSE FORMAT:
- Start with age-appropriate medical information
- Include relevant pediatric considerations
- Provide clear warning signs that require immediate medical attention
- End with strong recommendation to consult pediatric healthcare providers
- Use clear, accessible language appropriate for parents/caregivers

User question: ${userMessage}`

  return basePrompt
}

// Create enhanced prompt with pediatric context
export function enhancePromptWithPediatricKnowledge(
  originalPrompt: string,
  userMessage: string,
  context?: PediatricContext
): string {
  // If it's clearly a pediatric query, use specialized prompt
  if (isPediatricQuery(userMessage)) {
    return createPediatricPrompt(userMessage, context)
  }

  // Otherwise, enhance the original prompt with context if available
  if (context && (context.conditions.length > 0 || context.drugs.length > 0 || context.topics.length > 0)) {
    return originalPrompt + formatPediatricContext(context)
  }

  return originalPrompt
}

// Quick pediatric assessment questions
export const pediatricQuickPrompts = [
  "What are normal fever ranges for different pediatric age groups?",
  "When should I be concerned about my child's cough?",
  "What are the signs of dehydration in infants and children?",
  "How do I know if my child's rash needs medical attention?",
  "What are age-appropriate developmental milestones?",
  "When should my child see a pediatrician for stomach pain?",
  "What are the warning signs of serious illness in children?",
  "How do pediatric medication dosages differ from adults?"
]

// Age group classifications
export const ageGroups = [
  { key: 'newborn', label: 'Newborn (0-28 days)', ageRange: '0-28 days' },
  { key: 'infant', label: 'Infant (1-12 months)', ageRange: '1-12 months' },
  { key: 'toddler', label: 'Toddler (1-3 years)', ageRange: '1-3 years' },
  { key: 'preschool', label: 'Preschool (3-5 years)', ageRange: '3-5 years' },
  { key: 'school', label: 'School Age (5-12 years)', ageRange: '5-12 years' },
  { key: 'adolescent', label: 'Adolescent (12-18 years)', ageRange: '12-18 years' }
]

