import React, { useState, useEffect, useMemo } from 'react';
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
  ConfiguratorOptionGroup,
  GridSettings,
  ColumnSettings
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
      cornerStyle: 'softer',
      hideTitle: false,
      titlePosition: 'below'
    },
    gridSettings: {
      columns: 3,
      columnsTablet: 2,
      columnsMobile: 1,
      gap: 'medium',
      autoFit: false,
      minItemWidth: 120
    },
    columnSettings: {
      alignment: 'left',
      spacing: 'normal'
    }
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'display' | 'values'>('basic');
  const [localValues, setLocalValues] = useState<ConfiguratorOptionValue[]>([]);
  const [showValidationFlash, setShowValidationFlash] = useState(false);

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
            cornerStyle: 'softer',
            hideTitle: false,
            titlePosition: 'below'
          },
          gridSettings: option.gridSettings || {
            columns: 3,
            columnsTablet: 2,
            columnsMobile: 1,
            gap: 'medium',
            autoFit: false,
            minItemWidth: 120
          },
          columnSettings: option.columnSettings || {
            alignment: 'left',
            spacing: 'normal'
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
            cornerStyle: 'softer',
            hideTitle: false,
            titlePosition: 'below'
          },
          gridSettings: {
            columns: 3,
            columnsTablet: 2,
            columnsMobile: 1,
            gap: 'medium',
            autoFit: false,
            minItemWidth: 120
          },
          columnSettings: {
            alignment: 'left',
            spacing: 'normal'
          }
        });
        setLocalValues([]);
      }
      setActiveTab('basic');
      setShowValidationFlash(false);
    }
  }, [isOpen, option]);

  // Validation logic - only check for option name
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
    } else {
      // Flash validation feedback only when clicking save with missing name
      setShowValidationFlash(true);
      setTimeout(() => setShowValidationFlash(false), 3000);
    }
  };

  const handleAddValue = () => {
    const newValue: ConfiguratorOptionValue = {
      id: `temp_value_${Date.now()}`,
      name: 'New Value'
    };

    if (option) {
      // If option exists, use the real add value function
      onAddValue(option.id);
    } else {
      // If option doesn't exist yet, add to local state only
      setLocalValues(prev => [...prev, newValue]);
    }
  };

  const handleUpdateValue = (valueId: string, updates: Partial<ConfiguratorOptionValue>) => {
    if (option) {
      onUpdateValue(option.id, valueId, updates);
    }
    // Always update local state immediately for UI responsiveness
    setLocalValues(prev => prev.map(value => 
      value.id === valueId ? { ...value, ...updates } : value
    ));
  };

  const handleDeleteValue = (valueId: string) => {
    if (option) {
      onDeleteValue(option.id, valueId);
    }
    // Always update local state immediately
    setLocalValues(prev => prev.filter(value => value.id !== valueId));
  };

  const handleMoveValue = (dragIndex: number, hoverIndex: number) => {
    if (option) {
      onMoveValue(option.id, dragIndex, hoverIndex);
    }
    // Always update local state immediately
    setLocalValues(prev => {
      const newValues = [...prev];
      const draggedValue = newValues[dragIndex];
      newValues.splice(dragIndex, 1);
      newValues.splice(hoverIndex, 0, draggedValue);
      return newValues;
    });
  };

  // Memoize tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'basic':
        return (
          <BasicSettings
            formData={formData}
            setFormData={setFormData}
            modelComponents={modelComponents}
            availableGroups={availableGroups}
          />
        );
      case 'display':
        return (
          <DisplaySettings
            formData={formData}
            setFormData={setFormData}
            option={option}
          />
        );
      case 'values':
        return (
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
        );
      default:
        return null;
    }
  }, [activeTab, formData, option, localValues, modelComponents, allOptions, availableGroups]);

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
        <div className="p-4 sm:p-6 border-b border-gray-700 bg-gray-750 rounded-t-xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg sm:text-xl">
                  {isEditing ? 'Edit Option' : 'Create Option'}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {isEditing ? 'Modify option settings and values' : 'Configure a new configurator option'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Optimized Tabs - Reduced animation complexity */}
          <div className="bg-gray-700 p-1 rounded-lg">
            {/* Mobile: Stacked tabs */}
            <div className="sm:hidden space-y-1">
              {[
                { id: 'basic', label: 'Basic', icon: Settings },
                { id: 'display', label: 'Display', icon: Eye },
                { id: 'values', label: 'Values', icon: List }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-150 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Desktop: Horizontal tabs */}
            <div className="hidden sm:flex space-x-1">
              {[
                { id: 'basic', label: 'Basic Settings', icon: Settings },
                { id: 'display', label: 'Display & Style', icon: Eye },
                { id: 'values', label: 'Option Values', icon: List }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors duration-150 ${
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
        </div>

        {/* Content - Simplified animation for better performance */}
        <div className="flex-1 overflow-auto">
          <div key={activeTab} className="animate-in fade-in duration-200">
            {tabContent}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-700 bg-gray-750 rounded-b-xl">
          {/* Validation Feedback - Only show when flash is triggered and there are errors */}
          {showValidationFlash && validationErrors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 rounded-lg border bg-red-500/10 border-red-500/20"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-400" />
                <div>
                  <h4 className="font-semibold text-sm text-red-300">
                    Required to save:
                  </h4>
                  <ul className="text-sm mt-1 space-y-1 text-red-200/80">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
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
              className="flex-1 py-3 px-4 rounded-lg transition-colors font-medium bg-blue-600 hover:bg-blue-700 text-white"
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