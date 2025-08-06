-- Fixed cleanup script with proper FOR loop syntax

DO $$
DECLARE
    user_id_1 UUID := '91cb9659-f919-405f-81c2-8bff077a7871'; -- First iain macritchie
    user_id_2 UUID := 'de617f30-ac3b-485b-879c-ba8d37d92448'; -- Second iain macritchie
    user_id_3 UUID := '578030ac-df77-410a-b600-aa425f0fff79'; -- Iain MacRitchie (Google)
    r RECORD;
    cnt INTEGER;
BEGIN
    -- Check for any references to these users
    RAISE NOTICE 'Checking for references to users...';
    
    -- Check newsletter_profiles
    RAISE NOTICE 'Newsletter profiles:';
    FOR r IN (
        SELECT id, user_id, practice_name 
        FROM newsletter_profiles 
        WHERE user_id IN (user_id_1, user_id_2, user_id_3)
    ) LOOP
        RAISE NOTICE 'Found profile: % for user %', r.id, r.user_id;
    END LOOP;
    
    -- Check user_newsletter_roles
    RAISE NOTICE 'User newsletter roles:';
    FOR r IN (
        SELECT id, user_id, newsletter_profile_id, role
        FROM user_newsletter_roles
        WHERE user_id IN (user_id_1, user_id_2, user_id_3)
    ) LOOP
        RAISE NOTICE 'Found role: % for user %', r.id, r.user_id;
    END LOOP;
    
    -- Now forcefully delete all references
    RAISE NOTICE 'Deleting all references...';
    
    -- Delete from user_newsletter_roles
    DELETE FROM user_newsletter_roles 
    WHERE user_id IN (user_id_1, user_id_2, user_id_3);
    
    -- Delete from newsletter_profiles
    DELETE FROM newsletter_profiles 
    WHERE user_id IN (user_id_1, user_id_2, user_id_3);
    
    -- Check for any invited roles that reference these users by email
    DELETE FROM user_newsletter_roles 
    WHERE invitation_email IN (
        'iain_mactichie@hotmail.com', 
        'im@liberty-wealth.com'
    );
    
    RAISE NOTICE 'Cleanup complete. You should now be able to delete the users.';
END $$;
