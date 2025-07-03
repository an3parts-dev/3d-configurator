import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Settings, 
  Eye, 
  List,
  AlertCircle,
  ArrowLeft
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

interface OptionEditPanelProps {
  option?: ConfiguratorOption | null;
  modelComponents: ModelComponent[];
  allOptions: ConfiguratorOption[];
  onSave: (option: Omit<ConfiguratorOption, 'id' | 'values'>) => void;
  onCancel: () => void;
  onAddValue: (optionId: string) => void;
  onUpdateValue: (optionId: string, valueId: string, updates: Partial<ConfiguratorOptionValue>) => void;
  onDeleteValue: (optionId: string, valueId: string) => void;
  onMoveValue: (optionId: string, dragIndex: number, hoverIndex: number) => void;
  availableGroups: ConfiguratorOption[];
}

const OptionEditPanel: React.FC<OptionEditPanelProps> = ({
  option,
  modelComponents,
  allOptions,
  onSave,
  onCancel,
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

  // Sync local values with option values when option changes
  useEffect(() => {
    if (option?.values) {
      setLocalValues([...option.values]);
    } else {
      setLocalValues([]);
    }
  }, [option?.id, option?.values]);

  useEffect(() => {
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
  }, [option]);

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

    // ALWAYS update local state immediately for UI responsiveness
    setLocalValues(prev => [...prev, newValue]);

    // If option exists, also call the real add value function
    if (option) {
      onAddValue(option.id);
    }
  };

  const handleUpdateValue = (valueId: string, updates: Partial<ConfiguratorOptionValue>) => {
    // ALWAYS update local state immediately for UI responsiveness
    setLocalValues(prev => prev.map(value => 
      value.id === valueId ? { ...value, ...updates } : value
    ));

    // If option exists, also call the real update function
    if (option) {
      onUpdateValue(option.id, valueId, updates);
    }
  };

  const handleDeleteValue = (valueId: string) => {
    // ALWAYS update local state immediately
    setLocalValues(prev => prev.filter(value => value.id !== valueId));

    // If option exists, also call the real delete function
    if (option) {
      onDeleteValue(option.id, valueId);
    }
  };

  const handleMoveValue = (dragIndex: number, hoverIndex: number) => {
    // ALWAYS update local state immediately
    setLocalValues(prev => {
      const newValues = [...prev];
      const draggedValue = newValues[dragIndex];
      newValues.splice(dragIndex, 1);
      newValues.splice(hoverIndex, 0, draggedValue);
      return newValues;
    });

    // If option exists, also call the real move function
    if (option) {
      onMoveValue(option.id, dragIndex, hoverIndex);
    }
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

  const isEditing = !!option;

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg border border-blue-200 dark:border-blue-500/30">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg sm:text-xl">
              {isEditing ? 'Edit Option' : 'Create Option'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              {isEditing ? 'Modify option settings and values' : 'Configure a new configurator option'}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {[
              { id: 'basic', label: 'Basic', icon: Settings },
              { id: 'display', label: 'Display', icon: Eye },
              { id: 'values', label: 'Values', icon: List }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-750">
        <div key={activeTab} className="animate-in fade-in duration-200">
          {tabContent}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Validation Feedback */}
        {showValidationFlash && validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-lg border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500 dark:text-red-400" />
              <div>
                <h4 className="font-medium text-sm text-red-800 dark:text-red-300">
                  Required to save:
                </h4>
                <ul className="text-sm mt-1 space-y-1 text-red-700 dark:text-red-200/80">
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
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg transition-colors font-medium"
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
    </div>
  );
};

export default OptionEditPanel;