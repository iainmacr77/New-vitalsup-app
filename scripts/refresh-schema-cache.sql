-- Refresh the schema cache and fix any relationship issues

-- First, let's check the current state of our tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('newsletter_profiles', 'user_newsletter_roles')
AND table_schema = 'public';

-- Check foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'user_newsletter_roles';

-- If the foreign key is missing, recreate it
DO $$
BEGIN
    -- Check if the foreign key exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_newsletter_roles_newsletter_profile_id_fkey'
        AND table_name = 'user_newsletter_roles'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE user_newsletter_roles 
        ADD CONSTRAINT user_newsletter_roles_newsletter_profile_id_fkey 
        FOREIGN KEY (newsletter_profile_id) REFERENCES newsletter_profiles(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint for newsletter_profile_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- Refresh the schema cache by updating table comments (this forces Supabase to refresh)
COMMENT ON TABLE newsletter_profiles IS 'Newsletter profiles for practices - updated ' || NOW();
COMMENT ON TABLE user_newsletter_roles IS 'User roles for newsletter profiles - updated ' || NOW();

-- Verify the final state
SELECT 
    'newsletter_profiles' as table_name,
    COUNT(*) as record_count
FROM newsletter_profiles
UNION ALL
SELECT 
    'user_newsletter_roles' as table_name,
    COUNT(*) as record_count
FROM user_newsletter_roles;
