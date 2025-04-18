# TaskCanvas - Project Overview

## Project Summary

TaskCanvas is a web-based project management application built with React, TypeScript, and Supabase. It allows users to create and manage projects, tasks, and notes in a collaborative environment.

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **UI Component Library**: shadcn/ui components (based on Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: Context API with React Hooks
- **Routing**: React Router
- **Data Fetching**: React Query
- **Backend & Authentication**: Supabase
- **Form Management**: React Hook Form with Zod validation

## Project Structure

```
/
├── src/
│   ├── components/       # UI components organized by feature
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── layout/       # Layout components
│   │   ├── notes/        # Note-related components
│   │   ├── projects/     # Project-related components
│   │   ├── tasks/        # Task-related components
│   │   └── ui/           # shadcn/ui components
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext   # Authentication state management
│   │   └── ProjectContext # Projects, notes, and tasks state management
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Integration with external services
│   ├── lib/              # Utility functions and types
│   │   ├── supabase.ts   # Supabase client configuration
│   │   └── types.ts      # TypeScript interfaces
│   ├── pages/            # Page components
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
└── supabase/             # Supabase configuration
```

## Core Features

### Authentication

- User registration and login via Supabase Auth
- Password reset functionality
- Session management

### Projects

- Create, read, update, and delete projects
- Project sharing with other users
- Invitation system for collaboration

### Notes

- Rich text editor for note-taking within projects
- Create, read, update, and delete notes

### Tasks

- Create, read, update, and delete tasks
- Task hierarchy (parent/child relationships)
- Task status tracking (todo, in-progress, completed)
- Different task types (task, note)

## Data Models

### Project

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}
```

### Note

```typescript
interface Note {
  id: string;
  project_id: string;
  content: any; // JSONB for rich text
  created_at: string;
  updated_at: string;
  created_by: string;
}
```

### Task

```typescript
interface Task {
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
}
```

### Project Sharing

```typescript
interface ProjectSharing {
  id: string;
  project_id: string;
  owner_id: string;
  shared_with_id: string;
  permission_level: 'view' | 'edit';
  invitation_status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}
```

## Application Flow

1. Users register or log in via the auth page
2. After authentication, users are redirected to the dashboard
3. In the dashboard, users can:
   - View their projects
   - View projects shared with them
   - Create new projects
   - Accept/reject project invitations
4. Inside a project detail page, users can:
   - View and edit project details
   - Create, edit, and delete notes
   - Create, edit, and delete tasks
   - Share the project with other users

## Performance Considerations

- Request throttling and exponential backoff for Supabase API calls
- Caching with React Query
- Cooldown periods to prevent excessive API calls

## Security Features

- Authentication via Supabase Auth
- Permission-based access control for shared projects
- Data validation using Zod schemas

## Future Improvements

Based on the codebase analysis, potential improvements could include:

- Offline support
- Real-time collaboration features
- File attachments for tasks and notes
- Rich text editor improvements
- Mobile app version
- Enhanced analytics and reporting 