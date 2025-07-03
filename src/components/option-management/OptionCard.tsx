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
  Grid3X3,
  MoreVertical
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
  dragHandleProps?: any;
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
  isOver = false,
  dragHandleProps = {}
}) => {
  const hasConditionalLogic = option.conditionalLogic?.enabled;

  // Group rendering
  if (option.isGroup && option.groupData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isDragging ? 0.6 : 1, 
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
        className={`bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 sm:p-5 rounded-xl border transition-all duration-150 relative ${
          isDragging 
            ? 'border-purple-500 shadow-2xl shadow-purple-500/30 cursor-grabbing z-50' 
            : isOver
            ? 'border-purple-400 shadow-lg shadow-purple-400/20 bg-purple-500/5'
            : 'border-purple-700/50 hover:border-purple-600/50 shadow-sm'
        }`}
      >
        {/* Mobile-First Layout */}
        <div className="space-y-3 sm:space-y-0">
          {/* Header Row - Mobile Stacked, Desktop Inline */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div 
                {...dragHandleProps}
                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-purple-700/30 transition-colors flex-shrink-0 mt-1"
              >
                <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                  <div className="p-1.5 sm:p-2 bg-purple-600/20 rounded-lg border border-purple-500/30 flex-shrink-0">
                    <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="text-white font-semibold text-base sm:text-lg truncate">{option.groupData.name}</h4>
                      <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/30 flex-shrink-0">
                        GROUP
                      </span>
                    </div>
                    {option.groupData.description && (
                      <p className="text-purple-200/80 text-sm mt-1 line-clamp-2">{option.groupData.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Actions - Vertical Stack */}
            <div className="flex sm:hidden flex-col items-end space-y-2 flex-shrink-0">
              <button
                onClick={() => onToggleGroup?.(option.groupData!.id)}
                className="text-purple-400 hover:text-purple-300 p-2 rounded hover:bg-purple-500/10 transition-colors"
              >
                {option.groupData.isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
              <div className="text-right">
                <span className="text-purple-300 text-sm font-medium flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{groupedOptions.length}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Actions Row */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="text-left">
              <span className="text-purple-300 text-sm font-medium flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{groupedOptions.length} options</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleGroup?.(option.groupData!.id)}
                className="text-purple-400 hover:text-purple-300 p-2 rounded hover:bg-purple-500/10 transition-colors"
              >
                {option.groupData.isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onEdit(option)}
                className="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-purple-500/10 transition-colors"
                title="Edit Group"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => onDelete(option.id)}
                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Delete Group"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex sm:hidden space-x-2">
            <button
              onClick={() => onEdit(option)}
              className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(option.id)}
              className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Regular option rendering
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDragging ? 0.6 : 1, 
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
      className={`p-4 sm:p-5 rounded-xl border transition-all duration-150 relative ${
        isGrouped 
          ? 'bg-gray-800/50 ml-4 sm:ml-8 border-l-4 border-l-blue-500/50' 
          : 'bg-gray-800'
      } ${
        isDragging 
          ? 'border-blue-500 shadow-2xl shadow-blue-500/30 cursor-grabbing z-50' 
          : isOver
          ? 'border-blue-400 shadow-lg shadow-blue-400/20 bg-blue-500/5'
          : 'border-gray-700 hover:border-gray-600 shadow-sm'
      }`}
    >
      {/* Conditional Logic Indicator */}
      {hasConditionalLogic && (
        <div className="absolute -top-2 -right-2 bg-purple-600 text-white p-1.5 rounded-full shadow-lg border-2 border-gray-800">
          <Zap className="w-3 h-3" />
        </div>
      )}

      {/* Mobile-First Layout */}
      <div className="space-y-3 sm:space-y-0">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div 
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-700 transition-colors flex-shrink-0 mt-1"
            >
              <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                <h4 className="text-white font-semibold text-base sm:text-lg truncate">{option.name}</h4>
                {hasConditionalLogic && (
                  <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/30 flex-shrink-0">
                    Logic
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile Stats */}
          <div className="flex sm:hidden flex-col items-end text-right flex-shrink-0">
            <span className="text-gray-400 text-sm font-medium">{option.values.length} values</span>
            <span className="text-gray-500 text-xs">{option.targetComponents.length} targets</span>
          </div>
        </div>

        {/* Option Details - Mobile Stacked */}
        <div className="space-y-2 sm:space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center space-x-1 text-gray-400">
              <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="capitalize font-medium">{option.manipulationType}</span>
            </div>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <div className="flex items-center space-x-1 text-gray-400">
              {option.displayType === 'list' ? <List className="w-3 h-3 sm:w-4 sm:h-4" /> : <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="capitalize font-medium">{option.displayType}</span>
            </div>
            {option.defaultBehavior && (
              <>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  option.defaultBehavior === 'hide' 
                    ? 'bg-red-500/20 text-red-300' 
                    : 'bg-green-500/20 text-green-300'
                }`}>
                  {option.defaultBehavior === 'hide' ? 'Hide Default' : 'Show Default'}
                </span>
              </>
            )}
          </div>

          {/* Desktop Stats Row */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="text-left">
              <span className="text-gray-400 text-sm font-medium">{option.values.length} values</span>
              <span className="text-gray-500 text-xs ml-2">{option.targetComponents.length} targets</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEditConditionalLogic(option)}
                className={`p-2 rounded-lg transition-colors ${
                  hasConditionalLogic
                    ? 'text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20'
                    : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10'
                }`}
                title="Edit Conditional Logic"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => onEdit(option)}
                className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                title="Edit Option"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => onDelete(option.id)}
                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Delete Option"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex sm:hidden space-x-2">
          <button
            onClick={() => onEditConditionalLogic(option)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              hasConditionalLogic
                ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300'
                : 'bg-gray-600/20 hover:bg-purple-600/20 text-gray-400 hover:text-purple-400'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Logic</span>
          </button>
          <button
            onClick={() => onEdit(option)}
            className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(option.id)}
            className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OptionCard;