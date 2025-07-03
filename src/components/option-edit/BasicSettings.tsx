import React from 'react';
import { Eye, EyeOff, FolderOpen } from 'lucide-react';
import ComponentSelector from '../ComponentSelector';
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
  onNavigateToTab?: (tab: string) => void; // New prop for tab navigation
}

const BasicSettings: React.FC<BasicSettingsProps> = ({
  formData,
  setFormData,
  modelComponents,
  availableGroups,
  onNavigateToTab
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-400 text-sm mb-2 font-medium">
            Option Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter option name..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2 font-medium">
            Group Assignment
          </label>
          <select
            value={formData.groupId || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, groupId: e.target.value || undefined }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">No Group (Standalone)</option>
            {availableGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          {formData.groupId && (
            <p className="text-gray-500 text-xs mt-1 flex items-center">
              <FolderOpen className="w-3 h-3 mr-1" />
              This option will be grouped under "{availableGroups.find(g => g.id === formData.groupId)?.name}"
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-2 font-medium">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description for this option..."
          rows={3}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
        />
      </div>

      {/* Manipulation Type */}
      <div>
        <label className="block text-gray-400 text-sm mb-3 font-medium">
          Manipulation Type *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, manipulationType: 'visibility' }))}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.manipulationType === 'visibility'
                ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <Eye className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Visibility</div>
              <div className="text-sm opacity-80">Show/hide components</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, manipulationType: 'material' }))}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.manipulationType === 'material'
                ? 'border-green-500 bg-green-500/20 text-green-300'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <div className="w-6 h-6 mx-auto mb-2 bg-gradient-to-r from-red-400 to-blue-400 rounded"></div>
              <div className="font-semibold">Material</div>
              <div className="text-sm opacity-80">Change colors/materials</div>
            </div>
          </button>
        </div>
      </div>

      {/* Target Components */}
      <div>
        <ComponentSelector
          availableComponents={modelComponents}
          selectedComponents={formData.targetComponents}
          onSelectionChange={(components) => setFormData(prev => ({ ...prev, targetComponents: components }))}
          placeholder="Select target components (optional)..."
          label="Target Components"
          onConfigureTargets={() => {
            // This callback will be handled by the parent modal to navigate to values tab
            // where users can see the impact of not having target components
          }}
        />
        <p className="text-gray-500 text-xs mt-2">
          These components will be affected by this option's values. You can add these later.
        </p>
      </div>

      {/* Default Behavior for Visibility */}
      {formData.manipulationType === 'visibility' && (
        <div>
          <label className="block text-gray-400 text-sm mb-3 font-medium">
            Default Behavior
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, defaultBehavior: 'hide' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.defaultBehavior === 'hide'
                  ? 'border-red-500 bg-red-500/20 text-red-300'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <EyeOff className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Hide by Default</div>
                <div className="text-sm opacity-80">Hide targets, show selected</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, defaultBehavior: 'show' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.defaultBehavior === 'show'
                  ? 'border-green-500 bg-green-500/20 text-green-300'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <Eye className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Show by Default</div>
                <div className="text-sm opacity-80">Show targets, hide selected</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicSettings;