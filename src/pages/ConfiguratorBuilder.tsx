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
  X,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ThreeJSPreview from '../components/ThreeJSPreview';
import DragDropOption from '../components/DragDropOption';
import DragDropOptionValue from '../components/DragDropOptionValue';
import ComponentSelector from '../components/ComponentSelector';
import ConditionalLogicModal from '../components/ConditionalLogicModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { 
  ConfiguratorData, 
  ConfiguratorOption, 
  ConfiguratorOptionValue, 
  ModelComponent,
  ImageSettings 
} from '../types/ConfiguratorTypes';
import { useConfiguratorPersistence } from '../hooks/useConfiguratorPersistence';

const ConfiguratorBuilder: React.FC = () => {
  // State management
  const [configuratorData, setConfiguratorData] = useState<ConfiguratorData>({
    id: 'default',
    name: 'New Configurator',
    description: 'A new 3D configurator',
    model: '/models/sample.glb',
    options: []
  });

  const [availableComponents, setAvailableComponents] = useState<ModelComponent[]>([]);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [editingOption, setEditingOption] = useState<ConfiguratorOption | null>(null);
  const [showConditionalLogicModal, setShowConditionalLogicModal] = useState(false);
  const [conditionalLogicOption, setConditionalLogicOption] = useState<ConfiguratorOption | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);

  // Persistence
  const { 
    isLoading, 
    lastSaved, 
    saveToStorage, 
    loadFromStorage, 
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

  // Auto-save functionality
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        saveToStorage([configuratorData], configuratorData.id);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [configuratorData, isLoading, saveToStorage]);

  // Handle components loaded from 3D model
  const handleComponentsLoaded = useCallback((components: ModelComponent[]) => {
    setAvailableComponents(components);
  }, []);

  // Option management
  const addOption = () => {
    setEditingOption(null);
    setShowOptionModal(true);
  };

  const editOption = (option: ConfiguratorOption) => {
    setEditingOption(option);
    setShowOptionModal(true);
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

  const saveOption = (optionData: Partial<ConfiguratorOption>) => {
    if (editingOption) {
      // Update existing option
      setConfiguratorData(prev => ({
        ...prev,
        options: prev.options.map(opt => 
          opt.id === editingOption.id ? { ...opt, ...optionData } : opt
        )
      }));
    } else {
      // Create new option
      const newOption: ConfiguratorOption = {
        id: `option_${Date.now()}`,
        name: optionData.name || 'New Option',
        description: optionData.description || '',
        displayType: optionData.displayType || 'buttons',
        displayDirection: optionData.displayDirection || 'column',
        manipulationType: optionData.manipulationType || 'visibility',
        targetComponents: optionData.targetComponents || [],
        defaultBehavior: optionData.defaultBehavior || 'hide',
        imageSettings: optionData.imageSettings,
        values: []
      };
      
      setConfiguratorData(prev => ({
        ...prev,
        options: [...prev.options, newOption]
      }));
    }
    setShowOptionModal(false);
    setEditingOption(null);
  };

  const moveOption = (dragIndex: number, hoverIndex: number) => {
    setConfiguratorData(prev => {
      const newOptions = [...prev.options];
      const draggedOption = newOptions[dragIndex];
      newOptions.splice(dragIndex, 1);
      newOptions.splice(hoverIndex, 0, draggedOption);
      return { ...prev, options: newOptions };
    });
  };

  // Option value management
  const addOptionValue = (optionId: string) => {
    const newValue: ConfiguratorOptionValue = {
      id: `value_${Date.now()}`,
      name: 'New Value',
      visibleComponents: [],
      hiddenComponents: []
    };

    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.map(opt => 
        opt.id === optionId 
          ? { ...opt, values: [...opt.values, newValue] }
          : opt
      )
    }));
  };

  const updateOptionValue = (optionId: string, valueId: string, updates: any) => {
    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.map(opt => 
        opt.id === optionId 
          ? {
              ...opt,
              values: opt.values.map(val => 
                val.id === valueId ? { ...val, ...updates } : val
              )
            }
          : opt
      )
    }));
  };

  const deleteOptionValue = (optionId: string, valueId: string) => {
    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.map(opt => 
        opt.id === optionId 
          ? { ...opt, values: opt.values.filter(val => val.id !== valueId) }
          : opt
      )
    }));
  };

  const moveOptionValue = (optionId: string, dragIndex: number, hoverIndex: number) => {
    setConfiguratorData(prev => ({
      ...prev,
      options: prev.options.map(opt => {
        if (opt.id === optionId) {
          const newValues = [...opt.values];
          const draggedValue = newValues[dragIndex];
          newValues.splice(dragIndex, 1);
          newValues.splice(hoverIndex, 0, draggedValue);
          return { ...opt, values: newValues };
        }
        return opt;
      })
    }));
  };

  // Conditional Logic
  const editConditionalLogic = (option: ConfiguratorOption) => {
    setConditionalLogicOption(option);
    setShowConditionalLogicModal(true);
  };

  const saveConditionalLogic = (conditionalLogic: any) => {
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
  };

  // File operations
  const handleModelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setConfiguratorData(prev => ({ ...prev, model: url }));
    }
  };

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

  // Option Modal Component
  const OptionModal = () => {
    const [formData, setFormData] = useState({
      name: editingOption?.name || '',
      description: editingOption?.description || '',
      displayType: editingOption?.displayType || 'buttons',
      displayDirection: editingOption?.displayDirection || 'column',
      manipulationType: editingOption?.manipulationType || 'visibility',
      targetComponents: editingOption?.targetComponents || [],
      defaultBehavior: editingOption?.defaultBehavior || 'hide',
      imageSettings: editingOption?.imageSettings || {
        size: 'medium',
        aspectRatio: '1:1',
        showBorder: true,
        borderRadius: 8
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveOption(formData);
    };

    const updateImageSettings = (updates: Partial<ImageSettings>) => {
      setFormData(prev => ({
        ...prev,
        imageSettings: { ...prev.imageSettings, ...updates }
      }));
    };

    const getBorderStyles = () => {
      if (!formData.imageSettings.showBorder) return {};
      
      return {
        borderRadius: `${formData.imageSettings.borderRadius}px`,
        border: '2px solid #4b5563'
      };
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700 bg-gray-750 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-xl">
                  {editingOption ? 'Edit Option' : 'Create New Option'}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Configure how users interact with your 3D model
                </p>
              </div>
              <button
                onClick={() => setShowOptionModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                <h4 className="text-white font-semibold text-lg mb-6 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-400" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Option Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., Color, Material, Parts"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Description (Optional)</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Brief description of this option"
                    />
                  </div>
                </div>
              </div>

              {/* Display Configuration */}
              <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                <h4 className="text-white font-semibold text-lg mb-6 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-green-400" />
                  Display Configuration
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Display Type</label>
                    <select
                      value={formData.displayType}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayType: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="buttons">Buttons</option>
                      <option value="list">Dropdown List</option>
                      <option value="images">Image Gallery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Layout Direction</label>
                    <select
                      value={formData.displayDirection}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayDirection: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="column">Vertical (Column)</option>
                      <option value="row">Horizontal (Row)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Behavior Configuration */}
              <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                <h4 className="text-white font-semibold text-lg mb-6 flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-purple-400" />
                  Behavior Configuration
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Manipulation Type</label>
                    <select
                      value={formData.manipulationType}
                      onChange={(e) => setFormData(prev => ({ ...prev, manipulationType: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="visibility">Show/Hide Components</option>
                      <option value="material">Change Material/Color</option>
                    </select>
                  </div>
                  {formData.manipulationType === 'visibility' && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 font-medium">Default Behavior</label>
                      <select
                        value={formData.defaultBehavior}
                        onChange={(e) => setFormData(prev => ({ ...prev, defaultBehavior: e.target.value as any }))}
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
                <h4 className="text-white font-semibold text-lg mb-6 flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-orange-400" />
                  Target Components
                </h4>
                <ComponentSelector
                  availableComponents={availableComponents}
                  selectedComponents={formData.targetComponents}
                  onSelectionChange={(components) => setFormData(prev => ({ ...prev, targetComponents: components }))}
                  placeholder="Select components this option will affect..."
                  label="Target Components"
                  alwaysModal={true}
                />
                <p className="text-gray-500 text-sm mt-2">
                  These are the 3D model components that this option will control
                </p>
              </div>

              {/* Image Settings - Only show for image display type */}
              {formData.displayType === 'images' && (
                <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                  <h4 className="text-white font-semibold text-lg mb-6 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-pink-400" />
                    Image Settings
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium">Image Size</label>
                        <select
                          value={formData.imageSettings.size}
                          onChange={(e) => updateImageSettings({ size: e.target.value as any })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="x-small">Extra Small (48px)</option>
                          <option value="small">Small (64px)</option>
                          <option value="medium">Medium (80px)</option>
                          <option value="large">Large (96px)</option>
                          <option value="x-large">Extra Large (128px)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium">Aspect Ratio</label>
                        <select
                          value={formData.imageSettings.aspectRatio}
                          onChange={(e) => updateImageSettings({ aspectRatio: e.target.value as any })}
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

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-gray-400 text-sm font-medium">Show Border</label>
                          <button
                            type="button"
                            onClick={() => updateImageSettings({ showBorder: !formData.imageSettings.showBorder })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              formData.imageSettings.showBorder ? 'bg-blue-600' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                formData.imageSettings.showBorder ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {formData.imageSettings.showBorder && (
                          <div>
                            <label className="block text-gray-400 text-sm mb-2 font-medium">
                              Border Radius: {formData.imageSettings.borderRadius}px
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={formData.imageSettings.borderRadius}
                              onChange={(e) => updateImageSettings({ borderRadius: parseInt(e.target.value) })}
                              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-white font-medium">Preview</h5>
                      <div className="flex justify-center">
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <div
                            className={`
                              flex items-center justify-center overflow-hidden bg-gray-700
                              ${formData.imageSettings.size === 'x-small' ? 'w-12 h-12' :
                                formData.imageSettings.size === 'small' ? 'w-16 h-16' :
                                formData.imageSettings.size === 'medium' ? 'w-20 h-20' :
                                formData.imageSettings.size === 'large' ? 'w-24 h-24' :
                                formData.imageSettings.size === 'x-large' ? 'w-32 h-32' :
                                'w-20 h-20'
                              }
                              ${formData.imageSettings.aspectRatio === '1:1' ? 'aspect-square' :
                                formData.imageSettings.aspectRatio === '4:3' ? 'aspect-[4/3]' :
                                formData.imageSettings.aspectRatio === '16:9' ? 'aspect-video' :
                                formData.imageSettings.aspectRatio === '3:2' ? 'aspect-[3/2]' :
                                formData.imageSettings.aspectRatio === '2:3' ? 'aspect-[2/3]' :
                                formData.imageSettings.aspectRatio === 'full' ? 'w-auto max-w-32' :
                                'aspect-square'
                              }
                            `}
                            style={getBorderStyles()}
                          >
                            <ImageIcon className="w-6 h-6 text-gray-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowOptionModal(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  {editingOption ? 'Update Option' : 'Create Option'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading Configurator</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex">
        {/* Left Panel - Configuration */}
        <div className="w-1/2 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700 bg-gray-750">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-white font-bold text-2xl">3D Configurator Builder</h1>
                <p className="text-gray-400 text-sm mt-1">Design interactive 3D product configurators</p>
              </div>
              <div className="flex items-center space-x-2">
                {lastSaved && (
                  <span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-full">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Description</label>
                <input
                  type="text"
                  value={configuratorData.description}
                  onChange={(e) => setConfiguratorData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={addOption}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                
                <button
                  onClick={handleImport}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                </button>
              </div>
            </div>
          </div>

          {/* Model Upload */}
          <div className="p-6 border-b border-gray-700 bg-gray-750">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">3D Model</h3>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">GLB/GLTF</span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept=".glb,.gltf"
                onChange={handleModelUpload}
                className="hidden"
                id="model-upload"
              />
              <label
                htmlFor="model-upload"
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Model</span>
              </label>
              <span className="text-gray-400 text-sm truncate flex-1">
                {configuratorData.model.split('/').pop() || 'No model selected'}
              </span>
            </div>
          </div>

          {/* Options List */}
          <div className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Configuration Options</h3>
              <span className="text-gray-400 text-sm bg-gray-700 px-3 py-1 rounded-full">
                {configuratorData.options.length} options
              </span>
            </div>

            {configuratorData.options.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium">No options yet</p>
                <p className="text-sm mt-1">Add your first configuration option to get started</p>
                <button
                  onClick={addOption}
                  className="mt-4 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Option</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {configuratorData.options.map((option, index) => (
                  <div key={option.id}>
                    <DragDropOption
                      option={option}
                      index={index}
                      onMove={moveOption}
                      onEdit={editOption}
                      onDelete={deleteOption}
                      onEditConditionalLogic={editConditionalLogic}
                    />
                    
                    {/* Option Values */}
                    <div className="ml-8 mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-gray-300 font-medium text-sm">Values</h5>
                        <button
                          onClick={() => addOptionValue(option.id)}
                          className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm font-medium px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Value</span>
                        </button>
                      </div>
                      
                      {option.values.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 bg-gray-750 rounded-lg border border-gray-600">
                          <p className="text-sm">No values yet</p>
                          <button
                            onClick={() => addOptionValue(option.id)}
                            className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            Add the first value
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {option.values.map((value, valueIndex) => (
                            <DragDropOptionValue
                              key={value.id}
                              value={value}
                              index={valueIndex}
                              manipulationType={option.manipulationType}
                              displayType={option.displayType}
                              availableComponents={availableComponents}
                              targetComponents={option.targetComponents}
                              defaultBehavior={option.defaultBehavior}
                              imageSettings={option.imageSettings}
                              allOptions={configuratorData.options}
                              onMove={(dragIndex, hoverIndex) => moveOptionValue(option.id, dragIndex, hoverIndex)}
                              onUpdate={(valueId, updates) => updateOptionValue(option.id, valueId, updates)}
                              onDelete={(valueId) => deleteOptionValue(option.id, valueId)}
                              canDelete={option.values.length > 1}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-gray-900 flex flex-col">
          {/* Preview Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-white font-semibold">Live Preview</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === 'desktop' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === 'tablet' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === 'mobile' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowFullscreenPreview(true)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">Fullscreen</span>
            </button>
          </div>

          {/* Preview Content */}
          <div className="flex-1 relative">
            <div className={`h-full ${
              previewMode === 'mobile' ? 'max-w-sm mx-auto' :
              previewMode === 'tablet' ? 'max-w-2xl mx-auto' :
              'w-full'
            }`}>
              <ThreeJSPreview
                configuratorData={configuratorData}
                onComponentsLoaded={handleComponentsLoaded}
              />
            </div>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showOptionModal && <OptionModal />}
          
          {showConditionalLogicModal && conditionalLogicOption && (
            <ConditionalLogicModal
              isOpen={showConditionalLogicModal}
              onClose={() => setShowConditionalLogicModal(false)}
              onSave={saveConditionalLogic}
              currentOption={conditionalLogicOption}
              allOptions={configuratorData.options}
              conditionalLogic={conditionalLogicOption.conditionalLogic}
            />
          )}

          {showDeleteConfirmation && (
            <ConfirmationDialog
              isOpen={showDeleteConfirmation}
              onClose={() => setShowDeleteConfirmation(false)}
              onConfirm={confirmDeleteOption}
              title="Delete Option"
              message="Are you sure you want to delete this option? This action cannot be undone."
              confirmText="Delete Option"
              type="danger"
            />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
};

export default ConfiguratorBuilder;