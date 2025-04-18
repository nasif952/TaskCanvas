
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { ProjectSharing } from '@/lib/types';

interface ProjectSharedUsersListProps {
  isLoading: boolean;
  sharedWith: ProjectSharing[];
  canManage: boolean;
  onRemove: (id: string) => void;
}

export function ProjectSharedUsersList({
  isLoading,
  sharedWith,
  canManage,
  onRemove
}: ProjectSharedUsersListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sharedWith || sharedWith.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This project isn't shared with anyone yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sharedWith.map((share) => (
        <div key={share.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
          <div className="text-sm">
            <div className="font-medium">{share.user_email || `User ${share.shared_with_id.substring(0, 8)}`}</div>
            <div className="text-xs text-muted-foreground">
              {share.permission_level === 'edit' ? 'Can edit' : 'Can view'} • 
              {share.invitation_status === 'pending' ? ' Pending' : ' Accepted'}
            </div>
          </div>
          {canManage && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onRemove(share.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
