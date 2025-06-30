import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDragLayer } from 'react-dnd';
import { 
  GripVertical,
  Layers,
  FolderOpen,
  Zap
} from 'lucide-react';
import { ConfiguratorOption } from '../types/ConfiguratorTypes';

interface FloatingDragPreviewProps {
  allOptions: ConfiguratorOption[];
}

const FloatingDragPreview: React.FC<FloatingDragPreviewProps> = ({ allOptions }) => {
  const {
    itemType,
    isDragging,
    item,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getClientOffset(),
  }));

  const [draggedOption, setDraggedOption] = useState<ConfiguratorOption | null>(null);

  useEffect(() => {
    if (isDragging && item && itemType === 'option') {
      const option = allOptions.find(opt => opt.id === item.id);
      setDraggedOption(option || null);
    } else {
      setDraggedOption(null);
    }
  }, [isDragging, item, itemType, allOptions]);

  if (!isDragging || !currentOffset || !draggedOption) {
    return null;
  }

  const hasConditionalLogic = draggedOption.conditionalLogic?.enabled;

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 1000,
        left: currentOffset.x,
        top: currentOffset.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800 p-4 rounded-xl border border-gray-600 shadow-2xl max-w-sm"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Conditional Logic Indicator */}
        {hasConditionalLogic && (
          <div className="absolute -top-2 -right-2 bg-purple-600 text-white p-1.5 rounded-full shadow-lg border-2 border-gray-800">
            <Zap className="w-3 h-3" />
          </div>
        )}

        <div className="flex items-center space-x-3">
          <div className="p-1 rounded hover:bg-gray-700 transition-colors">
            <GripVertical className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {draggedOption.isGroup ? (
                <FolderOpen className="w-5 h-5 text-purple-400" />
              ) : (
                <Layers className="w-5 h-5 text-blue-400" />
              )}
              <h4 className="text-white font-semibold text-lg truncate">{draggedOption.name}</h4>
              {hasConditionalLogic && (
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/30 flex-shrink-0">
                  Logic
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {!draggedOption.isGroup && (
                <>
                  <span className="text-gray-400 text-sm capitalize">{draggedOption.manipulationType}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400 text-sm capitalize">{draggedOption.displayType}</span>
                </>
              )}
              {draggedOption.isGroup && (
                <span className="text-purple-400 text-sm">Group</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FloatingDragPreview;