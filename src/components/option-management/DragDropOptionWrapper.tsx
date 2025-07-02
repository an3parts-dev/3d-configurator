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
      type: 'option'
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'option',
    hover: (item: { id: string; index: number }, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = props.index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY * 0.1) {
        props.onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
      
      if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY * 1.9) {
        props.onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
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

  const dragDropRef = drag(drop(ref));

  return (
    <div ref={dragDropRef}>
      <OptionCard
        {...props}
        isDragging={isDragging}
        isOver={isOver}
      />
    </div>
  );
};

export default DragDropOptionWrapper;