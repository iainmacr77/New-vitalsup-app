-- Comprehensive fix for RLS policies on newsletter_profiles

-- 1. Disable RLS temporarily to clean up
ALTER TABLE newsletter_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies
DROP POLICY IF EXISTS newsletter_profiles_select_policy ON newsletter_profiles;
DROP POLICY IF EXISTS newsletter_profiles_insert_policy ON newsletter_profiles;
DROP POLICY IF EXISTS newsletter_profiles_update_policy ON newsletter_profiles;
DROP POLICY IF EXISTS newsletter_profiles_delete_policy ON newsletter_profiles;

-- 3. Re-enable RLS
ALTER TABLE newsletter_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create a simple, permissive INSERT policy for authenticated users
CREATE POLICY newsletter_profiles_insert_policy ON newsletter_profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- 5. Create SELECT policy (users can view profiles they have roles for)
CREATE POLICY newsletter_profiles_select_policy ON newsletter_profiles
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_id = auth.uid() 
      AND newsletter_profile_id = newsletter_profiles.id
    )
  );

-- 6. Create UPDATE policy (owners and managers can update)
CREATE POLICY newsletter_profiles_update_policy ON newsletter_profiles
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_id = auth.uid() 
      AND newsletter_profile_id = newsletter_profiles.id
      AND role IN ('owner', 'manager')
    )
  );

-- 7. Create DELETE policy (only owners can delete)
CREATE POLICY newsletter_profiles_delete_policy ON newsletter_profiles
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_newsletter_roles 
      WHERE user_id = auth.uid() 
      AND newsletter_profile_id = newsletter_profiles.id
      AND role = 'owner'
    )
  );

-- 8. Ensure proper permissions are granted
GRANT ALL ON newsletter_profiles TO authenticated;
GRANT ALL ON newsletter_profiles TO service_role;

-- 9. Also fix user_newsletter_roles policies to be more permissive for initial setup
ALTER TABLE user_newsletter_roles DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_newsletter_roles_select_policy ON user_newsletter_roles;
DROP POLICY IF EXISTS user_newsletter_roles_insert_policy ON user_newsletter_roles;
DROP POLICY IF EXISTS user_newsletter_roles_update_policy ON user_newsletter_roles;
DROP POLICY IF EXISTS user_newsletter_roles_delete_policy ON user_newsletter_roles;

ALTER TABLE user_newsletter_roles ENABLE ROW LEVEL SECURITY;

-- More permissive policies for user_newsletter_roles
CREATE POLICY user_newsletter_roles_select_policy ON user_newsletter_roles
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_newsletter_roles unr
      WHERE unr.user_id = auth.uid() 
      AND unr.newsletter_profile_id = user_newsletter_roles.newsletter_profile_id
      AND unr.role IN ('owner', 'manager')
    )
  );

CREATE POLICY user_newsletter_roles_insert_policy ON user_newsletter_roles
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY user_newsletter_roles_update_policy ON user_newsletter_roles
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_newsletter_roles unr
      WHERE unr.user_id = auth.uid() 
      AND unr.newsletter_profile_id = user_newsletter_roles.newsletter_profile_id
      AND unr.role = 'owner'
    )
  );

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

GRANT ALL ON user_newsletter_roles TO authenticated;
GRANT ALL ON user_newsletter_roles TO service_role;
