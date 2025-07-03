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

  // Create a proper drag preview that follows the cursor
  React.useEffect(() => {
    // Create a custom drag preview element
    const createDragPreview = () => {
      const preview = document.createElement('div');
      preview.style.cssText = `
        position: fixed;
        top: -1000px;
        left: -1000px;
        z-index: 1000;
        pointer-events: none;
        background: rgba(31, 41, 55, 0.95);
        border: 1px solid rgba(59, 130, 246, 0.5);
        border-radius: 8px;
        padding: 12px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(8px);
        max-width: 250px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `;
      
      // Add content based on option type
      if (props.option.isGroup) {
        preview.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 16px; height: 16px; background: rgba(147, 51, 234, 0.3); border: 1px solid rgba(147, 51, 234, 0.5); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              📁
            </div>
            <span>${props.option.name}</span>
            <span style="background: rgba(147, 51, 234, 0.2); color: rgba(196, 181, 253, 1); padding: 2px 6px; border-radius: 12px; font-size: 10px; border: 1px solid rgba(147, 51, 234, 0.3);">GROUP</span>
          </div>
        `;
      } else {
        preview.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 16px; height: 16px; background: rgba(59, 130, 246, 0.3); border: 1px solid rgba(59, 130, 246, 0.5); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              ⚙️
            </div>
            <span>${props.option.name}</span>
            ${props.option.conditionalLogic?.enabled ? '<span style="background: rgba(147, 51, 234, 0.2); color: rgba(196, 181, 253, 1); padding: 2px 6px; border-radius: 12px; font-size: 10px; border: 1px solid rgba(147, 51, 234, 0.3);">Logic</span>' : ''}
          </div>
        `;
      }
      
      document.body.appendChild(preview);
      return preview;
    };

    // Use the custom preview
    const preview = createDragPreview();
    dragPreview(preview, { 
      anchorX: 0.5, 
      anchorY: 0.5,
      captureDraggingState: true
    });

    // Cleanup function
    return () => {
      if (document.body.contains(preview)) {
        document.body.removeChild(preview);
      }
    };
  }, [dragPreview, props.option.name, props.option.isGroup, props.option.conditionalLogic?.enabled]);

  const dragDropRef = drag(drop(ref));

  // Determine drop zone styling with enhanced visual feedback
  const getDropZoneStyle = () => {
    if (!isOver || !canDrop) return '';
    
    if (props.option.isGroup) {
      return 'ring-2 ring-purple-400 ring-opacity-60 bg-purple-500/10 scale-[1.02]';
    } else if (!props.isGrouped) {
      return 'ring-2 ring-blue-400 ring-opacity-60 bg-blue-500/10 scale-[1.01]';
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
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-400 rounded-lg bg-purple-500/10 flex items-center justify-center z-10">
          <div className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Add to group</span>
          </div>
        </div>
      )}
      
      {/* Enhanced drop zone indicator for removing from group */}
      {isOver && canDrop && !props.option.isGroup && !props.isGrouped && (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-blue-400 rounded-lg bg-blue-500/10 flex items-center justify-center z-10">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Remove from group</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropOptionWrapper;