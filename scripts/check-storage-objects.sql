-- Check if users own any Storage objects that might be blocking deletion
-- Storage objects must be deleted before users can be removed

DO $$
DECLARE
    test_emails TEXT[] := ARRAY[
        'iain_mactichie@hotmail.com',
        'im@liberty-wealth.com'
    ];
    user_record RECORD;
    storage_count INTEGER;
BEGIN
    RAISE NOTICE 'Checking for Storage objects owned by test users...';
    
    FOR user_record IN 
        SELECT id, email 
        FROM auth.users 
        WHERE email = ANY(test_emails)
    LOOP
        -- Check storage.objects table
        SELECT COUNT(*) INTO storage_count
        FROM storage.objects 
        WHERE owner = user_record.id;
        
        IF storage_count > 0 THEN
            RAISE NOTICE 'User % owns % storage objects - this blocks deletion!', user_record.email, storage_count;
            
            -- Delete the storage objects
            DELETE FROM storage.objects WHERE owner = user_record.id;
            RAISE NOTICE 'Deleted % storage objects for user %', storage_count, user_record.email;
        ELSE
            RAISE NOTICE 'User % owns no storage objects', user_record.email;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Storage cleanup complete. Try deleting users again.';
    
END $$;
