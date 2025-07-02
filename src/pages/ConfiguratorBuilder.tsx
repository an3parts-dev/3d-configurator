import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Settings, 
  Save, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff,
  X,
  Layers,
  Zap,
  Image as ImageIcon,
  List,
  Grid3X3,
  RotateCcw,
  Copy,
  FileText,
  Box,
  Palette,
  Monitor,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ThreeJSPreview from '../components/ThreeJSPreview';
import DragDropOption from '../components/DragDropOption';
import DragDropOptionValue from '../components/DragDropOptionValue';
import ConditionalLogicModal from '../components/ConditionalLogicModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useConfiguratorPersistence } from '../hooks/useConfiguratorPersistence';
import { 
  ConfiguratorData, 
  ConfiguratorOption, 
  ConfiguratorOptionValue, 
  ModelComponent,
  ImageSettings 
} from '../types/ConfiguratorTypes';

const ConfiguratorBuilder: React.FC = () => {
  // State management
  const [configurators, setConfigurators] = useState<ConfiguratorData[]>([]);
  const [activeConfiguratorId, setActiveConfiguratorId] = useState<string>('');
  const [modelComponents, setModelComponents] = useState<ModelComponent[]>([]);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showConditionalLogicModal, setShowConditionalLogicModal] = useState(false);
  const [editingOption, setEditingOption] = useState<ConfiguratorOption | null>(null);
  const [conditionalLogicOption, setConditionalLogicOption] = useState<ConfiguratorOption | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'configurator' | 'option' | 'value';
    id: string;
    name: string;
    details?: string[];
  }>({ isOpen: false, type: 'configurator', id: '', name: '' });

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
      if (stored) {
        setConfigurators(stored.configurators);
        setActiveConfiguratorId(stored.activeId);
      } else {
        // Create default configurator
        const defaultConfigurator = createDefaultConfigurator();
        setConfigurators([defaultConfigurator]);
        setActiveConfiguratorId(defaultConfigurator.id);
      }
    }
  }, [isLoading, loadFromStorage]);

  // Auto-save when data changes
  useEffect(() => {
    if (configurators.length > 0 && activeConfiguratorId) {
      saveToStorage(configurators, activeConfiguratorId);
    }
  }, [configurators, activeConfiguratorId, saveToStorage]);

  // Helper functions
  const createDefaultConfigurator = (): ConfiguratorData => ({
    id: `configurator_${Date.now()}`,
    name: 'New Configurator',
    description: 'A new 3D configurator',
    model: '/models/sample.glb',
    options: []
  });

  const createDefaultOption = (): ConfiguratorOption => ({
    id: `option_${Date.now()}`,
    name: 'New Option',
    description: '',
    displayType: 'buttons',
    displayDirection: 'column',
    manipulationType: 'visibility',
    targetComponents: [],
    defaultBehavior: 'hide',
    imageSettings: {
      size: 'medium',
      aspectRatio: '1:1',
      showBorder: true,
      borderRadius: 8
    },
    values: [
      {
        id: `value_${Date.now()}`,
        name: 'Default Value',
        visibleComponents: [],
        hiddenComponents: []
      }
    ]
  });

  const createDefaultValue = (): ConfiguratorOptionValue => ({
    id: `value_${Date.now()}`,
    name: 'New Value',
    visibleComponents: [],
    hiddenComponents: []
  });

  // Get active configurator
  const activeConfigurator = configurators.find(c => c.id === activeConfiguratorId);

  // Event handlers
  const handleCreateConfigurator = () => {
    const newConfigurator = createDefaultConfigurator();
    setConfigurators(prev => [...prev, newConfigurator]);
    setActiveConfiguratorId(newConfigurator.id);
  };

  const handleDeleteConfigurator = (id: string) => {
    const configurator = configurators.find(c => c.id === id);
    if (!configurator) return;

    setShowDeleteConfirmation({
      isOpen: true,
      type: 'configurator',
      id,
      name: configurator.name,
      details: [
        `${configurator.options.length} options`,
        `${configurator.options.reduce((sum, opt) => sum + opt.values.length, 0)} total values`
      ]
    });
  };

  const confirmDelete = () => {
    const { type, id } = showDeleteConfirmation;
    
    if (type === 'configurator') {
      const newConfigurators = configurators.filter(c => c.id !== id);
      setConfigurators(newConfigurators);
      
      if (activeConfiguratorId === id) {
        if (newConfigurators.length > 0) {
          setActiveConfiguratorId(newConfigurators[0].id);
        } else {
          const defaultConfigurator = createDefaultConfigurator();
          setConfigurators([defaultConfigurator]);
          setActiveConfiguratorId(defaultConfigurator.id);
        }
      }
    } else if (type === 'option') {
      setConfigurators(prev => prev.map(configurator => 
        configurator.id === activeConfiguratorId
          ? { ...configurator, options: configurator.options.filter(opt => opt.id !== id) }
          : configurator
      ));
    } else if (type === 'value') {
      setConfigurators(prev => prev.map(configurator => 
        configurator.id === activeConfiguratorId
          ? {
              ...configurator,
              options: configurator.options.map(option => ({
                ...option,
                values: option.values.filter(val => val.id !== id)
              }))
            }
          : configurator
      ));
    }
  };

  const handleUpdateConfigurator = (updates: Partial<ConfiguratorData>) => {
    setConfigurators(prev => prev.map(configurator => 
      configurator.id === activeConfiguratorId
        ? { ...configurator, ...updates }
        : configurator
    ));
  };

  const handleCreateOption = () => {
    setEditingOption(createDefaultOption());
    setShowOptionModal(true);
  };

  const handleEditOption = (option: ConfiguratorOption) => {
    setEditingOption({ ...option });
    setShowOptionModal(true);
  };

  const handleSaveOption = (option: ConfiguratorOption) => {
    setConfigurators(prev => prev.map(configurator => 
      configurator.id === activeConfiguratorId
        ? {
            ...configurator,
            options: editingOption && configurator.options.find(opt => opt.id === editingOption.id)
              ? configurator.options.map(opt => opt.id === option.id ? option : opt)
              : [...configurator.options, option]
          }
        : configurator
    ));
    setShowOptionModal(false);
    setEditingOption(null);
  };

  const handleDeleteOption = (optionId: string) => {
    const option = activeConfigurator?.options.find(opt => opt.id === optionId);
    if (!option) return;

    setShowDeleteConfirmation({
      isOpen: true,
      type: 'option',
      id: optionId,
      name: option.name,
      details: [
        `${option.values.length} values`,
        `${option.targetComponents.length} target components`,
        option.conditionalLogic?.enabled ? 'Has conditional logic' : ''
      ].filter(Boolean)
    });
  };

  const handleMoveOption = (dragIndex: number, hoverIndex: number) => {
    if (!activeConfigurator) return;

    const draggedOption = activeConfigurator.options[dragIndex];
    const newOptions = [...activeConfigurator.options];
    newOptions.splice(dragIndex, 1);
    newOptions.splice(hoverIndex, 0, draggedOption);

    handleUpdateConfigurator({ options: newOptions });
  };

  const handleEditConditionalLogic = (option: ConfiguratorOption) => {
    setConditionalLogicOption(option);
    setShowConditionalLogicModal(true);
  };

  const handleSaveConditionalLogic = (conditionalLogic: any) => {
    if (!conditionalLogicOption) return;

    setConfigurators(prev => prev.map(configurator => 
      configurator.id === activeConfiguratorId
        ? {
            ...configurator,
            options: configurator.options.map(opt => 
              opt.id === conditionalLogicOption.id 
                ? { ...opt, conditionalLogic }
                : opt
            )
          }
        : configurator
    ));
  };

  const handleAddValue = (optionId: string) => {
    const newValue = createDefaultValue();
    setConfigurators(prev => prev.map(configurator => 
      configurator.id === activeConfiguratorId
        ? {
            ...configurator,
            options: configurator.options.map(option => 
              option.id === optionId
                ? { ...option, values: [...option.values, newValue] }
                : option
            )
          }
        : configurator
    ));
  };

  const handleUpdateValue = (optionId: string, valueId: string, updates: any) => {
    setConfigurators(prev => prev.map(configurator => 
      configurator.id === activeConfiguratorId
        ? {
            ...configurator,
            options: configurator.options.map(option => 
              option.id === optionId
                ? {
                    ...option,
                    values: option.values.map(value => 
                      value.id === valueId ? { ...value, ...updates } : value
                    )
                  }
                : option
            )
          }
        : configurator
    ));
  };

  const handleDeleteValue = (optionId: string, valueId: string) => {
    const option = activeConfigurator?.options.find(opt => opt.id === optionId);
    const value = option?.values.find(val => val.id === valueId);
    if (!option || !value) return;

    setShowDeleteConfirmation({
      isOpen: true,
      type: 'value',
      id: valueId,
      name: value.name,
      details: [
        `From option "${option.name}"`,
        value.conditionalLogic?.enabled ? 'Has conditional logic' : ''
      ].filter(Boolean)
    });
  };

  const handleMoveValue = (optionId: string, dragIndex: number, hoverIndex: number) => {
    setConfigurators(prev => prev.map(configurator => 
      configurator.id === activeConfiguratorId
        ? {
            ...configurator,
            options: configurator.options.map(option => 
              option.id === optionId
                ? {
                    ...option,
                    values: (() => {
                      const newValues = [...option.values];
                      const draggedValue = newValues[dragIndex];
                      newValues.splice(dragIndex, 1);
                      newValues.splice(hoverIndex, 0, draggedValue);
                      return newValues;
                    })()
                  }
                : option
            )
          }
        : configurator
    ));
  };

  const handleModelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handleUpdateConfigurator({ model: url });
    }
  };

  const handleExport = () => {
    try {
      exportConfigurations(configurators, activeConfiguratorId);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = async () => {
    try {
      const imported = await importConfigurations();
      setConfigurators(imported.configurators);
      setActiveConfiguratorId(imported.activeId);
    } catch (error) {
      console.error('Import failed:', error);
    }
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

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Panel - Configuration */}
      <div className="w-1/2 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-750">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">3D Configurator Builder</h1>
            <div className="flex items-center space-x-3">
              {lastSaved && (
                <span className="text-xs text-gray-400">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={handleExport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={handleImport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
            </div>
          </div>

          {/* Configurator Selection */}
          <div className="flex items-center space-x-4">
            <select
              value={activeConfiguratorId}
              onChange={(e) => setActiveConfiguratorId(e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {configurators.map(configurator => (
                <option key={configurator.id} value={configurator.id}>
                  {configurator.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateConfigurator}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </button>
            <button
              onClick={() => handleDeleteConfigurator(activeConfiguratorId)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              disabled={configurators.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Configurator Settings */}
        {activeConfigurator && (
          <div className="p-6 border-b border-gray-700 space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Configurator Name</label>
              <input
                type="text"
                value={activeConfigurator.name}
                onChange={(e) => handleUpdateConfigurator({ name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Description</label>
              <textarea
                value={activeConfigurator.description}
                onChange={(e) => handleUpdateConfigurator({ description: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">3D Model</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={activeConfigurator.model}
                  onChange={(e) => handleUpdateConfigurator({ model: e.target.value })}
                  placeholder="Enter model URL or upload file"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept=".glb,.gltf"
                    onChange={handleModelUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Configuration Options</h2>
              <button
                onClick={handleCreateOption}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
            </div>

            {activeConfigurator?.options.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No options yet</p>
                <p className="text-sm mt-2">Add your first configuration option to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeConfigurator?.options.map((option, index) => (
                  <DragDropOption
                    key={option.id}
                    option={option}
                    index={index}
                    onMove={handleMoveOption}
                    onEdit={handleEditOption}
                    onDelete={handleDeleteOption}
                    onEditConditionalLogic={handleEditConditionalLogic}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - 3D Preview */}
      <div className="w-1/2 bg-gray-900">
        {activeConfigurator ? (
          <ThreeJSPreview
            configuratorData={activeConfigurator}
            onComponentsLoaded={setModelComponents}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No configurator selected</p>
            </div>
          </div>
        )}
      </div>

      {/* Option Modal */}
      <AnimatePresence>
        {showOptionModal && editingOption && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-xl border border-gray-600 shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-700 bg-gray-750 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-xl">
                        {activeConfigurator?.options.find(opt => opt.id === editingOption.id) ? 'Edit Option' : 'Create Option'}
                      </h3>
                      <p className="text-gray-400 text-sm">Configure how users interact with your 3D model</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowOptionModal(false);
                      setEditingOption(null);
                    }}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Settings */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                      <h4 className="text-white font-semibold text-lg mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-400" />
                        Basic Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Option Name</label>
                          <input
                            type="text"
                            value={editingOption.name}
                            onChange={(e) => setEditingOption(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Color, Material, Parts"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Description (Optional)</label>
                          <textarea
                            value={editingOption.description || ''}
                            onChange={(e) => setEditingOption(prev => prev ? { ...prev, description: e.target.value } : null)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                            placeholder="Describe what this option controls..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Display Settings */}
                    <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                      <h4 className="text-white font-semibold text-lg mb-4 flex items-center">
                        <Monitor className="w-5 h-5 mr-2 text-green-400" />
                        Display Settings
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Display Type</label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: 'list', label: 'Dropdown', icon: List },
                              { value: 'buttons', label: 'Buttons', icon: Grid3X3 },
                              { value: 'images', label: 'Images', icon: ImageIcon }
                            ].map(({ value, label, icon: Icon }) => (
                              <button
                                key={value}
                                onClick={() => setEditingOption(prev => prev ? { ...prev, displayType: value as any } : null)}
                                className={`p-4 rounded-lg border-2 transition-all text-center ${
                                  editingOption.displayType === value
                                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                                }`}
                              >
                                <Icon className="w-6 h-6 mx-auto mb-2" />
                                <div className="text-sm font-medium">{label}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Layout Direction</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: 'column', label: 'Vertical' },
                              { value: 'row', label: 'Horizontal' }
                            ].map(({ value, label }) => (
                              <button
                                key={value}
                                onClick={() => setEditingOption(prev => prev ? { ...prev, displayDirection: value as any } : null)}
                                className={`p-3 rounded-lg border-2 transition-all text-center ${
                                  editingOption.displayDirection === value
                                    ? 'border-green-500 bg-green-500/20 text-green-300'
                                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                                }`}
                              >
                                <div className="text-sm font-medium">{label}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Image Settings - Only show for image display type */}
                        {editingOption.displayType === 'images' && (
                          <div className="space-y-4 pt-4 border-t border-gray-600">
                            <h5 className="text-white font-medium flex items-center">
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Image Settings
                            </h5>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {/* Image Size */}
                              <div>
                                <label className="block text-gray-400 text-sm mb-2">Image Size</label>
                                <select
                                  value={editingOption.imageSettings?.size || 'medium'}
                                  onChange={(e) => setEditingOption(prev => prev ? {
                                    ...prev,
                                    imageSettings: { ...prev.imageSettings, size: e.target.value as any }
                                  } : null)}
                                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="x-small">Extra Small</option>
                                  <option value="small">Small</option>
                                  <option value="medium">Medium</option>
                                  <option value="large">Large</option>
                                  <option value="x-large">Extra Large</option>
                                </select>
                              </div>

                              {/* Preview */}
                              <div className="flex items-end">
                                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 flex items-center justify-center">
                                  <div className="flex items-center space-x-2 text-gray-400">
                                    <ImageIcon className="w-4 h-4" />
                                    <span className="text-xs font-medium">Preview</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Aspect Ratio - Moved below Image Size */}
                            <div>
                              <label className="block text-gray-400 text-sm mb-2">Aspect Ratio</label>
                              <select
                                value={editingOption.imageSettings?.aspectRatio || '1:1'}
                                onChange={(e) => setEditingOption(prev => prev ? {
                                  ...prev,
                                  imageSettings: { ...prev.imageSettings, aspectRatio: e.target.value as any }
                                } : null)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="1:1">Square (1:1)</option>
                                <option value="4:3">Standard (4:3)</option>
                                <option value="16:9">Widescreen (16:9)</option>
                                <option value="3:2">Photo (3:2)</option>
                                <option value="2:3">Portrait (2:3)</option>
                                <option value="full">Full Size</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  id="showBorder"
                                  checked={editingOption.imageSettings?.showBorder ?? true}
                                  onChange={(e) => setEditingOption(prev => prev ? {
                                    ...prev,
                                    imageSettings: { ...prev.imageSettings, showBorder: e.target.checked }
                                  } : null)}
                                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="showBorder" className="text-gray-300 text-sm">Show Border</label>
                              </div>

                              <div>
                                <label className="block text-gray-400 text-sm mb-2">Border Radius</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="20"
                                  value={editingOption.imageSettings?.borderRadius || 8}
                                  onChange={(e) => setEditingOption(prev => prev ? {
                                    ...prev,
                                    imageSettings: { ...prev.imageSettings, borderRadius: parseInt(e.target.value) }
                                  } : null)}
                                  className="w-full slider"
                                  disabled={!editingOption.imageSettings?.showBorder}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {editingOption.imageSettings?.borderRadius || 8}px
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Behavior Settings */}
                  <div className="space-y-6">
                    {/* Manipulation Type */}
                    <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                      <h4 className="text-white font-semibold text-lg mb-4 flex items-center">
                        <Box className="w-5 h-5 mr-2 text-purple-400" />
                        Manipulation Type
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'visibility', label: 'Visibility', icon: Eye, desc: 'Show/hide components' },
                          { value: 'material', label: 'Material', icon: Palette, desc: 'Change colors/materials' }
                        ].map(({ value, label, icon: Icon, desc }) => (
                          <button
                            key={value}
                            onClick={() => setEditingOption(prev => prev ? { ...prev, manipulationType: value as any } : null)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              editingOption.manipulationType === value
                                ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                            }`}
                          >
                            <Icon className="w-6 h-6 mb-2" />
                            <div className="font-medium">{label}</div>
                            <div className="text-xs opacity-80 mt-1">{desc}</div>
                          </button>
                        ))}
                      </div>

                      {editingOption.manipulationType === 'visibility' && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <label className="block text-gray-400 text-sm mb-2">Default Behavior</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: 'hide', label: 'Hide All', desc: 'Hide all targets, show selected' },
                              { value: 'show', label: 'Show All', desc: 'Show all targets, hide selected' }
                            ].map(({ value, label, desc }) => (
                              <button
                                key={value}
                                onClick={() => setEditingOption(prev => prev ? { ...prev, defaultBehavior: value as any } : null)}
                                className={`p-3 rounded-lg border-2 transition-all text-left ${
                                  editingOption.defaultBehavior === value
                                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                                }`}
                              >
                                <div className="font-medium text-sm">{label}</div>
                                <div className="text-xs opacity-80 mt-1">{desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Target Components */}
                    <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                      <h4 className="text-white font-semibold text-lg mb-4 flex items-center">
                        <Layers className="w-5 h-5 mr-2 text-orange-400" />
                        Target Components
                      </h4>
                      <div className="space-y-3">
                        <p className="text-gray-400 text-sm">
                          Select which 3D model components this option will affect
                        </p>
                        
                        {modelComponents.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No components detected</p>
                            <p className="text-sm">Load a 3D model to see available components</p>
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto border border-gray-600 rounded-lg">
                            {modelComponents.map((component) => (
                              <label
                                key={component.name}
                                className="flex items-center space-x-3 p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                              >
                                <input
                                  type="checkbox"
                                  checked={editingOption.targetComponents.includes(component.name)}
                                  onChange={(e) => {
                                    const newTargets = e.target.checked
                                      ? [...editingOption.targetComponents, component.name]
                                      : editingOption.targetComponents.filter(name => name !== component.name);
                                    setEditingOption(prev => prev ? { ...prev, targetComponents: newTargets } : null);
                                  }}
                                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                />
                                <div className="flex items-center space-x-2 flex-1">
                                  <Box className="w-4 h-4 text-gray-400" />
                                  <span className="text-white text-sm">{component.name}</span>
                                </div>
                                <div 
                                  className={`w-2 h-2 rounded-full ${
                                    component.visible ? 'bg-green-400' : 'bg-red-400'
                                  }`} 
                                  title={component.visible ? 'Visible' : 'Hidden'} 
                                />
                              </label>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Selected: {editingOption.targetComponents.length} of {modelComponents.length} components
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Option Values Section */}
                <div className="mt-8 bg-gray-750 p-6 rounded-xl border border-gray-600">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-white font-semibold text-lg flex items-center">
                      <List className="w-5 h-5 mr-2 text-blue-400" />
                      Option Values
                    </h4>
                    <button
                      onClick={() => {
                        const newValue = createDefaultValue();
                        setEditingOption(prev => prev ? {
                          ...prev,
                          values: [...prev.values, newValue]
                        } : null);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Value</span>
                    </button>
                  </div>

                  {editingOption.values.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No values yet</p>
                      <p className="text-sm">Add values that users can choose from</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editingOption.values.map((value, index) => (
                        <DragDropOptionValue
                          key={value.id}
                          value={value}
                          index={index}
                          manipulationType={editingOption.manipulationType}
                          displayType={editingOption.displayType}
                          availableComponents={modelComponents}
                          targetComponents={editingOption.targetComponents}
                          defaultBehavior={editingOption.defaultBehavior}
                          imageSettings={editingOption.imageSettings}
                          allOptions={activeConfigurator?.options || []}
                          onMove={(dragIndex, hoverIndex) => {
                            const newValues = [...editingOption.values];
                            const draggedValue = newValues[dragIndex];
                            newValues.splice(dragIndex, 1);
                            newValues.splice(hoverIndex, 0, draggedValue);
                            setEditingOption(prev => prev ? { ...prev, values: newValues } : null);
                          }}
                          onUpdate={(valueId, updates) => {
                            setEditingOption(prev => prev ? {
                              ...prev,
                              values: prev.values.map(val => 
                                val.id === valueId ? { ...val, ...updates } : val
                              )
                            } : null);
                          }}
                          onDelete={(valueId) => {
                            setEditingOption(prev => prev ? {
                              ...prev,
                              values: prev.values.filter(val => val.id !== valueId)
                            } : null);
                          }}
                          canDelete={editingOption.values.length > 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-700 bg-gray-750 rounded-b-xl flex space-x-4">
                <button
                  onClick={() => {
                    setShowOptionModal(false);
                    setEditingOption(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveOption(editingOption)}
                  disabled={!editingOption.name.trim() || editingOption.targetComponents.length === 0}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium ${
                    !editingOption.name.trim() || editingOption.targetComponents.length === 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Save Option
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Conditional Logic Modal - Only render when conditionalLogicOption is not null */}
      {conditionalLogicOption && (
        <ConditionalLogicModal
          isOpen={showConditionalLogicModal}
          onClose={() => {
            setShowConditionalLogicModal(false);
            setConditionalLogicOption(null);
          }}
          onSave={handleSaveConditionalLogic}
          currentOption={conditionalLogicOption}
          allOptions={activeConfigurator?.options || []}
          conditionalLogic={conditionalLogicOption?.conditionalLogic}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation.isOpen}
        onClose={() => setShowDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title={`Delete ${showDeleteConfirmation.type}`}
        message={`Are you sure you want to delete "${showDeleteConfirmation.name}"?`}
        confirmText="Delete"
        type="danger"
        details={showDeleteConfirmation.details}
      />
    </div>
  );
};

export default ConfiguratorBuilder;