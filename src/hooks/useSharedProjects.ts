import { useState, useEffect, useCallback } from 'react';
import { ProjectWithCounts } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useSharedProjects = (userId: string | undefined) => {
  const [sharedProjects, setSharedProjects] = useState<ProjectWithCounts[]>([]);
  const [loadingShared, setLoadingShared] = useState(false);
  const { toast } = useToast();

  const fetchSharedProjects = useCallback(async () => {
    if (!userId) return;
    
    setLoadingShared(true);
    try {
      // Step 1: Fetch accepted sharing records for the current user
      const { data: sharingData, error: sharingError } = await supabase
        .from('project_sharing')
        .select(`
          id,
          project_id,
          permission_level,
          invitation_status,
          owner_id,
          owner:auth_user_emails!owner_id(email)
        `)
        .eq('shared_with_id', userId)
        .eq('invitation_status', 'accepted');
        
      if (sharingError) throw sharingError;
      
      if (!sharingData || sharingData.length === 0) {
        setSharedProjects([]);
        setLoadingShared(false);
        return;
      }
      
      // Extract project IDs
      const projectIds = sharingData.map(item => item.project_id);
      
      // Step 2: Fetch the actual project data with counts directly via RLS
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          created_at,
          updated_at,
          user_id,
          notes:notes(count),
          tasks:tasks(count)
        `)
        .in('id', projectIds);
      
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        // Continue execution - we'll handle missing projects gracefully
      }
      
      // Create combined project list with proper counts
      const formattedProjects = projectIds.map(projectId => {
        // Find this project in the projects data
        const project = projectsData?.find(p => p.id === projectId);
        // Find the sharing record for this project
        const sharing = sharingData.find(s => s.project_id === projectId);
        
        if (project) {
          // We have actual project data, use it
          return {
            ...project,
            permission_level: sharing?.permission_level,
            sharing_id: sharing?.id,
            note_count: typeof project.notes === 'object' ? 
              ((project.notes as any)?.count || 0) : 
              (project.notes || 0),
            task_count: typeof project.tasks === 'object' ? 
              ((project.tasks as any)?.count || 0) : 
              (project.tasks || 0),
            owner_email: (sharing?.owner as any)?.email || 'Unknown',
            is_deleted: false
          };
        } else {
          // No project data found, likely deleted or no access - create a placeholder
          let ownerEmail = 'Unknown';
          let ownerName = 'Unknown';
          
          if (sharing?.owner && (sharing.owner as any)?.email) {
            ownerEmail = (sharing.owner as any).email;
            // Extract username from email (part before @)
            const emailParts = ownerEmail.split('@');
            ownerName = emailParts[0] || 'User';
          }
            
          return {
            id: projectId,
            title: `Shared by ${ownerName}`,
            description: "This project is no longer available.",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: sharing?.owner_id || '',
            note_count: 0,
            task_count: 0,
            permission_level: sharing?.permission_level,
            sharing_id: sharing?.id,
            owner_email: ownerEmail,
            is_placeholder: true,
            is_deleted: true
          };
        }
      });
      
      // If any projects were unavailable, show a warning toast
      const deletedProjects = formattedProjects.filter(p => p.is_deleted);
      if (deletedProjects.length > 0) {
        toast({
          title: `${deletedProjects.length} shared project(s) unavailable`,
          description: 'Some shared projects may have been deleted by their owners.',
          variant: 'default', 
        });
      }
      
      setSharedProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching shared projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shared projects',
        variant: 'destructive',
      });
    } finally {
      setLoadingShared(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (userId) {
      fetchSharedProjects();
    } else {
      // Clear shared projects when userId is undefined
      setSharedProjects([]);
    }
  }, [userId, fetchSharedProjects]);

  return {
    sharedProjects,
    loadingShared,
    fetchSharedProjects
  };
};
