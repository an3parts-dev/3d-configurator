import React, { useRef, useState, useEffect } from 'react';
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
  Users,
  FolderOpen,
  ChevronRight
} from 'lucide-react';
import { ConfiguratorOption } from '../types/ConfiguratorTypes';

interface DragItem {
  id: string;
  index: number;
  type: string;
  isChild: boolean;
  originalParentId?: string;
  groupId?: string;
}

interface DragDropOptionProps {
  option: ConfiguratorOption;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onMoveWithinGroup?: (groupId: string, dragIndex: number, hoverIndex: number) => void;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  onEditConditionalLogic: (option: ConfiguratorOption) => void;
  onMoveToGroup?: (optionId: string, groupId: string | null) => void;
  allOptions?: ConfiguratorOption[];
  childOptions?: ConfiguratorOption[];
  isChild?: boolean;
  visualIndex: number;
  groupId?: string;
  isDraggedOver?: boolean;
  dragDirection?: 'up' | 'down' | null;
}

const DragDropOption: React.FC<DragDropOptionProps> = ({
  option,
  index,
  onMove,
  onMoveWithinGroup,
  onEdit,
  onDelete,
  onEditConditionalLogic,
  onMoveToGroup,
  allOptions = [],
  childOptions = [],
  isChild = false,
  visualIndex,
  groupId,
  isDraggedOver = false,
  dragDirection = null
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [isDragHovered, setIsDragHovered] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'option',
    item: (): DragItem => ({ 
      id: option.id, 
      index: isChild ? index : visualIndex,
      type: 'option',
      isChild,
      originalParentId: option.parentId,
      groupId: groupId
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => true,
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'option',
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = isChild ? index : visualIndex;

      if (dragIndex === hoverIndex) return;

      // Get hover position for smooth animations
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const isHoveringUpperHalf = hoverClientY < hoverMiddleY;

      // Set hovering state for visual feedback
      setIsHovering(true);

      // Handle reordering within the same group
      if (isChild && item.isChild && item.groupId === groupId) {
        if (onMoveWithinGroup && groupId) {
          // Only trigger reorder when crossing the middle threshold
          if (dragIndex < hoverIndex && !isHoveringUpperHalf) {
            onMoveWithinGroup(groupId, dragIndex, hoverIndex);
            item.index = hoverIndex;
          } else if (dragIndex > hoverIndex && isHoveringUpperHalf) {
            onMoveWithinGroup(groupId, dragIndex, hoverIndex);
            item.index = hoverIndex;
          }
        }
        return;
      }

      // Handle root-level reordering
      if (!isChild && !item.isChild) {
        // Only trigger reorder when crossing the middle threshold
        if (dragIndex < hoverIndex && !isHoveringUpperHalf) {
          onMove(dragIndex, hoverIndex);
          item.index = hoverIndex;
        } else if (dragIndex > hoverIndex && isHoveringUpperHalf) {
          onMove(dragIndex, hoverIndex);
          item.index = hoverIndex;
        }
      }
    },
    drop: (item: DragItem) => {
      setIsHovering(false);
      
      // Handle group operations for root-level items
      if (option.isGroup && item.id !== option.id && !item.isChild) {
        if (onMoveToGroup) {
          onMoveToGroup(item.id, option.id);
        }
        return;
      }

      // Handle moving child items out of groups
      if (!option.isGroup && !isChild && item.isChild && item.originalParentId) {
        if (onMoveToGroup) {
          onMoveToGroup(item.id, null);
        }
        return;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Reset hovering state when drag ends
  useEffect(() => {
    if (!isOver) {
      setIsHovering(false);
    }
  }, [isOver]);

  // Combine drag and drop refs
  const dragDropRef = drop(ref);

  // Only attach drag to the handle
  drag(dragHandleRef);

  // Create invisible drag preview
  useEffect(() => {
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    dragPreview(emptyImg, { anchorX: 0, anchorY: 0 });
  }, [dragPreview]);

  const hasConditionalLogic = option.conditionalLogic?.enabled;

  // Determine drop zone states
  const showGroupDropZone = isOver && canDrop && option.isGroup && !isChild;
  const showUngroupDropZone = isOver && canDrop && !option.isGroup && !isChild;

  // Calculate transform for smooth displacement
  const getTransform = () => {
    if (isDraggedOver && dragDirection) {
      return dragDirection === 'down' ? 'translateY(80px)' : 'translateY(-80px)';
    }
    return 'translateY(0px)';
  };

  return (
    <div ref={dragDropRef}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isDragging ? 0.3 : 1,
          y: 0,
          scale: isDragHovered ? 1.02 : 1,
        }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          type: "spring", 
          stiffness: 200,
          damping: 25,
          mass: 1,
          layout: { 
            type: "spring",
            stiffness: 200,
            damping: 25,
            mass: 1
          }
        }}
        style={{
          transform: getTransform(),
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className={`bg-gray-800 p-5 rounded-xl border transition-all duration-300 relative ${
          showGroupDropZone
            ? 'border-purple-400 shadow-lg shadow-purple-400/20 bg-purple-500/10'
            : showUngroupDropZone
            ? 'border-green-400 shadow-lg shadow-green-400/20 bg-green-500/10'
            : isHovering
            ? 'border-blue-400 shadow-lg shadow-blue-400/20 bg-blue-500/5'
            : option.isGroup
            ? 'bg-purple-900/20 border-purple-500/30 hover:border-purple-400'
            : isChild
            ? 'bg-gray-750 border-gray-600 hover:border-gray-500'
            : 'border-gray-700 hover:border-gray-600 shadow-sm'
        }`}
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

        {/* Ungroup Drop Zone Indicator */}
        {showUngroupDropZone && (
          <div className="absolute inset-0 bg-green-500/20 border-2 border-green-400 border-dashed rounded-xl flex items-center justify-center z-10">
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg">
              Drop here to remove from group
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Drag Handle - Only this part is draggable */}
            <div 
              ref={dragHandleRef}
              className="cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
              onMouseEnter={() => setIsDragHovered(true)}
              onMouseLeave={() => setIsDragHovered(false)}
            >
              <GripVertical className="w-5 h-5 text-gray-500" />
            </div>
            
            {isChild && (
              <div className="w-4 flex justify-center">
                <div className="w-px h-6 bg-purple-500/50"></div>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {option.isGroup ? (
                  <FolderOpen className="w-5 h-5 text-purple-400" />
                ) : (
                  <Layers className="w-5 h-5 text-blue-400" />
                )}
                <h4 className="text-white font-semibold text-lg truncate">{option.name}</h4>
                {hasConditionalLogic && (
                  <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/30 flex-shrink-0">
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
          <div className="flex items-center space-x-3 flex-shrink-0">
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
        <motion.div 
          layout
          transition={{ 
            type: "spring", 
            stiffness: 200,
            damping: 25,
            mass: 1
          }}
          className="ml-8 mt-4 space-y-3 border-l-2 border-purple-500/30 pl-6"
        >
          <AnimatePresence>
            {childOptions.map((childOption, childIndex) => (
              <DragDropOption
                key={childOption.id}
                option={childOption}
                index={childIndex}
                visualIndex={-1}
                onMove={onMove}
                onMoveWithinGroup={onMoveWithinGroup}
                onEdit={onEdit}
                onDelete={onDelete}
                onEditConditionalLogic={onEditConditionalLogic}
                onMoveToGroup={onMoveToGroup}
                allOptions={allOptions}
                isChild={true}
                groupId={option.id}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default DragDropOption;