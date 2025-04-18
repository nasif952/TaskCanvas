
import { useState } from 'react';
import { supabase, withBackoff } from '@/lib/supabase';
import { Note } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

export function useNoteOperations() {
  const [loadingNotes, setLoadingNotes] = useState(false);
  const { toast } = useToast();

  const fetchProjectNotes = async (projectId: string) => {
    setLoadingNotes(true);
    try {
      const { data, error } = await withBackoff(async () => {
        return await supabase
          .from('notes')
          .select('*')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false });
      });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project notes. Please try again later.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoadingNotes(false);
    }
  };

  const createNote = async (projectId: string, userId: string, content: any): Promise<string | null> => {
    try {
      const { data, error } = await withBackoff(async () => {
        return await supabase
          .from('notes')
          .insert([{
            project_id: projectId,
            content,
            created_by: userId,
          }])
          .select()
          .single();
      });
        
      if (error) throw error;
      
      toast({
        title: 'Note created',
        description: 'Your note has been created successfully.',
      });
      
      return data.id;
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to create note. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateNote = async (id: string, content: any) => {
    try {
      const { error } = await withBackoff(async () => {
        return await supabase
          .from('notes')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', id);
      });
        
      if (error) throw error;
      
      toast({
        title: 'Note updated',
        description: 'Your note has been updated successfully.',
      });
      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to update note. Please try again later.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await withBackoff(async () => {
        return await supabase
          .from('notes')
          .delete()
          .eq('id', id);
      });
        
      if (error) throw error;
      
      toast({
        title: 'Note deleted',
        description: 'Your note has been deleted successfully.',
      });
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note. Please try again later.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    loadingNotes,
    fetchProjectNotes,
    createNote,
    updateNote,
    deleteNote
  };
}
