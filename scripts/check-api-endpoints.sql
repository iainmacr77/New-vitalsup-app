-- Check what the API endpoints are trying to query

-- Look for any remaining references to 'doctors' table in views or functions
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE definition ILIKE '%doctors%'
AND schemaname = 'public';

-- Check if there are any stored procedures referencing old table names
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition ILIKE '%doctors%'
AND routine_schema = 'public';

-- Verify our current tables and their relationships
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_name IN ('newsletter_profiles', 'user_newsletter_roles')
AND t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;
