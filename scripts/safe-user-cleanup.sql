-- Safe cleanup script - shows you what will be deleted before doing it

-- Step 1: See what data exists for each user
\echo 'Current user data:'
SELECT 
    u.id as user_id,
    u.email,
    u.created_at,
    CASE WHEN np.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_newsletter_profile,
    np.practice_name,
    COUNT(unr.id) as role_count
FROM auth.users u
LEFT JOIN newsletter_profiles np ON u.id = np.user_id
LEFT JOIN user_newsletter_roles unr ON u.id = unr.user_id
GROUP BY u.id, u.email, u.created_at, np.id, np.practice_name
ORDER BY u.created_at DESC;

-- Step 2: If you want to delete ALL test data and start fresh:
\echo 'To delete all data, run these commands:'
\echo 'DELETE FROM user_newsletter_roles;'
\echo 'DELETE FROM newsletter_profiles;'
\echo 'Then you can delete users from Supabase dashboard.'

-- Step 3: Or delete data for specific users (safer approach)
-- Replace the user IDs below with the actual IDs you want to clean up

-- Example for cleaning up specific users:
/*
DO $$
DECLARE
    user_to_delete UUID := '91cb9659-f919-405f-81c2-8bff077a7871'; -- Replace with actual user ID
BEGIN
    -- Delete user roles
    DELETE FROM user_newsletter_roles WHERE user_id = user_to_delete;
    
    -- Delete newsletter profile
    DELETE FROM newsletter_profiles WHERE user_id = user_to_delete;
    
    RAISE NOTICE 'Cleaned up data for user: %', user_to_delete;
END $$;
*/
