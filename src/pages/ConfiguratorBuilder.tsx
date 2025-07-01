import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Save, 
  Eye, 
  Settings, 
  EyeOff, 
  Copy,
  Trash2,
  GripVertical,
  Box,
  Layers,
  Edit,
  List,
  Grid3X3,
  X,
  ToggleLeft,
  ToggleRight,
  Zap,
  Download,
  Upload,
  RefreshCw,
  Clock,
  AlertTriangle,
  Image as ImageIcon,
  Maximize2
} from 'lucide-react';
import ThreeJSPreview from '../components/ThreeJSPreview';
import FullscreenPreview from '../components/FullscreenPreview';
import ComponentSelector from '../components/ComponentSelector';
import DragDropOption from '../components/DragDropOption';
import DragDropOptionValue from '../components/DragDropOptionValue';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ConditionalLogicModal from '../components/ConditionalLogicModal';
import { ConfiguratorOption, ConfiguratorData, ModelComponent, ConditionalLogic, ImageSettings } from '../types/ConfiguratorTypes';
import { ConditionalLogicEngine } from '../utils/ConditionalLogicEngine';
import { useConfiguratorPersistence } from '../hooks/useConfiguratorPersistence';

const ConfiguratorBuilder = () => {
  const {
    isLoading: persistenceLoading,
    lastSaved,
    loadFromStorage,
    saveToStorage,
    exportConfigurations,
    importConfigurations,
    clearStorage
  } = useConfiguratorPersistence();

  const [configurators, setConfigurators] = useState<ConfiguratorData[]>([
    {
      id: 'default',
      name: 'Push-On Component Configurator',
      description: 'Customize your push-on component with different fittings and materials',
      model: 'https://cdn.shopify.com/3d/models/o/b5d4caf023120e2d/PUSH-ON.glb',
      options: []
    }
  ]);

  const [activeConfiguratorId, setActiveConfiguratorId] = useState('default');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showNewOptionModal, setShowNewOptionModal] = useState(false);
  const [showNewConfiguratorModal, setShowNewConfiguratorModal] = useState(false);
  const [showOptionEditModal, setShowOptionEditModal] = useState(false);
  const [showConditionalLogicModal, setShowConditionalLogicModal] = useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [editingOption, setEditingOption] = useState<ConfiguratorOption | null>(null);
  const [availableComponents, setAvailableComponents] = useState<ModelComponent[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: string[];
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const activeConfigurator = configurators.find(c => c.id === activeConfiguratorId) || configurators[0];

  // Load data on component mount
  useEffect(() => {
    if (!persistenceLoading) {
      const stored = loadFromStorage();
      if (stored) {
        setConfigurators(stored.configurators);
        setActiveConfiguratorId(stored.activeId);
      }
    }
  }, [persistenceLoading, loadFromStorage]);

  // Auto-save whenever configurators or activeConfiguratorId changes
  useEffect(() => {
    if (!persistenceLoading && configurators.length > 0) {
      // Debounce saves to avoid excessive localStorage writes
      const timer = setTimeout(() => {
        saveToStorage(configurators, activeConfiguratorId);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [configurators, activeConfiguratorId, persistenceLoading, saveToStorage]);

  const handleComponentsLoaded = useCallback((components: ModelComponent[]) => {
    console.log('🔄 Components loaded in builder:', components.length);
    setAvailableComponents(components);
  }, []);

  const addNewConfigurator = (name: string, description: string, modelUrl: string) => {
    const newConfigurator: ConfiguratorData = {
      id: `configurator_${Date.now()}`,
      name,
      description,
      model: modelUrl,
      options: []
    };
    setConfigurators(prev => [...prev, newConfigurator]);
    setActiveConfiguratorId(newConfigurator.id);
    setShowNewConfiguratorModal(false);
  };

  const addNewOption = (optionData: Omit<ConfiguratorOption, 'id' | 'values'>) => {
    const newOption: ConfiguratorOption = {
      ...optionData,
      id: `option_${Date.now()}`,
      defaultBehavior: optionData.manipulationType === 'visibility' ? 'hide' : undefined,
      conditionalLogic: ConditionalLogicEngine.createDefaultConditionalLogic(),
      imageSettings: optionData.displayType === 'images' ? {
        size: 'medium',
        aspectRatio: '1:1',
        showBorder: false,
        borderRadius: 8
      } : undefined,
      values: []
    };

    setConfigurators(prev => prev.map(config => 
      config.id === activeConfiguratorId 
        ? { ...config, options: [...config.options, newOption] }
        : config
    ));
    setShowNewOptionModal(false);
  };

  const updateOption = (optionId: string, updates: Partial<ConfiguratorOption>) => {
    setConfigurators(prev => prev.map(config => 
      config.id === activeConfiguratorId 
        ? {
            ...config,
            options: config.options.map(option => 
              option.id === optionId ? { ...option, ...updates } : option
            )
          }
        : config
    ));
  };

  const deleteOption = (optionId: string) => {
    const option = activeConfigurator.options.find(opt => opt.id === optionId);
    if (!option) return;

    const details = [
      `Option: "${option.name}"`,
      `${option.values.length} option values`,
      `${option.targetComponents.length} target components`,
      ...(option.conditionalLogic?.enabled ? ['Conditional logic rules'] : [])
    ];

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Configuration Option',
      message: `Are you sure you want to delete the option "${option.name}"? This will permanently remove all associated values and settings.`,
      details,
      type: 'danger',
      onConfirm: () => {
        setConfigurators(prev => prev.map(config => 
          config.id === activeConfiguratorId 
            ? {
                ...config,
                options: config.options.filter(opt => opt.id !== optionId)
              }
            : config
        ));
        if (selectedOptionId === optionId) {
          setSelectedOptionId(null);
        }
      }
    });
  };

  const moveOption = useCallback((dragIndex: number, hoverIndex: number) => {
    setConfigurators(prev => prev.map(config => {
      if (config.id !== activeConfiguratorId) return config;
      
      const options = [...config.options];
      
      if (dragIndex >= options.length || hoverIndex >= options.length) return config;
      
      const draggedOption = options[dragIndex];
      options.splice(dragIndex, 1);
      options.splice(hoverIndex, 0, draggedOption);
      
      return { 
        ...config, 
        options
      };
    }));
  }, [activeConfiguratorId]);

  const addValueToOption = (optionId: string) => {
    const option = activeConfigurator.options.find(opt => opt.id === optionId);
    if (!option) return;

    const newValue = {
      id: `value_${Date.now()}`,
      name: 'New Option',
      ...(option.manipulationType === 'material' && { color: '#000000' }),
      ...(option.displayType === 'images' && { image: undefined, hideTitle: false }),
      ...(option.manipulationType === 'visibility' && { 
        visibleComponents: [],
        hiddenComponents: []
      }),
      conditionalLogic: ConditionalLogicEngine.createDefaultValueConditionalLogic()
    };

    updateOption(optionId, {
      values: [...option.values, newValue]
    });
  };

  const updateOptionValue = (optionId: string, valueId: string, updates: any) => {
    const option = activeConfigurator.options.find(opt => opt.id === optionId);
    if (!option) return;

    const updatedValues = option.values.map(value => 
      value.id === valueId ? { ...value, ...updates } : value
    );

    updateOption(optionId, { values: updatedValues });
  };

  const deleteOptionValue = (optionId: string, valueId: string) => {
    const option = activeConfigurator.options.find(opt => opt.id === optionId);
    if (!option || option.values.length <= 1) return;

    const value = option.values.find(v => v.id === valueId);
    if (!value) return;

    const details = [
      `Value: "${value.name}"`,
      ...(value.visibleComponents ? [`${value.visibleComponents.length} visible components`] : []),
      ...(value.hiddenComponents ? [`${value.hiddenComponents.length} hidden components`] : []),
      ...(value.conditionalLogic?.enabled ? ['Conditional logic rules'] : [])
    ];

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Option Value',
      message: `Are you sure you want to delete the value "${value.name}" from option "${option.name}"?`,
      details,
      type: 'danger',
      onConfirm: () => {
        const updatedValues = option.values.filter(value => value.id !== valueId);
        updateOption(optionId, { values: updatedValues });
      }
    });
  };

  const moveOptionValue = useCallback((optionId: string, dragIndex: number, hoverIndex: number) => {
    const option = activeConfigurator.options.find(opt => opt.id === optionId);
    if (!option) return;

    const values = [...option.values];
    const draggedValue = values[dragIndex];
    
    values.splice(dragIndex, 1);
    values.splice(hoverIndex, 0, draggedValue);
    
    updateOption(optionId, { values });
  }, [activeConfigurator.options]);

  const openOptionEditModal = (option: ConfiguratorOption) => {
    setEditingOption({ ...option });
    setShowOptionEditModal(true);
  };

  const openConditionalLogicModal = (option: ConfiguratorOption) => {
    setEditingOption({ ...option });
    setShowConditionalLogicModal(true);
  };

  const saveOptionEdit = () => {
    if (!editingOption) return;
    updateOption(editingOption.id, editingOption);
    setShowOptionEditModal(false);
    setEditingOption(null);
  };

  const saveConditionalLogic = (conditionalLogic: ConditionalLogic) => {
    if (!editingOption) return;
    updateOption(editingOption.id, { conditionalLogic });
    setEditingOption(null);
  };

  // Export handler
  const handleExport = async () => {
    try {
      exportConfigurations(configurators, activeConfiguratorId);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Import handler
  const handleImport = async () => {
    try {
      setIsImporting(true);
      const imported = await importConfigurations();
      
      setConfirmDialog({
        isOpen: true,
        title: 'Import Configurations',
        message: `Import ${imported.configurators.length} configuration(s)? This will replace your current work.`,
        details: imported.configurators.map(config => `• ${config.name} (${config.options.length} options)`),
        type: 'warning',
        onConfirm: () => {
          setConfigurators(imported.configurators);
          setActiveConfiguratorId(imported.activeId);
        }
      });
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  // Clear storage handler
  const handleClearStorage = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Data',
      message: 'Are you sure you want to clear all saved configurations? This will reset everything to defaults.',
      details: [
        `${configurators.length} configurators will be lost`,
        'All options and values will be deleted',
        'This action cannot be undone'
      ],
      type: 'danger',
      onConfirm: () => {
        clearStorage();
        const defaultConfigurator = {
          id: 'default',
          name: 'Push-On Component Configurator',
          description: 'Customize your push-on component with different fittings and materials',
          model: 'https://cdn.shopify.com/3d/models/o/b5d4caf023120e2d/PUSH-ON.glb',
          options: []
        };
        setConfigurators([defaultConfigurator]);
        setActiveConfiguratorId('default');
      }
    });
  };

  if (persistenceLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading Configurator</p>
          <p className="text-gray-400 text-sm mt-2">Restoring your saved work...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Left Panel - Configuration */}
      <div className="w-1/2 bg-gray-900 flex flex-col border-r border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <select 
                value={activeConfiguratorId}
                onChange={(e) => setActiveConfiguratorId(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-lg font-bold mb-2 w-full"
              >
                {configurators.map(config => (
                  <option key={config.id} value={config.id}>{config.name}</option>
                ))}
              </select>
              <p className="text-gray-400">{activeConfigurator.description}</p>
            </div>
            <div className="flex space-x-2 ml-4">
              <button 
                onClick={() => setShowNewConfiguratorModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                title="Create New Configurator"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
              </button>
              <button 
                onClick={handleExport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                title="Export Configurations"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={handleImport}
                disabled={isImporting}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                title="Import Configurations"
              >
                {isImporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>Import</span>
              </button>
              <button 
                onClick={handleClearStorage}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                title="Clear All Data"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Auto-save status */}
          {lastSaved && (
            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-800/50 px-3 py-2 rounded-lg">
              <Clock className="w-3 h-3" />
              <span>Auto-saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Model Information */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-white font-medium mb-4 flex items-center">
                <Box className="w-5 h-5 mr-2" />
                3D Model
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Model URL</label>
                  <input
                    type="url"
                    value={activeConfigurator.model}
                    onChange={(e) => {
                      setConfigurators(prev => prev.map(config => 
                        config.id === activeConfiguratorId 
                          ? { ...config, model: e.target.value }
                          : config
                      ));
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="https://example.com/model.glb"
                  />
                </div>
                {availableComponents.length > 0 && (
                  <div className="text-sm text-gray-400">
                    <span className="font-medium text-green-400">✓</span> Model loaded with {availableComponents.length} components
                  </div>
                )}
              </div>
            </div>

            {/* Add New Option */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configuration Options
                </h3>
                <button
                  onClick={() => setShowNewOptionModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Option</span>
                </button>
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-4">
              {activeConfigurator.options.map((option, index) => (
                <DragDropOption
                  key={option.id}
                  option={option}
                  index={index}
                  onMove={moveOption}
                  onEdit={openOptionEditModal}
                  onDelete={deleteOption}
                  onEditConditionalLogic={openConditionalLogicModal}
                />
              ))}

              {activeConfigurator.options.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No configuration options yet</p>
                  <p className="text-sm">Click "Add Option" to create your first configuration</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - 3D Preview */}
      <div className="w-1/2 bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-white font-medium">Live Preview</h2>
            <p className="text-gray-400 text-sm">Real-time 3D model with advanced conditional logic</p>
          </div>
          <button
            onClick={() => setShowFullscreenPreview(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            title="Open Fullscreen Preview"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Live Preview</span>
          </button>
        </div>
        <div className="flex-1">
          <ThreeJSPreview 
            key={activeConfigurator.id}
            configuratorData={activeConfigurator} 
            onComponentsLoaded={handleComponentsLoaded}
          />
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      <FullscreenPreview
        isOpen={showFullscreenPreview}
        onClose={() => setShowFullscreenPreview(false)}
        configuratorData={activeConfigurator}
        onComponentsLoaded={handleComponentsLoaded}
      />

      {/* New Option Modal */}
      {showNewOptionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md"
          >
            <h3 className="text-white font-semibold text-lg mb-4">Add New Configuration Option</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addNewOption({
                name: formData.get('name') as string,
                displayType: formData.get('displayType') as 'list' | 'buttons' | 'images',
                manipulationType: formData.get('manipulationType') as 'visibility' | 'material',
                targetComponents: []
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Option Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder="e.g., Fitting A"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Manipulation Type</label>
                  <select
                    name="manipulationType"
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="visibility">Visibility (Show/Hide Components)</option>
                    <option value="material">Material (Change Colors/Materials)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Display Type</label>
                  <select
                    name="displayType"
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="buttons">Buttons</option>
                    <option value="list">List</option>
                    <option value="images">Images</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewOptionModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  Create Option
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Option Modal */}
      {showOptionEditModal && editingOption && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl"
            role="dialog"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-750 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-xl">Edit Option</h3>
                  <p className="text-gray-400 text-sm">{editingOption.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowOptionEditModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-8">
                {/* Basic Settings in a single organized section */}
                <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                  <h4 className="text-white font-semibold text-lg flex items-center mb-6">
                    <Settings className="w-5 h-5 mr-2 text-blue-400" />
                    Option Settings
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium">Option Name</label>
                        <input
                          type="text"
                          value={editingOption.name}
                          onChange={(e) => setEditingOption(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Option name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium">Description (Optional)</label>
                        <textarea
                          value={editingOption.description || ''}
                          onChange={(e) => setEditingOption(prev => prev ? { ...prev, description: e.target.value } : null)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          placeholder="Brief description of this option"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium">Display Type</label>
                        <select
                          value={editingOption.displayType}
                          onChange={(e) => {
                            const newDisplayType = e.target.value as 'list' | 'buttons' | 'images';
                            setEditingOption(prev => prev ? { 
                              ...prev, 
                              displayType: newDisplayType,
                              imageSettings: newDisplayType === 'images' ? {
                                size: 'medium',
                                aspectRatio: '1:1',
                                showBorder: false,
                                borderRadius: 8
                              } : undefined
                            } : null);
                          }}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="buttons">Buttons</option>
                          <option value="list">List</option>
                          <option value="images">Images</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium">Display Direction</label>
                        <select
                          value={editingOption.displayDirection || 'column'}
                          onChange={(e) => setEditingOption(prev => prev ? { 
                            ...prev, 
                            displayDirection: e.target.value as 'column' | 'row' 
                          } : null)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="column">Column (Wrap)</option>
                          <option value="row">Row (Horizontal Scroll)</option>
                        </select>
                      </div>

                      {/* Default Behavior for Visibility Options */}
                      {editingOption.manipulationType === 'visibility' && (
                        <div>
                          <label className="block text-gray-400 text-sm mb-3 font-medium">Default Behavior</label>
                          <button
                            onClick={() => setEditingOption(prev => prev ? { 
                              ...prev, 
                              defaultBehavior: prev.defaultBehavior === 'hide' ? 'show' : 'hide' 
                            } : null)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                              editingOption.defaultBehavior === 'hide'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                                : 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {editingOption.defaultBehavior === 'hide' ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                              <span className="font-medium">
                                {editingOption.defaultBehavior === 'hide' ? 'Hide by Default' : 'Show by Default'}
                              </span>
                            </div>
                            {editingOption.defaultBehavior === 'hide' ? (
                              <ToggleLeft className="w-6 h-6" />
                            ) : (
                              <ToggleRight className="w-6 h-6" />
                            )}
                          </button>
                          <p className="text-gray-500 text-xs mt-2">
                            {editingOption.defaultBehavior === 'hide' ? (
                              'All target components will be hidden initially. For each option value, specify which components to show.'
                            ) : (
                              'All target components will be visible initially. For each option value, specify which components to hide.'
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Settings for Images Display Type */}
                {editingOption.displayType === 'images' && (
                  <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                    <h4 className="text-white font-semibold text-lg flex items-center mb-6">
                      <ImageIcon className="w-5 h-5 mr-2 text-blue-400" />
                      Image Settings
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium">Image Size</label>
                        <select
                          value={editingOption.imageSettings?.size || 'medium'}
                          onChange={(e) => setEditingOption(prev => prev ? {
                            ...prev,
                            imageSettings: {
                              ...prev.imageSettings,
                              size: e.target.value as 'x-small' | 'small' | 'medium' | 'large' | 'x-large',
                              aspectRatio: prev.imageSettings?.aspectRatio || '1:1',
                              showBorder: prev.imageSettings?.showBorder || false,
                              borderRadius: prev.imageSettings?.borderRadius || 8
                            }
                          } : null)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="x-small">X-Small</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="x-large">X-Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium">Aspect Ratio</label>
                        <select
                          value={editingOption.imageSettings?.aspectRatio || '1:1'}
                          onChange={(e) => setEditingOption(prev => prev ? {
                            ...prev,
                            imageSettings: {
                              ...prev.imageSettings,
                              size: prev.imageSettings?.size || 'medium',
                              aspectRatio: e.target.value as '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | 'full',
                              showBorder: prev.imageSettings?.showBorder || false,
                              borderRadius: prev.imageSettings?.borderRadius || 8
                            }
                          } : null)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                        <label className="block text-gray-400 text-sm mb-2 font-medium">Border Radius</label>
                        <div className="space-y-3">
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
                            className="slider w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>0px</span>
                            <span className="font-medium text-white">{editingOption.imageSettings?.borderRadius || 8}px</span>
                            <span>20px</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={editingOption.imageSettings?.showBorder || false}
                          onChange={(e) => setEditingOption(prev => prev ? {
                            ...prev,
                            imageSettings: {
                              ...prev.imageSettings,
                              size: prev.imageSettings?.size || 'medium',
                              aspectRatio: prev.imageSettings?.aspectRatio || '1:1',
                              showBorder: e.target.checked,
                              borderRadius: prev.imageSettings?.borderRadius || 8
                            }
                          } : null)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-gray-300 text-sm font-medium">Show Border</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Component Selector */}
                <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
                  <ComponentSelector
                    availableComponents={availableComponents}
                    selectedComponents={editingOption.targetComponents}
                    onSelectionChange={(components) => setEditingOption(prev => prev ? { ...prev, targetComponents: components } : null)}
                    placeholder="Select components to manipulate..."
                    label="Target Components"
                    alwaysModal={true}
                  />
                </div>

                {/* Option Values */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-semibold text-lg">Option Values</h4>
                      <p className="text-gray-400 text-sm">Configure the different states for this option</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (!editingOption) return;
                        const newValue = {
                          id: `value_${Date.now()}`,
                          name: 'New Option',
                          ...(editingOption.manipulationType === 'material' && { color: '#000000' }),
                          ...(editingOption.displayType === 'images' && { image: undefined, hideTitle: false }),
                          ...(editingOption.manipulationType === 'visibility' && { 
                            visibleComponents: [],
                            hiddenComponents: []
                          }),
                          conditionalLogic: ConditionalLogicEngine.createDefaultValueConditionalLogic()
                        };
                        setEditingOption(prev => prev ? { ...prev, values: [...prev.values, newValue] } : null);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 font-medium transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Value</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {editingOption.values.map((value, index) => (
                      <DragDropOptionValue
                        key={value.id}
                        value={value}
                        index={index}
                        manipulationType={editingOption.manipulationType}
                        displayType={editingOption.displayType}
                        availableComponents={availableComponents}
                        targetComponents={editingOption.targetComponents}
                        defaultBehavior={editingOption.defaultBehavior}
                        imageSettings={editingOption.imageSettings}
                        allOptions={activeConfigurator.options}
                        onMove={(dragIndex, hoverIndex) => {
                          if (!editingOption) return;
                          const values = [...editingOption.values];
                          const draggedValue = values[dragIndex];
                          values.splice(dragIndex, 1);
                          values.splice(hoverIndex, 0, draggedValue);
                          setEditingOption(prev => prev ? { ...prev, values } : null);
                        }}
                        onUpdate={(valueId, updates) => {
                          const updatedValues = editingOption.values.map(v => 
                            v.id === valueId ? { ...v, ...updates } : v
                          );
                          setEditingOption(prev => prev ? { ...prev, values: updatedValues } : null);
                        }}
                        onDelete={(valueId) => {
                          const updatedValues = editingOption.values.filter(v => v.id !== valueId);
                          setEditingOption(prev => prev ? { ...prev, values: updatedValues } : null);
                        }}
                        canDelete={editingOption.values.length > 1}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 flex space-x-4 bg-gray-750 rounded-b-xl">
              <button
                onClick={() => setShowOptionEditModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveOptionEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Conditional Logic Modal - Only render when editingOption exists */}
      {showConditionalLogicModal && editingOption && (
        <ConditionalLogicModal
          isOpen={showConditionalLogicModal}
          onClose={() => {
            setShowConditionalLogicModal(false);
            setEditingOption(null);
          }}
          onSave={saveConditionalLogic}
          currentOption={editingOption}
          allOptions={activeConfigurator.options}
          conditionalLogic={editingOption.conditionalLogic}
        />
      )}

      {/* New Configurator Modal */}
      {showNewConfiguratorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md"
          >
            <h3 className="text-white font-semibold text-lg mb-4">Create New Configurator</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addNewConfigurator(
                formData.get('name') as string,
                formData.get('description') as string,
                formData.get('modelUrl') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Configurator Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder="e.g., Premium Product Configurator"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Description</label>
                  <textarea
                    name="description"
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder="Brief description of this configurator"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">3D Model URL</label>
                  <input
                    name="modelUrl"
                    type="url"
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder="https://example.com/model.glb"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewConfiguratorModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  Create Configurator
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        details={confirmDialog.details}
        type={confirmDialog.type}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ConfiguratorBuilder;