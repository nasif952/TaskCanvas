
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <header className="py-6 px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">TaskCanvas</h1>
        <div>
          {user ? (
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Manage Your Projects with Ease
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            TaskCanvas helps you organize your projects, tasks, and notes in one place. 
            Collaborate with your team and stay on top of your work.
          </p>
          <div className="mt-10">
            <Button size="lg" asChild>
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? "Go to Dashboard" : "Get Started"}
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Project Management</h3>
              <p className="text-gray-500">
                Create and organize projects. Keep track of progress and deadlines.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Task Tracking</h3>
              <p className="text-gray-500">
                Create tasks, set priorities, and track progress to keep your projects on schedule.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Rich Note Taking</h3>
              <p className="text-gray-500">
                Capture ideas, requirements, and documentation with our rich text editor.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500">
            TaskCanvas - Your project management solution
          </p>
          <p className="text-gray-500 mt-2 md:mt-0">
            © {new Date().getFullYear()} TaskCanvas
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
