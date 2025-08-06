-- Let's check if there are any remaining references to 'doctors' in the database
-- This will help us identify what the frontend might be trying to query

-- Check for any views that might reference 'doctors'
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE definition ILIKE '%doctors%'
AND schemaname = 'public';

-- Check for any functions that might reference 'doctors'
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition ILIKE '%doctors%'
AND routine_schema = 'public';

-- Check if there are any old table names or aliases
SELECT table_name 
FROM information_schema.tables 
WHERE table_name ILIKE '%doctor%'
AND table_schema = 'public';

-- Verify our current data
SELECT 
    id,
    email,
    practice_name,
    first_name,
    last_name,
    user_id
FROM newsletter_profiles;

SELECT 
    id,
    user_id,
    newsletter_profile_id,
    role,
    invitation_accepted
FROM user_newsletter_roles;
