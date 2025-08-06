-- Bypass RLS to clean up user data
-- This script uses the service_role to bypass RLS policies

-- First, check what data exists for these users
SELECT 
    'newsletter_profiles' as table_name,
    id, 
    user_id, 
    practice_name
FROM 
    newsletter_profiles
WHERE 
    user_id IN (
        '91cb9659-f919-405f-81c2-8bff077a7871',
        'de617f30-ac3b-485b-879c-ba8d37d92448',
        '578030ac-df77-410a-b600-aa425f0fff79'
    );

SELECT 
    'user_newsletter_roles' as table_name,
    id, 
    user_id, 
    newsletter_profile_id, 
    role
FROM 
    user_newsletter_roles
WHERE 
    user_id IN (
        '91cb9659-f919-405f-81c2-8bff077a7871',
        'de617f30-ac3b-485b-879c-ba8d37d92448',
        '578030ac-df77-410a-b600-aa425f0fff79'
    );

-- Now delete the data with RLS bypassed
BEGIN;
    -- Temporarily disable RLS
    ALTER TABLE newsletter_profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE user_newsletter_roles DISABLE ROW LEVEL SECURITY;
    
    -- Delete the data
    DELETE FROM user_newsletter_roles
    WHERE user_id IN (
        '91cb9659-f919-405f-81c2-8bff077a7871',
        'de617f30-ac3b-485b-879c-ba8d37d92448',
        '578030ac-df77-410a-b600-aa425f0fff79'
    );
    
    DELETE FROM newsletter_profiles
    WHERE user_id IN (
        '91cb9659-f919-405f-81c2-8bff077a7871',
        'de617f30-ac3b-485b-879c-ba8d37d92448',
        '578030ac-df77-410a-b600-aa425f0fff79'
    );
    
    -- Re-enable RLS
    ALTER TABLE newsletter_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_newsletter_roles ENABLE ROW LEVEL SECURITY;
COMMIT;

-- Verify the data is gone
SELECT 
    'newsletter_profiles' as table_name,
    COUNT(*) as count
FROM 
    newsletter_profiles
WHERE 
    user_id IN (
        '91cb9659-f919-405f-81c2-8bff077a7871',
        'de617f30-ac3b-485b-879c-ba8d37d92448',
        '578030ac-df77-410a-b600-aa425f0fff79'
    );

SELECT 
    'user_newsletter_roles' as table_name,
    COUNT(*) as count
FROM 
    user_newsletter_roles
WHERE 
    user_id IN (
        '91cb9659-f919-405f-81c2-8bff077a7871',
        'de617f30-ac3b-485b-879c-ba8d37d92448',
        '578030ac-df77-410a-b600-aa425f0fff79'
    );
