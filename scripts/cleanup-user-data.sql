-- Script to clean up user data before deleting users from Supabase Auth

-- First, let's see what data exists
SELECT 'Newsletter Profiles' as table_name, COUNT(*) as count FROM newsletter_profiles
UNION ALL
SELECT 'User Newsletter Roles' as table_name, COUNT(*) as count FROM user_newsletter_roles;

-- Show which users have data
SELECT 
    u.id as user_id,
    u.email,
    np.id as newsletter_profile_id,
    np.practice_name,
    COUNT(unr.id) as role_count
FROM auth.users u
LEFT JOIN newsletter_profiles np ON u.id = np.user_id
LEFT JOIN user_newsletter_roles unr ON u.id = unr.user_id
GROUP BY u.id, u.email, np.id, np.practice_name
ORDER BY u.email;

-- To clean up ALL data (BE CAREFUL - this will delete everything):
-- Uncomment the lines below if you want to delete all data

/*
-- Delete all user newsletter roles
DELETE FROM user_newsletter_roles;

-- Delete all newsletter profiles  
DELETE FROM newsletter_profiles;

-- Now you should be able to delete users from the Supabase dashboard
*/

-- To clean up data for specific users, replace 'user-id-here' with actual user IDs:
/*
-- Delete roles for specific user
DELETE FROM user_newsletter_roles WHERE user_id = 'user-id-here';

-- Delete newsletter profile for specific user
DELETE FROM newsletter_profiles WHERE user_id = 'user-id-here';
*/
