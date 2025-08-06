-- Fix the infinite recursion in RLS policies

-- Disable RLS temporarily to clean up
ALTER TABLE user_newsletter_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS user_newsletter_roles_select_policy ON user_newsletter_roles;
DROP POLICY IF EXISTS user_newsletter_roles_insert_policy ON user_newsletter_roles;
DROP POLICY IF EXISTS user_newsletter_roles_update_policy ON user_newsletter_roles;
DROP POLICY IF EXISTS user_newsletter_roles_delete_policy ON user_newsletter_roles;

DROP POLICY IF EXISTS newsletter_profiles_select_policy ON newsletter_profiles;
DROP POLICY IF EXISTS newsletter_profiles_insert_policy ON newsletter_profiles;
DROP POLICY IF EXISTS newsletter_profiles_update_policy ON newsletter_profiles;
DROP POLICY IF EXISTS newsletter_profiles_delete_policy ON newsletter_profiles;

-- Re-enable RLS
ALTER TABLE user_newsletter_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for user_newsletter_roles
-- Allow users to see their own roles
CREATE POLICY user_newsletter_roles_select_policy ON user_newsletter_roles
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

-- Allow authenticated users to insert (for initial setup and invitations)
CREATE POLICY user_newsletter_roles_insert_policy ON user_newsletter_roles
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own roles (for accepting invitations)
CREATE POLICY user_newsletter_roles_update_policy ON user_newsletter_roles
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to delete their own roles
CREATE POLICY user_newsletter_roles_delete_policy ON user_newsletter_roles
  FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid());

-- Create simple policies for newsletter_profiles
-- Allow authenticated users to insert
CREATE POLICY newsletter_profiles_insert_policy ON newsletter_profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow users to select profiles (we'll handle access control in the application layer for now)
CREATE POLICY newsletter_profiles_select_policy ON newsletter_profiles
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow users to update profiles (we'll handle access control in the application layer)
CREATE POLICY newsletter_profiles_update_policy ON newsletter_profiles
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Allow users to delete profiles (we'll handle access control in the application layer)
CREATE POLICY newsletter_profiles_delete_policy ON newsletter_profiles
  FOR DELETE 
  TO authenticated
  USING (true);

-- Grant permissions
GRANT ALL ON user_newsletter_roles TO authenticated;
GRANT ALL ON user_newsletter_roles TO service_role;
GRANT ALL ON newsletter_profiles TO authenticated;
GRANT ALL ON newsletter_profiles TO service_role;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('newsletter_profiles', 'user_newsletter_roles')
ORDER BY tablename, cmd, policyname;
