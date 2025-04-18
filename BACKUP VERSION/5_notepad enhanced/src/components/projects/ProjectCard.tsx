import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, FileText, CheckSquare, LogOut, AlertTriangle, ShieldAlert } from 'lucide-react';
import { ProjectWithCounts } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: ProjectWithCounts;
  isShared?: boolean;
  permissionLevel?: 'view' | 'edit';
  onEdit: (project: ProjectWithCounts) => void;
  onDelete: (project: ProjectWithCounts) => void;
  onLeave?: (project: ProjectWithCounts) => void;
  onOpen: (project: ProjectWithCounts) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  isShared = false,
  permissionLevel = 'view',
  onEdit, 
  onDelete,
  onLeave,
  onOpen
}) => {
  // If the project object is invalid, don't render anything
  if (!project || typeof project !== 'object' || !project.id) {
    return null;
  }

  const { id, title, description, updated_at, note_count, task_count } = project;
  
  // Extract additional properties from extended project
  const isDeleted = Boolean((project as any).is_deleted);
  const isPlaceholder = Boolean((project as any).is_placeholder);
  
  // Format the date properly
  let formattedDate;
  try {
    formattedDate = updated_at
      ? formatDistanceToNow(new Date(updated_at), { addSuffix: true })
      : 'recently';
  } catch (e) {
    formattedDate = 'recently';
  }

  // Determine permissions and availability
  const canEdit = !isShared || permissionLevel === 'edit';
  const isUnavailable = isDeleted;
  
  // Get owner information for shared projects
  const ownerEmail = (project as any).owner_email || '';
  const ownerName = ownerEmail ? ownerEmail.split('@')[0] : 'Unknown';
  
  // Display title logic
  let displayTitle = title || 'Untitled Project';
  if (isShared && !displayTitle.includes('Shared by') && !isPlaceholder) {
    displayTitle = `${displayTitle} (from ${ownerName})`;
  }
  
  const displayDescription = description || 'No description';
  const displayNoteCount = typeof note_count === 'number' ? note_count : 0;
  const displayTaskCount = typeof task_count === 'number' ? task_count : 0;

  return (
    <Card className={`h-full flex flex-col hover:shadow-md transition-shadow ${isUnavailable ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl truncate">{displayTitle}</CardTitle>
          {isShared && (
            <Badge variant="outline" className="ml-2">
              {permissionLevel === 'edit' ? 'Can edit' : 'View only'}
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2 h-10">
          {isUnavailable && (
            <span className="flex items-center text-destructive mb-1">
              <AlertTriangle className="h-4 w-4 mr-1" />
              This project is no longer available
            </span>
          )}
          {!isUnavailable && displayDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="grow">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <span>Updated {formattedDate}</span>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1 text-sm">
            <FileText className="h-4 w-4 text-blue-500" />
            <span>{displayNoteCount} {displayNoteCount === 1 ? 'note' : 'notes'}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <CheckSquare className="h-4 w-4 text-green-500" />
            <span>{displayTaskCount} {displayTaskCount === 1 ? 'task' : 'tasks'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex space-x-2">
          {canEdit && !isUnavailable && (
            <Button size="sm" variant="ghost" onClick={() => onEdit(project)}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {!isShared ? (
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(project)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => onLeave && onLeave(project)}>
              <LogOut className="h-4 w-4 mr-1" />
              Leave
            </Button>
          )}
        </div>
        <Button 
          size="sm" 
          onClick={() => onOpen(project)}
          disabled={isUnavailable}
          title={isUnavailable ? "This project is no longer available" : "Open project"}
        >
          Open
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
