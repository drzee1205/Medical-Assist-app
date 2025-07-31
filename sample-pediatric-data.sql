-- Sample Data for Nelson's Book of Pediatrics Knowledge Base
-- Run this after creating the schema to populate with example data

-- Sample Pediatric Conditions
INSERT INTO pediatric_conditions (title, category, subcategory, description, symptoms, diagnosis, treatment, complications, prognosis, age_groups, icd_codes, references, chapter, page_number) VALUES

('Acute Otitis Media', 'Infectious Diseases', 'Ear Infections', 'Acute inflammation of the middle ear, commonly occurring in children due to eustachian tube dysfunction and bacterial or viral infections.', 
ARRAY['ear pain', 'fever', 'irritability', 'hearing loss', 'ear drainage'], 
'Clinical diagnosis based on otoscopic examination showing erythematous, bulging tympanic membrane with decreased mobility.',
'First-line: Amoxicillin 80-90 mg/kg/day divided BID for 10 days. Alternative: Amoxicillin-clavulanate for treatment failures or recent antibiotic use.',
ARRAY['hearing loss', 'tympanic membrane perforation', 'mastoiditis', 'intracranial complications'],
'Excellent with appropriate treatment. Most cases resolve within 7-10 days.',
ARRAY['infant', 'toddler', 'preschool', 'school'],
ARRAY['H66.9', 'H66.90'],
ARRAY['Nelson Textbook of Pediatrics, 21st Edition, Chapter 658'],
'Ear, Nose, and Throat Disorders',
3245),

('Febrile Seizures', 'Neurological Disorders', 'Seizures', 'Seizures occurring in children aged 6 months to 5 years in association with fever, without evidence of intracranial infection or other defined cause.',
ARRAY['generalized tonic-clonic seizure', 'fever >38°C', 'altered consciousness', 'postictal drowsiness'],
'Clinical diagnosis in child 6 months-5 years with seizure and fever >38°C, normal neurological exam, and no signs of CNS infection.',
'Supportive care, fever reduction with acetaminophen or ibuprofen. Anticonvulsants not routinely indicated for simple febrile seizures.',
ARRAY['status epilepticus', 'recurrent febrile seizures', 'future epilepsy (rare)'],
'Excellent. Most children outgrow febrile seizures by age 5. Risk of future epilepsy is low (2-5%).',
ARRAY['infant', 'toddler', 'preschool'],
ARRAY['R56.00', 'R56.0'],
ARRAY['Nelson Textbook of Pediatrics, 21st Edition, Chapter 610'],
'Neurological Disorders',
2856),

('Bronchiolitis', 'Respiratory Disorders', 'Lower Respiratory Tract', 'Acute viral infection of the lower respiratory tract affecting infants and young children, most commonly caused by respiratory syncytial virus (RSV).',
ARRAY['cough', 'wheezing', 'tachypnea', 'feeding difficulties', 'fever', 'nasal congestion'],
'Clinical diagnosis based on age <2 years, viral prodrome, and characteristic physical findings of wheezing and crackles.',
'Supportive care: adequate hydration, oxygen if hypoxemic, nasal suctioning. Bronchodilators and corticosteroids not routinely recommended.',
ARRAY['respiratory failure', 'dehydration', 'secondary bacterial pneumonia', 'apnea in young infants'],
'Most children recover completely within 1-2 weeks. Hospitalization required in 1-3% of cases.',
ARRAY['newborn', 'infant', 'toddler'],
ARRAY['J21.9', 'J21.0'],
ARRAY['Nelson Textbook of Pediatrics, 21st Edition, Chapter 420'],
'Respiratory System',
2047),

('Gastroenteritis, Acute', 'Gastrointestinal Disorders', 'Infectious Diarrhea', 'Acute inflammation of the stomach and intestines, commonly caused by viral, bacterial, or parasitic pathogens.',
ARRAY['diarrhea', 'vomiting', 'abdominal pain', 'fever', 'dehydration signs'],
'Clinical diagnosis based on acute onset of diarrhea with or without vomiting. Stool studies if severe or prolonged.',
'Oral rehydration therapy is first-line. Continue feeding age-appropriate foods. Antibiotics only for specific bacterial causes.',
ARRAY['severe dehydration', 'electrolyte imbalances', 'hemolytic uremic syndrome', 'reactive arthritis'],
'Excellent with appropriate hydration. Most viral gastroenteritis resolves in 3-7 days.',
ARRAY['newborn', 'infant', 'toddler', 'preschool', 'school', 'adolescent'],
ARRAY['K59.1', 'A09'],
ARRAY['Nelson Textbook of Pediatrics, 21st Edition, Chapter 366'],
'Digestive System',
1875);

-- Sample Pediatric Drugs
INSERT INTO pediatric_drugs (name, generic_name, category, indications, contraindications, dosage_pediatric, dosage_by_age, side_effects, warnings, interactions, monitoring, references) VALUES

