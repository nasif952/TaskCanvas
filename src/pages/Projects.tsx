import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ProjectWithCounts } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderPlus, Grid3X3, LayoutList, Search, Filter, Clock, CheckCircle2, CalendarClock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedProjects } from '@/hooks/useSharedProjects';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const Projects: React.FC = () => {
  const { projects, loadingProjects, fetchProjects } = useProject();
  const { user } = useAuth();
  const { sharedProjects, loadingShared, fetchSharedProjects } = useSharedProjects(user?.id);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithCounts[]>([]);
  const [filteredSharedProjects, setFilteredSharedProjects] = useState<ProjectWithCounts[]>([]);
  const [sortType, setSortType] = useState<'recent' | 'alphabetical' | 'tasks'>('recent');

  useEffect(() => {
    fetchProjects();
    if (user) {
      fetchSharedProjects();
    }
  }, [fetchProjects, fetchSharedProjects, user]);

  // Apply filtering and sorting
  useEffect(() => {
    // Filter projects based on search query
    const filterProjects = (projectsList: ProjectWithCounts[]) => {
      return projectsList.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    };

    // Sort projects based on selected sort type
    const sortProjects = (projectsList: ProjectWithCounts[]) => {
      switch (sortType) {
        case 'alphabetical':
          return [...projectsList].sort((a, b) => a.title.localeCompare(b.title));
        case 'tasks':
          return [...projectsList].sort((a, b) => (b.task_count || 0) - (a.task_count || 0));
        case 'recent':
        default:
          return [...projectsList].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      }
    };

    setFilteredProjects(sortProjects(filterProjects(projects)));
    setFilteredSharedProjects(sortProjects(filterProjects(sharedProjects)));
  }, [projects, sharedProjects, searchQuery, sortType]);

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const openProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const getProjectStatusIndicator = (project: ProjectWithCounts) => {
    const completedTasks = 0; // This would need to be fetched from the backend
    const totalTasks = project.task_count || 0;
    
    if (totalTasks === 0) return { color: 'bg-gray-200', icon: <Clock className="h-4 w-4 text-gray-500" />, label: 'No tasks' };
    
    const completionRate = completedTasks / totalTasks;
    
    if (completionRate === 1) return { color: 'bg-green-200', icon: <CheckCircle2 className="h-4 w-4 text-green-600" />, label: 'Completed' };
    if (completionRate >= 0.5) return { color: 'bg-blue-200', icon: <CalendarClock className="h-4 w-4 text-blue-600" />, label: 'In progress' };
    return { color: 'bg-amber-200', icon: <AlertCircle className="h-4 w-4 text-amber-600" />, label: 'Just started' };
  };

  // Function to generate a gradient background based on project id
  const getProjectGradient = (id: string) => {
    const gradients = [
      'from-blue-500/10 to-indigo-500/5',
      'from-purple-500/10 to-pink-500/5',
      'from-emerald-500/10 to-teal-500/5',
      'from-amber-500/10 to-orange-500/5',
      'from-cyan-500/10 to-sky-500/5',
    ];
    
    // Use the first character of the id to pick a gradient
    const index = id.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  // Render project grid/list items
  const renderProjects = (projectsList: ProjectWithCounts[], isShared = false) => {
    if (projectsList.length === 0) {
      return (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-700">
            {searchQuery ? 'No projects match your search' : (isShared ? 'No shared projects' : 'No projects yet')}
          </h3>
          <p className="text-gray-500 mt-2">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : (isShared 
                ? 'When someone shares a project with you, it will appear here' 
                : 'Create your first project to get started')}
          </p>
          {!isShared && !searchQuery && (
            <Button 
              onClick={handleCreateProject}
              className="mt-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
          )}
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projectsList.map(project => (
            <motion.div 
              key={project.id}
              variants={itemVariants}
              layoutId={`project-${project.id}`}
              onClick={() => openProject(project.id)}
            >
              <Card className={`cursor-pointer group h-full overflow-hidden border hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${getProjectGradient(project.id)}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors truncate">
                      {project.title || 'Untitled Project'}
                    </CardTitle>
                    {isShared && (
                      <Badge variant="outline" className="ml-2 bg-white/50 backdrop-blur-sm">
                        Shared
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 mt-1 h-10">
                    {project.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Clock className="mr-1.5 h-4 w-4" />
                      <span>
                        {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className={`${getProjectStatusIndicator(project).color} px-2 py-1 rounded-full flex items-center`}>
                      {getProjectStatusIndicator(project).icon}
                      <span className="ml-1 text-xs font-medium">{getProjectStatusIndicator(project).label}</span>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-1 px-3 py-1.5 bg-white/70 rounded-md backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span className="font-medium">{project.note_count || 0}</span>
                      <span className="text-gray-500">{project.note_count === 1 ? 'note' : 'notes'}</span>
                    </div>
                    <div className="flex items-center space-x-1 px-3 py-1.5 bg-white/70 rounded-md backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{project.task_count || 0}</span>
                      <span className="text-gray-500">{project.task_count === 1 ? 'task' : 'tasks'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      );
    } else {
      // List view
      return (
        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4"
          >
            {projectsList.map(project => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                layoutId={`project-list-${project.id}`}
                onClick={() => openProject(project.id)}
              >
                <Card className={`cursor-pointer hover:shadow-md transition-all duration-200 group border hover:border-primary/40 overflow-hidden bg-gradient-to-r ${getProjectGradient(project.id)}`}>
                  <div className="flex items-center p-4">
                    <div className="mr-3 h-12 w-12 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                          {project.title || 'Untitled Project'}
                        </h3>
                        {isShared && (
                          <Badge variant="outline" className="ml-2 bg-white/50 backdrop-blur-sm text-xs">
                            Shared
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-1 mt-0.5">
                        {project.description || 'No description'}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center space-x-4">
                      <div className={`${getProjectStatusIndicator(project).color} px-2 py-1 rounded-full flex items-center`}>
                        {getProjectStatusIndicator(project).icon}
                        <span className="ml-1 text-xs font-medium">{getProjectStatusIndicator(project).label}</span>
                      </div>
                      <div className="flex space-x-3">
                        <div className="flex items-center space-x-1 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          <span className="font-medium">{project.note_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">{project.task_count || 0}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      );
    }
  };

  const renderLoadingState = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full py-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 sm:h-64 rounded-md overflow-hidden">
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-4 w-full py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-md overflow-hidden">
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <MainLayout>
      <div className="p-3 sm:p-6 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Manage and organize all your projects
              </p>
            </div>
            <Button 
              onClick={handleCreateProject}
              className="sm:w-auto w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                onChange={(e) => setSortType(e.target.value as any)}
                value={sortType}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="recent">Recent</option>
                <option value="alphabetical">A-Z</option>
                <option value="tasks">Most Tasks</option>
              </select>
              <div className="border rounded-md flex overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'grid' ? 'bg-muted text-primary' : 'hover:bg-muted/50'
                  )}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'list' ? 'bg-muted text-primary' : 'hover:bg-muted/50'
                  )}
                >
                  <LayoutList className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="my-projects" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="my-projects" className="relative">
              My Projects
              {filteredProjects.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                  {filteredProjects.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="shared-with-me" className="relative">
              Shared with Me
              {filteredSharedProjects.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                  {filteredSharedProjects.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-projects" className="focus-visible:outline-none focus-visible:ring-0">
            {loadingProjects ? renderLoadingState() : renderProjects(filteredProjects)}
          </TabsContent>
          
          <TabsContent value="shared-with-me" className="focus-visible:outline-none focus-visible:ring-0">
            {loadingShared ? renderLoadingState() : renderProjects(filteredSharedProjects, true)}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Projects; 