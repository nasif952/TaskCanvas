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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, Users, FileText, CheckSquare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

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

  // Calculate some stats for the dashboard
  const totalProjects = projects.length;
  const totalSharedProjects = sharedProjects.length;
  const totalInvitations = pendingInvitations.length;
  
  // Get counts of notes and tasks across all projects
  const totalNotes = projects.reduce((sum, project) => sum + (project.note_count || 0), 0);
  const totalTasks = projects.reduce((sum, project) => sum + (project.task_count || 0), 0);

  // Generate time-of-day based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.email?.split('@')[0] || 'there';

  const statCards = [
    { title: 'My Projects', value: totalProjects, icon: FolderKanban, color: 'bg-blue-500/10 text-blue-500' },
    { title: 'Shared With Me', value: totalSharedProjects, icon: Users, color: 'bg-purple-500/10 text-purple-500' },
    { title: 'Total Notes', value: totalNotes, icon: FileText, color: 'bg-amber-500/10 text-amber-500' },
    { title: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'bg-emerald-500/10 text-emerald-500' },
  ];

  return (
    <MainLayout>
      <div className="p-3 sm:p-6 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{getGreeting()}, {userName}</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Here's an overview of your workspace
              </p>
            </div>
            <DashboardHeader onRefresh={refreshAll} />
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="border-muted hover:border-primary/40 transition-colors">
                <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center px-3 sm:px-6 pb-3 sm:pb-6">
                  <span className="text-xl sm:text-2xl font-bold">{stat.value}</span>
                  <div className={`p-2 rounded-full ${stat.color}`}>
                    <stat.icon className="h-4 sm:h-5 w-4 sm:w-5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <PendingInvitations
          invitations={pendingInvitations}
          onInvitationHandled={refreshAll}
          isLoading={loadingInvitations}
          onAcceptReject={handleInvitation}
        />

        <Tabs defaultValue="my-projects" className="mt-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="my-projects" className="relative flex-1 sm:flex-none text-xs sm:text-sm">
              My Projects
              {totalProjects > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-1.5 sm:px-2 py-0.5 text-xs font-medium">
                  {totalProjects}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="shared-with-me" className="relative flex-1 sm:flex-none text-xs sm:text-sm">
              Shared with Me
              {totalSharedProjects > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-1.5 sm:px-2 py-0.5 text-xs font-medium">
                  {totalSharedProjects}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-projects">
            {loadingProjects ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full py-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 sm:h-64 rounded-md overflow-hidden">
                    <Skeleton className="h-full w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <ProjectGrid projects={projects} />
            )}
          </TabsContent>
          
          <TabsContent value="shared-with-me">
            {loadingShared ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 sm:h-64 rounded-md overflow-hidden">
                    <Skeleton className="h-full w-full" />
                  </div>
                ))}
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
