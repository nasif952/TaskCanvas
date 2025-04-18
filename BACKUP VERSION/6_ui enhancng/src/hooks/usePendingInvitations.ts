import { useState, useEffect, useCallback } from 'react';
import { supabase, withBackoff } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface PendingInvitation {
  id: string;
  project_id: string;
  owner_id: string;
  owner_email?: string;
  permission_level: 'view' | 'edit';
  project_title?: string;
  project_description?: string;
  created_at: string;
}

export const usePendingInvitations = (userId: string | undefined) => {
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const { toast } = useToast();

  const fetchPendingInvitations = useCallback(async () => {
    if (!userId) return;
    
    setLoadingInvitations(true);
    try {
      const { data, error } = await withBackoff(async () => {
        return await supabase
          .from('project_sharing')
          .select(`
            id,
            project_id,
            owner_id,
            created_at,
            permission_level,
            project:projects(id, title, description),
            owner:auth_user_emails!owner_id(email)
          `)
          .eq('shared_with_id', userId)
          .eq('invitation_status', 'pending');
      });
        
      if (error) throw error;
      
      // Transform data to a more usable format with proper typing
      const processedInvitations: PendingInvitation[] = (data || []).map(item => ({
        id: item.id,
        project_id: item.project_id,
        owner_id: item.owner_id,
        permission_level: item.permission_level,
        created_at: item.created_at,
        owner_email: item.owner?.email,
        project_title: item.project?.title,
        project_description: item.project?.description
      }));
      
      setPendingInvitations(processedInvitations);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invitations',
        variant: 'destructive',
      });
    } finally {
      setLoadingInvitations(false);
    }
  }, [userId, toast]);

  // Handle invitation accept/reject
  const handleInvitation = async (invitationId: string, accept: boolean) => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to handle invitations',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // First verify this invitation belongs to the current user
      const { data: invitationData, error: verifyError } = await supabase
        .from('project_sharing')
        .select('shared_with_id, project_id')
        .eq('id', invitationId)
        .single();
        
      if (verifyError || !invitationData) {
        throw new Error('Invitation not found');
      }
      
      if (invitationData.shared_with_id !== userId) {
        throw new Error('You cannot modify this invitation');
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('project_sharing')
        .update({ 
          invitation_status: accept ? 'accepted' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);
        
      if (updateError) throw updateError;
      
      // Remove from local state
      setPendingInvitations(prev => 
        prev.filter(inv => inv.id !== invitationId)
      );
      
      toast({
        title: accept ? 'Invitation accepted' : 'Invitation declined',
        description: accept 
          ? 'You now have access to this project' 
          : 'The invitation has been declined',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error handling invitation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process invitation',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPendingInvitations();
    } else {
      // Clear invitations when userId is undefined
      setPendingInvitations([]);
    }
  }, [userId, fetchPendingInvitations]);

  return {
    pendingInvitations,
    loadingInvitations,
    fetchPendingInvitations,
    handleInvitation
  };
};
