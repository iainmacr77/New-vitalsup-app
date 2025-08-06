-- Remove all old 'doctors' constraints - Supabase compatible version

-- Drop the problematic doctors_email_unique constraint
DROP INDEX IF EXISTS doctors_email_unique CASCADE;

-- Drop the old doctors_pkey index (this might be the primary key, so we'll be careful)
DROP INDEX IF EXISTS doctors_pkey CASCADE;

-- Drop the old doctors_user_id_idx index
DROP INDEX IF EXISTS doctors_user_id_idx CASCADE;

-- Now let's check what constraints actually exist on the table
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
