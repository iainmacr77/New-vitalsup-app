-- Fix any remaining references to the old 'doctors' table name

-- First, let's check if there are any views or functions still referencing 'doctors'
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE definition LIKE '%doctors%'
AND schemaname = 'public';

-- Check for any functions referencing 'doctors'
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE prosrc LIKE '%doctors%';

-- Ensure the newsletter_profiles table has the correct structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'newsletter_profiles'
ORDER BY ordinal_position;

-- Verify foreign key relationships
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('newsletter_profiles', 'user_newsletter_roles');
