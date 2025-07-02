import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Settings, 
  Layers, 
  Eye, 
  EyeOff,
  Image as ImageIcon,
  List,
  Grid3X3,
  FolderOpen
} from 'lucide-react';
import DragDropOptionValue from './DragDropOptionValue';
import ComponentSelector from './ComponentSelector';
import { 
  ConfiguratorOption, 
  ConfiguratorOptionValue, 
  ImageSettings,
  ConfiguratorOptionGroup
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
      aspectRatio: '1:1',
      cornerStyle: 'soft'
    }
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'display' | 'values'>('basic');

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
            aspectRatio: '1:1',
            cornerStyle: 'soft'
          },
          groupId: option.groupId
        });
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
            aspectRatio: '1:1',
            cornerStyle: 'soft'
          }
        });
      }
      setActiveTab('basic');
    }
  }, [isOpen, option]);

  const handleSave = () => {
    if (formData.name.trim() && formData.targetComponents.length > 0) {
      onSave(formData);
    }
  };

  const updateImageSettings = (updates: Partial<ImageSettings>) => {
    setFormData(prev => ({
      ...prev,
      imageSettings: { ...prev.imageSettings!, ...updates }
    }));
  };

  const handleAddValue = () => {
    if (option) {
      onAddValue(option.id);
    }
  };

  const handleUpdateValue = (valueId: string, updates: Partial<ConfiguratorOptionValue>) => {
    if (option) {
      onUpdateValue(option.id, valueId, updates);
    }
  };

  const handleDeleteValue = (valueId: string) => {
    if (option) {
      onDeleteValue(option.id, valueId);
    }
  };

  const handleMoveValue = (dragIndex: number, hoverIndex: number) => {
    if (option) {
      onMoveValue(option.id, dragIndex, hoverIndex);
    }
  };

  // Generate preview image based on current settings
  const getPreviewImageStyles = () => {
    const settings = formData.imageSettings!;
    
    let baseSize = 80; // Base size for preview
    
    switch (settings.size) {
      case 'x-small': baseSize = 48; break;
      case 'small': baseSize = 64; break;
      case 'medium': baseSize = 80; break;
      case 'large': baseSize = 96; break;
      case 'x-large': baseSize = 128; break;
    }

    let width = baseSize;
    let height = baseSize;

    // Adjust dimensions based on aspect ratio
    if (settings.aspectRatio !== 'full') {
      switch (settings.aspectRatio) {
        case '1:1':
          // Square - keep both dimensions the same
          break;
        case '4:3':
          width = baseSize;
          height = Math.round(baseSize * 3 / 4);
          break;
        case '16:9':
          width = baseSize;
          height = Math.round(baseSize * 9 / 16);
          break;
        case '3:2':
          width = baseSize;
          height = Math.round(baseSize * 2 / 3);
          break;
        case '2:3':
          width = Math.round(baseSize * 2 / 3);
          height = baseSize;
          break;
      }
    }

    let borderRadius = '0px';
    switch (settings.cornerStyle) {
      case 'squared': borderRadius = '0px'; break;
      case 'soft': borderRadius = '4px'; break;
      case 'rounded': borderRadius = '50%'; break;
    }

    return {
      width: `${width}px`,
      height: `${height}px`,
      borderRadius,
      maxWidth: '120px',
      maxHeight: '120px'
    };
  };

  if (!isOpen) return null;

  const isEditing = !!option;
  const canSave = formData.name.trim() && formData.targetComponents.length > 0;
  const previewStyles = getPreviewImageStyles();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-800 rounded-xl border border-gray-600 shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-750 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-xl">
                  {isEditing ? 'Edit Option' : 'Create Option'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {isEditing ? 'Modify option settings and values' : 'Configure a new configurator option'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-6 bg-gray-700 p-1 rounded-lg">
            {[
              { id: 'basic', label: 'Basic Settings', icon: Settings },
              { id: 'display', label: 'Display & Style', icon: Eye },
              { id: 'values', label: 'Option Values', icon: List }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
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

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 space-y-6"
              >
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">
                      Option Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter option name..."
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">
                      Group Assignment
                    </label>
                    <select
                      value={formData.groupId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, groupId: e.target.value || undefined }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">No Group (Standalone)</option>
                      {availableGroups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    {formData.groupId && (
                      <p className="text-gray-500 text-xs mt-1 flex items-center">
                        <FolderOpen className="w-3 h-3 mr-1" />
                        This option will be grouped under "{availableGroups.find(g => g.id === formData.groupId)?.name}"
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description for this option..."
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                {/* Manipulation Type */}
                <div>
                  <label className="block text-gray-400 text-sm mb-3 font-medium">
                    Manipulation Type *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, manipulationType: 'visibility' }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.manipulationType === 'visibility'
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <Eye className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">Visibility</div>
                        <div className="text-sm opacity-80">Show/hide components</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, manipulationType: 'material' }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.manipulationType === 'material'
                          ? 'border-green-500 bg-green-500/20 text-green-300'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-6 h-6 mx-auto mb-2 bg-gradient-to-r from-red-400 to-blue-400 rounded"></div>
                        <div className="font-semibold">Material</div>
                        <div className="text-sm opacity-80">Change colors/materials</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Target Components */}
                <div>
                  <ComponentSelector
                    availableComponents={modelComponents}
                    selectedComponents={formData.targetComponents}
                    onSelectionChange={(components) => setFormData(prev => ({ ...prev, targetComponents: components }))}
                    placeholder="Select target components..."
                    label="Target Components *"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    These components will be affected by this option's values
                  </p>
                </div>

                {/* Default Behavior for Visibility */}
                {formData.manipulationType === 'visibility' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-3 font-medium">
                      Default Behavior
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, defaultBehavior: 'hide' }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.defaultBehavior === 'hide'
                            ? 'border-red-500 bg-red-500/20 text-red-300'
                            : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-center">
                          <EyeOff className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-semibold">Hide by Default</div>
                          <div className="text-sm opacity-80">Hide targets, show selected</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, defaultBehavior: 'show' }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.defaultBehavior === 'show'
                            ? 'border-green-500 bg-green-500/20 text-green-300'
                            : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-center">
                          <Eye className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-semibold">Show by Default</div>
                          <div className="text-sm opacity-80">Show targets, hide selected</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'display' && (
              <motion.div
                key="display"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 space-y-6"
              >
                {/* Display Type */}
                <div>
                  <label className="block text-gray-400 text-sm mb-3 font-medium">
                    Display Type
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, displayType: 'list' }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.displayType === 'list'
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <List className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">List</div>
                        <div className="text-sm opacity-80">Dropdown list</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, displayType: 'buttons' }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.displayType === 'buttons'
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <Grid3X3 className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">Buttons</div>
                        <div className="text-sm opacity-80">Button grid</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, displayType: 'images' }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.displayType === 'images'
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <ImageIcon className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">Images</div>
                        <div className="text-sm opacity-80">Image gallery</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Display Direction - Only show for buttons and images */}
                {(formData.displayType === 'buttons' || formData.displayType === 'images') && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-3 font-medium">
                      Direction
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, displayDirection: 'row' }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.displayDirection === 'row'
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                            : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold">Row</div>
                          <div className="text-sm opacity-80">Horizontal layout</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, displayDirection: 'column' }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.displayDirection === 'column'
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                            : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold">Column</div>
                          <div className="text-sm opacity-80">Vertical layout</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Settings - No Frame */}
                {formData.displayType === 'images' && (
                  <div className="space-y-6">
                    <h4 className="text-white font-semibold text-lg">Image Settings</h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Column - Size and Aspect Ratio */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Image Size */}
                        <div>
                          <label className="block text-gray-400 text-sm mb-2 font-medium">Size</label>
                          <select
                            value={formData.imageSettings?.size || 'medium'}
                            onChange={(e) => updateImageSettings({ size: e.target.value as any })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                          >
                            <option value="x-small">Extra Small (48px)</option>
                            <option value="small">Small (64px)</option>
                            <option value="medium">Medium (80px)</option>
                            <option value="large">Large (96px)</option>
                            <option value="x-large">Extra Large (128px)</option>
                          </select>
                        </div>

                        {/* Aspect Ratio */}
                        <div>
                          <label className="block text-gray-400 text-sm mb-2 font-medium">Aspect Ratio</label>
                          <select
                            value={formData.imageSettings?.aspectRatio || '1:1'}
                            onChange={(e) => updateImageSettings({ aspectRatio: e.target.value as any })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                          >
                            <option value="1:1">Square (1:1)</option>
                            <option value="4:3">Standard (4:3)</option>
                            <option value="16:9">Widescreen (16:9)</option>
                            <option value="3:2">Photo (3:2)</option>
                            <option value="2:3">Portrait (2:3)</option>
                            <option value="full">Full Size</option>
                          </select>
                        </div>
                      </div>

                      {/* Right Column - Preview */}
                      <div className="flex flex-col items-center justify-center">
                        <label className="block text-gray-400 text-sm mb-3 font-medium text-center">Preview</label>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 flex items-center justify-center">
                          <div
                            className="bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-gray-500 flex items-center justify-center"
                            style={{
                              width: previewStyles.width,
                              height: previewStyles.height,
                              borderRadius: previewStyles.borderRadius,
                              maxWidth: previewStyles.maxWidth,
                              maxHeight: previewStyles.maxHeight
                            }}
                          >
                            <ImageIcon className="w-6 h-6 text-white opacity-80" />
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs mt-2 text-center">
                          {formData.imageSettings?.size} • {formData.imageSettings?.aspectRatio} • {formData.imageSettings?.cornerStyle}
                        </p>
                      </div>
                    </div>

                    {/* Corner Style - Full Width */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-3 font-medium">Corner Style</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => updateImageSettings({ cornerStyle: 'squared' })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.imageSettings?.cornerStyle === 'squared'
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                              : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="w-8 h-8 bg-gray-500 mx-auto mb-2" style={{ borderRadius: '0px' }}></div>
                            <div className="font-semibold text-sm">Squared</div>
                          </div>
                        </button>
                        <button
                          onClick={() => updateImageSettings({ cornerStyle: 'soft' })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.imageSettings?.cornerStyle === 'soft'
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                              : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="w-8 h-8 bg-gray-500 mx-auto mb-2" style={{ borderRadius: '4px' }}></div>
                            <div className="font-semibold text-sm">Soft</div>
                          </div>
                        </button>
                        <button
                          onClick={() => updateImageSettings({ cornerStyle: 'rounded' })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.imageSettings?.cornerStyle === 'rounded'
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                              : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="w-8 h-8 bg-gray-500 rounded-full mx-auto mb-2"></div>
                            <div className="font-semibold text-sm">Rounded</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'values' && (
              <motion.div
                key="values"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-white font-semibold text-lg">Option Values</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Configure the different choices users can select for this option
                    </p>
                  </div>
                  <button
                    onClick={handleAddValue}
                    disabled={!isEditing}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      isEditing
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Value</span>
                  </button>
                </div>

                {!isEditing ? (
                  <div className="text-center py-12 text-gray-500">
                    <List className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Save option first</p>
                    <p className="text-sm mt-2">You need to save the option before adding values</p>
                  </div>
                ) : option?.values.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <List className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No values yet</p>
                    <p className="text-sm mt-2">Add your first value to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {option?.values.map((value, index) => (
                      <DragDropOptionValue
                        key={value.id}
                        value={value}
                        index={index}
                        manipulationType={formData.manipulationType}
                        displayType={formData.displayType}
                        availableComponents={modelComponents}
                        targetComponents={formData.targetComponents}
                        defaultBehavior={formData.defaultBehavior}
                        imageSettings={formData.imageSettings}
                        allOptions={allOptions}
                        onMove={handleMoveValue}
                        onUpdate={handleUpdateValue}
                        onDelete={handleDeleteValue}
                        canDelete={option.values.length > 1}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-750 rounded-b-xl flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex-1 py-3 px-4 rounded-lg transition-colors font-medium ${
              canSave
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isEditing ? 'Update Option' : 'Create Option'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OptionEditModal;