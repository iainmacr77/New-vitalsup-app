-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS doctors;

-- Create doctors table with all required fields
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  
  -- Identity
  title TEXT,
  first_name TEXT,
  last_name TEXT,
  position TEXT,
  position_other TEXT,
  
  -- Practice Info
  practice_name TEXT,
  practice_address TEXT,
  specialty TEXT,
  specialty_other TEXT,
  
  -- Contact Info
  email TEXT,
  phone_number TEXT,
  mobile_phone TEXT,
  communication_preference TEXT,
  
  -- Operational Info
  patient_count INTEGER DEFAULT 1000,
  pms_system TEXT,
  booking_system TEXT,
  clinic_type TEXT,
  clinic_type_other TEXT,
  country TEXT DEFAULT 'South Africa',
  country_other TEXT,
  
  -- Newsletter fields
  newsletter_name TEXT DEFAULT 'An Apple a Day',
  newsletter_background_color TEXT DEFAULT 'soft-blue',
  headshot_url TEXT,
  newsletter_welcome_message TEXT DEFAULT '👋 Hello and welcome to this week''s "An Apple a Day" — your trusted guide to staying happy and healthy.',
  sender_email TEXT,
  custom_sender_domain BOOLEAN DEFAULT false,
  sending_frequency TEXT DEFAULT 'bi-weekly',
  
  -- Onboarding status
  onboarding_step INTEGER DEFAULT 1,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX doctors_user_id_idx ON doctors(user_id);

-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY doctors_select_policy ON doctors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY doctors_insert_policy ON doctors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY doctors_update_policy ON doctors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY doctors_delete_policy ON doctors
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON doctors TO authenticated;
GRANT ALL ON doctors TO service_role;