('Tylenol', 'Acetaminophen', 'Analgesics/Antipyretics', 
ARRAY['fever reduction', 'mild to moderate pain relief', 'post-vaccination fever'],
ARRAY['known hypersensitivity to acetaminophen', 'severe hepatic impairment'],
'10-15 mg/kg/dose every 4-6 hours, maximum 5 doses per 24 hours',
'[
  {"age_group": "newborn", "dosage": "10 mg/kg/dose", "route": "oral", "frequency": "every 6-8 hours"},
  {"age_group": "infant", "dosage": "10-15 mg/kg/dose", "route": "oral", "frequency": "every 4-6 hours"},
  {"age_group": "toddler", "dosage": "10-15 mg/kg/dose", "route": "oral", "frequency": "every 4-6 hours"},
  {"age_group": "preschool", "dosage": "10-15 mg/kg/dose", "route": "oral", "frequency": "every 4-6 hours"},
  {"age_group": "school", "dosage": "10-15 mg/kg/dose", "route": "oral", "frequency": "every 4-6 hours"},
  {"age_group": "adolescent", "dosage": "325-650 mg/dose", "route": "oral", "frequency": "every 4-6 hours"}
]'::jsonb,
ARRAY['nausea', 'rash', 'hepatotoxicity with overdose'],
ARRAY['Do not exceed maximum daily dose', 'Risk of hepatotoxicity with overdose', 'Use caution in hepatic impairment'],
ARRAY['warfarin (increased anticoagulant effect)', 'chronic alcohol use (increased hepatotoxicity risk)'],
ARRAY['liver function tests if chronic use', 'signs of hepatotoxicity'],
ARRAY['Nelson Textbook of Pediatrics, 21st Edition, Chapter 81']),

('Amoxil', 'Amoxicillin', 'Antibiotics',
ARRAY['acute otitis media', 'pneumonia', 'urinary tract infections', 'streptococcal pharyngitis'],
ARRAY['penicillin allergy', 'infectious mononucleosis'],
'Standard dose: 40-50 mg/kg/day divided BID. High dose: 80-90 mg/kg/day divided BID',
'[
  {"age_group": "newborn", "dosage": "20-30 mg/kg/day", "route": "oral", "frequency": "divided every 12 hours"},
  {"age_group": "infant", "dosage": "40-50 mg/kg/day", "route": "oral", "frequency": "divided every 12 hours"},
  {"age_group": "toddler", "dosage": "40-50 mg/kg/day", "route": "oral", "frequency": "divided every 12 hours"},
  {"age_group": "preschool", "dosage": "40-50 mg/kg/day", "route": "oral", "frequency": "divided every 12 hours"},
  {"age_group": "school", "dosage": "40-50 mg/kg/day", "route": "oral", "frequency": "divided every 12 hours"},
  {"age_group": "adolescent", "dosage": "250-500 mg", "route": "oral", "frequency": "every 12 hours"}
]'::jsonb,
ARRAY['diarrhea', 'nausea', 'vomiting', 'rash', 'abdominal pain'],
ARRAY['Increased risk of rash in patients with mononucleosis', 'C. difficile-associated diarrhea'],
ARRAY['probenecid (increased amoxicillin levels)', 'oral contraceptives (decreased effectiveness)'],
ARRAY['signs of allergic reaction', 'diarrhea or C. diff symptoms'],
ARRAY['Nelson Textbook of Pediatrics, 21st Edition, Chapter 739']),

('Motrin', 'Ibuprofen', 'NSAIDs',
ARRAY['fever reduction', 'pain relief', 'anti-inflammatory'],
ARRAY['age <6 months', 'dehydration', 'renal impairment', 'active GI bleeding'],
'5-10 mg/kg/dose every 6-8 hours, maximum 40 mg/kg/day',
'[
  {"age_group": "infant", "dosage": "5-10 mg/kg/dose", "route": "oral", "frequency": "every 6-8 hours"},
  {"age_group": "toddler", "dosage": "5-10 mg/kg/dose", "route": "oral", "frequency": "every 6-8 hours"},
  {"age_group": "preschool", "dosage": "5-10 mg/kg/dose", "route": "oral", "frequency": "every 6-8 hours"},
  {"age_group": "school", "dosage": "5-10 mg/kg/dose", "route": "oral", "frequency": "every 6-8 hours"},
  {"age_group": "adolescent", "dosage": "200-400 mg/dose", "route": "oral", "frequency": "every 6-8 hours"}
]'::jsonb,
ARRAY['GI upset', 'nausea', 'dizziness', 'headache', 'rash'],
ARRAY['Not recommended in dehydrated patients', 'Risk of renal toxicity', 'GI bleeding risk'],
ARRAY['warfarin (increased bleeding risk)', 'ACE inhibitors (decreased effectiveness)'],
ARRAY['renal function', 'signs of GI bleeding', 'hydration status'],
ARRAY['Nelson Textbook of Pediatrics, 21st Edition, Chapter 81']);

