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
  Layers,
  List,
  Grid3X3
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

  // Group rendering
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
        className={`bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-3 rounded-lg border transition-all ${
          isDragging 
            ? 'border-purple-500 shadow-lg cursor-grabbing' 
            : isOver
            ? 'border-purple-400 shadow-md bg-purple-500/5'
            : 'border-purple-700/30 hover:border-purple-600/50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-purple-700/20 transition-colors">
              <GripVertical className="w-4 h-4 text-purple-400" />
            </div>
            <div className="p-1.5 bg-purple-600/20 rounded border border-purple-500/30">
              <FolderOpen className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-white font-medium text-sm truncate">{option.groupData.name}</h4>
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full font-medium border border-purple-500/30">
                  GROUP
                </span>
              </div>
              {option.groupData.description && (
                <p className="text-purple-200/70 text-xs mt-1 truncate">{option.groupData.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-purple-300 text-xs font-medium flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{groupedOptions.length}</span>
            </span>
            <button
              onClick={() => onToggleGroup?.(option.groupData!.id)}
              className="text-purple-400 hover:text-purple-300 p-1 rounded hover:bg-purple-500/10 transition-colors"
            >
              {option.groupData.isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onEdit(option)}
              className="text-purple-400 hover:text-purple-300 p-1 rounded hover:bg-purple-500/10 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(option.id)}
              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Regular option rendering
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
          ? 'bg-gray-800/50 ml-4 border-l-4 border-l-blue-500/50' 
          : 'bg-gray-800'
      } ${
        isDragging 
          ? 'border-blue-500 shadow-lg cursor-grabbing' 
          : isOver
          ? 'border-blue-400 shadow-md bg-blue-500/5'
          : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      {/* Conditional Logic Indicator */}
      {hasConditionalLogic && (
        <div className="absolute -top-1 -right-1 bg-purple-600 text-white p-1 rounded-full shadow-lg border border-gray-800">
          <Zap className="w-2.5 h-2.5" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-700 transition-colors">
            <GripVertical className="w-4 h-4 text-gray-500" />
          </div>
          <Layers className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-white font-medium text-sm truncate">{option.name}</h4>
              {hasConditionalLogic && (
                <span className="bg-purple-500/20 text-purple-300 text-xs px-1.5 py-0.5 rounded-full font-medium border border-purple-500/30">
                  Logic
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
              <span className="capitalize">{option.manipulationType}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                {option.displayType === 'list' ? <List className="w-3 h-3" /> : <Grid3X3 className="w-3 h-3" />}
                <span className="capitalize">{option.displayType}</span>
              </div>
              <span>•</span>
              <span>{option.values.length} values</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEditConditionalLogic(option)}
            className={`p-1 rounded transition-colors ${
              hasConditionalLogic
                ? 'text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20'
                : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10'
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(option)}
            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-500/10 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(option.id)}
            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OptionCard;