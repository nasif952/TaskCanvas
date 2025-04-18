import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Plus,
  PlusCircle,
  Settings,
  FolderOpen,
  LogOut,
  ChevronRight,
  Menu,
  X,
  BookOpen,
  CheckSquare,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { name: 'Projects', path: '/projects', icon: <FolderOpen className="w-5 h-5" /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { name: 'Notes', path: '/notes', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '80px' },
  };

  const logoVariants = {
    expanded: { opacity: 1 },
    collapsed: { opacity: 0 },
  };

  const navTextVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 },
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <motion.button
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 right-4 z-50 bg-white p-2 rounded-full shadow-md"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 bg-white md:hidden"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                  TaskCanvas
                </h1>
                <button onClick={toggleMobileMenu}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                          location.pathname === item.path
                            ? 'bg-gradient-to-r from-purple-100 to-blue-50 text-purple-600'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={toggleMobileMenu}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-400 flex items-center justify-center text-white font-semibold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-medium">{user.displayName || user.email}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-500 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        initial="expanded"
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex h-screen overflow-hidden flex-col bg-white border-r border-gray-200 relative"
      >
        <div className="p-4 flex items-center justify-between">
          <Link 
            to="/dashboard" 
            className="flex items-center"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">
              TC
            </div>
            <motion.span 
              variants={logoVariants}
              transition={{ duration: 0.2 }}
              className="ml-3 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500"
            >
              TaskCanvas
            </motion.span>
          </Link>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <ChevronRight className={`w-5 h-5 transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>

        <Button
          className={`bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white mx-4 mb-6 ${isCollapsed ? 'justify-center' : ''}`}
          onClick={() => navigate('/projects/new')}
        >
          <PlusCircle className="w-5 h-5" />
          <motion.span
            variants={navTextVariants}
            transition={{ duration: 0.2 }}
            className="ml-2"
          >
            New Project
          </motion.span>
        </Button>

        <div className="flex-1 overflow-y-auto">
          <nav className="px-3 py-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 py-2.5 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-purple-100 to-blue-50 text-purple-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <motion.span
                      variants={navTextVariants}
                      transition={{ duration: 0.2 }}
                      className="ml-3 whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'flex justify-center' : ''}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-700 truncate">
                  {user.displayName || user.email}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-auto text-gray-500 hover:text-red-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
