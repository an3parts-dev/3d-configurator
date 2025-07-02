import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Settings, 
  Eye, 
  Download, 
  Upload, 
  Trash2, 
  Copy,
  Save,
  FileText,
  Layers,
  Zap,
  Image as ImageIcon,
  Grid3X3,
  List,
  Palette,
  ToggleLeft,
  ToggleRight,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ThreeJSPreview from '../components/ThreeJSPreview';
import DragDropOption from '../components/DragDropOption';
import DragDropOptionValue from '../components/DragDropOptionValue';
import ComponentSelector from '../components/ComponentSelector';
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
  const [configuratorData, setConfiguratorData] = useState<ConfiguratorData>({
    id: 'default',
    name: 'New Configurator',
    description: 'A new 3D configurator',
    model: '/models/sample.glb',
    options: []
  });

  const [modelComponents, setModelComponents] = useState<ModelComponent[]>([]);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [editingOption, setEditingOption] = useState<ConfiguratorOption | null>(null);
  const [showConditionalLogicModal, setShowConditionalLogicModal] = useState(false);
  const [conditionalLogicOption, setConditionalLogicOption] = useState<ConfiguratorOption | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Persistence
  const { 
    isLoading, 
    lastSaved, 
    loadFromStorage, 
    saveToStorage, 
    exportConfigurations, 
    importConfigurations, 
    clearStorage 
  } = useConfiguratorPersistence();

  // Load saved data on mount
  useEffect(() => {
    if (!isLoading) {
      const saved = loadFromStorage();
      if (saved && saved.configurators.length > 0) {
        const activeConfig = saved.configurators.find(c => c.id === saved.activeId) || saved.configurators[0];
        setConfiguratorData(activeConfig);
      }
    }
  }, [isLoading, loadFromStorage]);

  // Auto-save changes
  useEffect(() => {
    if (!isLoading && configuratorData.options.length > 0) {
      const timer = setTimeout(() => {
        saveToStorage([configuratorData], configuratorData.id);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [configuratorData, isLoading, saveToStorage]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Option management
  const createNewOption = () => {
    const newOption: ConfiguratorOption = {
      id: `option_${Date.now()}`,
      name: 'New Option',
      description: '',
      displayType: 'buttons',
      displayDirection: 'column',
      manipulationType: 'visibility',
      targetComponents: [],
      defaultBehavior: 'hide',
      values: [
        {
          id: `value_${Date.now()}`,
          name: 'Default Value',
          visibleComponents: [],
          hiddenComponents: []
        }
      ]
    };

    setEditingOption(newOption);
    setShowOptionModal(true);
  };

  const saveOption = (option: ConfiguratorOption) => {
    setConfiguratorData(prev => {
      const existingIndex = prev.options.findIndex(opt => opt.id === option.id);
      if (existingIndex >= 0) {
        const newOptions = [...prev.options];
        newOptions[existingIndex] = option;
        return { ...prev, options: newOptions };
      } else {
        return { ...prev, options: [...prev.options, option] };
      }
    });
    setShowOptionModal(false);
    setEditingOption(null);
  };

  const deleteOption = (optionId: string) => {
    setOptionToDelete(optionId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteOption = () => {
    if (optionToDelete) {
      setConfiguratorData(prev => ({
        ...prev,
        options: prev.options.filter(opt => opt.id !== optionToDelete)
      }));
      setOptionToDelete(null);
    }
  };

  const duplicateOption = (option: ConfiguratorOption) => {
    const duplicatedOption: ConfiguratorOption = {
      ...option,
      id: `option_${Date.now()}`,
      name: `${option.name} (Copy)`,
      values: option.values.map(value => ({
        ...value,
        id: `value_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }))
    };

    setConfiguratorData(prev => ({
      ...prev,
      options: [...prev.options, duplicatedOption]
    }));
  };

  const moveOption = useCallback((dragIndex: number, hoverIndex: number) => {
    setConfiguratorData(prev => {
      const newOptions = [...prev.options];
      const draggedOption = newOptions[dragIndex];
      newOptions.splice(dragIndex, 1);
      newOptions.splice(hoverIndex, 0, draggedOption);
      return { ...prev, options: newOptions };
    });
  }, []);

  // Option value management
  const addOptionValue = (optionId: string) => {
    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.map(option => 
        option.id === optionId 
          ? {
              ...option,
              values: [
                ...option.values,
                {
                  id: `value_${Date.now()}`,
                  name: `Value ${option.values.length + 1}`,
                  visibleComponents: [],
                  hiddenComponents: []
                }
              ]
            }
          : option
      )
    }));
  };

  const updateOptionValue = (optionId: string, valueId: string, updates: Partial<ConfiguratorOptionValue>) => {
    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.map(option => 
        option.id === optionId 
          ? {
              ...option,
              values: option.values.map(value => 
                value.id === valueId ? { ...value, ...updates } : value
              )
            }
          : option
      )
    }));
  };

  const deleteOptionValue = (optionId: string, valueId: string) => {
    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.map(option => 
        option.id === optionId 
          ? {
              ...option,
              values: option.values.filter(value => value.id !== valueId)
            }
          : option
      )
    }));
  };

  const moveOptionValue = useCallback((optionId: string, dragIndex: number, hoverIndex: number) => {
    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.map(option => 
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
    }));
  }, []);

  // File operations
  const handleExport = () => {
    try {
      exportConfigurations([configuratorData], configuratorData.id);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = async () => {
    try {
      const imported = await importConfigurations();
      if (imported.configurators.length > 0) {
        const activeConfig = imported.configurators.find(c => c.id === imported.activeId) || imported.configurators[0];
        setConfiguratorData(activeConfig);
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  // Conditional Logic
  const handleEditConditionalLogic = (option: ConfiguratorOption) => {
    setConditionalLogicOption(option);
    setShowConditionalLogicModal(true);
  };

  const handleSaveConditionalLogic = (conditionalLogic: any) => {
    if (conditionalLogicOption) {
      setConfiguratorData(prev => ({
        ...prev,
        options: prev.options.map(opt => 
          opt.id === conditionalLogicOption.id 
            ? { ...opt, conditionalLogic }
            : opt
        )
      }));
    }
    setShowConditionalLogicModal(false);
    setConditionalLogicOption(null);
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
    <div className="h-screen flex">
      {/* Left Panel - Configuration */}
      <div className="w-1/2 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-750">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white text-2xl font-bold">3D Configurator Builder</h1>
              <p className="text-gray-400 text-sm mt-1">
                Design interactive 3D product configurators
                {lastSaved && (
                  <span className="ml-2 text-green-400">
                    • Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleImport}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              <button
                onClick={handleExport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Project Name</label>
              <input
                type="text"
                value={configuratorData.name}
                onChange={(e) => setConfiguratorData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">Configuration Options</h2>
            <button
              onClick={createNewOption}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Option</span>
            </button>
          </div>

          {configuratorData.options.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No options yet</p>
              <p className="text-sm mt-2">Create your first configuration option to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {configuratorData.options.map((option, index) => (
                <DragDropOption
                  key={option.id}
                  option={option}
                  index={index}
                  onMove={moveOption}
                  onEdit={(opt) => {
                    setEditingOption(opt);
                    setShowOptionModal(true);
                  }}
                  onDelete={deleteOption}
                  onEditConditionalLogic={handleEditConditionalLogic}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - 3D Preview */}
      <div className="w-1/2 bg-gray-900">
        <ThreeJSPreview 
          configuratorData={configuratorData}
          onComponentsLoaded={setModelComponents}
        />
      </div>

      {/* Option Configuration Modal */}
      <AnimatePresence>
        {showOptionModal && editingOption && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-700 bg-gray-750 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-xl">
                      {editingOption.id.startsWith('option_') && editingOption.name === 'New Option' ? 'Create New Option' : 'Edit Option'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Configure display settings and behavior</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowOptionModal(false);
                      setEditingOption(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-6">
                <div className="space-y-8">
                  {/* Basic Settings */}
                  <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                    <h4 className="text-white font-semibold text-lg mb-6 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-blue-400" />
                      Basic Settings
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Option Name</label>
                        <input
                          type="text"
                          value={editingOption.name}
                          onChange={(e) => setEditingOption(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter option name"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Description (Optional)</label>
                        <input
                          type="text"
                          value={editingOption.description || ''}
                          onChange={(e) => setEditingOption(prev => prev ? { ...prev, description: e.target.value } : null)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Describe this option"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Manipulation Type</label>
                        <select
                          value={editingOption.manipulationType}
                          onChange={(e) => setEditingOption(prev => prev ? { 
                            ...prev, 
                            manipulationType: e.target.value as 'visibility' | 'material'
                          } : null)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="visibility">Visibility Control</option>
                          <option value="material">Material/Color Change</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Display Type</label>
                        <select
                          value={editingOption.displayType}
                          onChange={(e) => setEditingOption(prev => prev ? { 
                            ...prev, 
                            displayType: e.target.value as 'list' | 'buttons' | 'images'
                          } : null)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="list">Dropdown List</option>
                          <option value="buttons">Button Grid</option>
                          <option value="images">Image Grid</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Display Direction</label>
                        <select
                          value={editingOption.displayDirection || 'column'}
                          onChange={(e) => setEditingOption(prev => prev ? { 
                            ...prev, 
                            displayDirection: e.target.value as 'column' | 'row'
                          } : null)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="column">Vertical (Column)</option>
                          <option value="row">Horizontal (Row)</option>
                        </select>
                      </div>

                      {editingOption.manipulationType === 'visibility' && (
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Default Behavior</label>
                          <select
                            value={editingOption.defaultBehavior || 'hide'}
                            onChange={(e) => setEditingOption(prev => prev ? { 
                              ...prev, 
                              defaultBehavior: e.target.value as 'show' | 'hide'
                            } : null)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="hide">Hide All, Show Selected</option>
                            <option value="show">Show All, Hide Selected</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Target Components */}
                  <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                    <h4 className="text-white font-semibold text-lg mb-4 flex items-center">
                      <Layers className="w-5 h-5 mr-2 text-green-400" />
                      Target Components
                    </h4>
                    <ComponentSelector
                      availableComponents={modelComponents}
                      selectedComponents={editingOption.targetComponents}
                      onSelectionChange={(components) => setEditingOption(prev => prev ? { 
                        ...prev, 
                        targetComponents: components 
                      } : null)}
                      placeholder="Select components this option will control..."
                      label="3D Model Components"
                    />
                  </div>

                  {/* Image Settings - Only for Images Display Type */}
                  {editingOption.displayType === 'images' && (
                    <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-white font-semibold text-lg flex items-center">
                          <ImageIcon className="w-5 h-5 mr-2 text-purple-400" />
                          Image Settings
                        </h4>
                        <button
                          onClick={() => toggleSection('imageSettings')}
                          className="text-gray-400 hover:text-white transition-colors p-1 rounded"
                        >
                          {expandedSections.imageSettings ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Settings Controls */}
                        <div className="space-y-6">
                          <div>
                            <label className="block text-gray-400 text-sm mb-2">Image Size</label>
                            <select
                              value={editingOption.imageSettings?.size || 'medium'}
                              onChange={(e) => setEditingOption(prev => prev ? {
                                ...prev,
                                imageSettings: {
                                  ...prev.imageSettings,
                                  size: e.target.value as ImageSettings['size'],
                                  aspectRatio: prev.imageSettings?.aspectRatio || '1:1',
                                  showBorder: prev.imageSettings?.showBorder || false,
                                  borderRadius: prev.imageSettings?.borderRadius || 8
                                }
                              } : null)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value="x-small">X-Small</option>
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                              <option value="x-large">X-Large</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-gray-400 text-sm mb-2">Aspect Ratio</label>
                            <select
                              value={editingOption.imageSettings?.aspectRatio || '1:1'}
                              onChange={(e) => setEditingOption(prev => prev ? {
                                ...prev,
                                imageSettings: {
                                  ...prev.imageSettings,
                                  size: prev.imageSettings?.size || 'medium',
                                  aspectRatio: e.target.value as ImageSettings['aspectRatio'],
                                  showBorder: prev.imageSettings?.showBorder || false,
                                  borderRadius: prev.imageSettings?.borderRadius || 8
                                }
                              } : null)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value="1:1">Square (1:1)</option>
                              <option value="4:3">Standard (4:3)</option>
                              <option value="16:9">Widescreen (16:9)</option>
                              <option value="3:2">Photo (3:2)</option>
                              <option value="2:3">Portrait (2:3)</option>
                              <option value="full">Full Size</option>
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-gray-400 text-sm">Image Border</label>
                              <button
                                onClick={() => setEditingOption(prev => prev ? {
                                  ...prev,
                                  imageSettings: {
                                    ...prev.imageSettings,
                                    size: prev.imageSettings?.size || 'medium',
                                    aspectRatio: prev.imageSettings?.aspectRatio || '1:1',
                                    showBorder: !prev.imageSettings?.showBorder,
                                    borderRadius: prev.imageSettings?.borderRadius || 8
                                  }
                                } : null)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  editingOption.imageSettings?.showBorder
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-600 text-gray-300'
                                }`}
                              >
                                {editingOption.imageSettings?.showBorder ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>
                            
                            {editingOption.imageSettings?.showBorder && (
                              <div>
                                <label className="block text-gray-400 text-xs mb-2">Border Radius: {editingOption.imageSettings?.borderRadius || 8}px</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="20"
                                  value={editingOption.imageSettings?.borderRadius || 8}
                                  onChange={(e) => setEditingOption(prev => prev ? {
                                    ...prev,
                                    imageSettings: {
                                      ...prev.imageSettings,
                                      size: prev.imageSettings?.size || 'medium',
                                      aspectRatio: prev.imageSettings?.aspectRatio || '1:1',
                                      showBorder: prev.imageSettings?.showBorder || false,
                                      borderRadius: parseInt(e.target.value)
                                    }
                                  } : null)}
                                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Compact Preview */}
                        <div className="space-y-4">
                          <h5 className="text-gray-300 font-medium text-sm">Preview</h5>
                          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                            <div className="flex flex-col items-center space-y-2">
                              <div 
                                className={`
                                  bg-gray-700 border-2 border-dashed border-gray-600 flex items-center justify-center
                                  ${editingOption.imageSettings?.size === 'x-small' ? 'w-12 h-12' :
                                    editingOption.imageSettings?.size === 'small' ? 'w-16 h-16' :
                                    editingOption.imageSettings?.size === 'medium' ? 'w-20 h-20' :
                                    editingOption.imageSettings?.size === 'large' ? 'w-24 h-24' :
                                    editingOption.imageSettings?.size === 'x-large' ? 'w-32 h-32' :
                                    'w-20 h-20'
                                  }
                                  ${editingOption.imageSettings?.aspectRatio === '1:1' ? 'aspect-square' :
                                    editingOption.imageSettings?.aspectRatio === '4:3' ? 'aspect-[4/3]' :
                                    editingOption.imageSettings?.aspectRatio === '16:9' ? 'aspect-video' :
                                    editingOption.imageSettings?.aspectRatio === '3:2' ? 'aspect-[3/2]' :
                                    editingOption.imageSettings?.aspectRatio === '2:3' ? 'aspect-[2/3]' :
                                    editingOption.imageSettings?.aspectRatio === 'full' ? 'w-auto h-auto max-w-24 max-h-24' :
                                    'aspect-square'
                                  }
                                `}
                                style={editingOption.imageSettings?.showBorder ? {
                                  borderRadius: `${editingOption.imageSettings?.borderRadius || 8}px`,
                                  borderStyle: 'solid',
                                  borderColor: '#4b5563'
                                } : {}}
                              >
                                <ImageIcon className="w-4 h-4 text-gray-500" />
                              </div>
                              <span className="text-gray-400 text-xs font-medium">Sample Image</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option Values */}
                  <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-white font-semibold text-lg flex items-center">
                        <List className="w-5 h-5 mr-2 text-yellow-400" />
                        Option Values ({editingOption.values.length})
                      </h4>
                      <button
                        onClick={() => {
                          const newValue: ConfiguratorOptionValue = {
                            id: `value_${Date.now()}`,
                            name: `Value ${editingOption.values.length + 1}`,
                            visibleComponents: [],
                            hiddenComponents: []
                          };
                          setEditingOption(prev => prev ? {
                            ...prev,
                            values: [...prev.values, newValue]
                          } : null);
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Value</span>
                      </button>
                    </div>

                    {editingOption.values.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No values defined</p>
                        <p className="text-sm">Add values to configure this option</p>
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
                            allOptions={configuratorData.options}
                            onMove={(dragIndex, hoverIndex) => moveOptionValue(editingOption.id, dragIndex, hoverIndex)}
                            onUpdate={(valueId, updates) => {
                              setEditingOption(prev => prev ? {
                                ...prev,
                                values: prev.values.map(v => v.id === valueId ? { ...v, ...updates } : v)
                              } : null);
                            }}
                            onDelete={(valueId) => {
                              setEditingOption(prev => prev ? {
                                ...prev,
                                values: prev.values.filter(v => v.id !== valueId)
                              } : null);
                            }}
                            canDelete={editingOption.values.length > 1}
                          />
                        ))}
                      </div>
                    )}
                  </div>
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
                  onClick={() => saveOption(editingOption)}
                  disabled={!editingOption.name.trim() || editingOption.values.length === 0}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium ${
                    !editingOption.name.trim() || editingOption.values.length === 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {editingOption.id.startsWith('option_') && editingOption.name === 'New Option' ? 'Create Option' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Conditional Logic Modal - Only render when conditionalLogicOption is not null */}
      {showConditionalLogicModal && conditionalLogicOption && (
        <ConditionalLogicModal
          isOpen={showConditionalLogicModal}
          onClose={() => {
            setShowConditionalLogicModal(false);
            setConditionalLogicOption(null);
          }}
          onSave={handleSaveConditionalLogic}
          currentOption={conditionalLogicOption}
          allOptions={configuratorData.options}
          conditionalLogic={conditionalLogicOption.conditionalLogic}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setOptionToDelete(null);
        }}
        onConfirm={confirmDeleteOption}
        title="Delete Option"
        message="Are you sure you want to delete this option? This action cannot be undone."
        confirmText="Delete Option"
        type="danger"
        details={optionToDelete ? [
          `Option: ${configuratorData.options.find(opt => opt.id === optionToDelete)?.name}`,
          `Values: ${configuratorData.options.find(opt => opt.id === optionToDelete)?.values.length || 0} values will be deleted`,
          'All conditional logic rules referencing this option will be affected'
        ] : []}
      />
    </div>
  );
};

export default ConfiguratorBuilder;