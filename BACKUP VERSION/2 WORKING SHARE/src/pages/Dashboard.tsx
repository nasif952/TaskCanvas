import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import ProjectGrid from '@/components/projects/ProjectGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PendingInvitations from '@/components/projects/PendingInvitations';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useSharedProjects } from '@/hooks/useSharedProjects';
import { usePendingInvitations } from '@/hooks/usePendingInvitations';

const Dashboard: React.FC = () => {
  const { projects, loadingProjects, fetchProjects } = useProject();
  const { user } = useAuth();
  const { sharedProjects, loadingShared, fetchSharedProjects } = useSharedProjects(user?.id);
  const { pendingInvitations, loadingInvitations, fetchPendingInvitations, handleInvitation } = usePendingInvitations(user?.id);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (user) {
      fetchPendingInvitations();
      fetchSharedProjects();
    }
  }, [user, fetchPendingInvitations, fetchSharedProjects]);

  const refreshAll = () => {
    fetchProjects();
    fetchSharedProjects();
    fetchPendingInvitations();
  };

  return (
    <MainLayout>
      <div className="p-6">
        <DashboardHeader onRefresh={refreshAll} />

        <PendingInvitations
          invitations={pendingInvitations}
          onInvitationHandled={refreshAll}
          isLoading={loadingInvitations}
          onAcceptReject={handleInvitation}
        />

        <Tabs defaultValue="my-projects" className="mt-6">
          <TabsList>
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared-with-me">Shared with Me</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-projects">
            {loadingProjects ? (
              <div className="flex justify-center py-10">
                <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 bg-muted rounded-md"></div>
                  ))}
                </div>
              </div>
            ) : (
              <ProjectGrid projects={projects} />
            )}
          </TabsContent>
          
          <TabsContent value="shared-with-me">
            {loadingShared ? (
              <div className="flex justify-center py-10">
                <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-muted rounded-md"></div>
                  ))}
                </div>
              </div>
            ) : (
              <ProjectGrid 
                projects={sharedProjects} 
                sharedView 
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
