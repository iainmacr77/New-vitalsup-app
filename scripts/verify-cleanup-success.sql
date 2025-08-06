-- Verify that the cleanup was successful

-- Check for any remaining 'doctors' indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'newsletter_profiles'
ORDER BY indexname;

-- Check current constraints
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

-- Test that we can insert without the email unique constraint
-- (This is just a check - don't actually insert test data)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'newsletter_profiles'
AND column_name IN ('id', 'user_id', 'email', 'practice_name')
ORDER BY column_name;
