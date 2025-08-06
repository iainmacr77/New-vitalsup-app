-- Reset existing users to simulate fresh signup
-- This will clear all their data so they go through onboarding again

DO $$
DECLARE
    test_emails TEXT[] := ARRAY[
        'iain_mactichie@hotmail.com',
        'im@liberty-wealth.com'
    ];
    user_record RECORD;
BEGIN
    RAISE NOTICE 'Resetting existing users for fresh testing...';
    
    -- Loop through each test email
    FOR user_record IN 
        SELECT id, email 
        FROM auth.users 
        WHERE email = ANY(test_emails)
    LOOP
        RAISE NOTICE 'Resetting user: % (ID: %)', user_record.email, user_record.id;
        
        -- Delete from user_newsletter_roles
        DELETE FROM user_newsletter_roles WHERE user_id = user_record.id;
        RAISE NOTICE 'Deleted user newsletter roles for: %', user_record.email;
        
        -- Delete from newsletter_profiles  
        DELETE FROM newsletter_profiles WHERE user_id = user_record.id;
        RAISE NOTICE 'Deleted newsletter profile for: %', user_record.email;
        
        -- Update auth.users to mark email as unconfirmed (simulate fresh signup)
        UPDATE auth.users 
        SET 
            email_confirmed_at = NULL,
            confirmed_at = NULL,
            last_sign_in_at = NULL
        WHERE id = user_record.id;
        RAISE NOTICE 'Reset auth status for: %', user_record.email;
        
    END LOOP;
    
    -- Clean up any orphaned invitation records
    DELETE FROM user_newsletter_roles WHERE invitation_email = ANY(test_emails);
    
    RAISE NOTICE 'User reset complete! These users will now go through the full onboarding flow.';
    RAISE NOTICE 'You can now log in with these accounts and they will be treated as new users.';
    
END $$;
