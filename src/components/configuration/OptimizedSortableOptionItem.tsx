import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { 
  GripVertical, 
  Edit, 
  Trash2, 
  Layers, 
  Eye, 
  Palette,
  Zap,
  Target
} from 'lucide-react';
import { ConfiguratorOption } from '../../types/ConfiguratorTypes';

interface OptimizedSortableOptionItemProps {
  option: ConfiguratorOption;
  index: number;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  variant?: 'ungrouped' | 'grouped';
}

const OptimizedSortableOptionItem: React.FC<OptimizedSortableOptionItemProps> = ({
  option,
  index,
  onEdit,
  onDelete,
  variant = 'ungrouped'
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({
    id: option.id,
    data: {
      type: 'option',
      option,
      index
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasConditionalLogic = option.conditionalLogic?.enabled;

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isDragging ? 0.7 : 1, 
          y: 0,
          scale: isDragging ? 1.05 : isOver ? 1.02 : 1,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          opacity: { duration: 0.15 },
          scale: { duration: 0.15 }
        }}
        className={`relative p-4 rounded-xl border-2 transition-all duration-200 group ${
          variant === 'grouped' 
            ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:border-purple-300' 
            : 'bg-white border-gray-200 hover:border-blue-300'
        } ${
          isDragging 
            ? 'shadow-2xl shadow-blue-500/30 border-blue-500 z-50' 
            : 'shadow-sm hover:shadow-md'
        }`}
      >
        {/* Conditional Logic Indicator */}
        {hasConditionalLogic && (
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
            <Zap className="w-3 h-3" />
          </div>
        )}

        {/* Grid Snap Visual Feedback */}
        {isDragging && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-xl bg-blue-500/10 animate-pulse" />
        )}

        <div className="flex items-center space-x-3">
          {/* Enhanced Drag Handle */}
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 group/handle"
          >
            <GripVertical className="w-4 h-4 text-gray-400 group-hover/handle:text-blue-500 transition-colors" />
            
            {/* Touch feedback for mobile */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/handle:opacity-100 transition-opacity">
              <div className="flex space-x-0.5">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 h-0.5 bg-blue-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Option Icon */}
          <div className={`p-2 rounded-lg flex-shrink-0 ${
            variant === 'grouped' 
              ? 'bg-purple-100 border border-purple-200' 
              : 'bg-blue-100 border border-blue-200'
          }`}>
            <Layers className={`w-4 h-4 ${
              variant === 'grouped' ? 'text-purple-600' : 'text-blue-600'
            }`} />
          </div>

          {/* Option Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-gray-900 font-medium text-sm truncate">{option.name}</h4>
              {hasConditionalLogic && (
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium border border-orange-200">
                  Logic
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                {option.manipulationType === 'visibility' ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <Palette className="w-3 h-3" />
                )}
                <span className="capitalize">{option.manipulationType}</span>
              </div>
              
              <span className="text-gray-400 text-xs">•</span>
              
              <span className="text-gray-500 text-xs">
                {option.values.length} values
              </span>
              
              <span className="text-gray-400 text-xs">•</span>
              
              <span className="text-gray-500 text-xs capitalize">
                {option.displayType}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(option)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Option"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(option.id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Option"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Snap Grid Preview */}
        {isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 border-2 border-dashed border-green-400 rounded-xl bg-green-500/10"
          >
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <Target className="w-3 h-3" />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default OptimizedSortableOptionItem;