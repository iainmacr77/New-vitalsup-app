-- Force cleanup script with explicit user IDs

-- Set the user IDs from your screenshot
DO $$
DECLARE
    user_id_1 UUID := '91cb9659-f919-405f-81c2-8bff077a7871'; -- First iain macritchie
    user_id_2 UUID := 'de617f30-ac3b-485b-879c-ba8d37d92448'; -- Second iain macritchie
    user_id_3 UUID := '578030ac-df77-410a-b600-aa425f0fff79'; -- Iain MacRitchie (Google)
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
    
    -- Check for any other tables that might reference auth.users
    -- This is a more generic approach to find potential references
    RAISE NOTICE 'Checking for other potential references:';
    FOR r IN (
        SELECT 
            c.table_schema, 
            c.table_name, 
            c.column_name
        FROM 
            information_schema.columns c
        JOIN 
            information_schema.tables t 
            ON c.table_schema = t.table_schema AND c.table_name = t.table_name
        WHERE 
            t.table_type = 'BASE TABLE' AND
            c.column_name LIKE '%user_id%' AND
            c.table_schema NOT IN ('information_schema', 'pg_catalog')
    ) LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I.%I WHERE %I IN ($1, $2, $3)', 
                      r.table_schema, r.table_name, r.column_name)
        INTO strict cnt
        USING user_id_1, user_id_2, user_id_3;
        
        IF cnt > 0 THEN
            RAISE NOTICE 'Found % references in %.%', cnt, r.table_schema, r.table_name;
        END IF;
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
