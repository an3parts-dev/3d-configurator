import React, { useState } from 'react';
import { Eye, EyeOff, FolderOpen, Palette, Maximize2 } from 'lucide-react';
import { ConfiguratorOption, ConfiguratorOptionGroup } from '../../types/ConfiguratorTypes';

interface ModelComponent {
  name: string;
  mesh: any;
  visible: boolean;
  material?: any;
}

interface BasicSettingsProps {
  formData: Omit<ConfiguratorOption, 'id' | 'values'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<ConfiguratorOption, 'id' | 'values'>>>;
  modelComponents: ModelComponent[];
  availableGroups: ConfiguratorOption[];
  onShowComponentSelector?: (title: string, selectedComponents: string[], onSelectionChange: (components: string[]) => void) => void;
}

const BasicSettings: React.FC<BasicSettingsProps> = ({
  formData,
  setFormData,
  modelComponents,
  availableGroups,
  onShowComponentSelector
}) => {
  const handleTargetComponentsClick = () => {
    if (onShowComponentSelector) {
      onShowComponentSelector(
        'Target Components',
        formData.targetComponents,
        (components) => setFormData(prev => ({ ...prev, targetComponents: components }))
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable Content with hidden scrollbars */}
      <div 
        className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">
              Option Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter option name..."
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">
              Group Assignment
            </label>
            <select
              value={formData.groupId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, groupId: e.target.value || undefined }))}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="" className="text-gray-500 dark:text-gray-400">None</option>
              {availableGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {formData.groupId && (
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 flex items-center">
                <FolderOpen className="w-3 h-3 mr-1" />
                This option will be grouped under "{availableGroups.find(g => g.id === formData.groupId)?.name}"
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description for this option..."
            rows={3}
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {/* Manipulation Type - Minimal Card Design */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm mb-3 font-medium">
            Manipulation Type *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, manipulationType: 'visibility' }))}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.manipulationType === 'visibility'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  formData.manipulationType === 'visibility'
                    ? 'bg-blue-100 dark:bg-blue-600/20'
                    : 'bg-gray-100 dark:bg-gray-600'
                }`}>
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Visibility</div>
                  <div className="text-sm opacity-80">Show/hide components</div>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, manipulationType: 'material' }))}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.manipulationType === 'material'
                  ? 'border-green-500 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  formData.manipulationType === 'material'
                    ? 'bg-green-100 dark:bg-green-600/20'
                    : 'bg-gray-100 dark:bg-gray-600'
                }`}>
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Material</div>
                  <div className="text-sm opacity-80">Change colors/materials</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Target Components */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">
            Target Components
          </label>
          
          <div 
            onClick={handleTargetComponentsClick}
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-650 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 flex items-center justify-between min-h-[48px] focus-within:ring-2 focus-within:ring-blue-500/50"
          >
            <div className="flex-1 min-w-0">
              {formData.targetComponents.length === 0 ? (
                <span className="text-gray-500 dark:text-gray-400">Select target components (optional)...</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.targetComponents.slice(0, 4).map(componentName => (
                    <span
                      key={componentName}
                      className="inline-flex items-center bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-white text-sm px-3 py-1 rounded-full font-medium shadow-sm"
                    >
                      <span className="truncate max-w-[140px]" title={componentName}>
                        {componentName}
                      </span>
                    </span>
                  ))}
                  {formData.targetComponents.length > 4 && (
                    <span className="text-gray-600 dark:text-gray-400 text-sm px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-full font-medium">
                      +{formData.targetComponents.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
              <Maximize2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
            These components will be affected by this option's values. You can add these later.
          </p>
        </div>

        {/* Default Behavior for Visibility - Minimal Card Design */}
        {formData.manipulationType === 'visibility' && (
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm mb-3 font-medium">
              Default Behavior
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, defaultBehavior: 'hide' }))}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.defaultBehavior === 'hide'
                    ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    formData.defaultBehavior === 'hide'
                      ? 'bg-red-100 dark:bg-red-600/20'
                      : 'bg-gray-100 dark:bg-gray-600'
                  }`}>
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Hide by Default</div>
                    <div className="text-sm opacity-80">Hide targets, show selected</div>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, defaultBehavior: 'show' }))}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.defaultBehavior === 'show'
                    ? 'border-green-500 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    formData.defaultBehavior === 'show'
                      ? 'bg-green-100 dark:bg-green-600/20'
                      : 'bg-gray-100 dark:bg-gray-600'
                  }`}>
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Show by Default</div>
                    <div className="text-sm opacity-80">Show targets, hide selected</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS to hide scrollbars */}
      <style jsx>{`
        .flex-1::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default BasicSettings;