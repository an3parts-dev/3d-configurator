import React from 'react';
import { motion } from 'framer-motion';
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
}

const ConfiguratorOptionsPanel: React.FC<ConfiguratorOptionsPanelProps> = ({
  configuratorData,
  modelComponents,
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
  onToggleGroup
}) => {
  return (
    <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
      isPreviewMode ? 'w-0 overflow-hidden' : 'w-1/2'
    }`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-750">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white font-bold text-2xl">3D Configurator Builder</h1>
              <p className="text-gray-400 text-sm mt-1">
                Design interactive 3D product configurators
              </p>
            </div>
            <button
              onClick={onTogglePreviewMode}
              className={`p-3 rounded-lg transition-colors ${
                isPreviewMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={isPreviewMode ? 'Show Builder' : 'Preview Mode'}
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onCreateOption}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Option</span>
            </button>

            <button
              onClick={onCreateGroup}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add Group</span>
            </button>

            <button
              onClick={onExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <button
              onClick={onImport}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
          </div>

          {lastSaved && (
            <p className="text-gray-500 text-xs mt-3">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-auto p-6">
          <OptionsList
            options={configuratorData.options}
            onMove={onMoveOption}
            onEdit={onEditOption}
            onDelete={onDeleteOption}
            onEditConditionalLogic={onEditConditionalLogic}
            onToggleGroup={onToggleGroup}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorOptionsPanel;