-- Check if the Google user has any existing newsletter profiles
SELECT 
    np.*,
    unr.role,
    unr.invitation_accepted
FROM newsletter_profiles np
LEFT JOIN user_newsletter_roles unr ON np.id = unr.newsletter_profile_id
WHERE np.email LIKE '%iainmacr77%' 
   OR np.email LIKE '%gmail%'
   OR unr.user_id IN (
       SELECT id FROM auth.users WHERE email LIKE '%iainmacr77%' OR email LIKE '%gmail%'
   );
