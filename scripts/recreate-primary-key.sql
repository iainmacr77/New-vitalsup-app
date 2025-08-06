-- Recreate the primary key with the correct name

-- Add the primary key back with the correct name
ALTER TABLE newsletter_profiles ADD CONSTRAINT newsletter_profiles_pkey PRIMARY KEY (id);

-- Ensure we have the foreign key to auth.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'newsletter_profiles'::regclass 
        AND contype = 'f'
        AND pg_get_constraintdef(oid) LIKE '%auth.users%'
    ) THEN
        ALTER TABLE newsletter_profiles 
        ADD CONSTRAINT newsletter_profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;
END $$;

-- Create proper indexes (non-unique)
CREATE INDEX IF NOT EXISTS newsletter_profiles_user_id_idx ON newsletter_profiles(user_id);
CREATE INDEX IF NOT EXISTS newsletter_profiles_practice_name_idx ON newsletter_profiles(practice_name);

-- Final verification
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
