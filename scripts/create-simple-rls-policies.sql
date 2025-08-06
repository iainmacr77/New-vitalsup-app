-- Create simple, working RLS policies for the multi-user system

-- First, ensure RLS is enabled on both tables
ALTER TABLE newsletter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_newsletter_roles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS newsletter_profiles_select_policy ON newsletter_profiles;
DROP POLICY IF EXISTS newsletter_profiles_insert_policy ON newsletter_profiles;
DROP POLICY IF EXISTS newsletter_profiles_update_policy ON newsletter_profiles;
DROP POLICY IF EXISTS newsletter_profiles_delete_policy ON newsletter_profiles;

DROP POLICY IF EXISTS user_newsletter_roles_select_policy ON user_newsletter_roles;
DROP POLICY IF EXISTS user_newsletter_roles_insert_policy ON user_newsletter_roles;
DROP POLICY IF EXISTS user_newsletter_roles_update_policy ON user_newsletter_roles;
DROP POLICY IF EXISTS user_newsletter_roles_delete_policy ON user_newsletter_roles;

-- Create simple policies for newsletter_profiles
-- Allow authenticated users to insert (they become owners)
CREATE POLICY newsletter_profiles_insert_policy ON newsletter_profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to select profiles they have roles for
CREATE POLICY newsletter_profiles_select_policy ON newsletter_profiles
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_newsletter_roles.user_id = auth.uid() 
      AND user_newsletter_roles.newsletter_profile_id = newsletter_profiles.id
    )
  );

-- Allow owners and managers to update
CREATE POLICY newsletter_profiles_update_policy ON newsletter_profiles
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_newsletter_roles.user_id = auth.uid() 
      AND user_newsletter_roles.newsletter_profile_id = newsletter_profiles.id
      AND user_newsletter_roles.role IN ('owner', 'manager')
    )
  );

-- Allow only owners to delete
CREATE POLICY newsletter_profiles_delete_policy ON newsletter_profiles
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_newsletter_roles.user_id = auth.uid() 
      AND user_newsletter_roles.newsletter_profile_id = newsletter_profiles.id
      AND user_newsletter_roles.role = 'owner'
    )
  );

-- Create simple policies for user_newsletter_roles
-- Allow authenticated users to insert roles
CREATE POLICY user_newsletter_roles_insert_policy ON user_newsletter_roles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to see roles for profiles they have access to
CREATE POLICY user_newsletter_roles_select_policy ON user_newsletter_roles
  FOR SELECT 
  TO authenticated
  USING (
    user_newsletter_roles.user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_newsletter_roles unr
      WHERE unr.user_id = auth.uid() 
      AND unr.newsletter_profile_id = user_newsletter_roles.newsletter_profile_id
      AND unr.role IN ('owner', 'manager')
    )
  );

-- Allow owners to update roles
CREATE POLICY user_newsletter_roles_update_policy ON user_newsletter_roles
  FOR UPDATE 
  TO authenticated
  USING (
    user_newsletter_roles.user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_newsletter_roles unr
      WHERE unr.user_id = auth.uid() 
      AND unr.newsletter_profile_id = user_newsletter_roles.newsletter_profile_id
      AND unr.role = 'owner'
    )
  );

-- Allow owners to delete roles
CREATE POLICY user_newsletter_roles_delete_policy ON user_newsletter_roles
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles unr
      WHERE unr.user_id = auth.uid() 
      AND unr.newsletter_profile_id = user_newsletter_roles.newsletter_profile_id
      AND unr.role = 'owner'
    )
  );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('newsletter_profiles', 'user_newsletter_roles')
ORDER BY tablename, cmd, policyname;
