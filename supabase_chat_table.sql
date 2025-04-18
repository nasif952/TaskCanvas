-- Run this in your Supabase SQL editor to create the chat_messages table

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages for projects they own
CREATE POLICY "Users can view messages for projects they own"
    ON public.chat_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = chat_messages.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Policy: Users can view messages for projects shared with them
CREATE POLICY "Users can view messages for projects shared with them"
    ON public.chat_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_sharing
            WHERE project_sharing.project_id = chat_messages.project_id
            AND project_sharing.shared_with_id = auth.uid()
            AND project_sharing.invitation_status = 'accepted'
        )
    );

-- Policy: Users can insert messages for projects they own
CREATE POLICY "Users can insert messages for projects they own"
    ON public.chat_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = chat_messages.project_id
            AND projects.user_id = auth.uid()
        )
        AND created_by = auth.uid()
    );

-- Policy: Users can insert messages for projects shared with them
CREATE POLICY "Users can insert messages for shared projects"
    ON public.chat_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_sharing
            WHERE project_sharing.project_id = chat_messages.project_id
            AND project_sharing.shared_with_id = auth.uid()
            AND project_sharing.invitation_status = 'accepted'
        )
        AND created_by = auth.uid()
    ); 