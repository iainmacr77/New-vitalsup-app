-- Remove old 'doctors' constraints - corrected approach

-- First, drop the email unique constraint (this should work)
DROP INDEX IF EXISTS doctors_email_unique CASCADE;

-- Drop the doctors_pkey CONSTRAINT (not index)
ALTER TABLE newsletter_profiles DROP CONSTRAINT IF EXISTS doctors_pkey CASCADE;

-- Drop the old doctors_user_id_idx index
DROP INDEX IF EXISTS doctors_user_id_idx CASCADE;

-- Check what we have now
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
