import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  Layers, 
  Eye, 
  List,
  AlertCircle
} from 'lucide-react';
import { BasicSettings, DisplaySettings, OptionValues } from './option-edit';
import { 
  ConfiguratorOption, 
  ConfiguratorOptionValue, 
  ImageSettings,
  ConfiguratorOptionGroup
} from '../types/ConfiguratorTypes';

interface ModelComponent {
  name: string;
  mesh: any;
  visible: boolean;
  material?: any;
}

interface OptionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (option: Omit<ConfiguratorOption, 'id' | 'values'>) => void;
  option?: ConfiguratorOption | null;
  modelComponents: ModelComponent[];
  allOptions: ConfiguratorOption[];
  onAddValue: (optionId: string) => void;
  onUpdateValue: (optionId: string, valueId: string, updates: Partial<ConfiguratorOptionValue>) => void;
  onDeleteValue: (optionId: string, valueId: string) => void;
  onMoveValue: (optionId: string, dragIndex: number, hoverIndex: number) => void;
  availableGroups: ConfiguratorOption[];
}

const OptionEditModal: React.FC<OptionEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  option,
  modelComponents,
  allOptions,
  onAddValue,
  onUpdateValue,
  onDeleteValue,
  onMoveValue,
  availableGroups
}) => {
  const [formData, setFormData] = useState<Omit<ConfiguratorOption, 'id' | 'values'>>({
    name: '',
    description: '',
    displayType: 'buttons',
    displayDirection: 'row',
    manipulationType: 'visibility',
    targetComponents: [],
    defaultBehavior: 'hide',
    imageSettings: {
      size: 'medium',
      aspectRatio: 'square',
      cornerStyle: 'softer'
    }
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'display' | 'values'>('basic');
  const [localValues, setLocalValues] = useState<ConfiguratorOptionValue[]>([]);

  // Sync local values with option values
  useEffect(() => {
    if (option?.values) {
      setLocalValues([...option.values]);
    } else {
      setLocalValues([]);
    }
  }, [option?.values]);

  useEffect(() => {
    if (isOpen) {
      if (option) {
        setFormData({
          name: option.name,
          description: option.description || '',
          displayType: option.displayType,
          displayDirection: option.displayDirection || 'row',
          manipulationType: option.manipulationType,
          targetComponents: option.targetComponents,
          defaultBehavior: option.defaultBehavior || 'hide',
          conditionalLogic: option.conditionalLogic,
          imageSettings: option.imageSettings || {
            size: 'medium',
            aspectRatio: 'square',
            cornerStyle: 'softer'
          },
          groupId: option.groupId
        });
        setLocalValues([...option.values]);
      } else {
        setFormData({
          name: '',
          description: '',
          displayType: 'buttons',
          displayDirection: 'row',
          manipulationType: 'visibility',
          targetComponents: [],
          defaultBehavior: 'hide',
          imageSettings: {
            size: 'medium',
            aspectRatio: 'square',
            cornerStyle: 'softer'
          }
        });
        setLocalValues([]);
      }
      setActiveTab('basic');
    }
  }, [isOpen, option]);

  // Validation logic
  const getValidationErrors = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('Option name is required');
    }
    
    return errors;
  };

  const validationErrors = getValidationErrors();
  const canSave = validationErrors.length === 0;

  const handleSave = () => {
    if (canSave) {
      onSave(formData);
    }
  };

  const handleAddValue = () => {
    if (option) {
      onAddValue(option.id);
      // Optimistically add a new value to local state for immediate UI feedback
      const newValue: ConfiguratorOptionValue = {
        id: `temp_value_${Date.now()}`,
        name: 'New Value'
      };
      setLocalValues(prev => [...prev, newValue]);
    }
  };

  const handleUpdateValue = (valueId: string, updates: Partial<ConfiguratorOptionValue>) => {
    if (option) {
      onUpdateValue(option.id, valueId, updates);
      // Update local state immediately
      setLocalValues(prev => prev.map(value => 
        value.id === valueId ? { ...value, ...updates } : value
      ));
    }
  };

  const handleDeleteValue = (valueId: string) => {
    if (option) {
      onDeleteValue(option.id, valueId);
      // Update local state immediately
      setLocalValues(prev => prev.filter(value => value.id !== valueId));
    }
  };

  const handleMoveValue = (dragIndex: number, hoverIndex: number) => {
    if (option) {
      onMoveValue(option.id, dragIndex, hoverIndex);
      // Update local state immediately
      setLocalValues(prev => {
        const newValues = [...prev];
        const draggedValue = newValues[dragIndex];
        newValues.splice(dragIndex, 1);
        newValues.splice(hoverIndex, 0, draggedValue);
        return newValues;
      });
    }
  };

  if (!isOpen) return null;

  const isEditing = !!option;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-800 rounded-xl border border-gray-600 shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-750 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-xl">
                  {isEditing ? 'Edit Option' : 'Create Option'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {isEditing ? 'Modify option settings and values' : 'Configure a new configurator option'}
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

          {/* Tabs */}
          <div className="flex space-x-1 mt-6 bg-gray-700 p-1 rounded-lg">
            {[
              { id: 'basic', label: 'Basic Settings', icon: Settings },
              { id: 'display', label: 'Display & Style', icon: Eye },
              { id: 'values', label: 'Option Values', icon: List }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <BasicSettings
                  formData={formData}
                  setFormData={setFormData}
                  modelComponents={modelComponents}
                  availableGroups={availableGroups}
                />
              </motion.div>
            )}

            {activeTab === 'display' && (
              <motion.div
                key="display"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <DisplaySettings
                  formData={formData}
                  setFormData={setFormData}
                />
              </motion.div>
            )}

            {activeTab === 'values' && (
              <motion.div
                key="values"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <OptionValues
                  option={option}
                  formData={formData}
                  localValues={localValues}
                  modelComponents={modelComponents}
                  allOptions={allOptions}
                  onAddValue={handleAddValue}
                  onUpdateValue={handleUpdateValue}
                  onDeleteValue={handleDeleteValue}
                  onMoveValue={handleMoveValue}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-750 rounded-b-xl">
          {/* Validation Feedback */}
          {validationErrors.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-yellow-300 font-semibold text-sm">Required to save:</h4>
                  <ul className="text-yellow-200/80 text-sm mt-1 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium ${
                canSave
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600/50 text-white/70 cursor-pointer'
              }`}
            >
              {isEditing ? 'Update Option' : 'Create Option'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OptionEditModal;