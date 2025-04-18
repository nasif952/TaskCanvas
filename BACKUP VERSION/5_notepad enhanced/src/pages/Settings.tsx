
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-medium mb-4">Account</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-md font-medium mb-2">Project Management Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              More settings will be available in future updates. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
