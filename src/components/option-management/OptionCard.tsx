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
  Eye,
  Palette,
  Sparkles
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

  // Group rendering with enhanced glass morphism design
  if (option.isGroup && option.groupData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
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
        className={`relative overflow-hidden rounded-2xl transition-all duration-300 group ${
          isDragging 
            ? 'shadow-2xl shadow-purple-500/30 z-50' 
            : isOver
            ? 'shadow-xl shadow-purple-400/20'
            : 'shadow-lg hover:shadow-xl'
        }`}
      >
        {/* Enhanced glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-purple-900/40 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10" />
        
        {/* Animated border gradient */}
        <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
          isDragging 
            ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 p-[2px]' 
            : isOver
            ? 'bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 p-[1px]'
            : 'bg-gradient-to-r from-purple-700/50 via-blue-700/30 to-purple-700/50 p-[1px] group-hover:from-purple-600/60 group-hover:via-blue-600/40 group-hover:to-purple-600/60'
        }`}>
          <div className="h-full w-full rounded-2xl bg-gray-800/90 backdrop-blur-sm" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Mobile-First Layout */}
          <div className="space-y-4 sm:space-y-0">
            {/* Header Row */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                {/* Enhanced drag handle with haptic feedback simulation */}
                <motion.div 
                  {...dragHandleProps}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-grab active:cursor-grabbing p-3 rounded-xl bg-purple-500/20 border border-purple-400/30 hover:bg-purple-500/30 transition-all duration-200 flex-shrink-0 mt-1 group/handle"
                >
                  <GripVertical className="w-5 h-5 text-purple-400 group-hover/handle:text-purple-300 transition-colors" />
                  
                  {/* Touch feedback dots */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/handle:opacity-100 transition-opacity">
                    <div className="flex space-x-0.5">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 bg-purple-300 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 flex-wrap">
                    {/* Enhanced group icon */}
                    <div className="p-3 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-xl border border-purple-500/40 flex-shrink-0 relative overflow-hidden">
                      <FolderOpen className="w-6 h-6 text-purple-300 relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 animate-pulse" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 flex-wrap">
                        <h4 className="text-white font-bold text-xl truncate">{option.groupData.name}</h4>
                        
                        {/* Enhanced group badge */}
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-purple-200 text-xs px-3 py-1.5 rounded-full font-bold border border-purple-400/40 flex-shrink-0 backdrop-blur-sm"
                        >
                          GROUP
                        </motion.span>
                      </div>
                      {option.groupData.description && (
                        <p className="text-purple-200/90 text-sm mt-2 line-clamp-2 leading-relaxed">{option.groupData.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile Actions */}
              <div className="flex sm:hidden flex-col items-end space-y-3 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleGroup?.(option.groupData!.id)}
                  className="text-purple-300 hover:text-purple-200 p-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 transition-all duration-200 border border-purple-400/30"
                >
                  {option.groupData.isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </motion.button>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-purple-200 text-sm font-semibold">
                    <Users className="w-4 h-4" />
                    <span>{groupedOptions.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Actions Row */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-purple-200 text-sm font-semibold bg-purple-500/20 px-3 py-2 rounded-lg border border-purple-400/30">
                  <Users className="w-4 h-4" />
                  <span>{groupedOptions.length} options</span>
                </div>
                
                {/* Group stats */}
                <div className="flex items-center space-x-1 text-xs text-purple-300/80">
                  <Sparkles className="w-3 h-3" />
                  <span>Active Group</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleGroup?.(option.groupData!.id)}
                  className="text-purple-300 hover:text-purple-200 p-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 transition-all duration-200 border border-purple-400/30"
                >
                  {option.groupData.isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEdit(option)}
                  className="text-purple-300 hover:text-purple-200 p-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 transition-all duration-200 border border-purple-400/30"
                  title="Edit Group"
                >
                  <Edit className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(option.id)}
                  className="text-red-300 hover:text-red-200 p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 border border-red-400/30"
                  title="Delete Group"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex sm:hidden space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onEdit(option)}
                className="flex-1 bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/40 hover:to-blue-600/40 text-purple-200 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 border border-purple-400/30"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDelete(option.id)}
                className="flex-1 bg-gradient-to-r from-red-600/30 to-pink-600/30 hover:from-red-600/40 hover:to-pink-600/40 text-red-200 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 border border-red-400/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Enhanced regular option rendering with improved glass morphism
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
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
      className={`relative overflow-hidden rounded-xl transition-all duration-300 group ${
        isGrouped 
          ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-l-4 border-l-blue-500/60' 
          : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80'
      } ${
        isDragging 
          ? 'shadow-2xl shadow-blue-500/30 z-50' 
          : isOver
          ? 'shadow-xl shadow-blue-400/20'
          : 'shadow-lg hover:shadow-xl'
      }`}
    >
      {/* Enhanced glass morphism background */}
      <div className="absolute inset-0 backdrop-blur-xl" />
      <div className={`absolute inset-0 ${
        isGrouped 
          ? 'bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5' 
          : 'bg-gradient-to-r from-blue-500/10 via-transparent to-cyan-500/10'
      }`} />
      
      {/* Animated border */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
        isDragging 
          ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 p-[2px]' 
          : isOver
          ? 'bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 p-[1px]'
          : isGrouped
          ? 'bg-gradient-to-r from-blue-700/40 via-purple-700/30 to-blue-700/40 p-[1px] group-hover:from-blue-600/50 group-hover:via-purple-600/40 group-hover:to-blue-600/50'
          : 'bg-gradient-to-r from-gray-700/50 via-blue-700/30 to-gray-700/50 p-[1px] group-hover:from-gray-600/60 group-hover:via-blue-600/40 group-hover:to-gray-600/60'
      }`}>
        <div className="h-full w-full rounded-xl bg-gray-800/90 backdrop-blur-sm" />
      </div>

      {/* Conditional Logic Indicator with enhanced design */}
      {hasConditionalLogic && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 z-20"
        >
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-2 rounded-full shadow-lg border-2 border-gray-800 relative overflow-hidden">
            <Zap className="w-4 h-4 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-yellow-400/30 animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Mobile-First Layout */}
        <div className="space-y-4 sm:space-y-0">
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1 min-w-0">
              {/* Enhanced drag handle */}
              <motion.div 
                {...dragHandleProps}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-grab active:cursor-grabbing p-2.5 rounded-lg bg-blue-500/20 border border-blue-400/30 hover:bg-blue-500/30 transition-all duration-200 flex-shrink-0 mt-1 group/handle"
              >
                <GripVertical className="w-4 h-4 text-blue-400 group-hover/handle:text-blue-300 transition-colors" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 flex-wrap">
                  {/* Enhanced option icon */}
                  <div className="p-2.5 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-lg border border-blue-500/40 flex-shrink-0 relative overflow-hidden">
                    <Layers className="w-5 h-5 text-blue-300 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 animate-pulse" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="text-white font-bold text-lg truncate">{option.name}</h4>
                      {hasConditionalLogic && (
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-r from-orange-500/30 to-yellow-500/30 text-orange-200 text-xs px-2 py-1 rounded-full font-bold border border-orange-400/40 flex-shrink-0"
                        >
                          Logic
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Stats */}
            <div className="flex sm:hidden flex-col items-end text-right flex-shrink-0 space-y-1">
              <span className="text-blue-200 text-sm font-semibold">{option.values.length} values</span>
              <span className="text-blue-300/70 text-xs">{option.targetComponents.length} targets</span>
            </div>
          </div>

          {/* Option Details */}
          <div className="space-y-3 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {/* Type indicators with enhanced styling */}
              <div className="flex items-center space-x-2 bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-400/30">
                {option.manipulationType === 'visibility' ? (
                  <Eye className="w-4 h-4 text-blue-300" />
                ) : (
                  <Palette className="w-4 h-4 text-blue-300" />
                )}
                <span className="capitalize font-semibold text-blue-200">{option.manipulationType}</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-600/30 px-3 py-1.5 rounded-lg border border-gray-500/30">
                {option.displayType === 'list' ? (
                  <List className="w-4 h-4 text-gray-300" />
                ) : (
                  <Grid3X3 className="w-4 h-4 text-gray-300" />
                )}
                <span className="capitalize font-semibold text-gray-200">{option.displayType}</span>
              </div>
              
              {option.defaultBehavior && (
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${
                    option.defaultBehavior === 'hide' 
                      ? 'bg-red-500/20 text-red-200 border-red-400/30' 
                      : 'bg-green-500/20 text-green-200 border-green-400/30'
                  }`}
                >
                  {option.defaultBehavior === 'hide' ? 'Hide Default' : 'Show Default'}
                </motion.span>
              )}
            </div>

            {/* Desktop Stats Row */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-blue-200 text-sm font-semibold bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-400/30">
                  <span>{option.values.length} values</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300 text-xs">
                  <span>{option.targetComponents.length} targets</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEditConditionalLogic(option)}
                  className={`p-2.5 rounded-lg transition-all duration-200 border ${
                    hasConditionalLogic
                      ? 'text-orange-300 hover:text-orange-200 bg-orange-500/20 hover:bg-orange-500/30 border-orange-400/30'
                      : 'text-gray-400 hover:text-orange-300 hover:bg-orange-500/20 border-gray-500/30 hover:border-orange-400/30'
                  }`}
                  title="Edit Conditional Logic"
                >
                  <Zap className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEdit(option)}
                  className="text-blue-300 hover:text-blue-200 p-2.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-all duration-200 border border-blue-400/30"
                  title="Edit Option"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(option.id)}
                  className="text-red-300 hover:text-red-200 p-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 border border-red-400/30"
                  title="Delete Option"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex sm:hidden space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onEditConditionalLogic(option)}
              className={`flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 border ${
                hasConditionalLogic
                  ? 'bg-gradient-to-r from-orange-600/30 to-yellow-600/30 hover:from-orange-600/40 hover:to-yellow-600/40 text-orange-200 border-orange-400/30'
                  : 'bg-gradient-to-r from-gray-600/30 to-orange-600/30 hover:from-orange-600/30 hover:to-yellow-600/30 text-gray-300 hover:text-orange-200 border-gray-500/30 hover:border-orange-400/30'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Logic</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onEdit(option)}
              className="flex-1 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/40 hover:to-cyan-600/40 text-blue-200 px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 border border-blue-400/30"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDelete(option.id)}
              className="flex-1 bg-gradient-to-r from-red-600/30 to-pink-600/30 hover:from-red-600/40 hover:to-pink-600/40 text-red-200 px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 border border-red-400/30"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OptionCard;