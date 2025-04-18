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
        <CardHeader className="pb-0 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base sm:text-lg flex items-center">
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-background rounded-md">
                <div className="space-y-2 mb-3 sm:mb-0">
                  <Skeleton className="h-4 sm:h-5 w-32 sm:w-48" />
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 sm:h-9 w-16 sm:w-20" />
                  <Skeleton className="h-8 sm:h-9 w-16 sm:w-20" />
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
        <CardHeader className="pb-0 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base sm:text-lg flex items-center">
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-card rounded-lg border border-muted shadow-sm"
                >
                  <div className="mb-3 sm:mb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center mb-1 sm:mb-0">
                      <h3 className="font-medium text-primary mr-0 sm:mr-2 text-sm sm:text-base mb-1 sm:mb-0 break-all line-clamp-1">
                        {inv.project_title || 'Project ID: ' + inv.project_id.substring(0, 8)}
                      </h3>
                      <Badge variant="outline" className="bg-background/50 w-fit text-xs sm:text-xs">
                        {inv.permission_level === 'edit' ? 'Can edit' : 'Read only'}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      From: <span className="font-medium break-all">{inv.owner_email || 'Unknown sender'}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    {processingInvitation === inv.id ? (
                      <Button size="sm" disabled className="min-w-[100px] sm:min-w-[120px] h-8 sm:h-9 py-0">
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1" />
                        <span className="text-xs sm:text-sm">Processing</span>
                      </Button>
                    ) : (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleInvitation(inv.id, true)}
                          className="bg-primary/90 hover:bg-primary h-8 sm:h-9 py-0"
                        >
                          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="text-xs sm:text-sm">Accept</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleInvitation(inv.id, false)}
                          className="border-muted hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 h-8 sm:h-9 py-0"
                        >
                          <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="text-xs sm:text-sm">Decline</span>
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
