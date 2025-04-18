import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { PendingInvitation } from '@/hooks/usePendingInvitations';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

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
      <Card className="mb-6 bg-card/50 border-muted">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-primary" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-background rounded-md">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-6 border border-primary/10 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-primary" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <AnimatePresence>
            <div className="space-y-3">
              {invitations.map((inv) => (
                <motion.div 
                  key={inv.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.2,
                    layout: { duration: 0.2 }
                  }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card rounded-lg border border-muted shadow-sm"
                >
                  <div className="mb-3 sm:mb-0">
                    <div className="flex items-center">
                      <h3 className="font-medium text-primary mr-2">
                        {inv.project_title || 'Project ID: ' + inv.project_id.substring(0, 8)}
                      </h3>
                      <Badge variant="outline" className="bg-background/50">
                        {inv.permission_level === 'edit' ? 'Can edit' : 'Read only'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      From: <span className="font-medium">{inv.owner_email || 'Unknown sender'}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {processingInvitation === inv.id ? (
                      <Button size="sm" disabled className="min-w-[120px]">
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        Processing
                      </Button>
                    ) : (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleInvitation(inv.id, true)}
                          className="bg-primary/90 hover:bg-primary"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleInvitation(inv.id, false)}
                          className="border-muted hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PendingInvitations;
