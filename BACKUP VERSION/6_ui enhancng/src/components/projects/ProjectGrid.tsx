
import React from 'react';
import ProjectCard from './ProjectCard';
import { ProjectWithCounts } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface ProjectGridProps {
  projects: ProjectWithCounts[];
  sharedView?: boolean;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, sharedView = false }) => {
  const { updateProject, deleteProject } = useProject();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = React.useState<ProjectWithCounts | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleEditClick = (project: ProjectWithCounts) => {
    setSelectedProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (project: ProjectWithCounts) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleLeaveClick = (project: ProjectWithCounts) => {
    setSelectedProject(project);
    setLeaveDialogOpen(true);
  };

  const handleOpenProject = (project: ProjectWithCounts) => {
    // Ensure we have a valid project ID before navigating
    if (project && project.id) {
      navigate(`/projects/${project.id}`);
    } else {
      toast({
        title: 'Error',
        description: 'Cannot open project: invalid project ID',
        variant: 'destructive',
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProject) {
      await updateProject(selectedProject.id, title, description);
      setEditModalOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedProject) {
      await deleteProject(selectedProject.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleLeaveConfirm = async () => {
    if (selectedProject && (selectedProject as any).sharing_id) {
      try {
        const { error } = await supabase
          .from('project_sharing')
          .delete()
          .eq('id', (selectedProject as any).sharing_id);
          
        if (error) throw error;
        
        toast({
          title: 'Project left',
          description: `You no longer have access to "${selectedProject.title || 'this project'}"`,
        });
        
        setLeaveDialogOpen(false);
        // Refresh the page to update the project list
        window.location.reload();
      } catch (error) {
        console.error('Error leaving project:', error);
        toast({
          title: 'Error',
          description: 'Failed to leave the project. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">
          {sharedView ? 'No shared projects' : 'No projects yet'}
        </h3>
        <p className="text-muted-foreground mt-2">
          {sharedView 
            ? 'When someone shares a project with you, it will appear here' 
            : 'Create your first project to get started'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id || `shared-${(project as any).sharing_id || Math.random()}`}
            project={project}
            isShared={sharedView}
            permissionLevel={(project as any).permission_level}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onLeave={handleLeaveClick}
            onOpen={handleOpenProject}
          />
        ))}
      </div>

      {/* Edit Project Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
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
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedProject?.title || 'this project'}" and all its notes and tasks.
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

      {/* Leave Project Confirmation Dialog */}
      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave "{selectedProject?.title || 'this project'}"? You will no longer have access to this project unless the owner shares it with you again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveConfirm}>
              Leave Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectGrid;
