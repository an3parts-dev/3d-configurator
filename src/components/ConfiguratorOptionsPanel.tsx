import React from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  Maximize2,
  FolderPlus
} from 'lucide-react';
import DashboardHeader from './layout/DashboardHeader';
import { OptionsList } from './option-management';
import { 
  ConfiguratorData, 
  ConfiguratorOption, 
  ModelComponent 
} from '../types/ConfiguratorTypes';

interface ConfiguratorOptionsPanelProps {
  configuratorData: ConfiguratorData;
  modelComponents: ModelComponent[];
  lastSaved: Date | null;
  isPreviewMode: boolean;
  onTogglePreviewMode: () => void;
  onCreateOption: () => void;
  onCreateGroup: () => void;
  onExport: () => void;
  onImport: () => void;
  onMoveOption: (dragIndex: number, hoverIndex: number) => void;
  onEditOption: (option: ConfiguratorOption) => void;
  onDeleteOption: (optionId: string) => void;
  onEditConditionalLogic: (option: ConfiguratorOption) => void;
  onToggleGroup: (groupId: string) => void;
  onMoveToGroup: (optionId: string, targetGroupId: string | null) => void;
  onNavigateHome: () => void;
}

const ConfiguratorOptionsPanel: React.FC<ConfiguratorOptionsPanelProps> = ({
  configuratorData,
  lastSaved,
  isPreviewMode,
  onTogglePreviewMode,
  onCreateOption,
  onCreateGroup,
  onExport,
  onImport,
  onMoveOption,
  onEditOption,
  onDeleteOption,
  onEditConditionalLogic,
  onToggleGroup,
  onMoveToGroup,
  onNavigateHome
}) => {
  return (
    <div className="w-full h-screen bg-white dark:bg-gray-800 flex flex-col">
      {/* Dashboard Header */}
      <DashboardHeader
        projectName={configuratorData.name}
        onNavigateHome={onNavigateHome}
      />

      {/* Fixed Header Section - Mobile Optimized */}
      <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
        {/* Main Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-gray-900 dark:text-white font-bold text-lg sm:text-xl truncate">3D Configurator Builder</h1>
            </div>
            <button
              onClick={onTogglePreviewMode}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex-shrink-0 ml-2 shadow-md"
              title="Fullscreen Preview"
            >
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Import/Export Buttons - Drag & Drop Style */}
          <div className="flex gap-2">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all flex-1">
              <button
                onClick={onExport}
                className="w-full flex items-center justify-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>

            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all flex-1">
              <button
                onClick={onImport}
                className="w-full flex items-center justify-center space-x-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Import</span>
              </button>
            </div>
          </div>

          {lastSaved && (
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 hidden sm:block">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Configuration Options Header - Mobile Optimized */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-gray-900 dark:text-white font-semibold text-base sm:text-lg">Configuration Options</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 hidden sm:block">
                Create and manage your configurator options and groups
              </p>
            </div>
          </div>
          
          {/* Action Buttons - Drag & Drop Style */}
          <div className="flex gap-2">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all flex-1">
              <button
                onClick={onCreateOption}
                className="w-full flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium hidden xs:inline">Add Option</span>
                <span className="text-sm font-medium xs:hidden">Option</span>
              </button>
            </div>

            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all flex-1">
              <button
                onClick={onCreateGroup}
                className="w-full flex items-center justify-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                <span className="text-sm font-medium hidden xs:inline">Add Group</span>
                <span className="text-sm font-medium xs:hidden">Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Options Area - Mobile Optimized */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 bg-white dark:bg-gray-800">
        <OptionsList
          options={configuratorData.options}
          onMove={onMoveOption}
          onEdit={onEditOption}
          onDelete={onDeleteOption}
          onEditConditionalLogic={onEditConditionalLogic}
          onToggleGroup={onToggleGroup}
          onMoveToGroup={onMoveToGroup}
        />
      </div>
    </div>
  );
};

export default ConfiguratorOptionsPanel;