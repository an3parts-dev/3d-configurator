import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Layers } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  model: string;
  optionsCount: number;
  lastModified: Date;
  thumbnail?: string;
}

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'optionsCount' | 'lastModified'>) => void;
  project?: Project | null;
  isEditing?: boolean;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  project,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    model: 'https://cdn.shopify.com/3d/models/o/a7af059c00ea3c69/angle-3d-generated.glb',
    thumbnail: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData({
          name: project.name,
          description: project.description || '',
          model: project.model,
          thumbnail: project.thumbnail || ''
        });
      } else {
        setFormData({
          name: '',
          description: '',
          model: 'https://cdn.shopify.com/3d/models/o/a7af059c00ea3c69/angle-3d-generated.glb',
          thumbnail: ''
        });
      }
    }
  }, [isOpen, project]);

  const handleSave = () => {
    if (formData.name.trim()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-800 rounded-xl border border-gray-600 shadow-2xl w-full max-w-md"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {isEditing ? 'Edit Project' : 'Create Project'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {isEditing ? 'Update project details' : 'Create a new 3D configurator project'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-gray-400 text-sm mb-2 font-medium">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter project name..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-400 text-sm mb-2 font-medium">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description..."
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* 3D Model URL */}
          <div>
            <label className="block text-gray-400 text-sm mb-2 font-medium">
              3D Model URL
            </label>
            <input
              type="url"
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              placeholder="https://example.com/model.glb"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex space-x-4">
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
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Update Project' : 'Create Project'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectEditModal;