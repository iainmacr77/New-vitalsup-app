-- Final comprehensive cleanup to remove ALL possible references before manual user deletion
-- This script will ensure absolutely nothing is blocking user deletion

DO $$
DECLARE
    test_emails TEXT[] := ARRAY[
        'iain_mactichie@hotmail.com',
        'im@liberty-wealth.com'
    ];
    user_ids UUID[];
    user_id UUID;
    email_addr TEXT;
BEGIN
    -- Get all user IDs for these emails
    SELECT ARRAY_AGG(id) INTO user_ids
    FROM auth.users 
    WHERE email = ANY(test_emails);
    
    RAISE NOTICE 'Found user IDs to clean: %', user_ids;
    
    IF user_ids IS NULL OR array_length(user_ids, 1) = 0 THEN
        RAISE NOTICE 'No users found with the specified emails';
        RETURN;
    END IF;
    
    -- Disable all constraints temporarily
    SET session_replication_role = replica;
    
    -- Clean up all our custom tables
    FOREACH user_id IN ARRAY user_ids LOOP
        -- Delete from user_newsletter_roles
        DELETE FROM user_newsletter_roles WHERE user_id = user_id;
        DELETE FROM user_newsletter_roles WHERE invited_by = user_id;
        
        -- Delete from newsletter_profiles
        DELETE FROM newsletter_profiles WHERE user_id = user_id;
        
        RAISE NOTICE 'Cleaned up data for user ID: %', user_id;
    END LOOP;
    
    -- Clean up by email as well
    FOREACH email_addr IN ARRAY test_emails LOOP
        DELETE FROM user_newsletter_roles WHERE invitation_email = email_addr;
        RAISE NOTICE 'Cleaned up invitation records for email: %', email_addr;
    END LOOP;
    
    -- Re-enable constraints
    SET session_replication_role = DEFAULT;
    
    -- Force a schema cache refresh
    NOTIFY pgrst, 'reload schema';
    
    RAISE NOTICE 'Final cleanup complete!';
    RAISE NOTICE 'All references should now be removed.';
    RAISE NOTICE 'Try deleting these users from the Supabase Auth dashboard:';
    FOREACH email_addr IN ARRAY test_emails LOOP
        RAISE NOTICE '  - %', email_addr;
    END LOOP;
    
END $$;
