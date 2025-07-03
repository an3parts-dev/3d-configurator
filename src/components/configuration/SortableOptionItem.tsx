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
  EyeOff,
  Palette,
  Zap
} from 'lucide-react';
import { ConfiguratorOption } from '../../types/ConfiguratorTypes';

interface SortableOptionItemProps {
  option: ConfiguratorOption;
  index: number;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  variant?: 'individual' | 'grouped';
}

const SortableOptionItem: React.FC<SortableOptionItemProps> = ({
  option,
  index,
  onEdit,
  onDelete,
  variant = 'individual'
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
          scale: isDragging ? 1.02 : isOver ? 1.01 : 1,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          opacity: { duration: 0.15 },
          scale: { duration: 0.15 }
        }}
        className={`relative p-4 rounded-xl border transition-all duration-200 group ${
          variant === 'grouped' 
            ? 'bg-purple-900/20 border-purple-700/50 hover:border-purple-600/50' 
            : 'bg-gray-700 border-gray-600 hover:border-gray-500'
        } ${
          isDragging 
            ? 'shadow-2xl shadow-blue-500/30 border-blue-500 z-50' 
            : 'shadow-sm hover:shadow-md'
        }`}
      >
        {/* Conditional Logic Indicator */}
        {hasConditionalLogic && (
          <div className="absolute -top-2 -right-2 bg-orange-600 text-white p-1.5 rounded-full shadow-lg border-2 border-gray-800">
            <Zap className="w-3 h-3" />
          </div>
        )}

        <div className="flex items-center space-x-3">
          {/* Drag Handle */}
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-600 transition-colors flex-shrink-0"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>

          {/* Option Icon */}
          <div className={`p-2 rounded-lg flex-shrink-0 ${
            variant === 'grouped' 
              ? 'bg-purple-600/20 border border-purple-500/30' 
              : 'bg-blue-600/20 border border-blue-500/30'
          }`}>
            <Layers className={`w-4 h-4 ${
              variant === 'grouped' ? 'text-purple-400' : 'text-blue-400'
            }`} />
          </div>

          {/* Option Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-white font-medium text-sm truncate">{option.name}</h4>
              {hasConditionalLogic && (
                <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded-full font-medium border border-orange-500/30">
                  Logic
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                {option.manipulationType === 'visibility' ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <Palette className="w-3 h-3" />
                )}
                <span className="capitalize">{option.manipulationType}</span>
              </div>
              
              <span className="text-gray-500 text-xs">•</span>
              
              <span className="text-gray-400 text-xs">
                {option.values.length} values
              </span>
              
              <span className="text-gray-500 text-xs">•</span>
              
              <span className="text-gray-400 text-xs capitalize">
                {option.displayType}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(option)}
              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
              title="Edit Option"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(option.id)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete Option"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SortableOptionItem;