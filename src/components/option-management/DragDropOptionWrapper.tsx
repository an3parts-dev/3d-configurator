import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
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

  // Enhanced drop zone styling with better visual feedback
  const getDropZoneStyle = () => {
    if (!isOver) return '';
    
    if (props.option.isGroup) {
      return 'ring-2 ring-purple-400 ring-opacity-60 bg-purple-500/15 shadow-lg shadow-purple-500/25';
    } else if (!props.isGrouped) {
      return 'ring-2 ring-blue-400 ring-opacity-60 bg-blue-500/15 shadow-lg shadow-blue-500/25';
    }
    
    return '';
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative transition-all duration-300 ${getDropZoneStyle()}`}>
      {/* Enhanced glow effect for better visual feedback */}
      {isDragging && (
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl animate-pulse" />
      )}
      
      <OptionCard
        {...props}
        isDragging={isDragging}
        isOver={isOver}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
      />
      
      {/* Enhanced drop zone indicator for group headers */}
      {isOver && props.option.isGroup && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-400 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center z-20 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg border border-purple-400/50 flex items-center space-x-2"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>Drop to add to group</span>
          </motion.div>
        </motion.div>
      )}
      
      {/* Enhanced drop zone indicator for removing from group */}
      {isOver && !props.option.isGroup && !props.isGrouped && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 pointer-events-none border-2 border-dashed border-blue-400 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center z-20 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg border border-blue-400/50 flex items-center space-x-2"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>Drop to remove from group</span>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DragDropOptionWrapper;