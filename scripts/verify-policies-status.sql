-- Verify current policy status after the fix

-- 1. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('newsletter_profiles', 'user_newsletter_roles');

-- 2. List current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('newsletter_profiles', 'user_newsletter_roles')
ORDER BY tablename, cmd, policyname;

-- 3. Test auth.uid() function (should return your user ID when logged in)
SELECT auth.uid() as current_user_id;

-- 4. Check table permissions
SELECT table_name, grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name IN ('newsletter_profiles', 'user_newsletter_roles')
AND grantee IN ('authenticated', 'service_role');
