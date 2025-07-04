import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Save, ArrowLeft } from 'lucide-react';
import { ConfiguratorOptionGroup } from '../types/ConfiguratorTypes';

interface GroupEditPanelProps {
  groupData?: ConfiguratorOptionGroup | null;
  onSave: (groupData: ConfiguratorOptionGroup) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const GroupEditPanel: React.FC<GroupEditPanelProps> = ({
  groupData,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<ConfiguratorOptionGroup>({
    id: '',
    name: '',
    description: '',
    isExpanded: true
  });

  useEffect(() => {
    if (groupData) {
      setFormData({ ...groupData });
    } else {
      setFormData({
        id: `group_${Date.now()}`,
        name: '',
        description: '',
        isExpanded: true
      });
    }
  }, [groupData]);

  const handleSave = () => {
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData.name.trim()) {
      handleSave();
    }
  };

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700 bg-gray-750 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-xl">
              {isEditing ? 'Edit Group' : 'Create Group'}
            </h3>
            <p className="text-gray-400 text-sm">
              {isEditing ? 'Update group details' : 'Create a new option group'}
            </p>
          </div>
        </div>
      </div>

      {/* Content - Takes remaining space */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Group Name */}
        <div>
          <label className="block text-gray-400 text-sm mb-2 font-medium">
            Group Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            onKeyPress={handleKeyPress}
            placeholder="Enter group name..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            autoFocus
          />
        </div>

        {/* Group Description */}
        <div>
          <label className="block text-gray-400 text-sm mb-2 font-medium">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description for this group..."
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
          />
        </div>

        {/* Expanded by Default */}
        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
          <div>
            <label className="text-gray-400 text-sm font-medium">Expanded by Default</label>
            <p className="text-gray-500 text-xs mt-1">Show group options expanded when first loaded</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isExpanded: !prev.isExpanded }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.isExpanded ? 'bg-purple-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.isExpanded ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="p-6 border-t border-gray-700 bg-gray-750 flex space-x-4 flex-shrink-0">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!formData.name.trim()}
          className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 ${
            formData.name.trim()
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{isEditing ? 'Update Group' : 'Create Group'}</span>
        </button>
      </div>
    </div>
  );
};

export default GroupEditPanel;