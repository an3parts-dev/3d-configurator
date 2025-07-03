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
      type: props.option.isGroup ? 'group' : 'option',
      option: props.option,
      isGroup: props.option.isGroup,
      currentGroupId: props.option.groupId,
      name: props.option.name
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Ensure dragged items appear above drop zones
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <OptionCard
        {...props}
        isDragging={isDragging}
        isOver={isOver}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
      />
    </div>
  );
};

export default DragDropOptionWrapper;