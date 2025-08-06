-- Add all missing columns that the onboarding form expects
ALTER TABLE newsletter_profiles 
ADD COLUMN IF NOT EXISTS position_other TEXT,
ADD COLUMN IF NOT EXISTS specialty_other TEXT,
ADD COLUMN IF NOT EXISTS clinic_type_other TEXT,
ADD COLUMN IF NOT EXISTS country_other TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'newsletter_profiles' 
AND column_name IN ('position_other', 'specialty_other', 'clinic_type_other', 'country_other')
ORDER BY column_name;

-- Check the complete table structure to make sure we have everything
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'newsletter_profiles' 
ORDER BY ordinal_position;
