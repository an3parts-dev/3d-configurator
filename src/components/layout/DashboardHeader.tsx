import React from 'react';
import { ChevronRight, Home, Settings } from 'lucide-react';
import { ThemeToggle } from '../ui';

interface DashboardHeaderProps {
  projectName: string;
  onNavigateHome: () => void;
  onProjectSettings?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  projectName,
  onNavigateHome,
  onProjectSettings
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm">
          <button
            onClick={onNavigateHome}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
          
          <span className="text-blue-600 dark:text-blue-400">Configure</span>
          
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
          
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
            {projectName}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <ThemeToggle size="sm" />
          
          {onProjectSettings && (
            <button
              onClick={onProjectSettings}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Project Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;