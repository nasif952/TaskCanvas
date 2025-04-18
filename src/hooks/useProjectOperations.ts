
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Project, ProjectWithCounts } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

// Helper for retry logic
const fetchWithRetry = async (fetcher: () => Promise<any>, maxRetries = 2) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fetcher();
    } catch (error) {
      retries++;
      if (retries >= maxRetries) throw error;
      // Exponential backoff with shorter wait times
      await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(1.5, retries)));
    }
  }
};

export function useProjectOperations() {
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const { toast } = useToast();

  const fetchProjects = async (userId: string | undefined) => {
    if (!userId) return [];
    
    setLoadingProjects(true);
    try {
      const { data, error } = await fetchWithRetry(async () => {
        return await supabase
          .from('projects')
          .select(`
            *,
            note_count:notes(count),
            task_count:tasks(count)
          `)
          .order('updated_at', { ascending: false });
      });
        
      if (error) throw error;
      
      // Process the counts to ensure they are numbers, not objects
      const projectsWithCounts: ProjectWithCounts[] = data.map(project => ({
        ...project,
        note_count: typeof project.note_count === 'object' && project.note_count !== null 
          ? (project.note_count.count || 0) 
          : (project.note_count || 0),
        task_count: typeof project.task_count === 'object' && project.task_count !== null 
          ? (project.task_count.count || 0) 
          : (project.task_count || 0)
      }));
      
      return projectsWithCounts;
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your projects. Please try again later.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchProject = async (id: string) => {
    setLoadingProject(true);
    try {
      const { data, error } = await fetchWithRetry(async () => {
        return await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .maybeSingle(); // Use maybeSingle instead of single to prevent errors if no data
      });
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project details. Please try again later.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoadingProject(false);
    }
  };

  const createProject = async (userId: string, title: string, description: string): Promise<string | null> => {
    try {
      const { data, error } = await fetchWithRetry(async () => {
        return await supabase
          .from('projects')
          .insert([{
            title,
            description,
            user_id: userId,
          }])
          .select()
          .single();
      });
        
      if (error) throw error;
      
      toast({
        title: 'Project created',
        description: 'Your new project has been created successfully.',
      });
      
      return data.id;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateProject = async (id: string, title: string, description: string) => {
    try {
      const { error } = await fetchWithRetry(async () => {
        return await supabase
          .from('projects')
          .update({ title, description, updated_at: new Date().toISOString() })
          .eq('id', id);
      });
        
      if (error) throw error;
      
      toast({
        title: 'Project updated',
        description: 'Your project has been updated successfully.',
      });
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again later.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await fetchWithRetry(async () => {
        return await supabase
          .from('projects')
          .delete()
          .eq('id', id);
      });
        
      if (error) throw error;
      
      toast({
        title: 'Project deleted',
        description: 'Your project has been deleted successfully.',
      });
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again later.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    loadingProjects,
    loadingProject,
    setLoadingProject, // Exposing the setter
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject
  };
}
