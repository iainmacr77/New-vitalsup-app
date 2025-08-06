-- Remove all old 'doctors' constraints and fix the newsletter_profiles table

-- 1. First, let's see what we're working with
\echo 'Current constraints on newsletter_profiles:'
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'newsletter_profiles'::regclass;

-- 2. Drop old 'doctors' constraints if they exist
DO $$
BEGIN
    -- Drop doctors_pkey if it exists (but keep the actual primary key)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_pkey') THEN
        ALTER TABLE newsletter_profiles DROP CONSTRAINT doctors_pkey CASCADE;
        RAISE NOTICE 'Dropped doctors_pkey constraint';
    END IF;
    
    -- Drop doctors_user_id_fkey if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_user_id_fkey') THEN
        ALTER TABLE newsletter_profiles DROP CONSTRAINT doctors_user_id_fkey CASCADE;
        RAISE NOTICE 'Dropped doctors_user_id_fkey constraint';
    END IF;
    
    -- Drop unique_user_id if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_id') THEN
        ALTER TABLE newsletter_profiles DROP CONSTRAINT unique_user_id CASCADE;
        RAISE NOTICE 'Dropped unique_user_id constraint';
    END IF;
    
    -- Drop doctors_email_unique if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_email_unique') THEN
        ALTER TABLE newsletter_profiles DROP CONSTRAINT doctors_email_unique CASCADE;
        RAISE NOTICE 'Dropped doctors_email_unique constraint';
    END IF;
    
    -- Drop any other constraints with 'doctors' in the name
    FOR constraint_record IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'newsletter_profiles'::regclass 
        AND conname LIKE '%doctors%'
    LOOP
        EXECUTE 'ALTER TABLE newsletter_profiles DROP CONSTRAINT ' || constraint_record.conname || ' CASCADE';
        RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
    END LOOP;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;

-- 3. Drop old indexes with 'doctors' in the name
DO $$
BEGIN
    FOR index_record IN 
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'newsletter_profiles' 
        AND indexname LIKE '%doctors%'
    LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || index_record.indexname || ' CASCADE';
        RAISE NOTICE 'Dropped index: %', index_record.indexname;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping indexes: %', SQLERRM;
END $$;

-- 4. Ensure we have the correct primary key
DO $$
BEGIN
    -- Check if we have a primary key
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'newsletter_profiles'::regclass 
        AND contype = 'p'
    ) THEN
        -- Add primary key if missing
        ALTER TABLE newsletter_profiles ADD CONSTRAINT newsletter_profiles_pkey PRIMARY KEY (id);
        RAISE NOTICE 'Added newsletter_profiles_pkey constraint';
    END IF;
END $$;

-- 5. Ensure we have the correct foreign key to auth.users
DO $$
BEGIN
    -- Check if we have a foreign key to auth.users
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'newsletter_profiles'::regclass 
        AND contype = 'f'
        AND pg_get_constraintdef(oid) LIKE '%auth.users%'
    ) THEN
        -- Add foreign key if missing
        ALTER TABLE newsletter_profiles 
        ADD CONSTRAINT newsletter_profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id);
        RAISE NOTICE 'Added newsletter_profiles_user_id_fkey constraint';
    END IF;
END $$;

-- 6. Create proper indexes for performance
CREATE INDEX IF NOT EXISTS newsletter_profiles_user_id_idx ON newsletter_profiles(user_id);
CREATE INDEX IF NOT EXISTS newsletter_profiles_practice_name_idx ON newsletter_profiles(practice_name);

-- 7. Verify the final state
\echo 'Final constraints on newsletter_profiles:'
SELECT 
    conname as constraint_name,
    CASE contype 
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
        ELSE contype::text
    END as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'newsletter_profiles'::regclass
ORDER BY contype, conname;

\echo 'Final indexes on newsletter_profiles:'
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'newsletter_profiles'
ORDER BY indexname;
