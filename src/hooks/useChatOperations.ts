import { useState } from 'react';
import { supabase, withBackoff } from '@/lib/supabase';
import { ChatMessage } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

export function useChatOperations() {
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { toast } = useToast();

  const fetchProjectMessages = async (projectId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await withBackoff(async () => {
        return await supabase
          .from('chat_messages')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });
      });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat messages. Please try again later.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (projectId: string, userId: string, content: string): Promise<string | null> => {
    try {
      const { data, error } = await withBackoff(async () => {
        return await supabase
          .from('chat_messages')
          .insert([{
            project_id: projectId,
            content,
            created_by: userId,
          }])
          .select()
          .single();
      });
        
      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    loadingMessages,
    fetchProjectMessages,
    sendMessage,
  };
} 