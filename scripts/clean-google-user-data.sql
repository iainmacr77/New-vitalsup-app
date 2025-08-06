-- Clean up any existing data for the Google user so they go through proper flow
-- First, find the Google user ID
DO $$
DECLARE
    google_user_id UUID;
BEGIN
    -- Find Google user (adjust email pattern as needed)
    SELECT id INTO google_user_id 
    FROM auth.users 
    WHERE email LIKE '%iainmacr77%' OR email LIKE '%gmail%'
    LIMIT 1;
    
    IF google_user_id IS NOT NULL THEN
        -- Delete user roles
        DELETE FROM user_newsletter_roles WHERE user_id = google_user_id;
        
        -- Delete newsletter profiles owned by this user
        DELETE FROM newsletter_profiles WHERE user_id = google_user_id;
        
        RAISE NOTICE 'Cleaned up data for Google user: %', google_user_id;
    ELSE
        RAISE NOTICE 'No Google user found to clean up';
    END IF;
END $$;
