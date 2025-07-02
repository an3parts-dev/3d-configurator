import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { GripVertical, Trash2, Zap, Eye, EyeOff, Image as ImageIcon, Upload, X } from 'lucide-react';
import ComponentSelector from './ComponentSelector';
import ValueConditionalLogicModal from './ValueConditionalLogicModal';
import { ConfiguratorOptionValue, ConfiguratorOption, ImageSettings } from '../types/ConfiguratorTypes';

interface ModelComponent {
  name: string;
  mesh: any;
  visible: boolean;
  material?: any;
}

interface DragDropOptionValueProps {
  value: ConfiguratorOptionValue;
  index: number;
  manipulationType: 'visibility' | 'material';
  displayType: 'list' | 'buttons' | 'images';
  availableComponents: ModelComponent[];
  targetComponents: string[];
  defaultBehavior?: 'show' | 'hide';
  imageSettings?: ImageSettings;
  allOptions: ConfiguratorOption[];
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onUpdate: (valueId: string, updates: any) => void;
  onDelete: (valueId: string) => void;
  canDelete: boolean;
}

const DragDropOptionValue: React.FC<DragDropOptionValueProps> = ({
  value,
  index,
  manipulationType,
  displayType,
  availableComponents,
  targetComponents,
  defaultBehavior = 'hide',
  imageSettings,
  allOptions,
  onMove,
  onUpdate,
  onDelete,
  canDelete
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConditionalLogicModal, setShowConditionalLogicModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [{ isDraggingState }, drag] = useDrag({
    type: 'optionValue',
    item: () => {
      setIsDragging(true);
      return { id: value.id, index };
    },
    collect: (monitor) => ({
      isDraggingState: monitor.isDragging(),
    }),
    end: () => {
      setIsDragging(false);
    }
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'optionValue',
    hover: (item: { id: string; index: number }, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      // Get the bounding rectangle of the hovered element
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get the mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Immediate switching - switch places when touching
      if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY * 0.1) {
        onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
      
      if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY * 1.9) {
        onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Combine drag and drop refs
  const dragDropRef = drop(ref);

  // Filter available components to only show EXACT matches with target components
  const filteredComponents = availableComponents.filter(component => {
    const componentName = component.name.toLowerCase();
    return targetComponents.some(target => {
      const targetName = target.toLowerCase();
      return componentName === targetName;
    });
  });

  const hasConditionalLogic = value.conditionalLogic?.enabled;

  // Calculate component counts for the new text
  const getComponentCounts = () => {
    const totalTargeted = filteredComponents.length;
    let selectedCount = 0;

    if (defaultBehavior === 'hide') {
      selectedCount = value.visibleComponents?.length || 0;
    } else {
      selectedCount = value.hiddenComponents?.length || 0;
    }

    return { selectedCount, totalTargeted };
  };

  const { selectedCount, totalTargeted } = getComponentCounts();

  const getImageSizeClass = () => {
    if (!imageSettings) return 'h-24';
    
    switch (imageSettings.size) {
      case 'x-small': return 'h-12';
      case 'small': return 'h-16';
      case 'medium': return 'h-24';
      case 'large': return 'h-32';
      case 'x-large': return 'h-40';
      default: return 'h-24';
    }
  };

  const getAspectRatioClass = () => {
    if (!imageSettings) return 'aspect-square';
    
    switch (imageSettings.aspectRatio) {
      case '1:1': return 'aspect-square';
      case '4:3': return 'aspect-[4/3]';
      case '16:9': return 'aspect-video';
      case '3:2': return 'aspect-[3/2]';
      case '2:3': return 'aspect-[2/3]';
      case 'full': return ''; // No aspect ratio constraint for full size
      default: return 'aspect-square';
    }
  };

  const getUploadBoxClass = () => {
    const sizeClass = getImageSizeClass();
    
    // Always square when no image is uploaded
    if (!value.image) {
      return `${sizeClass} aspect-square`;
    }
    
    // Use current aspect ratio when image is uploaded
    const aspectClass = getAspectRatioClass();
    
    if (imageSettings?.aspectRatio === 'full') {
      return `${sizeClass} w-auto max-w-48`; // Full size with max width constraint
    }
    
    return `${sizeClass} ${aspectClass}`;
  };

  const getBorderStyles = () => {
    if (!imageSettings?.showBorder) return {};
    
    return {
      borderRadius: `${imageSettings.borderRadius || 8}px`,
      border: '2px solid #4b5563'
    };
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdate(value.id, { image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(value.id, { image: undefined });
  };

  return (
    <>
      <div ref={dragDropRef}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isDraggingState ? 0.6 : 1, 
            y: 0,
            scale: isDraggingState ? 1.02 : isOver ? 1.01 : 1,
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25,
            opacity: { duration: 0.15 },
            scale: { duration: 0.15 }
          }}
          className={`p-6 bg-gray-700 rounded-xl space-y-6 transition-all duration-150 border relative ${
            isDraggingState
              ? 'border-blue-500 shadow-2xl shadow-blue-500/30 z-50'
              : isOver
              ? 'border-blue-400 shadow-lg shadow-blue-400/20 bg-blue-500/5'
              : 'border-gray-600 hover:border-gray-500 shadow-sm'
          }`}
        >
          {/* Conditional Logic Indicator */}
          {hasConditionalLogic && (
            <div className="absolute -top-2 -right-2 bg-orange-600 text-white p-1.5 rounded-full shadow-lg border-2 border-gray-700">
              <Zap className="w-3 h-3" />
            </div>
          )}

          {/* Header with controls */}
          <div className="flex items-center justify-between">
            {/* Left side - Drag Handle and Value Name */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Drag Handle */}
              <div 
                ref={drag}
                className="cursor-grab active:cursor-grabbing flex-shrink-0 p-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>

              {/* Value Name Input */}
              <div className="flex-1 max-w-xs">
                <input
                  type="text"
                  value={value.name}
                  onChange={(e) => onUpdate(value.id, { name: e.target.value })}
                  className="w-full bg-gray-600 text-white text-sm font-medium focus:outline-none border border-gray-500 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  placeholder="Value name"
                />
              </div>
            </div>

            {/* Center - Controls based on type */}
            <div className="flex items-center space-x-4">
              {/* Hide Title Toggle for Images */}
              {displayType === 'images' && (
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => onUpdate(value.id, { hideTitle: !value.hideTitle })}
                    className={`p-2 rounded-lg transition-colors ${
                      value.hideTitle 
                        ? 'text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20' 
                        : 'text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20'
                    }`}
                    title={value.hideTitle ? 'Show title' : 'Hide title'}
                  >
                    {value.hideTitle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <span className="text-gray-400 text-xs font-medium">
                    {value.hideTitle ? 'Hidden' : 'Visible'}
                  </span>
                </div>
              )}

              {/* Color picker for material manipulation */}
              {manipulationType === 'material' && (
                <div className="relative flex-shrink-0">
                  <input
                    type="color"
                    value={value.color || '#000000'}
                    onChange={(e) => onUpdate(value.id, { color: e.target.value })}
                    className="w-12 h-12 rounded-lg border-2 border-gray-600 cursor-pointer shadow-sm"
                    title="Colour"
                  />
                  <div className="absolute inset-0 rounded-lg border-2 border-gray-600 pointer-events-none"></div>
                </div>
              )}

              {/* Image Upload/Preview for Images Display Type */}
              {displayType === 'images' && (
                <div className="flex-shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                  />
                  
                  <div
                    onClick={handleImageClick}
                    className={`${getUploadBoxClass()} border-2 border-dashed border-gray-600 cursor-pointer hover:border-gray-500 transition-colors overflow-hidden relative group bg-gray-800`}
                    style={value.image ? getBorderStyles() : { borderRadius: '8px' }}
                    title={value.image ? "Image" : "Upload Image"}
                  >
                    {value.image ? (
                      <>
                        <img
                          src={value.image}
                          alt={value.name}
                          className={`w-full h-full ${imageSettings?.aspectRatio === 'full' ? 'object-contain' : 'object-cover'}`}
                          style={getBorderStyles()}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex space-x-1">
                            <button
                              onClick={handleImageClick}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded transition-colors"
                            >
                              <Upload className="w-3 h-3" />
                            </button>
                            <button
                              onClick={handleRemoveImage}
                              className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-xs">Upload Image</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right side - Action Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => setShowConditionalLogicModal(true)}
                className={`p-2 rounded-lg transition-colors ${
                  hasConditionalLogic
                    ? 'text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20'
                    : 'text-gray-400 hover:text-orange-400 hover:bg-orange-500/10'
                }`}
                title="Edit Value Conditional Logic"
              >
                <Zap className="w-5 h-5" />
              </button>
              
              {canDelete && (
                <button
                  onClick={() => onDelete(value.id)}
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  title="Delete this value"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Component Selection for Visibility */}
          {manipulationType === 'visibility' && (
            <div className="space-y-4">
              {defaultBehavior === 'hide' ? (
                <div className="space-y-2">
                  <ComponentSelector
                    availableComponents={filteredComponents}
                    selectedComponents={value.visibleComponents || []}
                    onSelectionChange={(components) => onUpdate(value.id, { visibleComponents: components })}
                    placeholder="Select components to show..."
                    label="Components to Show"
                    alwaysModal={true}
                  />
                  <p className="text-gray-500 text-xs">
                    Showing {selectedCount} of {totalTargeted} target components ({filteredComponents.length} of {availableComponents.length} total)
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ComponentSelector
                    availableComponents={filteredComponents}
                    selectedComponents={value.hiddenComponents || []}
                    onSelectionChange={(components) => onUpdate(value.id, { hiddenComponents: components })}
                    placeholder="Select components to hide..."
                    label="Components to Hide"
                    alwaysModal={true}
                  />
                  <p className="text-gray-500 text-xs">
                    Hiding {selectedCount} of {totalTargeted} target components ({filteredComponents.length} of {availableComponents.length} total)
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Value Conditional Logic Modal */}
      <ValueConditionalLogicModal
        isOpen={showConditionalLogicModal}
        onClose={() => setShowConditionalLogicModal(false)}
        onSave={(conditionalLogic) => {
          onUpdate(value.id, { conditionalLogic });
          setShowConditionalLogicModal(false);
        }}
        valueName={value.name}
        allOptions={allOptions}
        conditionalLogic={value.conditionalLogic}
      />
    </>
  );
};

export default DragDropOptionValue;