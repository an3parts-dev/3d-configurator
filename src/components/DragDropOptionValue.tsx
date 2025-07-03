import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { GripVertical, Trash2, Zap, Image as ImageIcon, Upload, X, Droplets } from 'lucide-react';
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
  const colorInputRef = useRef<HTMLInputElement>(null);
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

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

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

  const dragDropRef = drop(ref);

  const filteredComponents = availableComponents.filter(component => {
    const componentName = component.name.toLowerCase();
    return targetComponents.some(target => {
      const targetName = target.toLowerCase();
      return componentName === targetName;
    });
  });

  const hasConditionalLogic = value.conditionalLogic?.enabled;

  // Generate precise upload box styles based on image settings
  const getUploadBoxStyles = () => {
    if (!imageSettings) {
      return {
        containerStyle: { width: '80px', height: '80px' },
        imageObjectFitClass: 'object-cover',
        borderRadius: '8px'
      };
    }
    
    let baseSizePx = 64; // Smaller default for mobile
    
    switch (imageSettings.size) {
      case 'x-small': baseSizePx = 40; break;
      case 'small': baseSizePx = 48; break;
      case 'medium': baseSizePx = 64; break;
      case 'large': baseSizePx = 80; break;
      case 'x-large': baseSizePx = 96; break;
    }

    let containerStyle: React.CSSProperties = {};
    let imageObjectFitClass = 'object-cover';

    // Handle aspect ratios with precise container sizing
    switch (imageSettings.aspectRatio) {
      case 'square':
        containerStyle = {
          width: `${baseSizePx}px`,
          height: `${baseSizePx}px`
        };
        imageObjectFitClass = 'object-cover';
        break;
      case 'round':
        containerStyle = {
          width: `${baseSizePx}px`,
          height: `${baseSizePx}px`
        };
        imageObjectFitClass = 'object-cover';
        break;
      case '3:2':
        containerStyle = {
          width: `${baseSizePx}px`,
          height: `${Math.round(baseSizePx * 2 / 3)}px`
        };
        imageObjectFitClass = 'object-cover';
        break;
      case '2:3':
        containerStyle = {
          width: `${Math.round(baseSizePx * 2 / 3)}px`,
          height: `${baseSizePx}px`
        };
        imageObjectFitClass = 'object-cover';
        break;
      case 'auto':
        containerStyle = {
          width: 'auto',
          height: 'auto',
          maxWidth: `${baseSizePx}px`,
          maxHeight: `${baseSizePx}px`
        };
        imageObjectFitClass = 'object-contain';
        break;
    }

    // Handle corner styles
    let borderRadius = '0px';
    switch (imageSettings.cornerStyle) {
      case 'squared': 
        borderRadius = '0px'; 
        break;
      case 'soft': 
        borderRadius = '4px'; 
        break;
      case 'softer': 
        borderRadius = '8px'; 
        break;
    }

    // Force round shape for round aspect ratio
    if (imageSettings.aspectRatio === 'round') {
      borderRadius = '50%';
    }

    containerStyle.borderRadius = borderRadius;

    return {
      containerStyle,
      imageObjectFitClass,
      borderRadius
    };
  };

  const { containerStyle, imageObjectFitClass, borderRadius } = getUploadBoxStyles();

  // Function to determine if text should be light or dark based on background color
  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark backgrounds, dark for light backgrounds
    return luminance > 0.5 ? '#374151' : '#ffffff';
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

  // Fixed color picker handler
  const handleColorPickerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    colorInputRef.current?.click();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(value.id, { color: e.target.value });
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
          className={`p-4 sm:p-6 bg-white dark:bg-gray-700 rounded-xl space-y-4 sm:space-y-6 transition-all duration-150 border relative ${
            isDraggingState
              ? 'border-blue-500 shadow-2xl shadow-blue-500/30 z-50'
              : isOver
              ? 'border-blue-400 shadow-lg shadow-blue-400/20 bg-blue-50/50 dark:bg-blue-500/5'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm'
          }`}
        >
          {/* Conditional Logic Indicator */}
          {hasConditionalLogic && (
            <div className="absolute -top-2 -right-2 bg-orange-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-700">
              <Zap className="w-3 h-3" />
            </div>
          )}

          {/* Header with controls - Mobile optimized */}
          <div className="flex items-center justify-between">
            {/* Left side - Drag Handle, Image Upload (for images), and Value Name */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              {/* Drag Handle */}
              <div 
                ref={drag}
                className="cursor-grab active:cursor-grabbing flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
              </div>

              {/* Image Upload - Only for Images Display Type - Moved to left */}
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
                    className="cursor-pointer hover:opacity-80 transition-opacity overflow-hidden relative group"
                    style={containerStyle}
                  >
                    {value.image ? (
                      <>
                        <img
                          src={value.image}
                          alt={value.name}
                          className={`w-full h-full ${imageObjectFitClass}`}
                          style={{ borderRadius }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex space-x-1">
                            <button
                              onClick={handleImageClick}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-1 sm:p-1.5 rounded transition-colors"
                            >
                              <Upload className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                            <button
                              onClick={handleRemoveImage}
                              className="bg-red-600 hover:bg-red-700 text-white p-1 sm:p-1.5 rounded transition-colors"
                            >
                              <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div 
                        className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800"
                        style={{ borderRadius }}
                      >
                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Value Name Input - Mobile optimized */}
              <div className="flex-1 max-w-xs sm:max-w-md">
                <input
                  type="text"
                  value={value.name}
                  onChange={(e) => onUpdate(value.id, { name: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white text-sm sm:text-base font-medium focus:outline-none border border-gray-300 dark:border-gray-500 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  placeholder="Value name"
                />
              </div>
            </div>

            {/* Center - Color picker for material manipulation */}
            {manipulationType === 'material' && (
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <div className="relative">
                  {/* Hidden color input */}
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={value.color || '#000000'}
                    onChange={handleColorChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ zIndex: -1 }}
                  />
                  {/* Visible color button */}
                  <button
                    type="button"
                    onClick={handleColorPickerClick}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 flex items-center justify-center relative overflow-hidden border-2 border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400"
                    style={{ 
                      backgroundColor: value.color || '#000000'
                    }}
                    title="Click to change color"
                  >
                    <Droplets 
                      className="w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200" 
                      style={{ 
                        color: getContrastColor(value.color || '#000000')
                      }}
                    />
                  </button>
                </div>
              </div>
            )}
            
            {/* Right side - Action Buttons - Mobile optimized */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button
                onClick={() => setShowConditionalLogicModal(true)}
                className={`p-2 rounded-lg transition-colors ${
                  hasConditionalLogic
                    ? 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-100 dark:bg-orange-500/10 hover:bg-orange-200 dark:hover:bg-orange-500/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10'
                }`}
                title="Edit Value Conditional Logic"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              {canDelete && (
                <button
                  onClick={() => onDelete(value.id)}
                  className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Delete this value"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Component Selection for Visibility - Mobile optimized */}
          {manipulationType === 'visibility' && (
            <div className="space-y-3 sm:space-y-4">
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