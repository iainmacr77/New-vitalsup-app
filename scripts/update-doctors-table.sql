-- Drop existing table if needed (comment this out if you want to preserve existing data)
-- DROP TABLE IF EXISTS doctors;

-- Create or update doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Identity
  salutation TEXT,
  first_name TEXT,
  last_name TEXT,
  position TEXT,
  
  -- Practice Info
  practice_name TEXT,
  practice_address TEXT,
  specialty TEXT,
  
  -- Contact Info
  phone_number TEXT,
  mobile_phone TEXT,
  communication_preference TEXT,
  
  -- Operational Info
  patient_count INTEGER,
  pms_system TEXT,
  booking_system TEXT,
  clinic_type TEXT,
  country TEXT,
  
  -- Onboarding status
  onboarding_step INTEGER DEFAULT 1,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS doctors_user_id_idx ON doctors(user_id);

-- Enable RLS if not already enabled
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if needed
DROP POLICY IF EXISTS doctors_select_policy ON doctors;
DROP POLICY IF EXISTS doctors_insert_policy ON doctors;
DROP POLICY IF EXISTS doctors_update_policy ON doctors;

-- Create policy for users to view their own data
CREATE POLICY doctors_select_policy ON doctors
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own data
CREATE POLICY doctors_insert_policy ON doctors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own data
CREATE POLICY doctors_update_policy ON doctors
  FOR UPDATE USING (auth.uid() = user_id);
