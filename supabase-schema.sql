-- Nelson's Book of Pediatrics Database Schema
-- Run this in your Supabase SQL Editor to create the pediatric knowledge base tables

-- Enable Row Level Security (RLS) for all tables
-- This ensures data security while allowing read access

-- 1. Pediatric Conditions Table
CREATE TABLE IF NOT EXISTS pediatric_conditions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT NOT NULL,
    symptoms TEXT[] NOT NULL DEFAULT '{}',
    diagnosis TEXT NOT NULL,
    treatment TEXT NOT NULL,
    complications TEXT[] DEFAULT '{}',
    prognosis TEXT,
    age_groups TEXT[] NOT NULL DEFAULT '{}',
    icd_codes TEXT[] DEFAULT '{}',
    references TEXT[] NOT NULL DEFAULT '{}',
    chapter TEXT NOT NULL,
    page_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Pediatric Drugs Table
CREATE TABLE IF NOT EXISTS pediatric_drugs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    generic_name TEXT,
    category TEXT NOT NULL,
    indications TEXT[] NOT NULL DEFAULT '{}',
    contraindications TEXT[] NOT NULL DEFAULT '{}',
    dosage_pediatric TEXT NOT NULL,
    dosage_by_age JSONB NOT NULL DEFAULT '[]',
    side_effects TEXT[] NOT NULL DEFAULT '{}',
    warnings TEXT[] NOT NULL DEFAULT '{}',
    interactions TEXT[] DEFAULT '{}',
    monitoring TEXT[] DEFAULT '{}',
    references TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Pediatric Topics Table
CREATE TABLE IF NOT EXISTS pediatric_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    key_points TEXT[] NOT NULL DEFAULT '{}',
    related_conditions TEXT[] DEFAULT '{}',
    related_drugs TEXT[] DEFAULT '{}',
    chapter TEXT NOT NULL,
    section TEXT NOT NULL,
    page_number INTEGER,
    tags TEXT[] NOT NULL DEFAULT '{}',
    references TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Pediatric References Table
CREATE TABLE IF NOT EXISTS pediatric_references (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL DEFAULT '{}',
    journal TEXT,
    year INTEGER NOT NULL,
    doi TEXT,
    pmid TEXT,
    url TEXT,
    citation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_pediatric_conditions_category ON pediatric_conditions(category);
CREATE INDEX IF NOT EXISTS idx_pediatric_conditions_age_groups ON pediatric_conditions USING GIN(age_groups);
CREATE INDEX IF NOT EXISTS idx_pediatric_conditions_symptoms ON pediatric_conditions USING GIN(symptoms);
CREATE INDEX IF NOT EXISTS idx_pediatric_conditions_title ON pediatric_conditions(title);
CREATE INDEX IF NOT EXISTS idx_pediatric_conditions_chapter ON pediatric_conditions(chapter);

CREATE INDEX IF NOT EXISTS idx_pediatric_drugs_category ON pediatric_drugs(category);
CREATE INDEX IF NOT EXISTS idx_pediatric_drugs_name ON pediatric_drugs(name);
CREATE INDEX IF NOT EXISTS idx_pediatric_drugs_indications ON pediatric_drugs USING GIN(indications);

CREATE INDEX IF NOT EXISTS idx_pediatric_topics_category ON pediatric_topics(category);
CREATE INDEX IF NOT EXISTS idx_pediatric_topics_title ON pediatric_topics(title);
CREATE INDEX IF NOT EXISTS idx_pediatric_topics_tags ON pediatric_topics USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_pediatric_topics_chapter ON pediatric_topics(chapter);

CREATE INDEX IF NOT EXISTS idx_pediatric_references_year ON pediatric_references(year);
CREATE INDEX IF NOT EXISTS idx_pediatric_references_authors ON pediatric_references USING GIN(authors);

-- Enable Row Level Security
ALTER TABLE pediatric_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pediatric_drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pediatric_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pediatric_references ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (for educational purposes)
-- You can modify these policies based on your security requirements

CREATE POLICY "Allow public read access to pediatric_conditions" ON pediatric_conditions
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to pediatric_drugs" ON pediatric_drugs
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to pediatric_topics" ON pediatric_topics
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to pediatric_references" ON pediatric_references
    FOR SELECT USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_pediatric_conditions_updated_at BEFORE UPDATE ON pediatric_conditions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pediatric_drugs_updated_at BEFORE UPDATE ON pediatric_drugs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pediatric_topics_updated_at BEFORE UPDATE ON pediatric_topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable full-text search (optional but recommended)
-- This creates a full-text search index for better search performance
CREATE INDEX IF NOT EXISTS idx_pediatric_conditions_fts ON pediatric_conditions 
    USING GIN(to_tsvector('english', title || ' ' || description || ' ' || diagnosis || ' ' || treatment));

CREATE INDEX IF NOT EXISTS idx_pediatric_drugs_fts ON pediatric_drugs 
    USING GIN(to_tsvector('english', name || ' ' || COALESCE(generic_name, '') || ' ' || dosage_pediatric));

CREATE INDEX IF NOT EXISTS idx_pediatric_topics_fts ON pediatric_topics 
    USING GIN(to_tsvector('english', title || ' ' || content));

