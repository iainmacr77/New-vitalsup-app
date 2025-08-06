-- Delete test user accounts and all associated data
-- This will clean up everything so you can test the full signup flow

DO $$
DECLARE
    test_emails TEXT[] := ARRAY[
        'iain_mactichie@hotmail.com',
        'im@liberty-wealth.com'
    ];
    email_addr TEXT;
    user_record RECORD;
BEGIN
    -- Loop through each test email
    FOREACH email_addr IN ARRAY test_emails LOOP
        RAISE NOTICE 'Cleaning up data for email: %', email_addr;
        
        -- Find users with this email in auth.users
        FOR user_record IN 
            SELECT id, email 
            FROM auth.users 
            WHERE email = email_addr
        LOOP
            RAISE NOTICE 'Found user: % with ID: %', user_record.email, user_record.id;
            
            -- Delete from user_newsletter_roles
            DELETE FROM user_newsletter_roles WHERE user_id = user_record.id;
            RAISE NOTICE 'Deleted user newsletter roles for user: %', user_record.id;
            
            -- Delete from newsletter_profiles
            DELETE FROM newsletter_profiles WHERE user_id = user_record.id;
            RAISE NOTICE 'Deleted newsletter profile for user: %', user_record.id;
            
        END LOOP;
        
        -- Also clean up any invitation records by email
        DELETE FROM user_newsletter_roles WHERE invitation_email = email_addr;
        RAISE NOTICE 'Deleted invitation records for email: %', email_addr;
        
    END LOOP;
    
    RAISE NOTICE 'Database cleanup complete. Now manually delete the users from Supabase Auth dashboard.';
    RAISE NOTICE 'Go to: Authentication > Users in your Supabase dashboard';
    RAISE NOTICE 'Delete users with emails: %', array_to_string(test_emails, ', ');
END $$;
