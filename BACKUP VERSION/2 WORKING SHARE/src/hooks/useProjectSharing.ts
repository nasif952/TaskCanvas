import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProjectSharing } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { withBackoff } from '@/lib/supabase';

export function useProjectSharing(projectId: string, ownerId: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [sharedWith, setSharedWith] = useState<ProjectSharing[]>([]);

  const fetchSharedUsers = async () => {
    if (!projectId) {
      console.error('Project ID is undefined in fetchSharedUsers');
      return;
    }
    
    setIsLoading(true);
    try {
      // Use the withBackoff helper to handle potential network issues
      const { data, error } = await withBackoff(async () => {
        return await supabase
          .from('project_sharing')
          .select(`
            id,
            project_id,
            owner_id,
            shared_with_id,
            permission_level,
            invitation_status,
            created_at,
            updated_at,
            auth.users!shared_with_id(email)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
      });
        
      if (error) throw error;
      
      // Process data to include user_email from the joined table
      const processedData = data?.map(item => ({
        ...item,
        user_email: item.users?.email || null
      })) || [];
      
      setSharedWith(processedData);
    } catch (error) {
      console.error('Error fetching shared users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sharing information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shareProject = async (email: string, permission: 'view' | 'edit') => {
    if (!projectId || !ownerId) {
      console.error('Project ID or Owner ID is undefined in shareProject');
      toast({
        title: 'Error',
        description: 'Missing project information. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
    
    // Normalize email to prevent case sensitivity issues
    const normalizedEmail = email.toLowerCase().trim();
    
    try {
      // First verify project exists and current user is owner
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, user_id')
        .eq('id', projectId)
        .single();
        
      if (projectError || !projectData) {
        console.error('Project verification error:', projectError);
        throw new Error('Project not found or access denied');
      }
      
      if (projectData.user_id !== ownerId) {
        throw new Error('Only the project owner can share this project');
      }
      
      // Look up user by email using auth.users table
      const { data: userData, error: userError } = await supabase
        .from('auth_user_emails')
        .select('user_id')
        .ilike('email', normalizedEmail)  // Case-insensitive search
        .single();
        
      if (userError || !userData) {
        console.error('User lookup error:', userError);
        throw new Error('User with this email not found');
      }
      
      // Check for self-sharing
      if (userData.user_id === ownerId) {
        throw new Error("You can't share a project with yourself");
      }
      
      // Use a transaction or RPC function for atomicity
      // Since Supabase JS client doesn't support transactions directly,
      // we'll use a two-step process with proper error handling
      
      // Check if already shared
      const { data: existingShare, error: existingError } = await supabase
        .from('project_sharing')
        .select('*')
        .eq('project_id', projectId)
        .eq('shared_with_id', userData.user_id)
        .maybeSingle();
        
      if (existingError) {
        console.error('Error checking existing share:', existingError);
        throw existingError;
      }
      
      if (existingShare) {
        // Update existing share
        const { error: updateError } = await supabase
          .from('project_sharing')
          .update({ 
            permission_level: permission,
            invitation_status: 'pending',
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingShare.id);
          
        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        
        toast({
          title: 'Invitation updated',
          description: `The sharing invitation for ${normalizedEmail} has been updated`,
        });
      } else {
        // Create new share with a unique constraint to prevent duplicates
        const { error: insertError } = await supabase
          .from('project_sharing')
          .insert([{
            project_id: projectId,
            owner_id: ownerId,
            shared_with_id: userData.user_id,
            permission_level: permission,
            invitation_status: 'pending'
          }]);
          
        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
        
        toast({
          title: 'Project shared',
          description: `Invitation has been sent to ${normalizedEmail}`,
        });
      }
      
      // Refresh the shared users list
      await fetchSharedUsers();
      return true;
    } catch (error: any) {
      console.error('Share project error:', error);
      toast({
        title: 'Failed to share project',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeSharing = async (sharingId: string) => {
    try {
      // First verify the current user is the project owner
      const { data: sharingData, error: sharingError } = await supabase
        .from('project_sharing')
        .select('project_id, owner_id')
        .eq('id', sharingId)
        .single();
        
      if (sharingError || !sharingData) {
        console.error('Sharing verification error:', sharingError);
        throw new Error('Sharing record not found');
      }
      
      if (sharingData.owner_id !== ownerId) {
        throw new Error('Only the project owner can remove sharing');
      }
      
      const { error } = await supabase
        .from('project_sharing')
        .delete()
        .eq('id', sharingId);
        
      if (error) {
        console.error('Remove sharing error:', error);
        throw error;
      }
      
      setSharedWith(prev => prev.filter(share => share.id !== sharingId));
      
      toast({
        title: 'Sharing removed',
        description: 'User no longer has access to this project',
      });
    } catch (error: any) {
      console.error('Error removing sharing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove sharing',
        variant: 'destructive',
      });
    }
  };

  return {
    isLoading,
    sharedWith,
    fetchSharedUsers,
    shareProject,
    removeSharing
  };
}
