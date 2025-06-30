import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { 
  GripVertical,
  Edit,
  Trash2,
  Layers,
  List,
  Grid3X3,
  Zap,
  Users,
  FolderOpen,
  ChevronRight
} from 'lucide-react';
import { ConfiguratorOption } from '../types/ConfiguratorTypes';
import { OptionOrderingManager } from '../utils/OptionOrderingManager';

interface DragItem {
  id: string;
  index: number;
  type: string;
  isChild: boolean;
  originalParentId?: string;
}

interface DragDropOptionProps {
  option: ConfiguratorOption;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  onEditConditionalLogic: (option: ConfiguratorOption) => void;
  onMoveToGroup?: (optionId: string, groupId: string | null) => void;
  allOptions?: ConfiguratorOption[];
  childOptions?: ConfiguratorOption[];
  isChild?: boolean;
  visualIndex: number; // New prop for visual ordering
}

const DragDropOption: React.FC<DragDropOptionProps> = ({
  option,
  index,
  onMove,
  onEdit,
  onDelete,
  onEditConditionalLogic,
  onMoveToGroup,
  allOptions = [],
  childOptions = [],
  isChild = false,
  visualIndex
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'option',
    item: (): DragItem => ({ 
      id: option.id, 
      index: visualIndex, // Use visual index instead of array index
      type: 'option',
      isChild,
      originalParentId: option.parentId 
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !isChild, // Only allow dragging root-level items
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'option',
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return;
      
      // Don't allow reordering if this is a child item or the dragged item is a child
      if (isChild || item.isChild) return;
      
      const dragIndex = item.index;
      const hoverIndex = visualIndex;

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
    drop: (item: DragItem) => {
      // Handle group operations
      if (option.isGroup && item.id !== option.id && !item.isChild) {
        // Moving item into a group
        if (onMoveToGroup) {
          onMoveToGroup(item.id, option.id);
        }
        return;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Combine drag and drop refs
  const dragDropRef = drop(ref);
  drag(dragDropRef);

  // Create invisible drag preview
  React.useEffect(() => {
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    dragPreview(emptyImg, { anchorX: 0, anchorY: 0 });
  }, [dragPreview]);

  const hasConditionalLogic = option.conditionalLogic?.enabled;

  // Determine drop zone states
  const showGroupDropZone = isOver && canDrop && option.isGroup && !isChild;

  return (
    <div ref={dragDropRef}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          zIndex: 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30
        }}
        className={`bg-gray-800 p-5 rounded-xl border transition-all duration-200 relative ${
          showGroupDropZone
            ? 'border-purple-400 shadow-lg shadow-purple-400/20 bg-purple-500/10'
            : option.isGroup
            ? 'bg-purple-900/20 border-purple-500/30 hover:border-purple-400'
            : isChild
            ? 'bg-gray-750 border-gray-600 hover:border-gray-500'
            : 'border-gray-700 hover:border-gray-600 shadow-sm'
        }`}
        style={{
          cursor: isDragging ? 'grabbing' : (isChild ? 'default' : 'grab'),
          opacity: isDragging ? 0.3 : 1,
        }}
      >
        {/* Conditional Logic Indicator */}
        {hasConditionalLogic && (
          <div className="absolute -top-2 -right-2 bg-purple-600 text-white p-1.5 rounded-full shadow-lg border-2 border-gray-800">
            <Zap className="w-3 h-3" />
          </div>
        )}

        {/* Group Drop Zone Indicator */}
        {showGroupDropZone && (
          <div className="absolute inset-0 bg-purple-500/20 border-2 border-purple-400 border-dashed rounded-xl flex items-center justify-center z-10">
            <div className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg">
              Drop here to add to group
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {!isChild && (
              <div className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-700 transition-colors">
                <GripVertical className="w-5 h-5 text-gray-500" />
              </div>
            )}
            {isChild && (
              <div className="w-7 flex justify-center">
                <div className="w-px h-6 bg-purple-500/50"></div>
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {option.isGroup ? (
                  <FolderOpen className="w-5 h-5 text-purple-400" />
                ) : (
                  <Layers className="w-5 h-5 text-blue-400" />
                )}
                <h4 className="text-white font-semibold text-lg">{option.name}</h4>
                {hasConditionalLogic && (
                  <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/30">
                    Conditional Logic
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 mt-1">
                {!option.isGroup && (
                  <>
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
                  </>
                )}
                {option.parentId && (
                  <div className="flex items-center space-x-1 text-purple-400 text-sm">
                    <ChevronRight className="w-3 h-3" />
                    <span>In Group</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              {!option.isGroup && (
                <>
                  <span className="text-gray-400 text-sm font-medium">{option.values.length} values</span>
                  <p className="text-gray-500 text-xs">{option.targetComponents.length} targets</p>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEditConditionalLogic(option)}
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
                onClick={() => onEdit(option)}
                className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                title="Edit Option"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(option.id)}
                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Delete Option"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Child Options for Groups */}
      {option.isGroup && childOptions.length > 0 && (
        <div className="ml-8 mt-4 space-y-3 border-l-2 border-purple-500/30 pl-6">
          {childOptions.map((childOption, childIndex) => (
            <DragDropOption
              key={childOption.id}
              option={childOption}
              index={childIndex}
              visualIndex={-1} // Child options don't participate in visual ordering
              onMove={() => {}} // Child options don't reorder
              onEdit={onEdit}
              onDelete={onDelete}
              onEditConditionalLogic={onEditConditionalLogic}
              onMoveToGroup={onMoveToGroup}
              allOptions={allOptions}
              isChild={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DragDropOption;