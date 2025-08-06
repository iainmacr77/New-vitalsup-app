-- Create doctors table if it doesn't exist
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  practice_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  practice_address TEXT NOT NULL,
  specialty TEXT NOT NULL,
  patient_count INTEGER,
  pms_system TEXT,
  booking_system TEXT,
  onboarding_step INTEGER DEFAULT 1,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS doctors_user_id_idx ON doctors(user_id);

-- Create RLS policies
-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own data
CREATE POLICY doctors_select_policy ON doctors
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own data
CREATE POLICY doctors_insert_policy ON doctors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own data
CREATE POLICY doctors_update_policy ON doctors
  FOR UPDATE USING (auth.uid() = user_id);
