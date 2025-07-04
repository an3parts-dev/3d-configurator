import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ConfiguratorOptionsPanel from '../components/ConfiguratorOptionsPanel';
import Configurator3DView from '../components/Configurator3DView';
import OptionEditPanel from '../components/OptionEditPanel';
import ConditionalLogicPanel from '../components/ConditionalLogicPanel';
import GroupEditPanel from '../components/GroupEditPanel';
import ConfirmationPanel from '../components/ConfirmationPanel';
import DashboardHeader from '../components/layout/DashboardHeader';
import { 
  ConfiguratorData, 
  ConfiguratorOption, 
  ConfiguratorOptionValue,
  ConfiguratorOptionGroup,
  ModelComponent 
} from '../types/ConfiguratorTypes';
import { useConfiguratorPersistence } from '../hooks/useConfiguratorPersistence';

interface Project {
  id: string;
  name: string;
  description?: string;
  model: string;
  optionsCount: number;
  lastModified: Date;
  thumbnail?: string;
}

interface ConfiguratorBuilderProps {
  project?: Project | null;
  onNavigateHome: () => void;
}

type PanelView = 
  | 'main'
  | 'option-edit'
  | 'group-edit'
  | 'conditional-logic'
  | 'confirmation';

const ConfiguratorBuilder: React.FC<ConfiguratorBuilderProps> = ({
  project,
  onNavigateHome
}) => {
  // State management
  const [configuratorData, setConfiguratorData] = useState<ConfiguratorData>({
    id: project?.id || 'default',
    name: project?.name || 'New Configurator',
    description: project?.description || 'A new 3D configurator',
    model: project?.model || 'https://cdn.shopify.com/3d/models/o/a7af059c00ea3c69/angle-3d-generated.glb',
    options: []
  });

  const [modelComponents, setModelComponents] = useState<ModelComponent[]>([]);
  const [currentPanel, setCurrentPanel] = useState<PanelView>('main');
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
    if (!isLoading && project) {
      // If we have a project, use its data
      setConfiguratorData({
        id: project.id,
        name: project.name,
        description: project.description || '',
        model: project.model,
        options: []
      });
    } else if (!isLoading) {
      const stored = loadFromStorage();
      if (stored && stored.configurators.length > 0) {
        const activeConfig = stored.configurators.find(c => c.id === stored.activeId) || stored.configurators[0];
        setConfiguratorData(activeConfig);
      }
    }
  }, [isLoading, project, loadFromStorage]);

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

  // Enhanced move to group function with precise positioning
  const moveToGroup = useCallback((optionId: string, targetGroupId: string | null) => {
    setConfiguratorData(prev => {
      const newOptions = [...prev.options];
      const optionIndex = newOptions.findIndex(opt => opt.id === optionId);
      
      if (optionIndex === -1) return prev;
      
      const option = newOptions[optionIndex];
      
      // Update group assignment
      option.groupId = targetGroupId;
      
      // If moving to a group, ensure the group is expanded
      if (targetGroupId) {
        const groupIndex = newOptions.findIndex(opt => opt.id === targetGroupId && opt.isGroup);
        if (groupIndex !== -1 && newOptions[groupIndex].groupData && !newOptions[groupIndex].groupData!.isExpanded) {
          newOptions[groupIndex] = {
            ...newOptions[groupIndex],
            groupData: {
              ...newOptions[groupIndex].groupData!,
              isExpanded: true
            }
          };
        }
      }
      
      return { ...prev, options: newOptions };
    });
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

  // Panel navigation handlers
  const handleEditOption = useCallback((option: ConfiguratorOption) => {
    if (option.isGroup && option.groupData) {
      setEditingGroup(option.groupData);
      setCurrentPanel('group-edit');
    } else {
      setEditingOption(option);
      setCurrentPanel('option-edit');
    }
  }, []);

  const handleSaveOption = useCallback((optionData: Omit<ConfiguratorOption, 'id' | 'values'>) => {
    if (editingOption) {
      updateOption(editingOption.id, optionData);
    } else {
      createOption(optionData);
    }
    setEditingOption(null);
    setCurrentPanel('main');
  }, [editingOption, updateOption, createOption]);

  const handleSaveGroup = useCallback((groupData: ConfiguratorOptionGroup) => {
    if (editingGroup) {
      updateGroup(groupData);
    } else {
      createGroup(groupData);
    }
    setEditingGroup(null);
    setCurrentPanel('main');
  }, [editingGroup, updateGroup, createGroup]);

  const handleDeleteOption = useCallback((optionId: string) => {
    setDeletingOptionId(optionId);
    setCurrentPanel('confirmation');
  }, []);

  const confirmDelete = useCallback(() => {
    if (deletingOptionId) {
      deleteOption(deletingOptionId);
      setDeletingOptionId(null);
    }
    setCurrentPanel('main');
  }, [deletingOptionId, deleteOption]);

  const handleConditionalLogic = useCallback((option: ConfiguratorOption) => {
    setConditionalLogicOption(option);
    setCurrentPanel('conditional-logic');
  }, []);

  const handleSaveConditionalLogic = useCallback((conditionalLogic: any) => {
    if (conditionalLogicOption) {
      updateOption(conditionalLogicOption.id, { conditionalLogic });
    }
    setConditionalLogicOption(null);
    setCurrentPanel('main');
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
    setCurrentPanel('option-edit');
  }, []);

  const handleCreateGroup = useCallback(() => {
    setEditingGroup(null);
    setCurrentPanel('group-edit');
  }, []);

  const handleTogglePreviewMode = useCallback(() => {
    setIsPreviewMode(prev => !prev);
  }, []);

  const handleBackToMain = useCallback(() => {
    setCurrentPanel('main');
    setEditingOption(null);
    setEditingGroup(null);
    setConditionalLogicOption(null);
    setDeletingOptionId(null);
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
      <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
        {/* Global Top Bar - Spans full width */}
        <div className="flex-shrink-0">
          <DashboardHeader
            projectName={configuratorData.name}
            onNavigateHome={onNavigateHome}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Fixed width, no overflow */}
          <div className={`transition-all duration-300 flex-shrink-0 ${
            isPreviewMode ? 'w-0 overflow-hidden' : 'w-full sm:w-1/4'
          }`}>
            {currentPanel === 'main' && (
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
                onMoveToGroup={moveToGroup}
                onNavigateHome={onNavigateHome}
              />
            )}

            {currentPanel === 'option-edit' && (
              <OptionEditPanel
                option={editingOption}
                modelComponents={modelComponents}
                allOptions={configuratorData.options.filter(opt => !opt.isGroup)}
                onSave={handleSaveOption}
                onCancel={handleBackToMain}
                onAddValue={addOptionValue}
                onUpdateValue={updateOptionValue}
                onDeleteValue={deleteOptionValue}
                onMoveValue={moveOptionValue}
                availableGroups={configuratorData.options.filter(opt => opt.isGroup && opt.groupData)}
              />
            )}

            {currentPanel === 'group-edit' && (
              <GroupEditPanel
                groupData={editingGroup}
                onSave={handleSaveGroup}
                onCancel={handleBackToMain}
                isEditing={!!editingGroup}
              />
            )}

            {currentPanel === 'conditional-logic' && conditionalLogicOption && (
              <ConditionalLogicPanel
                currentOption={conditionalLogicOption}
                allOptions={configuratorData.options.filter(opt => !opt.isGroup)}
                conditionalLogic={conditionalLogicOption.conditionalLogic}
                onSave={handleSaveConditionalLogic}
                onCancel={handleBackToMain}
              />
            )}

            {currentPanel === 'confirmation' && (
              <ConfirmationPanel
                title="Delete Option"
                message="Are you sure you want to delete this option? This action cannot be undone."
                confirmText="Delete"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={handleBackToMain}
              />
            )}
          </div>

          {/* Right Panel - Takes remaining space */}
          <div className={`transition-all duration-300 flex-1 min-w-0 ${
            isPreviewMode ? 'w-full' : 'w-full sm:w-3/4'
          }`}>
            <Configurator3DView
              configuratorData={configuratorData}
              isPreviewMode={isPreviewMode}
              onComponentsLoaded={setModelComponents}
              onTogglePreviewMode={handleTogglePreviewMode}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default ConfiguratorBuilder;