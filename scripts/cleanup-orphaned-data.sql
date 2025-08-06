-- Clean up any orphaned data and ensure data integrity

-- 1. Check for any orphaned user_newsletter_roles (roles without valid newsletter_profiles)
SELECT 
    unr.id,
    unr.user_id,
    unr.newsletter_profile_id,
    unr.role
FROM user_newsletter_roles unr
LEFT JOIN newsletter_profiles np ON unr.newsletter_profile_id = np.id
WHERE np.id IS NULL;

-- 2. Clean up orphaned roles if any exist
DELETE FROM user_newsletter_roles 
WHERE newsletter_profile_id NOT IN (
    SELECT id FROM newsletter_profiles
);

-- 3. Check for newsletter_profiles without any roles (should have at least one owner)
SELECT 
    np.id,
    np.practice_name,
    np.user_id
FROM newsletter_profiles np
LEFT JOIN user_newsletter_roles unr ON np.id = unr.newsletter_profile_id
WHERE unr.id IS NULL;

-- 4. For any newsletter_profiles without roles, create an owner role
INSERT INTO user_newsletter_roles (user_id, newsletter_profile_id, role, invitation_accepted)
SELECT 
    np.user_id,
    np.id,
    'owner',
    true
FROM newsletter_profiles np
LEFT JOIN user_newsletter_roles unr ON np.id = unr.newsletter_profile_id
WHERE unr.id IS NULL
AND np.user_id IS NOT NULL;

-- 5. Verify data integrity
\echo 'Newsletter profiles with their owner count:'
SELECT 
    np.id,
    np.practice_name,
    COUNT(unr.id) as role_count,
    COUNT(CASE WHEN unr.role = 'owner' THEN 1 END) as owner_count
FROM newsletter_profiles np
LEFT JOIN user_newsletter_roles unr ON np.id = unr.newsletter_profile_id
GROUP BY np.id, np.practice_name
ORDER BY np.practice_name;
