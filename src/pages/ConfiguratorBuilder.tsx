import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Settings, 
  Save, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  FolderPlus,
  Layers
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ThreeJSPreview from '../components/ThreeJSPreview';
import DragDropOption from '../components/DragDropOption';
import OptionEditModal from '../components/OptionEditModal';
import ConditionalLogicModal from '../components/ConditionalLogicModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import GroupEditModal from '../components/GroupEditModal';
import { 
  ConfiguratorData, 
  ConfiguratorOption, 
  ConfiguratorOptionValue,
  ConfiguratorOptionGroup,
  ModelComponent 
} from '../types/ConfiguratorTypes';
import { useConfiguratorPersistence } from '../hooks/useConfiguratorPersistence';

// Enhanced DragDropOption wrapper that handles group assignment
const DraggableOptionWrapper: React.FC<{
  option: ConfiguratorOption;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  onEditConditionalLogic: (option: ConfiguratorOption) => void;
  onToggleGroup?: (groupId: string) => void;
  onAssignToGroup?: (optionId: string, groupId: string | null) => void;
  isGrouped?: boolean;
  groupedOptions?: ConfiguratorOption[];
  availableGroups: ConfiguratorOption[];
}> = ({
  option,
  index,
  onMove,
  onEdit,
  onDelete,
  onEditConditionalLogic,
  onToggleGroup,
  onAssignToGroup,
  isGrouped = false,
  groupedOptions = [],
  availableGroups
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'configurator-option',
    item: { id: option.id, index, type: 'option' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['configurator-option', 'group-assignment'],
    hover: (item: any, monitor) => {
      if (item.type === 'option' && item.id !== option.id) {
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex !== hoverIndex) {
          onMove(dragIndex, hoverIndex);
          item.index = hoverIndex;
        }
      }
    },
    drop: (item: any, monitor) => {
      if (item.type === 'group-assignment' && !option.isGroup && onAssignToGroup) {
        // Assign option to group
        onAssignToGroup(option.id, item.groupId);
      } else if (item.type === 'option' && option.isGroup && !item.isGroup && onAssignToGroup) {
        // Assign dragged option to this group
        onAssignToGroup(item.id, option.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const ref = drop(drag(React.createRef<HTMLDivElement>()));

  return (
    <div 
      ref={ref}
      className={`${isDragging ? 'opacity-50' : ''} ${
        isOver && canDrop ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
      }`}
    >
      <DragDropOption
        option={option}
        index={index}
        onMove={onMove}
        onEdit={onEdit}
        onDelete={onDelete}
        onEditConditionalLogic={onEditConditionalLogic}
        onToggleGroup={onToggleGroup}
        isGrouped={isGrouped}
        groupedOptions={groupedOptions}
      />
    </div>
  );
};

// Group assignment helper component
const GroupAssignmentHelper: React.FC<{
  groups: ConfiguratorOption[];
  onAssignToGroup: (optionId: string, groupId: string | null) => void;
}> = ({ groups, onAssignToGroup }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'group-assignment',
    item: { type: 'group-assignment', groupId: null },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div className="mb-4 p-4 bg-gray-750 rounded-lg border border-gray-600">
      <h4 className="text-white font-medium mb-3">Quick Group Assignment</h4>
      <div className="flex flex-wrap gap-2">
        <div
          ref={drag}
          className={`px-3 py-2 bg-gray-600 text-gray-300 rounded-lg cursor-move hover:bg-gray-500 transition-colors ${
            isDragging ? 'opacity-50' : ''
          }`}
        >
          Remove from Group
        </div>
        {groups.map(group => (
          <GroupAssignmentButton
            key={group.id}
            group={group}
            onAssignToGroup={onAssignToGroup}
          />
        ))}
      </div>
      <p className="text-gray-500 text-xs mt-2">
        Drag these buttons onto options to quickly assign them to groups
      </p>
    </div>
  );
};

const GroupAssignmentButton: React.FC<{
  group: ConfiguratorOption;
  onAssignToGroup: (optionId: string, groupId: string | null) => void;
}> = ({ group, onAssignToGroup }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'group-assignment',
    item: { type: 'group-assignment', groupId: group.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`px-3 py-2 bg-purple-600 text-white rounded-lg cursor-move hover:bg-purple-500 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {group.name}
    </div>
  );
};

const ConfiguratorBuilder: React.FC = () => {
  // State management
  const [configuratorData, setConfiguratorData] = useState<ConfiguratorData>({
    id: 'default',
    name: 'New Configurator',
    description: 'A new 3D configurator',
    model: '/models/sample.glb',
    options: []
  });

  const [modelComponents, setModelComponents] = useState<ModelComponent[]>([]);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showConditionalLogicModal, setShowConditionalLogicModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editingOption, setEditingOption] = useState<ConfiguratorOption | null>(null);
  const [editingGroup, setEditingGroup] = useState<ConfiguratorOptionGroup | null>(null);
  const [conditionalLogicOption, setConditionalLogicOption] = useState<ConfiguratorOption | null>(null);
  const [deletingOptionId, setDeletingOptionId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Persistence hook
  const {
    isLoading,
    lastSaved,
    loadFromStorage,
    saveToStorage,
    exportConfigurations,
    importConfigurations,
    clearStorage
  } = useConfiguratorPersistence();

  // Load data on mount
  useEffect(() => {
    if (!isLoading) {
      const stored = loadFromStorage();
      if (stored && stored.configurators.length > 0) {
        const activeConfig = stored.configurators.find(c => c.id === stored.activeId) || stored.configurators[0];
        setConfiguratorData(activeConfig);
      }
    }
  }, [isLoading, loadFromStorage]);

  // Auto-save functionality
  useEffect(() => {
    if (!isLoading && configuratorData.options.length > 0) {
      const timeoutId = setTimeout(() => {
        saveToStorage([configuratorData], configuratorData.id);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [configuratorData, isLoading, saveToStorage]);

  // Group management functions
  const createGroup = useCallback((groupData: ConfiguratorOptionGroup) => {
    const groupOption: ConfiguratorOption = {
      id: groupData.id,
      name: groupData.name,
      description: groupData.description,
      displayType: 'list',
      manipulationType: 'visibility',
      targetComponents: [],
      values: [],
      isGroup: true,
      groupData: groupData
    };

    setConfiguratorData(prev => ({
      ...prev,
      options: [...prev.options, groupOption]
    }));
  }, []);

  const updateGroup = useCallback((groupData: ConfiguratorOptionGroup) => {
    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.map(option => 
        option.id === groupData.id && option.isGroup
          ? { ...option, name: groupData.name, description: groupData.description, groupData }
          : option
      )
    }));
  }, []);

  const toggleGroupExpansion = useCallback((groupId: string) => {
    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.map(option => 
        option.id === groupId && option.isGroup && option.groupData
          ? { 
              ...option, 
              groupData: { 
                ...option.groupData, 
                isExpanded: !option.groupData.isExpanded 
              } 
            }
          : option
      )
    }));
  }, []);

  // Enhanced option assignment to groups
  const assignOptionToGroup = useCallback((optionId: string, groupId: string | null) => {
    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.map(option => 
        option.id === optionId && !option.isGroup
          ? { ...option, groupId }
          : option
      )
    }));
  }, []);

  // Option management functions
  const createOption = useCallback((optionData: Omit<ConfiguratorOption, 'id' | 'values'>) => {
    const newOption: ConfiguratorOption = {
      ...optionData,
      id: `option_${Date.now()}`,
      values: []
    };

    setConfiguratorData(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }));
  }, []);

  const updateOption = useCallback((optionId: string, updates: Partial<ConfiguratorOption>) => {
    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.map(option => 
        option.id === optionId ? { ...option, ...updates } : option
      )
    }));
  }, []);

  const deleteOption = useCallback((optionId: string) => {
    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.filter(option => option.id !== optionId)
    }));
  }, []);

  const moveOption = useCallback((dragIndex: number, hoverIndex: number) => {
    setConfiguratorData(prev => {
      const newOptions = [...prev.options];
      const draggedOption = newOptions[dragIndex];
      newOptions.splice(dragIndex, 1);
      newOptions.splice(hoverIndex, 0, draggedOption);
      return { ...prev, options: newOptions };
    });
  }, []);

  // Value management functions
  const addOptionValue = useCallback((optionId: string) => {
    const newValue: ConfiguratorOptionValue = {
      id: `value_${Date.now()}`,
      name: 'New Value'
    };

    updateOption(optionId, {
      values: [...(configuratorData.options.find(opt => opt.id === optionId)?.values || []), newValue]
    });
  }, [configuratorData.options, updateOption]);

  const updateOptionValue = useCallback((optionId: string, valueId: string, updates: Partial<ConfiguratorOptionValue>) => {
    const option = configuratorData.options.find(opt => opt.id === optionId);
    if (!option) return;

    const updatedValues = option.values.map(value => 
      value.id === valueId ? { ...value, ...updates } : value
    );

    updateOption(optionId, { values: updatedValues });
  }, [configuratorData.options, updateOption]);

  const deleteOptionValue = useCallback((optionId: string, valueId: string) => {
    const option = configuratorData.options.find(opt => opt.id === optionId);
    if (!option) return;

    const updatedValues = option.values.filter(value => value.id !== valueId);
    updateOption(optionId, { values: updatedValues });
  }, [configuratorData.options, updateOption]);

  const moveOptionValue = useCallback((optionId: string, dragIndex: number, hoverIndex: number) => {
    const option = configuratorData.options.find(opt => opt.id === optionId);
    if (!option) return;

    const newValues = [...option.values];
    const draggedValue = newValues[dragIndex];
    newValues.splice(dragIndex, 1);
    newValues.splice(hoverIndex, 0, draggedValue);

    updateOption(optionId, { values: newValues });
  }, [configuratorData.options, updateOption]);

  // Modal handlers
  const handleEditOption = useCallback((option: ConfiguratorOption) => {
    if (option.isGroup && option.groupData) {
      setEditingGroup(option.groupData);
      setShowGroupModal(true);
    } else {
      setEditingOption(option);
      setShowOptionModal(true);
    }
  }, []);

  const handleSaveOption = useCallback((optionData: Omit<ConfiguratorOption, 'id' | 'values'>) => {
    if (editingOption) {
      updateOption(editingOption.id, optionData);
    } else {
      createOption(optionData);
    }
    setEditingOption(null);
    setShowOptionModal(false);
  }, [editingOption, updateOption, createOption]);

  const handleSaveGroup = useCallback((groupData: ConfiguratorOptionGroup) => {
    if (editingGroup) {
      updateGroup(groupData);
    } else {
      createGroup(groupData);
    }
    setEditingGroup(null);
    setShowGroupModal(false);
  }, [editingGroup, updateGroup, createGroup]);

  const handleDeleteOption = useCallback((optionId: string) => {
    const option = configuratorData.options.find(opt => opt.id === optionId);
    if (!option) return;

    setDeletingOptionId(optionId);
    setShowDeleteConfirmation(true);
  }, [configuratorData.options]);

  const confirmDelete = useCallback(() => {
    if (deletingOptionId) {
      deleteOption(deletingOptionId);
      setDeletingOptionId(null);
    }
    setShowDeleteConfirmation(false);
  }, [deletingOptionId, deleteOption]);

  const handleConditionalLogic = useCallback((option: ConfiguratorOption) => {
    setConditionalLogicOption(option);
    setShowConditionalLogicModal(true);
  }, []);

  const handleSaveConditionalLogic = useCallback((conditionalLogic: any) => {
    if (conditionalLogicOption) {
      updateOption(conditionalLogicOption.id, { conditionalLogic });
    }
    setConditionalLogicOption(null);
    setShowConditionalLogicModal(false);
  }, [conditionalLogicOption, updateOption]);

  // File operations
  const handleExport = useCallback(() => {
    try {
      exportConfigurations([configuratorData], configuratorData.id);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [configuratorData, exportConfigurations]);

  const handleImport = useCallback(async () => {
    try {
      const imported = await importConfigurations();
      if (imported.configurators.length > 0) {
        const activeConfig = imported.configurators.find(c => c.id === imported.activeId) || imported.configurators[0];
        setConfiguratorData(activeConfig);
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  }, [importConfigurations]);

  // Render organized options with groups
  const renderOrganizedOptions = () => {
    const organizedOptions: (ConfiguratorOption | { type: 'grouped'; group: ConfiguratorOption; options: ConfiguratorOption[] })[] = [];
    const processedOptionIds = new Set<string>();

    configuratorData.options.forEach(option => {
      if (processedOptionIds.has(option.id)) return;

      if (option.isGroup && option.groupData) {
        // Find all options that belong to this group
        const groupedOptions = configuratorData.options.filter(opt => 
          !opt.isGroup && opt.groupId === option.id
        );
        
        // Mark grouped options as processed
        groupedOptions.forEach(opt => processedOptionIds.add(opt.id));
        
        organizedOptions.push({
          type: 'grouped',
          group: option,
          options: groupedOptions
        });
      } else if (!option.groupId) {
        // Standalone option (not in a group)
        organizedOptions.push(option);
      }
      
      processedOptionIds.add(option.id);
    });

    return organizedOptions.map((item, index) => {
      if ('type' in item && item.type === 'grouped') {
        const { group, options } = item;
        return (
          <div key={group.id}>
            <DraggableOptionWrapper
              option={group}
              index={index}
              onMove={moveOption}
              onEdit={handleEditOption}
              onDelete={handleDeleteOption}
              onEditConditionalLogic={handleConditionalLogic}
              onToggleGroup={toggleGroupExpansion}
              onAssignToGroup={assignOptionToGroup}
              groupedOptions={options}
              availableGroups={configuratorData.options.filter(opt => opt.isGroup && opt.groupData)}
            />
            
            {/* Render grouped options when expanded */}
            <AnimatePresence>
              {group.groupData?.isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-8 mt-4 space-y-4"
                >
                  {options.map((option, optIndex) => (
                    <DraggableOptionWrapper
                      key={option.id}
                      option={option}
                      index={configuratorData.options.findIndex(opt => opt.id === option.id)}
                      onMove={moveOption}
                      onEdit={handleEditOption}
                      onDelete={handleDeleteOption}
                      onEditConditionalLogic={handleConditionalLogic}
                      onAssignToGroup={assignOptionToGroup}
                      isGrouped={true}
                      availableGroups={configuratorData.options.filter(opt => opt.isGroup && opt.groupData)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      } else {
        // Standalone option
        const option = item as ConfiguratorOption;
        return (
          <DraggableOptionWrapper
            key={option.id}
            option={option}
            index={index}
            onMove={moveOption}
            onEdit={handleEditOption}
            onDelete={handleDeleteOption}
            onEditConditionalLogic={handleConditionalLogic}
            onAssignToGroup={assignOptionToGroup}
            availableGroups={configuratorData.options.filter(opt => opt.isGroup && opt.groupData)}
          />
        );
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading Configurator</p>
        </div>
      </div>
    );
  }

  const availableGroups = configuratorData.options.filter(opt => opt.isGroup && opt.groupData);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-900 flex">
        {/* Left Panel - Configuration */}
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
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
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
                  onClick={() => {
                    setEditingOption(null);
                    setShowOptionModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Option</span>
                </button>

                <button
                  onClick={() => {
                    setEditingGroup(null);
                    setShowGroupModal(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Add Group</span>
                </button>

                <button
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>

                <button
                  onClick={handleImport}
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
              <div className="space-y-4">
                {/* Group Assignment Helper */}
                {availableGroups.length > 0 && configuratorData.options.some(opt => !opt.isGroup) && (
                  <GroupAssignmentHelper
                    groups={availableGroups}
                    onAssignToGroup={assignOptionToGroup}
                  />
                )}

                {configuratorData.options.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No options yet</p>
                    <p className="text-sm mt-2">Add your first option or group to get started</p>
                  </div>
                ) : (
                  renderOrganizedOptions()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - 3D Preview */}
        <div className={`transition-all duration-300 ${
          isPreviewMode ? 'w-full' : 'w-1/2'
        }`}>
          <ThreeJSPreview
            configuratorData={configuratorData}
            onComponentsLoaded={setModelComponents}
          />
        </div>

        {/* Modals */}
        <OptionEditModal
          isOpen={showOptionModal}
          onClose={() => {
            setShowOptionModal(false);
            setEditingOption(null);
          }}
          onSave={handleSaveOption}
          option={editingOption}
          modelComponents={modelComponents}
          allOptions={configuratorData.options.filter(opt => !opt.isGroup)}
          onAddValue={addOptionValue}
          onUpdateValue={updateOptionValue}
          onDeleteValue={deleteOptionValue}
          onMoveValue={moveOptionValue}
          availableGroups={configuratorData.options.filter(opt => opt.isGroup && opt.groupData)}
        />

        <GroupEditModal
          isOpen={showGroupModal}
          onClose={() => {
            setShowGroupModal(false);
            setEditingGroup(null);
          }}
          onSave={handleSaveGroup}
          groupData={editingGroup}
          isEditing={!!editingGroup}
        />

        {/* Only render ConditionalLogicModal when both conditions are met */}
        {showConditionalLogicModal && conditionalLogicOption && (
          <ConditionalLogicModal
            isOpen={showConditionalLogicModal}
            onClose={() => {
              setShowConditionalLogicModal(false);
              setConditionalLogicOption(null);
            }}
            onSave={handleSaveConditionalLogic}
            currentOption={conditionalLogicOption}
            allOptions={configuratorData.options.filter(opt => !opt.isGroup)}
            conditionalLogic={conditionalLogicOption.conditionalLogic}
          />
        )}

        <ConfirmationDialog
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={confirmDelete}
          title="Delete Option"
          message="Are you sure you want to delete this option? This action cannot be undone."
          confirmText="Delete"
          type="danger"
        />
      </div>
    </DndProvider>
  );
};

export default ConfiguratorBuilder;