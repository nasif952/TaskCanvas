import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, FileText, CheckSquare, LogOut, AlertTriangle, ExternalLink, Calendar } from 'lucide-react';
import { ProjectWithCounts } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

  // Generate a pseudo-random color for the card gradient based on the project id
  const colorIndex = id.charCodeAt(0) % 5;
  const gradientColors = [
    'from-blue-500/10 to-indigo-500/5',       // Blue-Indigo
    'from-purple-500/10 to-pink-500/5',       // Purple-Pink
    'from-emerald-500/10 to-teal-500/5',      // Emerald-Teal
    'from-amber-500/10 to-orange-500/5',      // Amber-Orange
    'from-cyan-500/10 to-sky-500/5',          // Cyan-Sky
  ];

  const selectedGradient = gradientColors[colorIndex];

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        `h-full flex flex-col overflow-hidden border bg-gradient-to-br ${selectedGradient}`,
        isUnavailable ? 'opacity-75' : '',
        'transition-all duration-300 hover:shadow-lg hover:border-primary/20'
      )}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl truncate font-bold text-primary">
              {displayTitle}
            </CardTitle>
            {isShared && (
              <Badge variant="outline" className="ml-2 bg-background/50 backdrop-blur-sm">
                {permissionLevel === 'edit' ? 'Can edit' : 'View only'}
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-2 h-10 mt-1">
            {isUnavailable && (
              <motion.span 
                className="flex items-center text-destructive mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                This project is no longer available
              </motion.span>
            )}
            {!isUnavailable && displayDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="grow pb-2">
          <div className="flex items-center text-sm text-muted-foreground mb-3 opacity-80">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span>Updated {formattedDate}</span>
          </div>
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2 text-sm bg-background/40 px-2.5 py-1.5 rounded-md">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{displayNoteCount}</span>
              <span className="text-muted-foreground">{displayNoteCount === 1 ? 'note' : 'notes'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm bg-background/40 px-2.5 py-1.5 rounded-md">
              <CheckSquare className="h-4 w-4 text-green-500" />
              <span className="font-medium">{displayTaskCount}</span>
              <span className="text-muted-foreground">{displayTaskCount === 1 ? 'task' : 'tasks'}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between border-t bg-card/30 backdrop-blur-sm">
          <div className="flex space-x-2">
            {canEdit && !isUnavailable && (
              <Button size="sm" variant="ghost" onClick={() => onEdit(project)}
                className="hover:bg-background/60">
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {!isShared ? (
              <Button size="sm" variant="ghost" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                onClick={() => onDelete(project)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            ) : (
              <Button size="sm" variant="ghost" 
                className="hover:bg-background/60"
                onClick={() => onLeave && onLeave(project)}>
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
            className="bg-primary/90 hover:bg-primary"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;
