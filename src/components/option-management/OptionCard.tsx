import React from 'react';
import { motion } from 'framer-motion';
import { 
  GripVertical,
  Edit,
  Trash2,
  Zap,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Users,
  Layers
} from 'lucide-react';
import { ConfiguratorOption } from '../../types/ConfiguratorTypes';

interface OptionCardProps {
  option: ConfiguratorOption;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  onEditConditionalLogic: (option: ConfiguratorOption) => void;
  onToggleGroup?: (groupId: string) => void;
  isGrouped?: boolean;
  groupedOptions?: ConfiguratorOption[];
  isDragging?: boolean;
  isOver?: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({
  option,
  index,
  onMove,
  onEdit,
  onDelete,
  onEditConditionalLogic,
  onToggleGroup,
  isGrouped = false,
  groupedOptions = [],
  isDragging = false,
  isOver = false
}) => {
  const hasConditionalLogic = option.conditionalLogic?.enabled;

  // Group rendering - clean minimal design
  if (option.isGroup && option.groupData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isDragging ? 0.5 : 1, 
          y: 0,
          scale: isDragging ? 1.02 : isOver ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={`bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg border transition-all ${
          isDragging 
            ? 'border-purple-400 dark:border-purple-500 shadow-lg shadow-purple-200/50 dark:shadow-purple-500/20 cursor-grabbing' 
            : isOver
            ? 'border-purple-300 dark:border-purple-400 shadow-md shadow-purple-100/50 dark:shadow-purple-500/10 bg-purple-50/80 dark:bg-purple-500/5'
            : 'border-purple-200/50 dark:border-purple-700/30 hover:border-purple-300/70 dark:hover:border-purple-600/50 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-purple-100/50 dark:hover:bg-purple-700/20 transition-colors">
              <GripVertical className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            </div>
            <div className="p-1.5 bg-purple-100 dark:bg-purple-600/20 rounded border border-purple-200 dark:border-purple-500/30">
              <FolderOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-gray-900 dark:text-white font-medium text-sm truncate">{option.groupData.name}</h4>
              {option.groupData.description && (
                <p className="text-purple-700/70 dark:text-purple-200/70 text-xs mt-1 truncate hidden sm:block">{option.groupData.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-purple-600 dark:text-purple-300 text-xs font-medium flex items-center space-x-1 bg-purple-100 dark:bg-purple-500/20 px-2 py-1 rounded-full">
              <Users className="w-3 h-3" />
              <span>{groupedOptions.length}</span>
            </span>
            <button
              onClick={() => onToggleGroup?.(option.groupData!.id)}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-500/10 transition-colors"
            >
              {option.groupData.isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onEdit(option)}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-500/10 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(option.id)}
              className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Regular option rendering - mobile-optimized design
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        y: 0,
        scale: isDragging ? 1.02 : isOver ? 1.01 : 1,
      }}
      transition={{ duration: 0.2 }}
      className={`p-3 rounded-lg border transition-all relative ${
        isGrouped 
          ? 'bg-blue-50/50 dark:bg-gray-800/50 ml-2 border-l-4 border-l-blue-400 dark:border-l-blue-500/50 border-r border-t border-b border-blue-200/50 dark:border-gray-700' 
          : 'bg-white dark:bg-gray-800'
      } ${
        isDragging 
          ? 'border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-200/50 dark:shadow-blue-500/20 cursor-grabbing' 
          : isOver
          ? 'border-blue-300 dark:border-blue-400 shadow-md shadow-blue-100/50 dark:shadow-blue-500/10 bg-blue-50/30 dark:bg-blue-500/5'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm hover:bg-gray-50/50 dark:hover:bg-gray-750/50'
      }`}
    >
      {/* Conditional Logic Indicator */}
      {hasConditionalLogic && (
        <div className="absolute -top-1 -right-1 bg-orange-500 dark:bg-orange-600 text-white p-1 rounded-full shadow-lg border-2 border-white dark:border-gray-800">
          <Zap className="w-2.5 h-2.5" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="p-1.5 bg-blue-100 dark:bg-blue-600/20 rounded border border-blue-200 dark:border-blue-500/30">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Title and badges on same row */}
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-gray-900 dark:text-white font-medium text-sm truncate flex-1">{option.name}</h4>
              {hasConditionalLogic && (
                <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-xs px-1.5 py-0.5 rounded-full font-medium border border-orange-200 dark:border-orange-500/30 flex-shrink-0">
                  Logic
                </span>
              )}
            </div>
            {/* Simplified metadata for mobile */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                {option.manipulationType}
              </span>
              <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                {option.values.length} values
              </span>
              {/* Hide display type on mobile to save space */}
              <span className="hidden sm:inline-block capitalize bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                {option.displayType}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={() => onEditConditionalLogic(option)}
            className={`p-1 rounded transition-colors ${
              hasConditionalLogic
                ? 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-100 dark:bg-orange-500/10 hover:bg-orange-200 dark:hover:bg-orange-500/20'
                : 'text-gray-400 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10'
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(option)}
            className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(option.id)}
            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OptionCard;