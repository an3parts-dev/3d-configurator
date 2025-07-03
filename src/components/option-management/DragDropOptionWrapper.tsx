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

      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Determine if we should allow reordering based on context
      const bothInSameContext = (
        // Both are in the same group
        (item.currentGroupId === props.option.groupId) ||
        // Both are at root level
        (!item.currentGroupId && !props.option.groupId && !props.isGrouped) ||
        // Both are groups at root level
        (item.isGroup && props.option.isGroup) ||
        // Both are in the same parent group (for grouped items)
        (props.isGrouped && item.parentGroupId === props.parentGroupId)
      );

      if (bothInSameContext) {
        props.onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
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
          // Moving an option into a group
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

  // Determine drop zone styling
  const getDropZoneStyle = () => {
    if (!isOver || !canDrop) return '';
    
    if (props.option.isGroup) {
      return 'ring-1 ring-purple-400 ring-opacity-50 bg-purple-500/5';
    } else if (!props.isGrouped) {
      return 'ring-1 ring-blue-400 ring-opacity-50 bg-blue-500/5';
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
      
      {/* Drop zone indicator for group headers */}
      {isOver && canDrop && props.option.isGroup && (
        <div className="absolute inset-0 pointer-events-none border border-dashed border-purple-400 rounded-lg bg-purple-500/5 flex items-center justify-center z-10">
          <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium shadow-lg">
            Add to group
          </div>
        </div>
      )}
      
      {/* Drop zone indicator for removing from group */}
      {isOver && canDrop && !props.option.isGroup && !props.isGrouped && (
        <div className="absolute inset-0 pointer-events-none border border-dashed border-blue-400 rounded-lg bg-blue-500/5 flex items-center justify-center z-10">
          <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium shadow-lg">
            Remove from group
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropOptionWrapper;