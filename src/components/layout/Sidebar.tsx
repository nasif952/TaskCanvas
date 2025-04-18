import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Home,
  LogOut,
  Plus,
  PlusCircle,
  Settings,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    projects: true,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Function to explicitly toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  if (!user) {
    return null;
  }

  const sidebarVariants = {
    expanded: { width: "240px" },
    collapsed: { width: "64px" }
  };

  const iconOnly = isCollapsed;

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm z-10"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 1 }}
          animate={{ opacity: isCollapsed ? 0 : 1 }}
          className="font-bold text-xl"
        >
          TaskCanvas
        </motion.div>
        {isCollapsed ? (
          <motion.button
            onClick={toggleSidebar}
            className="absolute -right-4 top-[50px] bg-indigo-600 dark:bg-indigo-800 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-700 z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            aria-label="Expand sidebar"
          >
            <ChevronRight />
          </motion.button>
        ) : (
          <motion.button
            onClick={toggleSidebar}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Collapse sidebar"
          >
            <ChevronDown />
          </motion.button>
        )}
      </div>

      {/* Create New */}
      <div className="p-3">
        <AnimatePresence mode="wait">
          {!iconOnly ? (
            <motion.button
              key="expanded-new"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
              onClick={() => navigate("/projects/new")}
            >
              <Plus size={18} />
              <span>New Project</span>
            </motion.button>
          ) : (
            <motion.button
              key="collapsed-new"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center justify-center p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
              onClick={() => navigate("/projects/new")}
            >
              <PlusCircle size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center p-2 rounded-lg ${
                location.pathname === "/dashboard"
                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              } transition-colors duration-200`}
            >
              <Home size={iconOnly ? 24 : 20} />
              <AnimatePresence>
                {!iconOnly && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 font-medium"
                  >
                    Dashboard
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </li>

          {/* Projects Section */}
          <li>
            <button
              onClick={() => toggleSection("projects")}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
            >
              <div className="flex items-center">
                <Folder size={iconOnly ? 24 : 20} />
                <AnimatePresence>
                  {!iconOnly && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-3 font-medium"
                    >
                      Projects
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {!iconOnly && openSections.projects !== undefined && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {openSections.projects ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            
            <AnimatePresence>
              {(openSections.projects || iconOnly) && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-2 space-y-1 mt-1 overflow-hidden"
                >
                  {/* Main Projects Link */}
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to="/projects"
                      className={`flex items-center p-2 pl-8 rounded-lg ${
                        location.pathname === "/projects"
                          ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      } transition-colors duration-200`}
                    >
                      <span className="truncate font-medium">All Projects</span>
                    </Link>
                  </motion.li>
                  
                  {/* Recent Projects List */}
                  {user?.recentProjects && Array.isArray(user.recentProjects) && user.recentProjects.length > 0 ? (
                    user.recentProjects.map((project: any) => (
                      <motion.li
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          to={`/projects/${project.id}`}
                          className={`flex items-center p-2 pl-8 rounded-lg ${
                            location.pathname === `/projects/${project.id}`
                              ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          } transition-colors duration-200`}
                        >
                          {iconOnly ? (
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                          ) : (
                            <span className="truncate">{project.name}</span>
                          )}
                        </Link>
                      </motion.li>
                    ))
                  ) : (
                    <motion.li
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-500 dark:text-gray-400 p-2 pl-8"
                    >
                      No recent projects
                    </motion.li>
                  )}
                </motion.ul>
              )}
            </AnimatePresence>
          </li>

          <li>
            <Link
              to="/settings"
              className={`flex items-center p-2 rounded-lg ${
                location.pathname === "/settings"
                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              } transition-colors duration-200`}
            >
              <Settings size={iconOnly ? 24 : 20} />
              <AnimatePresence>
                {!iconOnly && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 font-medium"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </li>
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              {user.email?.[0]?.toUpperCase()}
            </div>
          </div>
          <AnimatePresence>
            {!iconOnly && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3"
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {user.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="ml-auto">
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut size={iconOnly ? 20 : 18} />
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
