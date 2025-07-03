import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ConfiguratorOptionsPanel from '../components/ConfiguratorOptionsPanel';
import Configurator3DView from '../components/Configurator3DView';
import OptionEditModal from '../components/OptionEditModal';
import { ConditionalLogicModal } from '../components/conditional-logic';
import { GroupEditModal } from '../components/groups';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { 
  ConfiguratorData, 
  ConfiguratorOption, 
  ConfiguratorOptionValue,
  ConfiguratorOptionGroup,
  ModelComponent 
} from '../types/ConfiguratorTypes';
import { useConfiguratorPersistence } from '../hooks/useConfiguratorPersistence';

const ConfiguratorBuilder: React.FC = () => {
  // State management
  const [configuratorData, setConfiguratorData] = useState<ConfiguratorData>({
    id: 'default',
    name: 'New Configurator',
    description: 'A new 3D configurator',
    model: 'https://cdn.shopify.com/3d/models/o/a7af059c00ea3c69/angle-3d-generated.glb',
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
    importConfigurations
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
    setDeletingOptionId(optionId);
    setShowDeleteConfirmation(true);
  }, []);

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

  // UI handlers
  const handleCreateOption = useCallback(() => {
    setEditingOption(null);
    setShowOptionModal(true);
  }, []);

  const handleCreateGroup = useCallback(() => {
    setEditingGroup(null);
    setShowGroupModal(true);
  }, []);

  const handleTogglePreviewMode = useCallback(() => {
    setIsPreviewMode(prev => !prev);
  }, []);

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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-900 flex">
        {/* Left Panel - Configuration */}
        <ConfiguratorOptionsPanel
          configuratorData={configuratorData}
          modelComponents={modelComponents}
          lastSaved={lastSaved}
          isPreviewMode={isPreviewMode}
          onTogglePreviewMode={handleTogglePreviewMode}
          onCreateOption={handleCreateOption}
          onCreateGroup={handleCreateGroup}
          onExport={handleExport}
          onImport={handleImport}
          onMoveOption={moveOption}
          onEditOption={handleEditOption}
          onDeleteOption={handleDeleteOption}
          onEditConditionalLogic={handleConditionalLogic}
          onToggleGroup={toggleGroupExpansion}
        />

        {/* Right Panel - 3D Preview */}
        <Configurator3DView
          configuratorData={configuratorData}
          isPreviewMode={isPreviewMode}
          onComponentsLoaded={setModelComponents}
        />

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