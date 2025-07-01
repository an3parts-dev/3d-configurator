import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GripVertical,
  Edit,
  Trash2,
  Layers,
  List,
  Grid3X3,
  Zap,
  Eye,
  EyeOff,
  MoreVertical
} from 'lucide-react';
import { ConfiguratorOption } from '../types/ConfiguratorTypes';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { cn } from '../lib/utils';

interface DragDropOptionProps {
  option: ConfiguratorOption;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  onEditConditionalLogic: (option: ConfiguratorOption) => void;
}

const DragDropOption: React.FC<DragDropOptionProps> = ({
  option,
  index,
  onMove,
  onEdit,
  onDelete,
  onEditConditionalLogic
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'option',
    item: () => ({ 
      id: option.id, 
      index, 
      type: 'option'
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'option',
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

  const hasConditionalLogic = option.conditionalLogic?.enabled;
  const showDropZone = isOver && canDrop;

  const getDisplayTypeIcon = () => {
    switch (option.displayType) {
      case 'list': return <List className="w-4 h-4" />;
      case 'buttons': return <Grid3X3 className="w-4 h-4" />;
      case 'images': return <Eye className="w-4 h-4" />;
      default: return <List className="w-4 h-4" />;
    }
  };

  const getManipulationTypeColor = () => {
    return option.manipulationType === 'visibility' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400';
  };

  return (
    <TooltipProvider>
      <div ref={dragDropRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isDragging ? 0.3 : 1, 
            y: 0,
            scale: showDropZone ? 1.02 : 1,
            rotateX: isDragging ? 5 : 0,
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            opacity: { duration: 0.2 },
            scale: { duration: 0.2 },
          }}
          className={cn(
            "relative group",
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
                  <Badge variant="default" className="bg-purple-600 hover:bg-purple-700 shadow-lg">
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

            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Drag Handle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        ref={dragRef}
                        className={cn(
                          "drag-handle p-2 rounded-lg transition-all duration-200",
                          "hover:bg-accent/50 active:bg-accent",
                          "touch-manipulation"
                        )}
                      >
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Drag to reorder</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {/* Option Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={cn(
                        "p-1.5 rounded-md",
                        getManipulationTypeColor()
                      )}>
                        <Layers className="w-4 h-4" />
                      </div>
                      <h4 className="text-foreground font-semibold text-lg truncate">
                        {option.name}
                      </h4>
                      {hasConditionalLogic && (
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          Smart Logic
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        {getDisplayTypeIcon()}
                        <span className="capitalize font-medium">{option.displayType}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Layers className="w-4 h-4" />
                        <span className="capitalize font-medium">{option.manipulationType}</span>
                      </div>
                      
                      {option.defaultBehavior && (
                        <Badge 
                          variant={option.defaultBehavior === 'hide' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {option.defaultBehavior === 'hide' ? (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Hide Default
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Show Default
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {option.values.length} values
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {option.targetComponents.length} targets
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className={cn(
                    "flex items-center space-x-1 transition-all duration-200",
                    isHovered ? "opacity-100" : "opacity-60"
                  )}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditConditionalLogic(option)}
                          className={cn(
                            "h-8 w-8 micro-interaction focus-ring",
                            hasConditionalLogic
                              ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                              : 'text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10'
                          )}
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Conditional Logic</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(option)}
                          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 micro-interaction focus-ring"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Option</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(option.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10 micro-interaction focus-ring"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Option</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default DragDropOption;