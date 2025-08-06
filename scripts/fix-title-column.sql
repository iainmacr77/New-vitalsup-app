-- Check if salutation column exists and rename it to title
DO $$
BEGIN
    -- Check if salutation column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'doctors' 
        AND column_name = 'salutation'
    ) THEN
        -- Rename salutation to title
        ALTER TABLE doctors RENAME COLUMN salutation TO title;
        RAISE NOTICE 'Renamed salutation column to title';
    END IF;
    
    -- Check if title column exists, if not create it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'doctors' 
        AND column_name = 'title'
    ) THEN
        -- Add title column
        ALTER TABLE doctors ADD COLUMN title TEXT;
        RAISE NOTICE 'Added title column';
    END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'doctors' 
AND column_name IN ('title', 'salutation')
ORDER BY column_name;
