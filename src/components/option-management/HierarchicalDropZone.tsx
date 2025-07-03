import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { Plus, ArrowDown } from 'lucide-react';

interface HierarchicalDropZoneProps {
  onDrop: (draggedItem: any, position: 'before' | 'after' | 'inside') => void;
  position: 'before' | 'after' | 'inside';
  isGroup?: boolean;
  isVisible?: boolean;
  className?: string;
}

const HierarchicalDropZone: React.FC<HierarchicalDropZoneProps> = ({
  onDrop,
  position,
  isGroup = false,
  isVisible = false,
  className = ""
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'option',
    drop: (item: any, monitor) => {
      if (!monitor.didDrop()) {
        onDrop(item, position);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const dropRef = drop(ref);

  const getDropZoneContent = () => {
    switch (position) {
      case 'before':
        return (
          <div className="flex items-center space-x-2 text-blue-400">
            <ArrowDown className="w-4 h-4 rotate-180" />
            <span className="text-sm font-medium">Drop above</span>
          </div>
        );
      case 'after':
        return (
          <div className="flex items-center space-x-2 text-blue-400">
            <ArrowDown className="w-4 h-4" />
            <span className="text-sm font-medium">Drop below</span>
          </div>
        );
      case 'inside':
        return (
          <div className="flex items-center space-x-2 text-purple-400">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Drop inside group</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getDropZoneStyles = () => {
    const baseStyles = "transition-all duration-200 rounded-lg border-2 border-dashed";
    
    if (isOver && canDrop) {
      if (position === 'inside') {
        return `${baseStyles} border-purple-400 bg-purple-500/10 p-4`;
      } else {
        return `${baseStyles} border-blue-400 bg-blue-500/10 p-2`;
      }
    }
    
    if (isVisible) {
      if (position === 'inside') {
        return `${baseStyles} border-purple-300/30 bg-purple-500/5 p-4`;
      } else {
        return `${baseStyles} border-blue-300/30 bg-blue-500/5 p-1`;
      }
    }
    
    return `${baseStyles} border-transparent p-1`;
  };

  return (
    <div
      ref={dropRef}
      className={`${getDropZoneStyles()} ${className}`}
    >
      {(isOver && canDrop) || isVisible ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center justify-center"
        >
          {getDropZoneContent()}
        </motion.div>
      ) : (
        <div className="h-2" />
      )}
    </div>
  );
};

export default HierarchicalDropZone;