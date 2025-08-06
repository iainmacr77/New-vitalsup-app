-- Simple cleanup script that actually works

-- First, let's see what data exists for the problematic users
SELECT 'newsletter_profiles' as table_name, COUNT(*) as count 
FROM newsletter_profiles 
WHERE user_id IN (
    '91cb9659-f919-405f-81c2-8bff077a7871',
    'de617f30-ac3b-485b-879c-ba8d37d92448', 
    '578030ac-df77-410a-b600-aa425f0fff79'
);

SELECT 'user_newsletter_roles' as table_name, COUNT(*) as count 
FROM user_newsletter_roles 
WHERE user_id IN (
    '91cb9659-f919-405f-81c2-8bff077a7871',
    'de617f30-ac3b-485b-879c-ba8d37d92448',
    '578030ac-df77-410a-b600-aa425f0fff79'
);

-- Delete from user_newsletter_roles first (child table)
DELETE FROM user_newsletter_roles 
WHERE user_id IN (
    '91cb9659-f919-405f-81c2-8bff077a7871',
    'de617f30-ac3b-485b-879c-ba8d37d92448',
    '578030ac-df77-410a-b600-aa425f0fff79'
);

-- Delete from newsletter_profiles (parent table)
DELETE FROM newsletter_profiles 
WHERE user_id IN (
    '91cb9659-f919-405f-81c2-8bff077a7871',
    'de617f30-ac3b-485b-879c-ba8d37d92448',
    '578030ac-df77-410a-b600-aa425f0fff79'
);

-- Also clean up any invitation records by email
DELETE FROM user_newsletter_roles 
WHERE invitation_email IN (
    'iain_mactichie@hotmail.com', 
    'im@liberty-wealth.com'
);

-- Verify cleanup worked
SELECT 'After cleanup - newsletter_profiles' as info, COUNT(*) as count 
FROM newsletter_profiles 
WHERE user_id IN (
    '91cb9659-f919-405f-81c2-8bff077a7871',
    'de617f30-ac3b-485b-879c-ba8d37d92448',
    '578030ac-df77-410a-b600-aa425f0fff79'
);

SELECT 'After cleanup - user_newsletter_roles' as info, COUNT(*) as count 
FROM user_newsletter_roles 
WHERE user_id IN (
    '91cb9659-f919-405f-81c2-8bff077a7871',
    'de617f30-ac3b-485b-879c-ba8d37d92448',
    '578030ac-df77-410a-b600-aa425f0fff79'
);
