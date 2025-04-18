import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onRefresh }) => {
  const navigate = useNavigate();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Only show search on mobile when specifically toggled
  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  return (
    <motion.div 
      className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      {/* Search field - hidden on mobile until toggled */}
      {isSearchVisible ? (
        <div className="relative w-full flex items-center">
          <Search className="absolute left-2.5 top-[50%] transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-9 bg-background border-muted pr-9"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-[50%] transform -translate-y-1/2 h-7 w-7"
            onClick={toggleSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex sm:flex-row gap-2 items-center w-full justify-between sm:justify-start">
          {/* Search button only visible on mobile */}
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden border-muted bg-background hover:bg-primary/5 hover:text-primary"
            onClick={toggleSearch}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          {/* Search field always visible on larger screens */}
          <div className="relative hidden sm:block sm:w-auto sm:flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-9 bg-background border-muted"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onRefresh} 
                title="Refresh all data"
                className="border-muted bg-background hover:bg-primary/5 hover:text-primary touch-manipulation"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => navigate('/projects/new')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-4 py-2 h-auto touch-manipulation"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="text-sm">New</span>
                <span className="hidden sm:inline ml-1">Project</span>
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardHeader;
