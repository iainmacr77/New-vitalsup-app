-- First, let's check the current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'doctors' 
ORDER BY ordinal_position;

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'doctors';

-- Drop and recreate RLS policies to ensure they're correct
DROP POLICY IF EXISTS doctors_select_policy ON doctors;
DROP POLICY IF EXISTS doctors_insert_policy ON doctors;
DROP POLICY IF EXISTS doctors_update_policy ON doctors;
DROP POLICY IF EXISTS doctors_delete_policy ON doctors;

-- Recreate RLS policies
CREATE POLICY doctors_select_policy ON doctors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY doctors_insert_policy ON doctors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY doctors_update_policy ON doctors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY doctors_delete_policy ON doctors
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON doctors TO authenticated;
GRANT ALL ON doctors TO service_role;
