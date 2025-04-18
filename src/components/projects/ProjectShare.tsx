
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProjectShareForm } from './ProjectShareForm';
import { ProjectSharedUsersList } from './ProjectSharedUsersList';
import { useProjectSharing } from '@/hooks/useProjectSharing';

interface ProjectShareProps {
  projectId: string;
  ownerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectShare: React.FC<ProjectShareProps> = ({
  projectId,
  ownerId,
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const { isLoading, sharedWith, fetchSharedUsers, shareProject, removeSharing } = useProjectSharing(projectId, ownerId);

  useEffect(() => {
    if (open && projectId) {
      console.log('ProjectShare: Fetching shared users for project:', projectId);
      fetchSharedUsers();
    }
  }, [open, projectId]);

  const canManageSharing = user?.id === ownerId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Share this project with other users by email.
          </DialogDescription>
        </DialogHeader>
        
        {canManageSharing && (
          <ProjectShareForm onShare={shareProject} />
        )}
        
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">Shared with</h3>
          <ProjectSharedUsersList
            isLoading={isLoading}
            sharedWith={sharedWith}
            canManage={canManageSharing}
            onRemove={removeSharing}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectShare;
