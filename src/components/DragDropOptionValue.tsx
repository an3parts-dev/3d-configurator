import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, Trash2, Zap, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import ComponentSelector from './ComponentSelector';
import ImageUploader from './ImageUploader';
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
  const [showConditionalLogicModal, setShowConditionalLogicModal] = useState(false);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'optionValue',
    item: () => ({ id: value.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'optionValue',
    hover: (item: { id: string; index: number }, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Combine drag and drop refs, but use separate preview
  const dragDropRef = drop(ref);
  drag(dragDropRef);

  // Create a custom drag preview that's invisible (we'll show the actual element)
  React.useEffect(() => {
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    dragPreview(emptyImg, { anchorX: 0, anchorY: 0 });
  }, [dragPreview]);

  // Filter available components to only show EXACT matches with target components
  const filteredComponents = availableComponents.filter(component => {
    const componentName = component.name.toLowerCase();
    return targetComponents.some(target => {
      const targetName = target.toLowerCase();
      return componentName === targetName;
    });
  });

  const hasConditionalLogic = value.conditionalLogic?.enabled;

  const getImageSizeClass = () => {
    if (!imageSettings) return 'h-24';
    
    switch (imageSettings.size) {
      case 'small': return 'h-16';
      case 'medium': return 'h-24';
      case 'large': return 'h-32';
      default: return 'h-24';
    }
  };

  const getAspectRatioClass = () => {
    if (!imageSettings) return '';
    
    switch (imageSettings.aspectRatio) {
      case '1:1': return 'aspect-square';
      case '4:3': return 'aspect-[4/3]';
      case '16:9': return 'aspect-video';
      case '3:2': return 'aspect-[3/2]';
      case '2:3': return 'aspect-[2/3]';
      default: return '';
    }
  };

  return (
    <>
      <div 
        ref={dragDropRef}
        className={`p-6 bg-gray-700 rounded-xl space-y-6 transition-all duration-200 border relative cursor-move ${
          isOver
            ? 'border-blue-400 shadow-lg shadow-blue-400/10 scale-102'
            : 'border-gray-600 hover:border-gray-500 shadow-sm'
        }`}
        style={{
          opacity: isDragging ? 0.3 : 1,
          transform: isOver ? 'scale(1.02)' : undefined,
        }}
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
                onChange={(e) => onUpdate(value.id, { color: e.target.value })}
                className="w-12 h-12 rounded-lg border-2 border-gray-600 cursor-pointer shadow-sm"
              />
              <div className="absolute inset-0 rounded-lg border-2 border-gray-600 pointer-events-none"></div>
            </div>
          )}
          
          <input
            type="text"
            value={value.name}
            onChange={(e) => onUpdate(value.id, { name: e.target.value })}
            className="flex-1 bg-gray-600 text-white text-sm font-medium focus:outline-none border border-gray-500 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            placeholder="Value name"
          />
          
          <div className="flex items-center space-x-2">
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
                <div className={`w-full ${getImageSizeClass()} ${getAspectRatioClass()}`}>
                  <ImageUploader
                    currentImage={value.image}
                    onImageChange={(imageUrl) => onUpdate(value.id, { image: imageUrl })}
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
                      onChange={(e) => onUpdate(value.id, { hideTitle: e.target.checked })}
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
                      <div className={`${getImageSizeClass()} ${getAspectRatioClass()} mx-auto max-w-32`}>
                        <img
                          src={value.image}
                          alt={value.name}
                          className="w-full h-full object-cover rounded-lg"
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
                  onSelectionChange={(components) => onUpdate(value.id, { visibleComponents: components })}
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
                  onSelectionChange={(components) => onUpdate(value.id, { hiddenComponents: components })}
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