-- Test script to verify newsletter profile creation works

-- 1. Check current table structure
\echo 'Newsletter profiles table structure:'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'newsletter_profiles'
ORDER BY ordinal_position;

-- 2. Check constraints
\echo 'Current constraints:'
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conrelid = 'newsletter_profiles'::regclass;

-- 3. Test insert (replace with actual user ID when testing)
-- This is just a template - don't run with fake data
/*
INSERT INTO newsletter_profiles (
    user_id,
    practice_name,
    first_name,
    last_name,
    email,
    newsletter_name,
    newsletter_background_color,
    newsletter_welcome_message,
    sending_frequency,
    country,
    onboarding_step,
    onboarding_completed
) VALUES (
    'test-user-id',  -- Replace with real user ID
    'Test Practice',
    'Test',
    'Doctor',
    'test@example.com',
    'An Apple a Day',
    'soft-blue',
    'Welcome message',
    'bi-weekly',
    'South Africa',
    1,
    false
);
*/

-- 4. Check RLS policies are working
\echo 'RLS policies:'
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'newsletter_profiles'
ORDER BY cmd, policyname;
