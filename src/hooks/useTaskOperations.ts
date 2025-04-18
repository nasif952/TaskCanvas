
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Task } from '@/lib/types';
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

export function useTaskOperations() {
  const [loadingTasks, setLoadingTasks] = useState(false);
  const { toast } = useToast();

  const fetchProjectTasks = async (projectId: string) => {
    setLoadingTasks(true);
    try {
      const { data, error } = await fetchWithRetry(async () => {
        return await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false });
      });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project tasks. Please try again later.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoadingTasks(false);
    }
  };

  const createTask = async (
    projectId: string,
    userId: string,
    title: string,
    description: string,
    status: Task['status'],
    taskType: Task['task_type'],
    parentTaskId?: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await fetchWithRetry(async () => {
        return await supabase
          .from('tasks')
          .insert([{
            project_id: projectId,
            parent_task_id: parentTaskId || null,
            title,
            description,
            status,
            task_type: taskType,
            created_by: userId,
          }])
          .select()
          .single();
      });
        
      if (error) throw error;
      
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully.',
      });
      
      return data.id;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'created_by'>>) => {
    try {
      const { error } = await fetchWithRetry(async () => {
        return await supabase
          .from('tasks')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);
      });
        
      if (error) throw error;
      
      toast({
        title: 'Task updated',
        description: 'Your task has been updated successfully.',
      });
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again later.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await fetchWithRetry(async () => {
        return await supabase
          .from('tasks')
          .delete()
          .eq('id', id);
      });
        
      if (error) throw error;
      
      toast({
        title: 'Task deleted',
        description: 'Your task has been deleted successfully.',
      });
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again later.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    loadingTasks,
    fetchProjectTasks,
    createTask,
    updateTask,
    deleteTask
  };
}
