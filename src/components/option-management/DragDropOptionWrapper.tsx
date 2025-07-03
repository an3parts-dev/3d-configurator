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
      name: props.option.name
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'option',
    hover: (item: { id: string; index: number; isGroup: boolean; currentGroupId?: string; name?: string }, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = props.index;

      if (dragIndex === hoverIndex) return;

      // Don't allow dropping a group into itself or its children
      if (item.isGroup && props.option.groupId === item.id) return;

      // CRITICAL FIX: Don't trigger reordering when hovering over a group header
      // if the dragged item is not a group (this prevents the flicker)
      if (props.option.isGroup && !item.isGroup) {
        return; // Exit early to prevent reordering
      }

      // CRITICAL FIX: Don't trigger reordering when hovering over a standalone option
      // if the dragged item is coming from a group (this is likely a group removal operation)
      if (!props.option.isGroup && !props.isGrouped && item.currentGroupId) {
        return; // Exit early to prevent reordering
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Only proceed with reordering for same-level items
      if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY * 0.1) {
        props.onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
      
      if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY * 1.9) {
        props.onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
    drop: (item: { id: string; index: number; isGroup: boolean; currentGroupId?: string; name?: string }, monitor) => {
      // Only handle drops that weren't handled by child components
      if (!monitor.didDrop()) {
        // Handle group assignment - only for group headers and standalone options
        if (props.option.isGroup && !item.isGroup && props.onMoveToGroup) {
          // Moving an option into a group (dropping on group header)
          props.onMoveToGroup(item.id, props.option.id);
        } else if (!props.option.isGroup && !props.isGrouped && item.currentGroupId && props.onMoveToGroup) {
          // Moving an option out of a group (dropping on standalone option)
          props.onMoveToGroup(item.id, null);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Create invisible drag preview for smooth dragging
  React.useEffect(() => {
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    dragPreview(emptyImg, { anchorX: 0, anchorY: 0 });
  }, [dragPreview]);

  const dragDropRef = drag(drop(ref));

  // Determine drop zone styling - only for group headers and standalone options
  const getDropZoneStyle = () => {
    if (!isOver || !canDrop) return '';
    
    // Only show drop indicators for group headers and standalone options
    if (props.option.isGroup) {
      return 'ring-2 ring-purple-400 ring-opacity-50 bg-purple-500/10';
    } else if (!props.isGrouped) {
      return 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-500/10';
    }
    
    return '';
  };

  return (
    <div ref={dragDropRef} className={`relative ${getDropZoneStyle()}`}>
      <OptionCard
        {...props}
        isDragging={isDragging}
        isOver={isOver && canDrop}
      />
      
      {/* Drop zone indicator for group headers */}
      {isOver && canDrop && props.option.isGroup && (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-400 rounded-xl bg-purple-500/5 flex items-center justify-center z-10">
          <div className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
            Drop to add to group
          </div>
        </div>
      )}
      
      {/* Drop zone indicator for removing from group */}
      {isOver && canDrop && !props.option.isGroup && !props.isGrouped && (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-blue-400 rounded-xl bg-blue-500/5 flex items-center justify-center z-10">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
            Drop to remove from group
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropOptionWrapper;