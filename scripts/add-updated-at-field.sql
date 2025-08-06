-- Add the missing updated_at timestamp field
ALTER TABLE newsletter_profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Also add a trigger to automatically update the timestamp on record updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_newsletter_profiles_updated_at ON newsletter_profiles;
CREATE TRIGGER update_newsletter_profiles_updated_at
    BEFORE UPDATE ON newsletter_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'newsletter_profiles' 
AND column_name = 'updated_at';

-- Check if there are any existing records that need the timestamp
UPDATE newsletter_profiles 
SET updated_at = created_at 
WHERE updated_at IS NULL AND created_at IS NOT NULL;
