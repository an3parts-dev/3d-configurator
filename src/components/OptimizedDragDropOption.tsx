import React, { useRef, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { 
  GripVertical,
  Edit,
  Trash2,
  Layers,
  List,
  Grid3X3,
  Zap
} from 'lucide-react';
import { ConfiguratorOption } from '../types/ConfiguratorTypes';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { logger } from '../utils/Logger';

interface OptimizedDragDropOptionProps {
  option: ConfiguratorOption;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  onEditConditionalLogic: (option: ConfiguratorOption) => void;
}

const OptimizedDragDropOption: React.FC<OptimizedDragDropOptionProps> = React.memo(({
  option,
  index,
  onMove,
  onEdit,
  onDelete,
  onEditConditionalLogic
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const performanceMonitor = PerformanceMonitor.getInstance();

  // Optimized drag configuration with performance monitoring
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'option',
    item: () => {
      const endTiming = performanceMonitor.startTiming('drag-start');
      logger.debug('Drag started for option', { optionId: option.id, index });
      
      return { 
        id: option.id, 
        index, 
        type: 'option',
        onDragEnd: endTiming
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item) => {
      // Call the timing end function when drag ends
      if (item.onDragEnd) {
        item.onDragEnd();
      }
    }
  });

  // Optimized drop configuration with immediate switching
  const [{ isOver }, drop] = useDrop({
    accept: 'option',
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

  // Memoized conditional logic check
  const hasConditionalLogic = React.useMemo(() => 
    option.conditionalLogic?.enabled, 
    [option.conditionalLogic?.enabled]
  );

  // Optimized event handlers with useCallback
  const handleEdit = useCallback(() => {
    logger.debug('Edit option clicked', { optionId: option.id });
    onEdit(option);
  }, [option, onEdit]);

  const handleDelete = useCallback(() => {
    logger.debug('Delete option clicked', { optionId: option.id });
    onDelete(option.id);
  }, [option.id, onDelete]);

  const handleEditConditionalLogic = useCallback(() => {
    logger.debug('Edit conditional logic clicked', { optionId: option.id });
    onEditConditionalLogic(option);
  }, [option, onEditConditionalLogic]);

  return (
    <div ref={dragDropRef}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
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
        className={`bg-gray-800 p-5 rounded-xl border transition-all duration-150 relative ${
          isDragging 
            ? 'border-blue-500 shadow-2xl shadow-blue-500/30 cursor-grabbing z-50' 
            : isOver
            ? 'border-blue-400 shadow-lg shadow-blue-400/20 bg-blue-500/5'
            : 'border-gray-700 hover:border-gray-600 shadow-sm'
        }`}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Conditional Logic Indicator */}
        {hasConditionalLogic && (
          <div className="absolute -top-2 -right-2 bg-purple-600 text-white p-1.5 rounded-full shadow-lg border-2 border-gray-800">
            <Zap className="w-3 h-3" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-700 transition-colors">
              <GripVertical className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <h4 className="text-white font-semibold text-lg">{option.name}</h4>
                {hasConditionalLogic && (
                  <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/30">
                    Conditional Logic
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-gray-400 text-sm flex items-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span className="capitalize font-medium">{option.manipulationType}</span>
                </p>
                <span className="text-gray-600">•</span>
                <p className="text-gray-400 text-sm flex items-center space-x-2">
                  {option.displayType === 'list' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                  <span className="capitalize font-medium">{option.displayType}</span>
                </p>
                {option.defaultBehavior && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      option.defaultBehavior === 'hide' 
                        ? 'bg-red-500/20 text-red-300' 
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                      {option.defaultBehavior === 'hide' ? 'Hide Default' : 'Show Default'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-gray-400 text-sm font-medium">{option.values.length} values</span>
              <p className="text-gray-500 text-xs">{option.targetComponents.length} targets</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEditConditionalLogic}
                className={`p-2 rounded-lg transition-colors ${
                  hasConditionalLogic
                    ? 'text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20'
                    : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10'
                }`}
                title="Edit Conditional Logic"
              >
                <Zap className="w-5 h-5" />
              </button>
              <button
                onClick={handleEdit}
                className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                title="Edit Option"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Delete Option"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

OptimizedDragDropOption.displayName = 'OptimizedDragDropOption';

export default OptimizedDragDropOption;