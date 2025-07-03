import React from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  Eye,
  FolderPlus
} from 'lucide-react';
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
  onMoveToGroup
}) => {
  return (
    <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
      isPreviewMode ? 'w-0 overflow-hidden' : 'w-full sm:w-1/2'
    }`}>
      <div className="h-full flex flex-col">
        {/* Fixed Header Section - Mobile Optimized */}
        <div className="flex-shrink-0 bg-gray-750 border-b border-gray-700">
          {/* Main Header */}
          <div className="p-3 sm:p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-white font-bold text-lg sm:text-xl truncate">3D Configurator Builder</h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 hidden sm:block">
                  Design interactive 3D product configurators
                </p>
              </div>
              <button
                onClick={onTogglePreviewMode}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ml-2 ${
                  isPreviewMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={isPreviewMode ? 'Show Builder' : 'Preview Mode'}
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Import/Export Buttons - Mobile Optimized */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onExport}
                className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors text-xs sm:text-sm flex-1 sm:flex-none justify-center"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Export</span>
              </button>

              <button
                onClick={onImport}
                className="bg-orange-600 hover:bg-orange-700 text-white px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors text-xs sm:text-sm flex-1 sm:flex-none justify-center"
              >
                <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Import</span>
              </button>
            </div>

            {lastSaved && (
              <p className="text-gray-500 text-xs mt-2 hidden sm:block">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Configuration Options Header - Mobile Optimized */}
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-white font-semibold text-base sm:text-lg">Configuration Options</h2>
                <p className="text-gray-400 text-xs mt-1 hidden sm:block">
                  Create and manage your configurator options and groups
                </p>
              </div>
            </div>
            
            {/* Action Buttons - Mobile Optimized */}
            <div className="flex gap-2">
              <button
                onClick={onCreateOption}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors text-xs sm:text-sm flex-1 justify-center"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Add Option</span>
                <span className="xs:hidden">Option</span>
              </button>

              <button
                onClick={onCreateGroup}
                className="bg-purple-600 hover:bg-purple-700 text-white px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors text-xs sm:text-sm flex-1 justify-center"
              >
                <FolderPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Add Group</span>
                <span className="xs:hidden">Group</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drag & Drop Options Area - Mobile Optimized */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 bg-gray-800">
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
    </div>
  );
};

export default ConfiguratorOptionsPanel;