export interface Project {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Note {
  id: string;
  project_id: string;
  title: string | null;
  content: any; // JSONB for rich text
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Task {
  id: string;
  project_id: string;
  parent_task_id: string | null;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  task_type: 'task' | 'note';
  due_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | null;
  labels?: string[] | null;
  estimated_time?: number | null; // in minutes
  actual_time?: number | null; // in minutes
}

export interface ProjectSharing {
  id: string;
  project_id: string;
  owner_id: string;
  shared_with_id: string;
  permission_level: 'view' | 'edit';
  invitation_status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  user_email?: string; // Added this optional field to match usage in ProjectSharedUsersList
}

export interface Image {
  id: string;
  note_id: string;
  storage_path: string;
  file_name: string;
  created_at: string;
  uploaded_by: string;
}

export interface ProjectWithCounts extends Project {
  note_count: number;
  task_count: number;
}

export interface ChatMessage {
  id: string;
  project_id: string;
  content: string;
  created_at: string;
  created_by: string;
  user_name?: string; // Optional field to store or join with user's name
}
