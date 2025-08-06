-- Ensure we have the correct constraints after cleanup

-- Make sure we have a proper primary key
DO $$
BEGIN
    -- Check if we have a primary key constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'newsletter_profiles'::regclass 
        AND contype = 'p'
    ) THEN
        -- Add primary key if missing
        ALTER TABLE newsletter_profiles ADD CONSTRAINT newsletter_profiles_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- Make sure we have a proper foreign key to auth.users
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
    END IF;
END $$;

-- Create proper indexes for performance (but NOT unique on email)
CREATE INDEX IF NOT EXISTS newsletter_profiles_user_id_idx ON newsletter_profiles(user_id);
CREATE INDEX IF NOT EXISTS newsletter_profiles_practice_name_idx ON newsletter_profiles(practice_name);

-- Verify final state
SELECT 
    conname as constraint_name,
    CASE contype 
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
        ELSE contype::text
    END as constraint_type
FROM pg_constraint 
WHERE conrelid = 'newsletter_profiles'::regclass
ORDER BY contype, conname;
