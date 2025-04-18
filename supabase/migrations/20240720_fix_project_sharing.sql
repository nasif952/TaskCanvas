-- First, create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique index on email (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower ON profiles (LOWER(email));

-- Ensure proper foreign key constraint on project_sharing table
-- that cascades deletions when a project is deleted
ALTER TABLE IF EXISTS project_sharing
DROP CONSTRAINT IF EXISTS project_sharing_project_id_fkey,
ADD CONSTRAINT project_sharing_project_id_fkey
  FOREIGN KEY (project_id)
  REFERENCES projects(id)
  ON DELETE CASCADE;

-- Add a unique constraint to prevent duplicate sharing records
ALTER TABLE IF EXISTS project_sharing
DROP CONSTRAINT IF EXISTS unique_project_sharing,
ADD CONSTRAINT unique_project_sharing
  UNIQUE (project_id, shared_with_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_sharing_shared_with_id
  ON project_sharing(shared_with_id);

CREATE INDEX IF NOT EXISTS idx_project_sharing_project_id
  ON project_sharing(project_id);

CREATE INDEX IF NOT EXISTS idx_project_sharing_invitation_status
  ON project_sharing(invitation_status);

-- Create composite index for pending invitations query
CREATE INDEX IF NOT EXISTS idx_project_sharing_pending_invitations
  ON project_sharing(shared_with_id, invitation_status);

-- Row-level security policy to ensure users can only manipulate their own invitations
DROP POLICY IF EXISTS users_can_update_their_invitations ON project_sharing;
CREATE POLICY users_can_update_their_invitations ON project_sharing
  FOR UPDATE
  USING (auth.uid() = shared_with_id)
  WITH CHECK (
    auth.uid() = shared_with_id AND
    -- Only allow changing invitation_status
    OLD.invitation_status IS DISTINCT FROM NEW.invitation_status
  );

-- Ensure owners can manage their project sharing
DROP POLICY IF EXISTS owners_can_manage_sharing ON project_sharing;
CREATE POLICY owners_can_manage_sharing ON project_sharing
  USING (auth.uid() = owner_id);

-- Ensure shared users can see projects shared with them
DROP POLICY IF EXISTS shared_users_can_see_projects ON projects;
CREATE POLICY shared_users_can_see_projects ON projects
  FOR SELECT
  USING (
    id IN (
      SELECT project_id 
      FROM project_sharing 
      WHERE shared_with_id = auth.uid() AND invitation_status = 'accepted'
    )
  );

-- Create a function to auto-populate profile email from auth.users
CREATE OR REPLACE FUNCTION sync_user_email_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the email in the profiles table when a user's email changes
  UPDATE profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to keep profiles.email in sync with auth.users
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email_to_profile();

-- Create a function to populate profiles from existing users
DO $$
BEGIN
  INSERT INTO profiles (id, email)
  SELECT id, email FROM auth.users
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Grant necessary permissions
GRANT ALL ON TABLE profiles TO authenticated;
GRANT ALL ON TABLE profiles TO service_role;

-- Add RLS policy for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id); 