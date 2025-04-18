
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onRefresh }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex space-x-2">
        <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh all data">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button onClick={() => navigate('/projects/new')}>
          <Plus className="h-4 w-4 mr-1" />
          New Project
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
