-- Comprehensive system health check

\echo '=== SYSTEM HEALTH CHECK ==='

\echo '1. Table existence and structure:'
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('newsletter_profiles', 'user_newsletter_roles')
ORDER BY table_name;

\echo '2. Newsletter profiles constraints:'
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conrelid = 'newsletter_profiles'::regclass
ORDER BY contype, conname;

\echo '3. User newsletter roles constraints:'
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conrelid = 'user_newsletter_roles'::regclass
ORDER BY contype, conname;

\echo '4. RLS status:'
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('newsletter_profiles', 'user_newsletter_roles');

\echo '5. RLS policies:'
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('newsletter_profiles', 'user_newsletter_roles')
ORDER BY tablename, cmd, policyname;

\echo '6. Data counts:'
SELECT 
    'newsletter_profiles' as table_name,
    COUNT(*) as record_count
FROM newsletter_profiles
UNION ALL
SELECT 
    'user_newsletter_roles' as table_name,
    COUNT(*) as record_count
FROM user_newsletter_roles;

\echo '7. Sample data integrity check:'
SELECT 
    np.id,
    np.practice_name,
    np.user_id,
    COUNT(unr.id) as role_count,
    STRING_AGG(unr.role, ', ') as roles
FROM newsletter_profiles np
LEFT JOIN user_newsletter_roles unr ON np.id = unr.newsletter_profile_id
GROUP BY np.id, np.practice_name, np.user_id
LIMIT 5;

\echo '=== END HEALTH CHECK ==='
