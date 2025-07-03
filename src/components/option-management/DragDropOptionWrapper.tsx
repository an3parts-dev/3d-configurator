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

      // Enhanced logic for cross-group and same-context moves
      const isSameContext = (
        // Both are in the same group
        (item.currentGroupId === props.option.groupId && item.currentGroupId) ||
        // Both are at root level
        (!item.currentGroupId && !props.option.groupId && !props.isGrouped) ||
        // Both are groups at root level
        (item.isGroup && props.option.isGroup) ||
        // Both are in the same parent group (for grouped items)
        (props.isGrouped && item.parentGroupId === props.parentGroupId && props.parentGroupId)
      );

      const isCrossGroupMove = (
        // Moving from one group to another group's item
        (!item.isGroup && !props.option.isGroup && 
         item.currentGroupId !== props.option.groupId) ||
        // Moving from root to group or vice versa
        (!item.isGroup && !props.option.isGroup &&
         ((item.currentGroupId && !props.option.groupId) || 
          (!item.currentGroupId && props.option.groupId)))
      );

      // Handle same-context reordering with immediate switching
      if (isSameContext) {
        const threshold = 0.1; // 10% from edges for immediate response
        
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

      // Handle cross-group moves - show visual feedback but don't reorder
      if (isCrossGroupMove && props.onMoveToGroup) {
        // Visual feedback will be handled by the drop zone styling
        // Actual move happens in the drop handler
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
        // Handle cross-group moves
        if (!item.isGroup && !props.option.isGroup) {
          const targetGroupId = props.isGrouped ? props.parentGroupId : props.option.groupId;
          
          // Only move if it's actually a different group
          if (item.currentGroupId !== targetGroupId) {
            props.onMoveToGroup(item.id, targetGroupId || null);
          }
        }
        
        // Handle group assignment for non-group items dropped on groups
        if (props.option.isGroup && !item.isGroup && item.currentGroupId !== props.option.id) {
          // Moving an option into a group - expand the group if collapsed
          if (!props.option.groupData?.isExpanded && props.onToggleGroup) {
            props.onToggleGroup(props.option.id);
          }
          props.onMoveToGroup(item.id, props.option.id);
        } 
        
        // Handle moving options out of groups to root level
        else if (!props.option.isGroup && !props.isGrouped && item.currentGroupId && !item.isGroup) {
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

  // Enhanced drop zone styling for cross-group moves
  const getDropZoneStyle = () => {
    if (!isOver || !canDrop) return '';
    
    if (props.option.isGroup) {
      return 'ring-2 ring-purple-400 ring-opacity-60 bg-purple-500/10 scale-[1.02]';
    } else if (!props.isGrouped) {
      return 'ring-2 ring-blue-400 ring-opacity-60 bg-blue-500/10 scale-[1.01]';
    } else {
      // Grouped item - show different styling for cross-group moves
      return 'ring-2 ring-green-400 ring-opacity-60 bg-green-500/10 scale-[1.01]';
    }
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
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-400 rounded-lg bg-purple-500/10 flex items-center justify-center z-10">
          <div className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Add to group</span>
          </div>
        </div>
      )}
      
      {/* Enhanced drop zone indicator for cross-group moves */}
      {isOver && canDrop && !props.option.isGroup && props.isGrouped && (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-green-400 rounded-lg bg-green-500/10 flex items-center justify-center z-10">
          <div className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Move to this group</span>
          </div>
        </div>
      )}
      
      {/* Enhanced drop zone indicator for removing from group */}
      {isOver && canDrop && !props.option.isGroup && !props.isGrouped && (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-blue-400 rounded-lg bg-blue-500/10 flex items-center justify-center z-10">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Move to root level</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropOptionWrapper;