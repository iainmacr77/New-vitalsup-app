-- Comprehensive cleanup script to remove ALL references to test users
-- This will find and delete references from any table that might be blocking user deletion

DO $$
DECLARE
    test_emails TEXT[] := ARRAY[
        'iain_mactichie@hotmail.com',
        'im@liberty-wealth.com'
    ];
    user_ids UUID[];
    user_id UUID;
    table_record RECORD;
    ref_count INTEGER;
BEGIN
    -- First, collect all user IDs for these emails
    SELECT ARRAY_AGG(id) INTO user_ids
    FROM auth.users 
    WHERE email = ANY(test_emails);
    
    RAISE NOTICE 'Found user IDs: %', user_ids;
    
    -- If no users found, exit
    IF user_ids IS NULL OR array_length(user_ids, 1) = 0 THEN
        RAISE NOTICE 'No users found with the specified emails';
        RETURN;
    END IF;
    
    -- Disable RLS temporarily for cleanup
    SET row_security = off;
    
    -- Find and clean ALL tables that reference these user IDs
    FOR table_record IN (
        SELECT 
            schemaname,
            tablename,
            columnname
        FROM (
            -- Get all columns that might reference user IDs
            SELECT 
                t.schemaname,
                t.tablename,
                c.column_name as columnname
            FROM 
                pg_tables t
            JOIN 
                information_schema.columns c 
                ON c.table_schema = t.schemaname 
                AND c.table_name = t.tablename
            WHERE 
                t.schemaname NOT IN ('information_schema', 'pg_catalog', 'auth', 'storage', 'supabase_functions', 'extensions', 'graphql', 'graphql_public', 'net', 'pgsodium', 'pgsodium_masks', 'pgtle', 'realtime', 'supabase_migrations', 'vault')
                AND (
                    c.column_name LIKE '%user_id%' 
                    OR c.column_name = 'id'
                    OR c.data_type = 'uuid'
                )
        ) sub
    ) LOOP
        -- Check if this table/column has references to our user IDs
        BEGIN
            EXECUTE format(
                'SELECT COUNT(*) FROM %I.%I WHERE %I = ANY($1)',
                table_record.schemaname,
                table_record.tablename,
                table_record.columnname
            ) INTO ref_count USING user_ids;
            
            IF ref_count > 0 THEN
                RAISE NOTICE 'Found % references in %.%.%', ref_count, table_record.schemaname, table_record.tablename, table_record.columnname;
                
                -- Delete the references
                EXECUTE format(
                    'DELETE FROM %I.%I WHERE %I = ANY($1)',
                    table_record.schemaname,
                    table_record.tablename,
                    table_record.columnname
                ) USING user_ids;
                
                RAISE NOTICE 'Deleted % references from %.%.%', ref_count, table_record.schemaname, table_record.tablename, table_record.columnname;
            END IF;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not check table %.%: %', table_record.tablename, table_record.columnname, SQLERRM;
        END;
    END LOOP;
    
    -- Also clean up by email address in case there are email-based references
    FOREACH user_id IN ARRAY user_ids LOOP
        -- Clean up any email-based references
        DELETE FROM user_newsletter_roles WHERE invitation_email IN (
            SELECT email FROM auth.users WHERE id = user_id
        );
    END LOOP;
    
    -- Re-enable RLS
    SET row_security = on;
    
    RAISE NOTICE 'Comprehensive cleanup complete!';
    RAISE NOTICE 'Now try deleting the users from the Supabase Auth dashboard again.';
    RAISE NOTICE 'User IDs to delete: %', user_ids;
    
END $$;
