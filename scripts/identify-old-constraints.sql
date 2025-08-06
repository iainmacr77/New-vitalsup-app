-- Identify all constraints related to the old 'doctors' table

-- 1. Check all constraints on newsletter_profiles table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'newsletter_profiles'::regclass
ORDER BY contype, conname;

-- 2. Check for any remaining references to 'doctors' in constraint names
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE indexname LIKE '%doctors%' 
   OR indexdef LIKE '%doctors%';

-- 3. Check for unique constraints specifically
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'newsletter_profiles'
    AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.constraint_name;

-- 4. Check for foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'newsletter_profiles'
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.constraint_name;

-- 5. Check for any sequences or other objects with 'doctors' in the name
SELECT 
    schemaname,
    sequencename
FROM pg_sequences 
WHERE sequencename LIKE '%doctors%';
