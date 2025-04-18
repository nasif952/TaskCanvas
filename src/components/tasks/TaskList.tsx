import React, { useState } from 'react';
import { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, CheckCircle, Circle, Clock, ArrowUpDown, Flag, Calendar, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProject } from '@/contexts/ProjectContext';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

interface TaskListProps {
  projectId: string;
  tasks: Task[];
  loading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ projectId, tasks, loading }) => {
  const { createTask, updateTask, deleteTask } = useProject();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');
  const [isViewMode, setIsViewMode] = useState<'kanban' | 'list'>('list');

  const availableLabels = ['frontend', 'backend', 'bug', 'feature', 'design', 'documentation', 'testing', 'meeting', 'research'];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setDueDate(null);
    setLabels([]);
    setLabelInput('');
    setSelectedTask(null);
  };

  const handleAddClick = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority || 'medium');
    setDueDate(task.due_date);
    setLabels(task.labels || []);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskId = await createTask(projectId, title, description, status, 'task');
    if (taskId) {
      await updateTask(taskId, { 
        priority,
        due_date: dueDate,
        labels: labels.length > 0 ? labels : null
      });
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTask) {
      await updateTask(selectedTask.id, { 
        title, 
        description, 
        status,
        priority,
        due_date: dueDate,
        labels: labels.length > 0 ? labels : null
      });
      setIsEditModalOpen(false);
      resetForm();
    }
  };

  const handleDeleteTask = async () => {
    if (selectedTask) {
      await deleteTask(selectedTask.id);
      setIsDeleteDialogOpen(false);
      resetForm();
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item is dropped in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Extract the status from the droppable id
    const newStatus = destination.droppableId as Task['status'];
    
    // Find the task and update its status
    const taskId = draggableId;
    handleStatusChange(taskId, newStatus);
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return <Circle className="h-5 w-5" />;
      case 'in-progress':
        return <Clock className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch(priority) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'medium': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const isTaskOverdue = (task: Task) => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only, not time
    return dueDate < today && task.status !== 'completed';
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const addLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels([...labels, labelInput.trim()]);
      setLabelInput('');
    }
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter(l => l !== label));
  };

  const renderTaskItem = (task: Task, index: number) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          layout
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 border rounded-md ${snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-sm'} transition-all bg-card`}
          style={{
            ...provided.draggableProps.style,
            transformOrigin: 'center',
          }}
        >
          <div className="flex items-start gap-3">
            <button 
              className={`mt-1 flex-shrink-0 ${
                task.status === 'completed' ? 'text-green-500' : 
                task.status === 'in-progress' ? 'text-amber-500' : 'text-muted-foreground'
              }`}
              onClick={() => {
                const nextStatus = task.status === 'todo' ? 'in-progress' : 
                                  task.status === 'in-progress' ? 'completed' : 'todo';
                handleStatusChange(task.id, nextStatus);
              }}
            >
              {getStatusIcon(task.status)}
            </button>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description || 'No description'}
                  </p>
                </div>
                <Badge 
                  className={`ml-2 capitalize ${
                    task.status === 'todo' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
                    task.status === 'in-progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' : 
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }`}
                >
                  {task.status.replace('-', ' ')}
                </Badge>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                </span>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditClick(task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(task)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {task.due_date && (
                <div className={`flex items-center text-xs mt-2 ${isTaskOverdue(task) ? 'text-red-500' : 'text-muted-foreground'}`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  Due: {formatDueDate(task.due_date)}
                  {isTaskOverdue(task) && ' (overdue)'}
                </div>
              )}
            </div>
          </div>
          {task.priority && (
            <Badge className={`${getPriorityColor(task.priority)} ml-1`}>
              <Flag className="h-3 w-3 mr-1" />
              {task.priority}
            </Badge>
          )}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.labels.map(label => (
                <Badge key={label} variant="outline" className="text-xs px-2 py-0">
                  <Tag className="h-3 w-3 mr-1" />
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </Draggable>
  );

  const renderKanbanBoard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        {(['todo', 'in-progress', 'completed'] as const).map((columnStatus) => (
          <div key={columnStatus} className="bg-muted/40 p-4 rounded-md">
            <h3 className="font-medium mb-3 capitalize flex items-center">
              {getStatusIcon(columnStatus)}
              <span className="ml-2">{columnStatus.replace('-', ' ')}</span>
              <Badge variant="outline" className="ml-2">{getTasksByStatus(columnStatus).length}</Badge>
            </h3>
            <Droppable droppableId={columnStatus}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3 min-h-[200px]"
                >
                  <AnimatePresence>
                    {getTasksByStatus(columnStatus).map((task, index) => renderTaskItem(task, index))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );

  const renderListView = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      {(['todo', 'in-progress', 'completed'] as const).map((columnStatus) => (
        <Droppable key={columnStatus} droppableId={columnStatus}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3 mt-4"
            >
              <AnimatePresence>
                {getTasksByStatus(columnStatus).map((task, index) => renderTaskItem(task, index))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse flex flex-col space-y-4 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tasks</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsViewMode(isViewMode === 'list' ? 'kanban' : 'list')}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            {isViewMode === 'list' ? 'Kanban View' : 'List View'}
          </Button>
          <Button onClick={handleAddClick} variant="default" size="sm">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 border border-dashed rounded-md"
        >
          <p className="text-muted-foreground">No tasks yet. Click "Add Task" to create one.</p>
          <Button onClick={handleAddClick} variant="outline" size="sm" className="mt-4">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Your First Task
          </Button>
        </motion.div>
      ) : (
        isViewMode === 'kanban' ? renderKanbanBoard() : renderListView()
      )}

      {/* Add Task Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Create a new task for this project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Task description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: Task['status']) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority || 'medium'} onValueChange={(value: Task['priority']) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 mr-2 text-blue-500" />
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 mr-2 text-green-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 mr-2 text-orange-500" />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 mr-2 text-red-500" />
                        Urgent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate || ''}
                    onChange={(e) => setDueDate(e.target.value || null)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Labels</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {labels.map(label => (
                    <Badge key={label} variant="outline" className="flex items-center gap-1">
                      {label}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeLabel(label)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    value={labelInput} 
                    onChange={(e) => setLabelInput(e.target.value)} 
                    placeholder="Add a label" 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addLabel();
                      }
                    }}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Tag className="h-4 w-4 mr-1" />
                        Suggestions
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="end">
                      <Command>
                        <CommandInput placeholder="Search labels..." />
                        <CommandEmpty>No label found.</CommandEmpty>
                        <CommandGroup>
                          {availableLabels.map(label => (
                            <CommandItem
                              key={label}
                              onSelect={() => {
                                if (!labels.includes(label)) {
                                  setLabels([...labels, label]);
                                }
                              }}
                            >
                              {label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to the task.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTask}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as Task['status'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={priority || 'medium'} onValueChange={(value: Task['priority']) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 mr-2 text-blue-500" />
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 mr-2 text-green-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 mr-2 text-orange-500" />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 mr-2 text-red-500" />
                        Urgent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={dueDate || ''}
                    onChange={(e) => setDueDate(e.target.value || null)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Labels</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {labels.map(label => (
                    <Badge key={label} variant="outline" className="flex items-center gap-1">
                      {label}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeLabel(label)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    value={labelInput} 
                    onChange={(e) => setLabelInput(e.target.value)} 
                    placeholder="Add a label" 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addLabel();
                      }
                    }}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Tag className="h-4 w-4 mr-1" />
                        Suggestions
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="end">
                      <Command>
                        <CommandInput placeholder="Search labels..." />
                        <CommandEmpty>No label found.</CommandEmpty>
                        <CommandGroup>
                          {availableLabels.map(label => (
                            <CommandItem
                              key={label}
                              onSelect={() => {
                                if (!labels.includes(label)) {
                                  setLabels([...labels, label]);
                                }
                              }}
                            >
                              {label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{selectedTask?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskList;
