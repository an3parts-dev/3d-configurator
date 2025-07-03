import React, { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({
    id: props.option.id,
    data: {
      type: 'option',
      option: props.option,
      isGroup: props.option.isGroup,
      currentGroupId: props.option.groupId,
      name: props.option.name
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Determine drop zone styling
  const getDropZoneStyle = () => {
    if (!isOver) return '';
    
    if (props.option.isGroup) {
      return 'ring-2 ring-purple-400 ring-opacity-50 bg-purple-500/10';
    } else if (!props.isGrouped) {
      return 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-500/10';
    }
    
    return '';
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative ${getDropZoneStyle()}`}>
      <OptionCard
        {...props}
        isDragging={isDragging}
        isOver={isOver}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
      />
      
      {/* Drop zone indicator for group headers */}
      {isOver && props.option.isGroup && (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-400 rounded-xl bg-purple-500/5 flex items-center justify-center z-10">
          <div className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
            Drop to add to group
          </div>
        </div>
      )}
      
      {/* Drop zone indicator for removing from group */}
      {isOver && !props.option.isGroup && !props.isGrouped && (
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