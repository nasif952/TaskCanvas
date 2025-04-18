import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onRefresh }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="flex flex-col sm:flex-row gap-2 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <div className="relative w-full sm:w-auto sm:flex-1 max-w-sm">
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
            className="border-muted bg-background hover:bg-primary/5 hover:text-primary"
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
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
