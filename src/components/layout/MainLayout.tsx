import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import Sidebar from './Sidebar';
import { Toaster } from '@/components/ui/sonner';
import InstallAppButton from '../ui/InstallAppButton';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const loadingVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="flex items-center justify-center h-screen bg-background"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={loadingVariants}
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{
              rotate: 360,
              transition: {
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.p 
            className="text-sm text-muted-foreground"
            animate={{
              opacity: [0.5, 1, 0.5],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            Loading your workspace...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <motion.div 
      className="flex min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="h-screen"
        >
          <Sidebar />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={pageVariants}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.3
          }}
          className="flex-1 overflow-x-hidden"
        >
          <motion.div 
            className="container mx-auto p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            {children}
          </motion.div>
        </motion.main>
      </AnimatePresence>
      <Toaster position="bottom-right" richColors />
      <InstallAppButton variant="banner" />
    </motion.div>
  );
};

export default MainLayout;
