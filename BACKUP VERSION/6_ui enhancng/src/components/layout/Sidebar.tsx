import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Folder, 
  LogOut, 
  Plus, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  Bell
} from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { projects } = useProject();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';
  const iconOnly = isCollapsed ? 'justify-center' : 'justify-start';

  const sidebarVariants = {
    expanded: {
      width: 256,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    collapsed: {
      width: 64,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const itemVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const SidebarItem = ({ to, icon: Icon, label, isActive }: { to: string; icon: any; label: string; isActive?: boolean }) => (
    <Link to={to} className="block w-full">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={itemVariants}
            >
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full group transition-all duration-200',
                  iconOnly,
                  isActive && 'bg-primary/10'
                )}
                size={isCollapsed ? 'icon' : 'default'}
              >
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className={cn('h-5 w-5', isCollapsed ? '' : 'mr-2')} />
                </motion.div>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {label}
                  </motion.span>
                )}
              </Button>
            </motion.div>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" sideOffset={10}>
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
              >
                {label}
              </motion.p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </Link>
  );

  return (
    <motion.div
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      className={cn(
        'relative min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col',
        'transition-all duration-200 ease-in-out'
      )}
    >
      <motion.div 
        className="p-4 flex items-center justify-between border-b border-sidebar-border"
        animate={{
          backgroundColor: isCollapsed ? "rgba(0,0,0,0.02)" : "transparent"
        }}
      >
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-xl font-bold text-sidebar-foreground"
            >
              TaskCanvas
            </motion.h2>
          )}
        </AnimatePresence>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="shrink-0"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
      
      <div className="p-2 flex-1 flex flex-col gap-2">
        <Button 
          variant="default" 
          className={cn(
            'bg-primary hover:bg-primary/90',
            isCollapsed ? 'px-2' : 'w-full'
          )}
          onClick={() => navigate('/projects/new')}
        >
          <Plus className={cn('h-4 w-4', isCollapsed ? '' : 'mr-2')} />
          {!isCollapsed && 'New Project'}
        </Button>
        
        <nav className="space-y-1">
          <SidebarItem 
            to="/dashboard" 
            icon={LayoutDashboard} 
            label="Dashboard"
            isActive={location.pathname === '/dashboard'}
          />
          <SidebarItem 
            to="/calendar" 
            icon={Calendar} 
            label="Calendar"
            isActive={location.pathname === '/calendar'}
          />
          <SidebarItem 
            to="/search" 
            icon={Search} 
            label="Search"
            isActive={location.pathname === '/search'}
          />
          <SidebarItem 
            to="/notifications" 
            icon={Bell} 
            label="Notifications"
            isActive={location.pathname === '/notifications'}
          />
          
          <Separator className="my-4" />
          
          {!isCollapsed && (
            <div className="px-2 py-1">
              <h3 className="text-sm font-medium text-sidebar-foreground/70">Recent Projects</h3>
            </div>
          )}
          
          <div className="space-y-1">
            {projects.slice(0, 5).map(project => (
              <SidebarItem
                key={project.id}
                to={`/projects/${project.id}`}
                icon={Folder}
                label={project.title}
                isActive={location.pathname === `/projects/${project.id}`}
              />
            ))}
          </div>
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className={cn(
          'flex items-center gap-3 mb-4',
          isCollapsed && 'justify-center'
        )}>
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <SidebarItem 
            to="/settings" 
            icon={Settings} 
            label="Settings"
            isActive={location.pathname === '/settings'}
          />
          <Button 
            variant="ghost" 
            className={cn(
              'text-red-500 hover:text-red-600 hover:bg-red-100/10',
              isCollapsed ? 'px-2' : 'w-full'
            )}
            size={isCollapsed ? 'icon' : 'default'}
            onClick={handleSignOut}
          >
            <LogOut className={cn('h-4 w-4', isCollapsed ? '' : 'mr-2')} />
            {!isCollapsed && 'Sign Out'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
