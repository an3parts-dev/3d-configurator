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
  Sparkles,
  Monitor
} from 'lucide-react';
import ThreeJSPreview from '../components/ThreeJSPreview';
import ComponentSelector from '../components/ComponentSelector';
import DragDropOption from '../components/DragDropOption';
import DragDropOptionValue from '../components/DragDropOptionValue';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ConditionalLogicModal from '../components/ConditionalLogicModal';
import { ConfiguratorOption, ConfiguratorData, ModelComponent, ConditionalLogic, ImageSettings } from '../types/ConfiguratorTypes';
import { ConditionalLogicEngine } from '../utils/ConditionalLogicEngine';
import { useConfiguratorPersistence } from '../hooks/useConfiguratorPersistence';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../components/ui/tooltip';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

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
        aspectRatio: '1:1'
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
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold">Loading Configurator</h2>
            <p className="text-muted-foreground text-sm">Restoring your saved work...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex bg-background">
        {/* Left Panel - Configuration */}
        <div className="w-1/2 bg-background flex flex-col border-r border-border">
          {/* Header */}
          <div className="p-6 border-b border-border flex-shrink-0 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 space-y-2">
                <Select value={activeConfiguratorId} onValueChange={setActiveConfiguratorId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {configurators.map(config => (
                      <SelectItem key={config.id} value={config.id}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-sm">{activeConfigurator.description}</p>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => setShowNewConfiguratorModal(true)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create New Configurator</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleExport}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export Configurations</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleImport}
                      disabled={isImporting}
                      size="sm"
                      variant="outline"
                    >
                      {isImporting ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-1" />
                      )}
                      Import
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Import Configurations</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleClearStorage}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear All Data</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Auto-save status */}
            <AnimatePresence>
              {lastSaved && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg"
                >
                  <Clock className="w-3 h-3" />
                  <span>Auto-saved {lastSaved.toLocaleTimeString()}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Model Information */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg">
                    <Box className="w-5 h-5 mr-2 text-primary" />
                    3D Model
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="model-url">Model URL</Label>
                    <Input
                      id="model-url"
                      type="url"
                      value={activeConfigurator.model}
                      onChange={(e) => {
                        setConfigurators(prev => prev.map(config => 
                          config.id === activeConfiguratorId 
                            ? { ...config, model: e.target.value }
                            : config
                        ));
                      }}
                      placeholder="https://example.com/model.glb"
                      className="focus-ring"
                    />
                  </div>
                  {availableComponents.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge variant="default" className="bg-green-600">
                        ✓ Loaded
                      </Badge>
                      <span className="text-muted-foreground">
                        {availableComponents.length} components detected
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add New Option */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Settings className="w-5 h-5 mr-2 text-primary" />
                      Configuration Options
                    </CardTitle>
                    <Button
                      onClick={() => setShowNewOptionModal(true)}
                      size="sm"
                      className="micro-interaction"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Options List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {activeConfigurator.options.map((option, index) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <DragDropOption
                        option={option}
                        index={index}
                        onMove={moveOption}
                        onEdit={openOptionEditModal}
                        onDelete={deleteOption}
                        onEditConditionalLogic={openConditionalLogicModal}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {activeConfigurator.options.length === 0 && (
                  <Card className="border-dashed border-2">
                    <CardContent className="text-center py-12">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <Settings className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-foreground font-medium">No configuration options yet</h3>
                          <p className="text-muted-foreground text-sm">
                            Click "Add Option" to create your first configuration
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowNewOptionModal(true)}
                          className="micro-interaction"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Option
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - 3D Preview */}
        <div className="w-1/2 bg-muted/30 flex flex-col">
          <div className="p-4 border-b border-border flex-shrink-0 bg-card">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Monitor className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-foreground font-semibold">Live Preview</h2>
                <p className="text-muted-foreground text-sm">Real-time 3D model with advanced conditional logic</p>
              </div>
              {activeConfigurator.options.some(opt => opt.conditionalLogic?.enabled || opt.values.some(v => v.conditionalLogic?.enabled)) && (
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20 ml-auto">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Smart Logic Active
                </Badge>
              )}
            </div>
          </div>
          <div className="flex-1">
            <ThreeJSPreview 
              key={activeConfigurator.id}
              configuratorData={activeConfigurator} 
              onComponentsLoaded={handleComponentsLoaded}
            />
          </div>
        </div>

        {/* Modals and Dialogs */}
        {/* New Option Modal */}
        <AnimatePresence>
          {showNewOptionModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Add New Configuration Option</CardTitle>
                    <CardDescription>Create a new option to customize your 3D model</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                          <Label htmlFor="option-name">Option Name</Label>
                          <Input
                            id="option-name"
                            name="name"
                            required
                            placeholder="e.g., Fitting Type"
                            className="focus-ring"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="manipulation-type">Manipulation Type</Label>
                          <Select name="manipulationType" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select manipulation type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="visibility">Visibility (Show/Hide Components)</SelectItem>
                              <SelectItem value="material">Material (Change Colors/Materials)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="display-type">Display Type</Label>
                          <Select name="displayType" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select display type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buttons">Buttons</SelectItem>
                              <SelectItem value="list">List</SelectItem>
                              <SelectItem value="images">Images</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewOptionModal(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                          Create Option
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Option Modal */}
        <AnimatePresence>
          {showOptionEditModal && editingOption && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-7xl max-h-[95vh] flex flex-col"
              >
                <Card className="flex flex-col h-full">
                  {/* Modal Header */}
                  <CardHeader className="flex-shrink-0 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Edit className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle>Edit Option</CardTitle>
                          <CardDescription>{editingOption.name}</CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowOptionEditModal(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Modal Content */}
                  <CardContent className="flex-1 overflow-auto p-6">
                    <div className="space-y-8">
                      {/* Basic Settings */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="edit-option-name">Option Name</Label>
                          <Input
                            id="edit-option-name"
                            type="text"
                            value={editingOption.name}
                            onChange={(e) => setEditingOption(prev => prev ? { ...prev, name: e.target.value } : null)}
                            placeholder="Option name"
                            className="focus-ring"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-display-type">Display Type</Label>
                          <Select
                            value={editingOption.displayType}
                            onValueChange={(value: 'list' | 'buttons' | 'images') => {
                              setEditingOption(prev => prev ? { 
                                ...prev, 
                                displayType: value,
                                imageSettings: value === 'images' ? {
                                  size: 'medium',
                                  aspectRatio: '1:1'
                                } : undefined
                              } : null);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buttons">Buttons</SelectItem>
                              <SelectItem value="list">List</SelectItem>
                              <SelectItem value="images">Images</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Image Settings for Images Display Type */}
                      {editingOption.displayType === 'images' && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                              <ImageIcon className="w-5 h-5 mr-2 text-blue-400" />
                              Image Settings
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <Label htmlFor="image-size">Image Size</Label>
                                <Select
                                  value={editingOption.imageSettings?.size || 'medium'}
                                  onValueChange={(value: 'small' | 'medium' | 'large') => setEditingOption(prev => prev ? {
                                    ...prev,
                                    imageSettings: {
                                      ...prev.imageSettings,
                                      size: value,
                                      aspectRatio: prev.imageSettings?.aspectRatio || '1:1'
                                    }
                                  } : null)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="small">Small</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="large">Large</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                                <Select
                                  value={editingOption.imageSettings?.aspectRatio || '1:1'}
                                  onValueChange={(value: '1:1' | '4:3' | '16:9' | '3:2' | '2:3') => setEditingOption(prev => prev ? {
                                    ...prev,
                                    imageSettings: {
                                      ...prev.imageSettings,
                                      size: prev.imageSettings?.size || 'medium',
                                      aspectRatio: value
                                    }
                                  } : null)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                                    <SelectItem value="4:3">Standard (4:3)</SelectItem>
                                    <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                                    <SelectItem value="3:2">Photo (3:2)</SelectItem>
                                    <SelectItem value="2:3">Portrait (2:3)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Default Behavior for Visibility Options */}
                      {editingOption.manipulationType === 'visibility' && (
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="flex items-center text-lg">
                                  <Settings className="w-5 h-5 mr-2 text-blue-400" />
                                  Default Behavior
                                </CardTitle>
                                <CardDescription>How should components behave by default?</CardDescription>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Label htmlFor="default-behavior-switch" className="text-sm">
                                  {editingOption.defaultBehavior === 'hide' ? 'Hide by Default' : 'Show by Default'}
                                </Label>
                                <Switch
                                  id="default-behavior-switch"
                                  checked={editingOption.defaultBehavior === 'show'}
                                  onCheckedChange={(checked) => setEditingOption(prev => prev ? { 
                                    ...prev, 
                                    defaultBehavior: checked ? 'show' : 'hide' 
                                  } : null)}
                                />
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-muted/50 rounded-lg p-4">
                              <p className="text-sm text-muted-foreground">
                                {editingOption.defaultBehavior === 'hide' ? (
                                  <>
                                    <strong>Hide by Default:</strong> All target components will be hidden initially. 
                                    For each option value, you'll specify which components to <em>show</em>.
                                  </>
                                ) : (
                                  <>
                                    <strong>Show by Default:</strong> All target components will be visible initially. 
                                    For each option value, you'll specify which components to <em>hide</em>.
                                  </>
                                )}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Component Selector */}
                      <Card>
                        <CardContent className="p-6">
                          <ComponentSelector
                            availableComponents={availableComponents}
                            selectedComponents={editingOption.targetComponents}
                            onSelectionChange={(components) => setEditingOption(prev => prev ? { ...prev, targetComponents: components } : null)}
                            placeholder="Select components to manipulate..."
                            label="Target Components"
                            alwaysModal={true}
                          />
                        </CardContent>
                      </Card>

                      {/* Option Values */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>Option Values</CardTitle>
                              <CardDescription>Configure the different states for this option</CardDescription>
                            </div>
                            <Button 
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
                              size="sm"
                              className="micro-interaction"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Value
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <AnimatePresence>
                              {editingOption.values.map((value, index) => (
                                <motion.div
                                  key={value.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <DragDropOptionValue
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
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>

                  {/* Modal Footer */}
                  <div className="p-6 border-t flex space-x-4 flex-shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => setShowOptionEditModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveOptionEdit}
                      className="flex-1"
                    >
                      Save Changes
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Conditional Logic Modal */}
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
        <AnimatePresence>
          {showNewConfiguratorModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Create New Configurator</CardTitle>
                    <CardDescription>Set up a new 3D product configurator</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                          <Label htmlFor="configurator-name">Configurator Name</Label>
                          <Input
                            id="configurator-name"
                            name="name"
                            required
                            placeholder="e.g., Premium Product Configurator"
                            className="focus-ring"
                          />
                        </div>
                        <div>
                          <Label htmlFor="configurator-description">Description</Label>
                          <Input
                            id="configurator-description"
                            name="description"
                            required
                            placeholder="Brief description of this configurator"
                            className="focus-ring"
                          />
                        </div>
                        <div>
                          <Label htmlFor="configurator-model">3D Model URL</Label>
                          <Input
                            id="configurator-model"
                            name="modelUrl"
                            type="url"
                            required
                            placeholder="https://example.com/model.glb"
                            className="focus-ring"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewConfiguratorModal(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                          Create Configurator
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
    </TooltipProvider>
  );
};

export default ConfiguratorBuilder;