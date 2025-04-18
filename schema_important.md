-- Create the projects table
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

-- Create the project_sharing table
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
  CONSTRAINT project_sharing_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT project_sharing_shared_with_id_fkey FOREIGN KEY (shared_with_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT project_sharing_permission_level_check CHECK (permission_level = ANY (ARRAY['view'::text, 'edit'::text])),
  CONSTRAINT project_sharing_invitation_status_check CHECK (invitation_status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text]))
);

-- Create the notes table
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT notes_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Create the profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLS Policies for project_sharing
CREATE POLICY "Users can update their own invitations" ON public.project_sharing
  FOR UPDATE
  USING (auth.uid() = shared_with_id)
  WITH CHECK (
    auth.uid() = shared_with_id AND
    invitation_status IS DISTINCT FROM invitation_status
  );

CREATE POLICY "Project owners can manage sharing" ON public.project_sharing
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can see when projects are shared with them" ON public.project_sharing
  FOR SELECT
  USING (shared_with_id = auth.uid());

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own projects" ON public.projects
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for notes
CREATE POLICY "Users can view notes in their projects" ON public.notes
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE (projects.id = notes.project_id AND projects.user_id = auth.uid())));

CREATE POLICY "Users can manage notes in their projects" ON public.notes
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE (projects.id = notes.project_id AND projects.user_id = auth.uid())));

-- RLS Policies for profiles
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);