-- This migration fixes the foreign key relationships for project sharing

-- If auth_user_emails doesn't exist, create it as a view
CREATE OR REPLACE VIEW auth_user_emails AS
SELECT id as user_id, email
FROM auth.users;

-- Grant necessary permissions
GRANT SELECT ON auth_user_emails TO authenticated;
GRANT SELECT ON auth_user_emails TO service_role;

-- Ensure foreign key constraints for project_sharing are properly set up
ALTER TABLE IF EXISTS project_sharing
DROP CONSTRAINT IF EXISTS project_sharing_project_id_fkey,
ADD CONSTRAINT project_sharing_project_id_fkey
  FOREIGN KEY (project_id)
  REFERENCES projects(id)
  ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate sharing
ALTER TABLE IF EXISTS project_sharing
DROP CONSTRAINT IF EXISTS unique_project_sharing,
ADD CONSTRAINT unique_project_sharing
  UNIQUE (project_id, shared_with_id);

-- Update RLS policies for project_sharing
-- Users can update their own invitations
DROP POLICY IF EXISTS users_can_update_their_invitations ON project_sharing;
CREATE POLICY users_can_update_their_invitations ON project_sharing
  FOR UPDATE
  USING (auth.uid() = shared_with_id)
  WITH CHECK (
    auth.uid() = shared_with_id AND
    invitation_status IS DISTINCT FROM NEW.invitation_status
  );

-- Project owners can manage sharing
DROP POLICY IF EXISTS owners_can_manage_sharing ON project_sharing;
CREATE POLICY owners_can_manage_sharing ON project_sharing
  USING (auth.uid() = owner_id);

-- Shared users can see shared projects
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_sharing_shared_with_id
  ON project_sharing(shared_with_id);

CREATE INDEX IF NOT EXISTS idx_project_sharing_project_id
  ON project_sharing(project_id);

CREATE INDEX IF NOT EXISTS idx_project_sharing_invitation_status
  ON project_sharing(invitation_status);

-- Create composite index for pending invitations query
CREATE INDEX IF NOT EXISTS idx_project_sharing_pending_invitations
  ON project_sharing(shared_with_id, invitation_status); 