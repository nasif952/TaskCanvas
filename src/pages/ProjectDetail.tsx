import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Share2, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import TaskList from '@/components/tasks/TaskList';
import NoteList from '@/components/notes/NoteList';
import ChatList from '@/components/chat/ChatList';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ProjectShare from '@/components/projects/ProjectShare';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    fetchProject, 
    currentProject, 
    loadingProject,
    setLoadingProject,
    fetchProjectNotes,
    projectNotes,
    loadingNotes,
    fetchProjectTasks,
    projectTasks,
    loadingTasks,
    fetchProjectMessages,
    projectMessages,
    loadingMessages,
    updateProject,
    deleteProject
  } = useProject();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const maxFetchAttempts = 2;
  const [sharedWithMe, setSharedWithMe] = useState<boolean>(false);
  const [permissionLevel, setPermissionLevel] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProjectDeleted, setIsProjectDeleted] = useState<boolean>(false);
  
  const isMounted = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Invalid project ID. Please return to Dashboard and try again.');
      setIsLoading(false);
    }
  }, [id]);

  const checkSharedStatus = useCallback(async () => {
    if (!id || !user) return false;
    
    try {
      console.log(`Checking shared status for project: ${id} and user: ${user.id}`);
      const { data, error } = await supabase
        .from('project_sharing')
        .select('permission_level')
        .eq('project_id', id)
        .eq('shared_with_id', user.id)
        .eq('invitation_status', 'accepted')
        .maybeSingle();
        
      if (error) {
        console.error('Error checking shared status:', error);
        throw error;
      }
      
      if (data) {
        console.log('Project shared with me, permission:', data.permission_level);
        setSharedWithMe(true);
        setPermissionLevel(data.permission_level as 'view' | 'edit');
        return true;
      } else {
        console.log('Project not shared with me');
        setSharedWithMe(false);
        return false;
      }
    } catch (err) {
      console.error('Error checking shared status:', err);
      return false;
    }
  }, [id, user]);

  const fetchProjectData = useCallback(async () => {
    // Cancel if we've reached max attempts, component unmounted, or invalid ID
    if (!id || id === 'undefined' || !isMounted.current || fetchAttempts >= maxFetchAttempts) {
      if (!id || id === 'undefined') {
        setError('Invalid project ID. Please return to Dashboard and try again.');
      } else if (fetchAttempts >= maxFetchAttempts) {
        setError('Failed to load project after multiple attempts. The project may not exist or has been deleted.');
      }
      setIsLoading(false);
      return;
    }
    
    try {
      setError(null);
      setIsLoading(true);
      
      if (!user) {
        setError('Please sign in to access this project.');
        setIsLoading(false);
        return;
      }
      
      console.log(`Fetching project data for ID: ${id}, attempt: ${fetchAttempts + 1}`);
      
      // First check if this is a project shared with the current user
      const isSharedWithCurrentUser = await checkSharedStatus();
      
      // Then try to fetch the project itself - IMPORTANT FIX: This is the modified query
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (projectError) {
        console.error('Error fetching project:', projectError);
        throw projectError;
      }
      
      // If project doesn't exist, but it's shared with the user, let's double-check
      // if it's truly deleted or just a permissions issue
      if (!projectData && isSharedWithCurrentUser) {
        // Try a more direct query to see if the project exists at all
        const { data: projectExistsCheck, error: existsError } = await supabase
          .from('projects')
          .select('id')
          .eq('id', id)
          .maybeSingle();
          
        if (existsError) {
          console.error('Error checking if project exists:', existsError);
        }
        
        // If we get null from this query too, then the project is truly deleted
        if (!projectExistsCheck) {
          setIsProjectDeleted(true);
          setError('This shared project appears to have been deleted by its owner.');
          setIsLoading(false);
          setIsInitialFetchDone(true);
          return;
        } else {
          // The project exists but the user doesn't have access
          setError('You may not have sufficient permissions to access this project. Please contact the project owner.');
          setIsLoading(false);
          setIsInitialFetchDone(true);
          return;
        }
      }
      
      // If project doesn't exist and not shared with user, no permission
      if (!projectData && !isSharedWithCurrentUser) {
        setError('Project not found or you do not have permission to access it.');
        setIsLoading(false);
        setIsInitialFetchDone(true);
        return;
      }
      
      const isOwner = projectData?.user_id === user.id;
      
      // Check if user has permission to view this project
      if (!isOwner && !isSharedWithCurrentUser) {
        setError('You do not have permission to access this project.');
        setIsLoading(false);
        setIsInitialFetchDone(true);
        return;
      }
      
      // If we get here, load the project and its contents
      if (isMounted.current) {
        // Load project details
        await fetchProject(id);
        
        // Only fetch notes and tasks if we have successfully loaded the project
        if (projectData) {
          await Promise.all([
            fetchProjectNotes(id),
            fetchProjectTasks(id),
            fetchProjectMessages(id)
          ]);
        }
        
        setIsInitialFetchDone(true);
        setIsLoading(false);
      }
      
    } catch (err: any) {
      console.error("Error fetching project data:", err);
      if (isMounted.current) {
        if (err?.message?.includes("invalid input syntax for type uuid")) {
          setError("Invalid project ID. Please return to Dashboard and try again.");
        } else {
          setError("Failed to load project data. Please try again later.");
        }
        
        setFetchAttempts(prev => prev + 1);
        
        toast({
          title: "Error",
          description: "Failed to load project data. Please try again later.",
          variant: "destructive"
        });
        
        // If we haven't reached max attempts, schedule another try
        if (fetchAttempts < maxFetchAttempts - 1 && isMounted.current) {
          fetchTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              fetchProjectData();
            }
          }, 3000);
        } else {
          setIsLoading(false);
        }
      }
    }
  }, [id, user, fetchProject, fetchProjectNotes, fetchProjectTasks, fetchProjectMessages, fetchAttempts, toast, checkSharedStatus, maxFetchAttempts]);

  // Initial fetch when component mounts
  useEffect(() => {
    // Only fetch if we haven't already done so and have valid parameters
    if (!isInitialFetchDone && id && id !== 'undefined') {
      fetchProjectData();
    }
  }, [fetchProjectData, isInitialFetchDone, id]);

  // Update form values when project data changes
  useEffect(() => {
    if (currentProject) {
      setTitle(currentProject.title || '');
      setDescription(currentProject.description || '');
    }
  }, [currentProject]);

  const handleEditProject = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && id !== 'undefined') {
      await updateProject(id, title, description);
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteProject = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (id && id !== 'undefined') {
      await deleteProject(id);
      navigate('/dashboard');
    }
  };

  const handleRetry = () => {
    setError(null);
    setFetchAttempts(0);
    setIsInitialFetchDone(false);
    fetchProjectData();
  };

  // Invalid ID case
  if (!id || id === 'undefined') {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold">Invalid Project</h2>
            <p className="text-muted-foreground mt-2">
              This project cannot be loaded because the project ID is invalid.
            </p>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Deleted project case
  if (isProjectDeleted) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold">Error Loading Project</h2>
            <p className="text-muted-foreground mt-2">
              This shared project appears to have been deleted by its owner.
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Button onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error case
  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold">Error Loading Project</h2>
            <p className="text-muted-foreground mt-2">{error}</p>
            <div className="mt-4 flex justify-center gap-4">
              <Button onClick={handleRetry}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Loading case
  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center mb-2">
              <Skeleton className="h-10 w-20 mr-2 rounded" />
              <Skeleton className="h-10 w-1/3 rounded" />
            </div>
            <Skeleton className="h-6 w-1/2 rounded" />
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Failed to load case
  if (!currentProject && fetchAttempts >= maxFetchAttempts) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold">Failed to load project</h2>
            <p className="text-muted-foreground mt-2">
              We're having trouble connecting to the server. This could be due to network issues or server maintenance.
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Button onClick={handleRetry}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // No project case
  if (!currentProject) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold">Project not found</h2>
            <p className="text-muted-foreground mt-2">The project you're looking for does not exist or you don't have permission to view it.</p>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isOwner = user?.id === currentProject?.user_id;
  const canEdit = isOwner || (sharedWithMe && permissionLevel === 'edit');

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{currentProject?.title || 'Untitled Project'}</h1>
          {sharedWithMe && (
            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              Shared with you ({permissionLevel === 'edit' ? 'Can edit' : 'Can view'})
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-muted-foreground">
              {currentProject.description || 'No description'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated {formatDistanceToNow(new Date(currentProject.updated_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex space-x-2">
            {canEdit && (
              <Button variant="outline" size="sm" onClick={handleEditProject}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {(isOwner || sharedWithMe) && (
              <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            )}
            {isOwner && (
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDeleteProject}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="tasks" className="mt-6">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="mt-6">
            <TaskList 
              projectId={id} 
              tasks={projectTasks}
              loading={loadingTasks}
            />
          </TabsContent>
          <TabsContent value="notes" className="mt-6">
            <NoteList 
              projectId={id} 
              notes={projectNotes}
              loading={loadingNotes}
            />
          </TabsContent>
          <TabsContent value="chat" className="mt-6">
            <ChatList 
              projectId={id} 
              messages={projectMessages}
              loading={loadingMessages}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to your project details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project description"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{currentProject.title || 'this project'}" and all its notes and tasks.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProjectShare 
        projectId={id} 
        ownerId={currentProject.user_id}
        open={isShareModalOpen} 
        onOpenChange={setIsShareModalOpen} 
      />
    </MainLayout>
  );
};

export default ProjectDetail;
