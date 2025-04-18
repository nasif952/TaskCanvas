import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project, ProjectWithCounts, Note, Task } from '@/lib/types';
import { useAuth } from './AuthContext';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import { useNoteOperations } from '@/hooks/useNoteOperations';
import { useTaskOperations } from '@/hooks/useTaskOperations';

interface ProjectContextType {
  projects: ProjectWithCounts[];
  currentProject: Project | null;
  projectNotes: Note[];
  projectTasks: Task[];
  loadingProjects: boolean;
  loadingProject: boolean;
  loadingNotes: boolean;
  loadingTasks: boolean;
  setLoadingProject: (loading: boolean) => void;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (title: string, description: string) => Promise<string | null>;
  updateProject: (id: string, title: string, description: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjectNotes: (projectId: string) => Promise<void>;
  createNote: (projectId: string, content: any) => Promise<string | null>;
  updateNote: (id: string, content: any) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  fetchProjectTasks: (projectId: string) => Promise<void>;
  createTask: (projectId: string, title: string, description: string, status: Task['status'], taskType: Task['task_type'], parentTaskId?: string) => Promise<string | null>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'created_by'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Track in-flight fetching to prevent request flooding
const inFlightRequests: Record<string, boolean> = {
  projects: false,
  project: false,
  notes: false,
  tasks: false
};

// Add cooldown to prevent too many requests in a short time
const requestCooldowns: Record<string, number> = {
  projects: 0,
  project: 0,
  notes: 0,
  tasks: 0
};

// Cooldown time in milliseconds
const COOLDOWN_TIME = 3000; // 3 seconds

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectNotes, setProjectNotes] = useState<Note[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  
  const { user } = useAuth();
  const projectOps = useProjectOperations();
  const noteOps = useNoteOperations();
  const taskOps = useTaskOperations();

  const fetchProjects = async () => {
    if (!user || inFlightRequests.projects) return;
    
    // Check cooldown
    const now = Date.now();
    if (now < requestCooldowns.projects) {
      return;
    }
    
    try {
      inFlightRequests.projects = true;
      requestCooldowns.projects = now + COOLDOWN_TIME;
      
      const fetchedProjects = await projectOps.fetchProjects(user.id);
      setProjects(fetchedProjects);
    } finally {
      inFlightRequests.projects = false;
    }
  };

  const fetchProject = async (id: string) => {
    if (inFlightRequests.project) return;
    
    // Check cooldown
    const now = Date.now();
    if (now < requestCooldowns.project) {
      return;
    }
    
    try {
      inFlightRequests.project = true;
      requestCooldowns.project = now + COOLDOWN_TIME;
      
      const project = await projectOps.fetchProject(id);
      setCurrentProject(project);
    } finally {
      inFlightRequests.project = false;
    }
  };

  const createProject = async (title: string, description: string) => {
    if (!user) return null;
    const projectId = await projectOps.createProject(user.id, title, description);
    if (projectId) {
      const project = await projectOps.fetchProject(projectId);
      setProjects(prev => [
        {
          ...project,
          note_count: 0,
          task_count: 0
        } as ProjectWithCounts,
        ...prev
      ]);
    }
    return projectId;
  };

  const updateProject = async (id: string, title: string, description: string) => {
    const success = await projectOps.updateProject(id, title, description);
    if (success) {
      setProjects(prev => 
        prev.map(project => 
          project.id === id 
            ? { ...project, title, description, updated_at: new Date().toISOString() } 
            : project
        )
      );
      
      if (currentProject && currentProject.id === id) {
        setCurrentProject({
          ...currentProject,
          title,
          description,
          updated_at: new Date().toISOString()
        });
      }
    }
  };

  const deleteProject = async (id: string) => {
    const success = await projectOps.deleteProject(id);
    if (success) {
      setProjects(prev => prev.filter(project => project.id !== id));
      if (currentProject && currentProject.id === id) {
        setCurrentProject(null);
      }
    }
  };

  const fetchProjectNotes = async (projectId: string) => {
    if (inFlightRequests.notes) return;
    
    // Check cooldown
    const now = Date.now();
    if (now < requestCooldowns.notes) {
      return;
    }
    
    try {
      inFlightRequests.notes = true;
      requestCooldowns.notes = now + COOLDOWN_TIME;
      
      const notes = await noteOps.fetchProjectNotes(projectId);
      setProjectNotes(notes);
    } finally {
      inFlightRequests.notes = false;
    }
  };

  const createNote = async (projectId: string, content: any) => {
    if (!user) return null;
    const noteId = await noteOps.createNote(projectId, user.id, content);
    if (noteId) {
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, note_count: project.note_count + 1 } 
            : project
        )
      );
      await fetchProjectNotes(projectId);
    }
    return noteId;
  };

  const updateNote = async (id: string, content: any) => {
    const success = await noteOps.updateNote(id, content);
    if (success) {
      setProjectNotes(prev => 
        prev.map(note => 
          note.id === id 
            ? { ...note, content, updated_at: new Date().toISOString() } 
            : note
        )
      );
    }
  };

  const deleteNote = async (id: string) => {
    const noteToDelete = projectNotes.find(note => note.id === id);
    const success = await noteOps.deleteNote(id);
    if (success && noteToDelete?.project_id) {
      setProjectNotes(prev => prev.filter(note => note.id !== id));
      setProjects(prev => 
        prev.map(project => 
          project.id === noteToDelete.project_id 
            ? { ...project, note_count: Math.max(0, project.note_count - 1) } 
            : project
        )
      );
    }
  };

  const fetchProjectTasks = async (projectId: string) => {
    if (inFlightRequests.tasks) return;
    
    // Check cooldown
    const now = Date.now();
    if (now < requestCooldowns.tasks) {
      return;
    }
    
    try {
      inFlightRequests.tasks = true;
      requestCooldowns.tasks = now + COOLDOWN_TIME;
      
      const tasks = await taskOps.fetchProjectTasks(projectId);
      setProjectTasks(tasks);
    } finally {
      inFlightRequests.tasks = false;
    }
  };

  const createTask = async (
    projectId: string,
    title: string,
    description: string,
    status: Task['status'],
    taskType: Task['task_type'],
    parentTaskId?: string
  ) => {
    if (!user) return null;
    const taskId = await taskOps.createTask(projectId, user.id, title, description, status, taskType, parentTaskId);
    if (taskId) {
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, task_count: project.task_count + 1 } 
            : project
        )
      );
      await fetchProjectTasks(projectId);
    }
    return taskId;
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'created_by'>>) => {
    const success = await taskOps.updateTask(id, updates);
    if (success) {
      setProjectTasks(prev => 
        prev.map(task => 
          task.id === id 
            ? { ...task, ...updates, updated_at: new Date().toISOString() } 
            : task
        )
      );
    }
  };

  const deleteTask = async (id: string) => {
    const taskToDelete = projectTasks.find(task => task.id === id);
    const success = await taskOps.deleteTask(id);
    if (success && taskToDelete?.project_id) {
      setProjectTasks(prev => prev.filter(task => task.id !== id));
      setProjects(prev => 
        prev.map(project => 
          project.id === taskToDelete.project_id 
            ? { ...project, task_count: Math.max(0, project.task_count - 1) } 
            : project
        )
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setProjectNotes([]);
      setProjectTasks([]);
    }
  }, [user]);

  const value = {
    projects,
    currentProject,
    projectNotes,
    projectTasks,
    loadingProjects: projectOps.loadingProjects,
    loadingProject: projectOps.loadingProject,
    loadingNotes: noteOps.loadingNotes,
    loadingTasks: taskOps.loadingTasks,
    setLoadingProject: projectOps.setLoadingProject,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    fetchProjectNotes,
    createNote,
    updateNote,
    deleteNote,
    fetchProjectTasks,
    createTask,
    updateTask,
    deleteTask,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