-- Sample Pediatric Topics
INSERT INTO pediatric_topics (title, category, content, key_points, related_conditions, related_drugs, chapter, section, page_number, tags, references) VALUES

('Growth Charts and Assessment', 'Growth and Development', 'Growth assessment is fundamental to pediatric care. Growth charts provide standardized references for height, weight, and head circumference based on age and sex. The WHO growth charts are recommended for children 0-2 years, while CDC charts are used for children 2-20 years. Growth velocity is often more important than absolute measurements.',
ARRAY['Use appropriate growth charts for age', 'Plot multiple measurements over time', 'Growth velocity more important than single measurements', 'Consider genetic potential and family history', 'Evaluate for underlying conditions if growth faltering'],
ARRAY[], ARRAY[],
'Growth, Development, and Behavior', 'Growth Assessment', 45,
ARRAY['growth charts', 'anthropometry', 'failure to thrive', 'growth velocity'],
ARRAY['Nelson Textbook of Pediatrics, 21st Edition, Chapter 19']),

('Immunization Schedule', 'Preventive Care', 'The recommended immunization schedule protects children from vaccine-preventable diseases. The schedule is developed by the CDC, AAP, and AAFP based on epidemiological data and vaccine efficacy studies. Vaccines should be given at the earliest recommended age to provide optimal protection.',
ARRAY['Follow CDC recommended schedule', 'Vaccines can be given simultaneously', 'Catch-up schedules available for delayed vaccines', 'Document all vaccines in permanent record', 'Educate parents about vaccine safety and importance'],
ARRAY[], ARRAY[],
'Immunization', 'Vaccine Schedule', 1345,
ARRAY['vaccines', 'immunization', 'prevention', 'schedule'],
ARRAY['Nelson Textbook of Pediatrics, 21st Edition, Chapter 293']),

('Developmental Milestones', 'Growth and Development', 'Developmental milestones are skills that most children can do by a certain age. They include gross motor, fine motor, language, and social-emotional skills. Early identification of developmental delays allows for timely intervention and improved outcomes.',
ARRAY['Monitor development at each visit', 'Use standardized screening tools', 'Consider referral if concerns', 'Provide anticipatory guidance', 'Remember wide range of normal'],
ARRAY[], ARRAY[],
'Growth, Development, and Behavior', 'Development', 67,
ARRAY['milestones', 'development', 'screening', 'early intervention'],
ARRAY['Nelson Textbook of Pediatrics, 21st Edition, Chapter 21']);

-- Sample References
INSERT INTO pediatric_references (title, authors, journal, year, doi, pmid, citation) VALUES

('Clinical Practice Guideline: The Diagnosis and Management of Acute Otitis Media', 
ARRAY['Lieberthal AS', 'Carroll AE', 'Chonmaitree T'], 
'Pediatrics', 2013, '10.1542/peds.2012-3488', '23439909',
'Lieberthal AS, Carroll AE, Chonmaitree T, et al. Clinical Practice Guideline: The Diagnosis and Management of Acute Otitis Media. Pediatrics. 2013;131(3):e964-e999.'),

('Febrile Seizures: Clinical Practice Guideline for the Long-term Management of the Child With Simple Febrile Seizures',
ARRAY['Steering Committee on Quality Improvement and Management'], 
'Pediatrics', 2008, '10.1542/peds.2008-0939', '18558431',
'Steering Committee on Quality Improvement and Management, Subcommittee on Febrile Seizures. Febrile Seizures: Clinical Practice Guideline for the Long-term Management of the Child With Simple Febrile Seizures. Pediatrics. 2008;121(6):1281-1286.'),

('Clinical Practice Guideline: The Diagnosis, Management, and Prevention of Bronchiolitis',
ARRAY['Ralston SL', 'Lieberthal AS', 'Meissner HC'], 
'Pediatrics', 2014, '10.1542/peds.2014-2742', '25349312',
'Ralston SL, Lieberthal AS, Meissner HC, et al. Clinical Practice Guideline: The Diagnosis, Management, and Prevention of Bronchiolitis. Pediatrics. 2014;134(5):e1474-e1502.');

-- Create a view for easy searching across all content types
CREATE OR REPLACE VIEW pediatric_search_view AS
SELECT 
    'condition' as content_type,
    id,
    title,
    category,
    description as content,
    age_groups,
    chapter,
    created_at
FROM pediatric_conditions
UNION ALL
SELECT 
    'drug' as content_type,
    id,
    name as title,
    category,
    dosage_pediatric as content,
    ARRAY[]::text[] as age_groups,
    'Medications' as chapter,
    created_at
FROM pediatric_drugs
UNION ALL
SELECT 
    'topic' as content_type,
    id,
    title,
    category,
    content,
    ARRAY[]::text[] as age_groups,
    chapter,
    created_at
FROM pediatric_topics;

