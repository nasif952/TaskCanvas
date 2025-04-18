import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { PendingInvitation } from '@/hooks/usePendingInvitations';

interface PendingInvitationsProps {
  invitations: PendingInvitation[];
  onInvitationHandled: () => void;
  isLoading: boolean;
  onAcceptReject: (invitationId: string, accept: boolean) => Promise<boolean>;
}

const PendingInvitations: React.FC<PendingInvitationsProps> = ({
  invitations,
  onInvitationHandled,
  isLoading,
  onAcceptReject
}) => {
  const [processingInvitation, setProcessingInvitation] = React.useState<string | null>(null);

  const handleInvitation = async (invitationId: string, accept: boolean) => {
    setProcessingInvitation(invitationId);
    try {
      const success = await onAcceptReject(invitationId, accept);
      if (success) {
        onInvitationHandled();
      }
    } finally {
      setProcessingInvitation(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6 p-4 border rounded-md bg-muted">
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Loading invitations...</span>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 border rounded-md bg-muted">
      <h3 className="font-medium mb-2">Pending Invitations</h3>
      <div className="space-y-3">
        {invitations.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between p-3 bg-card rounded-md shadow-sm">
            <div>
              <p className="font-medium">
                {inv.project_title || 'Project ID: ' + inv.project_id.substring(0, 8)}
              </p>
              <p className="text-sm text-muted-foreground">
                {inv.owner_email ? `From: ${inv.owner_email}` : 'Unknown sender'} • 
                {inv.permission_level === 'edit' ? ' Can edit' : ' Can view'}
              </p>
            </div>
            <div className="flex gap-2">
              {processingInvitation === inv.id ? (
                <Button size="sm" disabled>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Processing...
                </Button>
              ) : (
                <>
                  <Button size="sm" onClick={() => handleInvitation(inv.id, true)}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => handleInvitation(inv.id, false)}>Decline</Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingInvitations;
