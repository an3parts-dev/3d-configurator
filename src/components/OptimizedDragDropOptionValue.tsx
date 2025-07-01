import React, { useRef, useState, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { GripVertical, Trash2, Zap, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import ComponentSelector from './ComponentSelector';
import ImageUploader from './ImageUploader';
import ValueConditionalLogicModal from './ValueConditionalLogicModal';
import { ConfiguratorOptionValue, ConfiguratorOption, ImageSettings } from '../types/ConfiguratorTypes';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { logger } from '../utils/Logger';

interface ModelComponent {
  name: string;
  mesh: any;
  visible: boolean;
  material?: any;
}

interface OptimizedDragDropOptionValueProps {
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

const OptimizedDragDropOptionValue: React.FC<OptimizedDragDropOptionValueProps> = React.memo(({
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
  const [showConditionalLogicModal, setShowConditionalLogicModal] = useState(false);
  const performanceMonitor = PerformanceMonitor.getInstance();

  // Optimized drag configuration
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'optionValue',
    item: () => {
      const endTiming = performanceMonitor.startTiming('value-drag-start');
      logger.debug('Value drag started', { valueId: value.id, index });
      
      return { 
        id: value.id, 
        index,
        onDragEnd: endTiming
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item) => {
      if (item.onDragEnd) {
        item.onDragEnd();
      }
    }
  });

  // Optimized drop configuration with immediate switching
  const [{ isOver }, drop] = useDrop({
    accept: 'optionValue',
    hover: useCallback((item: { id: string; index: number }, monitor) => {
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

      // Immediate switching - switch places when crossing just 10% of the target
      if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY * 0.1) {
        onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
      
      if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY * 1.9) {
        onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    }, [index, onMove]),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Create invisible drag preview for smooth dragging
  React.useEffect(() => {
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    dragPreview(emptyImg, { anchorX: 0, anchorY: 0 });
  }, [dragPreview]);

  // Combine drag and drop refs
  const dragDropRef = drag(drop(ref));

  // Memoized filtered components to prevent unnecessary recalculations
  const filteredComponents = React.useMemo(() => {
    return availableComponents.filter(component => {
      const componentName = component.name.toLowerCase();
      return targetComponents.some(target => {
        const targetName = target.toLowerCase();
        return componentName === targetName;
      });
    });
  }, [availableComponents, targetComponents]);

  // Memoized conditional logic check
  const hasConditionalLogic = React.useMemo(() => 
    value.conditionalLogic?.enabled, 
    [value.conditionalLogic?.enabled]
  );

  // Optimized image size and aspect ratio classes
  const imageClasses = React.useMemo(() => {
    const sizeClass = !imageSettings ? 'h-24' : 
      imageSettings.size === 'small' ? 'h-16' :
      imageSettings.size === 'large' ? 'h-32' : 'h-24';
    
    const aspectClass = !imageSettings ? '' :
      imageSettings.aspectRatio === '1:1' ? 'aspect-square' :
      imageSettings.aspectRatio === '4:3' ? 'aspect-[4/3]' :
      imageSettings.aspectRatio === '16:9' ? 'aspect-video' :
      imageSettings.aspectRatio === '3:2' ? 'aspect-[3/2]' :
      imageSettings.aspectRatio === '2:3' ? 'aspect-[2/3]' : '';
    
    return { sizeClass, aspectClass };
  }, [imageSettings]);

  // Optimized event handlers with useCallback
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(value.id, { name: e.target.value });
  }, [value.id, onUpdate]);

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(value.id, { color: e.target.value });
  }, [value.id, onUpdate]);

  const handleImageChange = useCallback((imageUrl: string | undefined) => {
    onUpdate(value.id, { image: imageUrl });
  }, [value.id, onUpdate]);

  const handleHideTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(value.id, { hideTitle: e.target.checked });
  }, [value.id, onUpdate]);

  const handleVisibleComponentsChange = useCallback((components: string[]) => {
    onUpdate(value.id, { visibleComponents: components });
  }, [value.id, onUpdate]);

  const handleHiddenComponentsChange = useCallback((components: string[]) => {
    onUpdate(value.id, { hiddenComponents: components });
  }, [value.id, onUpdate]);

  const handleConditionalLogicSave = useCallback((conditionalLogic: any) => {
    onUpdate(value.id, { conditionalLogic });
    setShowConditionalLogicModal(false);
  }, [value.id, onUpdate]);

  const handleDelete = useCallback(() => {
    logger.debug('Delete value clicked', { valueId: value.id });
    onDelete(value.id);
  }, [value.id, onDelete]);

  const handleConditionalLogicClick = useCallback(() => {
    logger.debug('Edit value conditional logic clicked', { valueId: value.id });
    setShowConditionalLogicModal(true);
  }, [value.id]);

  return (
    <>
      <div ref={dragDropRef}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isDragging ? 0.6 : 1, 
            y: 0,
            scale: isDragging ? 1.02 : isOver ? 1.01 : 1,
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25,
            opacity: { duration: 0.15 },
            scale: { duration: 0.15 }
          }}
          className={`p-6 bg-gray-700 rounded-xl space-y-6 transition-all duration-150 border relative cursor-move ${
            isDragging
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

          {/* Header with drag handle and value name */}
          <div className="flex items-center space-x-4">
            <div className="cursor-grab active:cursor-grabbing flex-shrink-0 p-2 rounded-lg hover:bg-gray-600 transition-colors">
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            
            {manipulationType === 'material' && (
              <div className="relative">
                <input
                  type="color"
                  value={value.color || '#000000'}
                  onChange={handleColorChange}
                  className="w-12 h-12 rounded-lg border-2 border-gray-600 cursor-pointer shadow-sm"
                />
                <div className="absolute inset-0 rounded-lg border-2 border-gray-600 pointer-events-none"></div>
              </div>
            )}
            
            <input
              type="text"
              value={value.name}
              onChange={handleNameChange}
              className="flex-1 bg-gray-600 text-white text-sm font-medium focus:outline-none border border-gray-500 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              placeholder="Value name"
            />
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleConditionalLogicClick}
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
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"
                  title="Delete this value"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Image Upload for Images Display Type */}
          {displayType === 'images' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-3 font-medium">Option Image</label>
                  <div className={`w-full ${imageClasses.sizeClass} ${imageClasses.aspectClass}`}>
                    <ImageUploader
                      currentImage={value.image}
                      onImageChange={handleImageChange}
                      className="h-full w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={value.hideTitle || false}
                        onChange={handleHideTitleChange}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-gray-300 text-sm font-medium">Hide Title</span>
                    </label>
                    <p className="text-gray-500 text-xs mt-1 ml-7">
                      Hide the option name below the image
                    </p>
                  </div>

                  {/* Image Preview */}
                  {value.image && (
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <p className="text-gray-400 text-sm mb-3 font-medium">Preview</p>
                      <div className="bg-gray-900 p-3 rounded-lg">
                        <div className={`${imageClasses.sizeClass} ${imageClasses.aspectClass} mx-auto max-w-32`}>
                          <img
                            src={value.image}
                            alt={value.name}
                            className="w-full h-full object-cover rounded-lg"
                            loading="lazy"
                          />
                        </div>
                        {!value.hideTitle && (
                          <p className="text-white text-sm text-center mt-2 font-medium">
                            {value.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Component Selection for Visibility */}
          {manipulationType === 'visibility' && (
            <div className="space-y-4">
              {defaultBehavior === 'hide' ? (
                <div className="space-y-2">
                  <ComponentSelector
                    availableComponents={filteredComponents}
                    selectedComponents={value.visibleComponents || []}
                    onSelectionChange={handleVisibleComponentsChange}
                    placeholder="Select components to show..."
                    label="Components to Show"
                    alwaysModal={true}
                  />
                  <p className="text-gray-500 text-xs">
                    Showing {filteredComponents.length} target components (filtered from {availableComponents.length} total)
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ComponentSelector
                    availableComponents={filteredComponents}
                    selectedComponents={value.hiddenComponents || []}
                    onSelectionChange={handleHiddenComponentsChange}
                    placeholder="Select components to hide..."
                    label="Components to Hide"
                    alwaysModal={true}
                  />
                  <p className="text-gray-500 text-xs">
                    Showing {filteredComponents.length} target components (filtered from {availableComponents.length} total)
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
        onSave={handleConditionalLogicSave}
        valueName={value.name}
        allOptions={allOptions}
        conditionalLogic={value.conditionalLogic}
      />
    </>
  );
});

OptimizedDragDropOptionValue.displayName = 'OptimizedDragDropOptionValue';

export default OptimizedDragDropOptionValue;