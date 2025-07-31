# 🏥 Nelson's Book of Pediatrics - Supabase Setup Guide

This guide will help you set up the pediatric knowledge base in your Supabase database.

## 📋 Prerequisites

- Supabase project created at [supabase.com](https://supabase.com)
- Your Supabase credentials from your project dashboard

## 🚀 Setup Steps

### Step 1: Create Database Schema

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `supabase-schema.sql`
6. Click **Run** to execute the schema creation

This will create:
- ✅ `pediatric_conditions` table
- ✅ `pediatric_drugs` table  
- ✅ `pediatric_topics` table
- ✅ `pediatric_references` table
- ✅ Indexes for optimal search performance
- ✅ Row Level Security policies
- ✅ Full-text search capabilities

### Step 2: Add Sample Data

1. In the SQL Editor, create another **New Query**
2. Copy and paste the entire contents of `sample-pediatric-data.sql`
3. Click **Run** to populate with sample Nelson's Textbook data

This will add:
- 🏥 4 sample pediatric conditions (Otitis Media, Febrile Seizures, Bronchiolitis, Gastroenteritis)
- 💊 3 sample pediatric drugs (Acetaminophen, Amoxicillin, Ibuprofen)
- 📚 3 sample topics (Growth Charts, Immunizations, Developmental Milestones)
- 📖 3 sample references from medical literature

### Step 3: Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
# Your existing credentials (use your actual values)
VITE_MISTRAL_API_KEY=your_mistral_api_key_here
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Supabase Configuration (for pediatric knowledge base)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Service role key (for admin operations)
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Open the app in your browser
3. Look for the **Pediatric** toggle button in the header
4. Click it to enable Pediatric Mode
5. Try asking pediatric questions like:
   - "What are the symptoms of ear infections in children?"
   - "How do I treat fever in a 2-year-old?"
   - "What is the normal dosage of amoxicillin for kids?"

## 🔍 Verifying the Setup

### Check Tables Were Created
In Supabase SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'pediatric_%';
```

You should see 4 tables listed.

### Check Sample Data
```sql
SELECT COUNT(*) as conditions FROM pediatric_conditions;
SELECT COUNT(*) as drugs FROM pediatric_drugs;
SELECT COUNT(*) as topics FROM pediatric_topics;
SELECT COUNT(*) as references FROM pediatric_references;
```

### Test Search Functionality
```sql
SELECT title, category FROM pediatric_conditions 
WHERE 'fever' = ANY(symptoms);
```

## 📊 Database Structure

### Pediatric Conditions
- Medical conditions with symptoms, treatments, age groups
- Searchable by category, age group, symptoms
- Includes ICD codes and references

### Pediatric Drugs  
- Medications with pediatric dosing information
- Age-specific dosing guidelines
- Safety warnings and contraindications

### Pediatric Topics
- General pediatric health topics
- Educational content from Nelson's Textbook
- Tagged and categorized for easy discovery

### References
- Medical literature citations
- Links to original research and guidelines
- Supports evidence-based information

## 🔒 Security Notes

- Row Level Security (RLS) is enabled on all tables
- Public read access is allowed for educational purposes
- Service role key should be kept secure and used only for admin operations
- Consider implementing user authentication for production use

## 📈 Adding More Data

To add more Nelson's Textbook content:

1. Use the existing table structure
2. Follow the same data format as the samples
3. Ensure proper categorization and tagging
4. Include appropriate references and citations

## 🆘 Troubleshooting

**Pediatric toggle not appearing?**
- Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly
- Verify the tables were created successfully
- Check browser console for any connection errors

**Search not working?**
- Ensure indexes were created properly
- Check that sample data was inserted
- Verify RLS policies allow read access

**AI not using pediatric context?**
- Make sure you're in Pediatric Mode (toggle enabled)
- Try questions with pediatric keywords (child, infant, etc.)
- Check that the usePediatricKnowledge hook is working

## 🎯 Next Steps

1. **Add Real Nelson's Data**: Replace sample data with actual content from Nelson's Textbook
2. **Enhance Search**: Implement semantic search using embeddings
3. **Add More Categories**: Expand beyond the basic categories
4. **User Analytics**: Track which pediatric content is most accessed
5. **Content Management**: Build admin interface for managing pediatric content

Your pediatric knowledge base is now ready to enhance your Medical-Assist-app with authoritative pediatric medical information! 🚀

