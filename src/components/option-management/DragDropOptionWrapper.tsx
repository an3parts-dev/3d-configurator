import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import OptionCard from './OptionCard';
import { ConfiguratorOption } from '../../types/ConfiguratorTypes';

interface DragDropOptionWrapperProps {
  option: ConfiguratorOption;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  onEditConditionalLogic: (option: ConfiguratorOption) => void;
  onToggleGroup?: (groupId: string) => void;
  onMoveToGroup?: (optionId: string, targetGroupId: string | null) => void;
  isGrouped?: boolean;
  groupedOptions?: ConfiguratorOption[];
  parentGroupId?: string;
}

const DragDropOptionWrapper: React.FC<DragDropOptionWrapperProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'option',
    item: () => ({ 
      id: props.option.id, 
      index: props.index, 
      type: 'option',
      isGroup: props.option.isGroup,
      currentGroupId: props.option.groupId,
      parentGroupId: props.parentGroupId,
      name: props.option.name
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'option',
    hover: (item: { 
      id: string; 
      index: number; 
      isGroup: boolean; 
      currentGroupId?: string; 
      parentGroupId?: string;
      name?: string 
    }, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = props.index;

      if (dragIndex === hoverIndex) return;

      // Prevent dropping a group into itself or its children
      if (item.isGroup && props.option.groupId === item.id) return;

      // Get the bounding rectangle of the hovered element
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Enhanced reordering logic for precise positioning
      const bothInSameContext = (
        // Both are in the same group
        (item.currentGroupId === props.option.groupId && item.currentGroupId) ||
        // Both are at root level
        (!item.currentGroupId && !props.option.groupId && !props.isGrouped) ||
        // Both are groups at root level
        (item.isGroup && props.option.isGroup) ||
        // Both are in the same parent group (for grouped items)
        (props.isGrouped && item.parentGroupId === props.parentGroupId && props.parentGroupId)
      );

      if (bothInSameContext) {
        // Immediate switching - trigger move as soon as items touch
        // Use a smaller threshold for more responsive switching
        const threshold = 0.1; // 10% from edges instead of 50% from middle
        
        if (dragIndex < hoverIndex) {
          // Dragging downward - switch when touching the top 10% of target
          if (hoverClientY > hoverMiddleY * threshold) {
            props.onMove(dragIndex, hoverIndex);
            item.index = hoverIndex;
          }
        } else {
          // Dragging upward - switch when touching the bottom 10% of target  
          if (hoverClientY < hoverMiddleY * (2 - threshold)) {
            props.onMove(dragIndex, hoverIndex);
            item.index = hoverIndex;
          }
        }
      }
    },
    drop: (item: { 
      id: string; 
      index: number; 
      isGroup: boolean; 
      currentGroupId?: string; 
      parentGroupId?: string;
      name?: string 
    }, monitor) => {
      if (!monitor.didDrop() && props.onMoveToGroup) {
        // Handle group assignment only for direct drops on this element
        if (props.option.isGroup && !item.isGroup && item.currentGroupId !== props.option.id) {
          // Moving an option into a group - expand the group if collapsed
          if (!props.option.groupData?.isExpanded && props.onToggleGroup) {
            props.onToggleGroup(props.option.id);
          }
          props.onMoveToGroup(item.id, props.option.id);
        } else if (!props.option.isGroup && !props.isGrouped && item.currentGroupId && !item.isGroup) {
          // Moving an option out of a group to root level (drop on standalone option)
          props.onMoveToGroup(item.id, null);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Create invisible drag preview
  React.useEffect(() => {
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    dragPreview(emptyImg, { anchorX: 0, anchorY: 0 });
  }, [dragPreview]);

  const dragDropRef = drag(drop(ref));

  // Enhanced drop zone styling with better light mode support
  const getDropZoneStyle = () => {
    if (!isOver || !canDrop) return '';
    
    if (props.option.isGroup) {
      return 'ring-2 ring-purple-400 dark:ring-purple-400 ring-opacity-60 bg-purple-100/20 dark:bg-purple-500/10 scale-[1.02] shadow-lg shadow-purple-200/50 dark:shadow-purple-500/20';
    } else if (!props.isGrouped) {
      return 'ring-2 ring-blue-400 dark:ring-blue-400 ring-opacity-60 bg-blue-100/20 dark:bg-blue-500/10 scale-[1.01] shadow-md shadow-blue-200/50 dark:shadow-blue-500/20';
    }
    
    return '';
  };

  return (
    <div ref={dragDropRef} className={`relative transition-all duration-200 ${getDropZoneStyle()}`}>
      <OptionCard
        {...props}
        isDragging={isDragging}
        isOver={isOver && canDrop}
      />
      
      {/* Enhanced drop zone indicator for group headers */}
      {isOver && canDrop && props.option.isGroup && (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-400 dark:border-purple-400 rounded-lg bg-purple-100/30 dark:bg-purple-500/10 flex items-center justify-center z-10">
          <div className="bg-purple-600 dark:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Add to group</span>
          </div>
        </div>
      )}
      
      {/* Enhanced drop zone indicator for removing from group */}
      {isOver && canDrop && !props.option.isGroup && !props.isGrouped && (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-blue-400 dark:border-blue-400 rounded-lg bg-blue-100/30 dark:bg-blue-500/10 flex items-center justify-center z-10">
          <div className="bg-blue-600 dark:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Remove from group</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropOptionWrapper;