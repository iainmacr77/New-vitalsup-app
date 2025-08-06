-- Rename doctors table to newsletter_profiles
ALTER TABLE IF EXISTS doctors RENAME TO newsletter_profiles;

-- Create user_newsletter_roles table
CREATE TABLE IF NOT EXISTS user_newsletter_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  newsletter_profile_id UUID REFERENCES newsletter_profiles(id) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'assistant', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invitation_accepted BOOLEAN DEFAULT FALSE,
  invitation_email TEXT,
  invitation_token TEXT,
  invitation_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, newsletter_profile_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_newsletter_roles_user_id_idx ON user_newsletter_roles(user_id);
CREATE INDEX IF NOT EXISTS user_newsletter_roles_newsletter_profile_id_idx ON user_newsletter_roles(newsletter_profile_id);
CREATE INDEX IF NOT EXISTS user_newsletter_roles_invitation_token_idx ON user_newsletter_roles(invitation_token);

-- Enable RLS on the new table
ALTER TABLE user_newsletter_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_newsletter_roles
-- Users can view roles for newsletter profiles they have access to
CREATE POLICY user_newsletter_roles_select_policy ON user_newsletter_roles
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_id = auth.uid() 
      AND newsletter_profile_id = user_newsletter_roles.newsletter_profile_id
      AND role IN ('owner', 'manager')
    )
  );

-- Only owners can insert new roles
CREATE POLICY user_newsletter_roles_insert_policy ON user_newsletter_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_id = auth.uid() 
      AND newsletter_profile_id = NEW.newsletter_profile_id
      AND role = 'owner'
    ) OR 
    -- Allow system to create the first owner role during signup
    (NEW.role = 'owner' AND NOT EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE newsletter_profile_id = NEW.newsletter_profile_id
    ))
  );

-- Only owners can update roles
CREATE POLICY user_newsletter_roles_update_policy ON user_newsletter_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_id = auth.uid() 
      AND newsletter_profile_id = user_newsletter_roles.newsletter_profile_id
      AND role = 'owner'
    )
  );

-- Only owners can delete roles
CREATE POLICY user_newsletter_roles_delete_policy ON user_newsletter_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_id = auth.uid() 
      AND newsletter_profile_id = user_newsletter_roles.newsletter_profile_id
      AND role = 'owner'
    )
  );

-- Update RLS policies for newsletter_profiles (formerly doctors)
DROP POLICY IF EXISTS doctors_select_policy ON newsletter_profiles;
DROP POLICY IF EXISTS doctors_insert_policy ON newsletter_profiles;
DROP POLICY IF EXISTS doctors_update_policy ON newsletter_profiles;
DROP POLICY IF EXISTS doctors_delete_policy ON newsletter_profiles;

-- Users can view newsletter profiles they have a role for
CREATE POLICY newsletter_profiles_select_policy ON newsletter_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_id = auth.uid() 
      AND newsletter_profile_id = newsletter_profiles.id
    )
  );

-- Only owners and managers can update newsletter profiles
CREATE POLICY newsletter_profiles_update_policy ON newsletter_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_id = auth.uid() 
      AND newsletter_profile_id = newsletter_profiles.id
      AND role IN ('owner', 'manager')
    )
  );

-- Only authenticated users can insert newsletter profiles (they become owners)
CREATE POLICY newsletter_profiles_insert_policy ON newsletter_profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only owners can delete newsletter profiles
CREATE POLICY newsletter_profiles_delete_policy ON newsletter_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_id = auth.uid() 
      AND newsletter_profile_id = newsletter_profiles.id
      AND role = 'owner'
    )
  );

-- Grant necessary permissions
GRANT ALL ON user_newsletter_roles TO authenticated;
GRANT ALL ON user_newsletter_roles TO service_role;
