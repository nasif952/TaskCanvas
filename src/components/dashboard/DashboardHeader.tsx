import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  onRefresh: () => void;
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  status?: ('active' | 'archived' | 'completed')[];
  sortBy?: 'newest' | 'oldest' | 'alphabetical' | 'lastUpdated';
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onRefresh,
  onSearch,
  onFilterChange
}) => {
  const navigate = useNavigate();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: ['active'],
    sortBy: 'newest'
  });
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  // Toggle search visibility on mobile
  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      // Reset search when opening
      setSearchQuery('');
      if (onSearch) {
        onSearch('');
      }
    }
  };

  // Update filters and notify parent component
  const updateFilters = (newFilters: FilterOptions) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      if (onFilterChange) {
        onFilterChange(updated);
      }
      return updated;
    });
  };

  // Count active filters for badge display
  useEffect(() => {
    let count = 0;
    if (filters.status && filters.status.length < 3 && filters.status.length > 0) count++;
    if (filters.sortBy && filters.sortBy !== 'newest') count++;
    setActiveFilterCount(count);
  }, [filters]);

  // Handle status filter changes
  const handleStatusChange = (status: 'active' | 'archived' | 'completed') => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    updateFilters({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  return (
    <motion.div 
      className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto bg-card/40 backdrop-blur-sm p-3 rounded-lg border border-border/50 shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {isSearchVisible ? (
          <motion.div 
            className="relative w-full flex items-center"
            key="search-mobile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="absolute left-2.5 top-[50%] transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-9 bg-background border-muted pr-9"
              value={searchQuery}
              onChange={handleSearchChange}
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
          </motion.div>
        ) : (
          <motion.div 
            className="flex sm:flex-row gap-2 items-center w-full justify-between sm:justify-start"
            key="default-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
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
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {/* Filters dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative border-muted bg-background hover:bg-primary/5 hover:text-primary"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {activeFilterCount > 0 && (
                      <Badge 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                        variant="default"
                      >
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter Projects</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
                    Status
                  </DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={filters.status?.includes('active')}
                    onCheckedChange={() => handleStatusChange('active')}
                  >
                    Active Projects
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.status?.includes('completed')}
                    onCheckedChange={() => handleStatusChange('completed')}
                  >
                    Completed
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.status?.includes('archived')}
                    onCheckedChange={() => handleStatusChange('archived')}
                  >
                    Archived
                  </DropdownMenuCheckboxItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Sort By
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    className={filters.sortBy === 'newest' ? 'bg-muted/50' : ''} 
                    onClick={() => updateFilters({ ...filters, sortBy: 'newest' })}
                  >
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={filters.sortBy === 'oldest' ? 'bg-muted/50' : ''} 
                    onClick={() => updateFilters({ ...filters, sortBy: 'oldest' })}
                  >
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={filters.sortBy === 'alphabetical' ? 'bg-muted/50' : ''} 
                    onClick={() => updateFilters({ ...filters, sortBy: 'alphabetical' })}
                  >
                    Alphabetical (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={filters.sortBy === 'lastUpdated' ? 'bg-muted/50' : ''} 
                    onClick={() => updateFilters({ ...filters, sortBy: 'lastUpdated' })}
                  >
                    Last Updated
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardHeader;
