import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, Zap, Eye, EyeOff, Image as ImageIcon, Palette } from 'lucide-react';
import ComponentSelector from './ComponentSelector';
import ImageUploader from './ImageUploader';
import ValueConditionalLogicModal from './ValueConditionalLogicModal';
import { ConfiguratorOptionValue, ConfiguratorOption, ImageSettings } from '../types/ConfiguratorTypes';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { Separator } from './ui/separator';
import { cn } from '../lib/utils';

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
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'optionValue',
    item: () => ({ id: value.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
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
      canDrop: monitor.canDrop(),
    }),
  });

  // Create invisible drag preview
  React.useEffect(() => {
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    dragPreview(emptyImg, { anchorX: 0, anchorY: 0 });
  }, [dragPreview]);

  const dragDropRef = drop(ref);
  const dragRef = drag(dragDropRef);

  // Filter available components to only show EXACT matches with target components
  const filteredComponents = availableComponents.filter(component => {
    const componentName = component.name.toLowerCase();
    return targetComponents.some(target => {
      const targetName = target.toLowerCase();
      return componentName === targetName;
    });
  });

  const hasConditionalLogic = value.conditionalLogic?.enabled;
  const showDropZone = isOver && canDrop;

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
    <TooltipProvider>
      <>
        <div 
          ref={dragDropRef}
          className={cn(
            "relative group transition-all duration-200",
            isDragging && "dragging",
            showDropZone && "drop-zone-hover"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Card className={cn(
            "transition-all duration-200 border-2",
            isDragging 
              ? 'border-primary shadow-2xl shadow-primary/20' 
              : showDropZone
              ? 'border-primary/50 bg-primary/5 shadow-lg'
              : 'border-border hover:border-primary/30 hover:shadow-md',
            "relative overflow-hidden"
          )}>
            {/* Conditional Logic Indicator */}
            <AnimatePresence>
              {hasConditionalLogic && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-2 -right-2 z-10"
                >
                  <Badge variant="default" className="bg-orange-600 hover:bg-orange-700 shadow-lg">
                    <Zap className="w-3 h-3" />
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drop Zone Indicator */}
            <AnimatePresence>
              {showDropZone && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-lg flex items-center justify-center z-20"
                >
                  <Badge variant="default" className="shadow-lg">
                    Drop here to reorder
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>

            <CardContent className="p-6 space-y-6">
              {/* Header with drag handle and value name */}
              <div className="flex items-center space-x-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      ref={dragRef}
                      className="drag-handle p-2 rounded-lg transition-all duration-200 hover:bg-accent/50 active:bg-accent touch-manipulation"
                    >
                      <GripVertical className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Drag to reorder</p>
                  </TooltipContent>
                </Tooltip>
                
                {/* Color picker for material manipulation */}
                {manipulationType === 'material' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <input
                          type="color"
                          value={value.color || '#000000'}
                          onChange={(e) => onUpdate(value.id, { color: e.target.value })}
                          className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer shadow-sm hover:shadow-md transition-shadow micro-interaction focus-ring"
                        />
                        <div className="absolute inset-0 rounded-lg border-2 border-border pointer-events-none"></div>
                        <Palette className="absolute -bottom-1 -right-1 w-4 h-4 text-muted-foreground bg-background rounded-full p-0.5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Choose color</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                <div className="flex-1">
                  <Label htmlFor={`value-name-${value.id}`} className="sr-only">
                    Value name
                  </Label>
                  <Input
                    id={`value-name-${value.id}`}
                    type="text"
                    value={value.name}
                    onChange={(e) => onUpdate(value.id, { name: e.target.value })}
                    className="text-sm font-medium focus-ring"
                    placeholder="Value name"
                  />
                </div>
                
                <div className={cn(
                  "flex items-center space-x-2 transition-all duration-200",
                  isHovered ? "opacity-100" : "opacity-60"
                )}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowConditionalLogicModal(true)}
                        className={cn(
                          "h-8 w-8 micro-interaction focus-ring",
                          hasConditionalLogic
                            ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10'
                            : 'text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10'
                        )}
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit Value Conditional Logic</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {canDelete && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(value.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10 micro-interaction focus-ring"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete this value</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Image Upload for Images Display Type */}
              {displayType === 'images' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Option Image</Label>
                        <div className={cn("w-full", getImageSizeClass(), getAspectRatioClass())}>
                          <ImageUploader
                            currentImage={value.image}
                            onImageChange={(imageUrl) => onUpdate(value.id, { image: imageUrl })}
                            className="h-full w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`hide-title-${value.id}`}
                            checked={value.hideTitle || false}
                            onChange={(e) => onUpdate(value.id, { hideTitle: e.target.checked })}
                            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                          />
                          <Label htmlFor={`hide-title-${value.id}`} className="text-sm font-medium">
                            Hide Title
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Hide the option name below the image
                        </p>

                        {/* Image Preview */}
                        {value.image && (
                          <Card className="bg-muted/50">
                            <CardContent className="p-4">
                              <Label className="text-sm font-medium mb-3 block">Preview</Label>
                              <div className="bg-background p-3 rounded-lg border">
                                <div className={cn(getImageSizeClass(), getAspectRatioClass(), "mx-auto max-w-32")}>
                                  <img
                                    src={value.image}
                                    alt={value.name}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                </div>
                                {!value.hideTitle && (
                                  <p className="text-foreground text-sm text-center mt-2 font-medium">
                                    {value.name}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Component Selection for Visibility */}
              {manipulationType === 'visibility' && (
                <>
                  <Separator />
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
                        <p className="text-xs text-muted-foreground">
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
                        <p className="text-xs text-muted-foreground">
                          Showing {filteredComponents.length} target components (filtered from {availableComponents.length} total)
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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
    </TooltipProvider>
  );
};

export default DragDropOptionValue;