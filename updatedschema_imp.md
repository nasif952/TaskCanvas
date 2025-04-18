-- Create View
CREATE VIEW public.auth_user_emails AS 
SELECT users.id AS user_id, users.email 
FROM auth.users;

-- Create Tables
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NULL,
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT notes_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower ON public.profiles USING btree (lower(email));

CREATE TABLE public.project_sharing (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  shared_with_id uuid NOT NULL,
  permission_level text NOT NULL,
  invitation_status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_sharing_pkey PRIMARY KEY (id),
  CONSTRAINT unique_project_sharing UNIQUE (project_id, shared_with_id),
  CONSTRAINT project_sharing_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT project_sharing_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT project_sharing_shared_with_id_fkey FOREIGN KEY (shared_with_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT project_sharing_permission_level_check CHECK ((permission_level = ANY (ARRAY['view'::text, 'edit'::text]))),
  CONSTRAINT project_sharing_invitation_status_check CHECK ((invitation_status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])))
);
CREATE INDEX IF NOT EXISTS idx_project_sharing_shared_with_id ON public.project_sharing USING btree (shared_with_id);
CREATE INDEX IF NOT EXISTS idx_project_sharing_project_id ON public.project_sharing USING btree (project_id);
CREATE INDEX IF NOT EXISTS idx_project_sharing_invitation_status ON public.project_sharing USING btree (invitation_status);
CREATE INDEX IF NOT EXISTS idx_project_sharing_pending_invitations ON public.project_sharing USING btree (shared_with_id, invitation_status);

CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  parent_task_id uuid NULL,
  title text NOT NULL,
  description text NULL,
  status text NOT NULL,
  task_type text NOT NULL,
  due_date timestamp with time zone NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT tasks_parent_task_id_fkey FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['todo'::text, 'in-progress'::text, 'completed'::text]))),
  CONSTRAINT tasks_task_type_check CHECK ((task_type = ANY (ARRAY['task'::text, 'note'::text])))
);

-----------------------------
-- Users can view their own projects
CREATE POLICY "Users can view their own projects" 
ON projects 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Users can create their own projects
CREATE POLICY "Users can create their own projects" 
ON projects 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Users can update their own projects
CREATE POLICY "Users can update their own projects" 
ON projects 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

-- Users can delete their own projects
CREATE POLICY "Users can delete their own projects" 
ON projects 
FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- Users can view tasks in their projects
CREATE POLICY "Users can view tasks in their projects" 
ON tasks 
FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM projects WHERE (projects.id = tasks.project_id AND projects.user_id = auth.uid())));

-- Users can manage tasks in their projects
CREATE POLICY "Users can manage tasks in their projects" 
ON tasks 
FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM projects WHERE (projects.id = tasks.project_id AND projects.user_id = auth.uid())));

-- Users can view notes in their projects
CREATE POLICY "Users can view notes in their projects" 
ON notes 
FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM projects WHERE (projects.id = notes.project_id AND projects.user_id = auth.uid())));

-- Users can manage notes in their projects
CREATE POLICY "Users can manage notes in their projects" 
ON notes 
FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM projects WHERE (projects.id = notes.project_id AND projects.user_id = auth.uid())));

-- Project owners can view project shares
CREATE POLICY "Project owners can view project shares" 
ON project_sharing 
FOR SELECT 
TO authenticated 
USING (owner_id = auth.uid());

-- Project owners can create/manage project shares
CREATE POLICY "Project owners can create/manage project shares" 
ON project_sharing 
FOR ALL 
TO authenticated 
USING (owner_id = auth.uid());

-- Users can see when projects are shared with them
CREATE POLICY "Users can see when projects are shared with them" 
ON project_sharing 
FOR SELECT 
TO authenticated 
USING (shared_with_id = auth.uid());

-- Users can update their own invitations
CREATE POLICY "Users can update their own invitations" 
ON project_sharing 
FOR UPDATE 
TO authenticated 
USING (shared_with_id = auth.uid()) 
WITH CHECK ((shared_with_id = auth.uid()) AND (invitation_status = ANY (ARRAY['accepted'::text, 'rejected'::text])));

-- Users can leave shared projects
CREATE POLICY "Users can leave shared projects" 
ON project_sharing 
FOR DELETE 
TO authenticated 
USING (shared_with_id = auth.uid());

-- Users can view projects shared with them
CREATE POLICY "Users can view projects shared with them" 
ON project_sharing 
FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM project_sharing WHERE (project_sharing.project_id = project_sharing.id AND project_sharing.shared_with_id = auth.uid() AND project_sharing.invitation_status = 'accepted'::text)));

-- Users can view tasks in shared projects
CREATE POLICY "Users can view tasks in shared projects" 
ON tasks 
FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM project_sharing WHERE (project_sharing.project_id = project_sharing.project_id AND project_sharing.shared_with_id = auth.uid() AND project_sharing.invitation_status = 'accepted'::text)));

-- Users with edit permission can modify tasks
CREATE POLICY "Users with edit permission can modify tasks" 
ON tasks 
FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM project_sharing WHERE (project_sharing.project_id = project_sharing.project_id AND project_sharing.shared_with_id = auth.uid() AND project_sharing.permission_level = 'edit'::text AND project_sharing.invitation_status = 'accepted'::text)));

-- Users can view notes in shared projects
CREATE POLICY "Users can view notes in shared projects" 
ON notes 
FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM project_sharing WHERE (project_sharing.project_id = project_sharing.project_id AND project_sharing.shared_with_id = auth.uid() AND project_sharing.invitation_status = 'accepted'::text)));

-- Users with edit permission can modify notes
CREATE POLICY "Users with edit permission can modify notes" 
ON notes 
FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM project_sharing WHERE (project_sharing.project_id = project_sharing.project_id AND project_sharing.shared_with_id = auth.uid() AND project_sharing.permission_level = 'edit'::text AND project_sharing.invitation_status = 'accepted'::text)));

-- Project owners can manage sharing
CREATE POLICY "Project owners can manage sharing" 
ON project_sharing 
FOR ALL 
TO authenticated 
USING (auth.uid() = owner_id);

-- Users can view all profiles
CREATE POLICY "Users can view all profiles" 
ON profiles 
FOR SELECT 
TO authenticated, anon 
USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile" 
ON profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Users can update their invitations
CREATE POLICY "users_can_update_their_invitations" 
ON project_sharing 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = shared_with_id) 
WITH CHECK ((auth.uid() = shared_with_id) AND (invitation_status IS DISTINCT FROM invitation_status));

-- Owners can manage sharing
CREATE POLICY "owners_can_manage_sharing" 
ON project_sharing 
FOR ALL 
TO authenticated 
USING (auth.uid() = owner_id);

-- Shared users can see projects
CREATE POLICY "shared_users_can_see_projects" 
ON project_sharing 
FOR SELECT 
TO authenticated 
USING (id IN (SELECT project_sharing.project_id FROM project_sharing WHERE (project_sharing.shared_with_id = auth.uid() AND project_sharing.invitation_status = 'accepted'::text)));