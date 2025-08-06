-- Update doctors table to rename salutation to title and add country_other
ALTER TABLE doctors 
RENAME COLUMN salutation TO title;

-- Add country_other column if it doesn't exist
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS country_other TEXT;

-- Ensure all other new fields exist
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS position_other TEXT,
ADD COLUMN IF NOT EXISTS specialty_other TEXT,
ADD COLUMN IF NOT EXISTS clinic_type_other TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing records to include email from auth.users if not already set
UPDATE doctors 
SET email = auth.users.email 
FROM auth.users 
WHERE doctors.user_id = auth.users.id 
AND doctors.email IS NULL;
