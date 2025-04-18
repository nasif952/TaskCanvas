
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import NewProjectForm from '@/components/projects/NewProjectForm';

const NewProject: React.FC = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">Get started by creating a new project to organize your tasks and notes.</p>
        </div>
        
        <div className="mt-6">
          <NewProjectForm />
        </div>
      </div>
    </MainLayout>
  );
};

export default NewProject;
