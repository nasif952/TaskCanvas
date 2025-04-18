
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Folder, LogOut, Plus, Settings } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { projects } = useProject();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-2xl font-bold text-sidebar-foreground">TaskCanvas</h2>
      </div>
      
      <div className="p-4">
        <Button 
          variant="default" 
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 mb-4"
          onClick={() => navigate('/projects/new')}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
        
        <nav className="space-y-1">
          <Link to="/dashboard" className="block">
            <Button
              variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          
          <div className="py-2">
            <div className="flex items-center justify-between py-2">
              <h3 className="text-sm font-medium text-sidebar-foreground/70">Recent Projects</h3>
            </div>
            <div className="space-y-1 mt-1">
              {projects.slice(0, 5).map(project => (
                <Link key={project.id} to={`/projects/${project.id}`} className="block">
                  <Button
                    variant={location.pathname === `/projects/${project.id}` ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    <span className="truncate">{project.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          
          <Link to="/settings" className="block mt-auto">
            <Button
              variant={location.pathname === '/settings' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
          </Link>
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full border-sidebar-border" 
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
