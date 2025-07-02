import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FolderOpen, Save } from 'lucide-react';
import { ConfiguratorOptionGroup } from '../types/ConfiguratorTypes';

interface GroupEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groupData: ConfiguratorOptionGroup) => void;
  groupData?: ConfiguratorOptionGroup;
  isEditing?: boolean;
}

const GroupEditModal: React.FC<GroupEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  groupData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<ConfiguratorOptionGroup>({
    id: '',
    name: '',
    description: '',
    isExpanded: true
  });

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, groupData]);

  const handleSave = () => {
    if (formData.name.trim()) {
      onSave(formData);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData.name.trim()) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-800 rounded-xl border border-gray-600 shadow-2xl w-full max-w-md"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-750 rounded-t-xl">
          <div className="flex items-center justify-between">
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
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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
          <div className="flex items-center justify-between">
            <div>
              <label className="text-gray-400 text-sm font-medium">Expanded by Default</label>
              <p className="text-gray-500 text-xs mt-1">Show group options expanded when first loaded</p>
            </div>
            <button
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

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-750 rounded-b-xl flex space-x-4">
          <button
            onClick={onClose}
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
      </motion.div>
    </div>
  );
};

export default GroupEditModal;