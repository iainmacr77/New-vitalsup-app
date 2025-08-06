-- Complete cleanup of all test users and data to start fresh
-- This will remove all users and their associated data

-- First, let's see what we're about to delete
SELECT 'Current Users:' as info;
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
ORDER BY created_at DESC;

SELECT 'Current Newsletter Profiles:' as info;
SELECT id, user_id, practice_name, first_name, last_name, email
FROM newsletter_profiles;

SELECT 'Current User Roles:' as info;
SELECT id, user_id, newsletter_profile_id, role
FROM user_newsletter_roles;

-- Now delete everything (in correct order to avoid foreign key issues)
DELETE FROM user_newsletter_roles;
DELETE FROM newsletter_profiles;

-- Note: We cannot delete from auth.users directly via SQL
-- You'll need to delete users from the Supabase Auth dashboard manually

SELECT 'Cleanup complete! Now manually delete users from Auth > Users in Supabase dashboard' as next_step;
