import React from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import DragDropOptionWrapper from './DragDropOptionWrapper';
import { EmptyState } from '../ui';
import { ConfiguratorOption } from '../../types/ConfiguratorTypes';

interface OptionsListProps {
  options: ConfiguratorOption[];
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  onEditConditionalLogic: (option: ConfiguratorOption) => void;
  onToggleGroup: (groupId: string) => void;
  onMoveToGroup: (optionId: string, targetGroupId: string | null) => void;
}

const OptionsList: React.FC<OptionsListProps> = ({
  options,
  onMove,
  onEdit,
  onDelete,
  onEditConditionalLogic,
  onToggleGroup,
  onMoveToGroup
}) => {
  if (options.length === 0) {
    return (
      <div className="relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
            />
          ))}
        </div>

        <EmptyState
          icon={Layers}
          title="No options yet"
          description="Add your first option or group to get started"
          className="relative z-10 py-16"
        />
      </div>
    );
  }

  // Get all option IDs for SortableContext
  const optionIds = options.map(option => option.id);

  return (
    <div className="relative">
      {/* Enhanced background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)] rounded-2xl" />
      
      {/* Main content area */}
      <div className="relative z-10 p-2">
        <SortableContext items={optionIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {options.map((option, index) => {
                if (option.isGroup && option.groupData) {
                  // Find all options that belong to this group
                  const groupedOptions = options.filter(opt => 
                    !opt.isGroup && opt.groupId === option.id
                  );
                  
                  return (
                    <motion.div
                      key={option.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        layout: { duration: 0.3 }
                      }}
                      className="space-y-3"
                    >
                      {/* Enhanced Group Header with glass morphism */}
                      <div className="relative group">
                        {/* Glow effect on hover */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                        
                        <DragDropOptionWrapper
                          option={option}
                          index={index}
                          onMove={onMove}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onEditConditionalLogic={onEditConditionalLogic}
                          onToggleGroup={onToggleGroup}
                          onMoveToGroup={onMoveToGroup}
                          groupedOptions={groupedOptions}
                        />
                      </div>
                      
                      {/* Enhanced Grouped Options with smooth animations */}
                      <AnimatePresence>
                        {option.groupData?.isExpanded && groupedOptions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                              opacity: { duration: 0.2 }
                            }}
                            className="ml-6 pl-6 relative"
                          >
                            {/* Enhanced connection line with gradient */}
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/60 via-blue-500/40 to-transparent rounded-full" />
                            
                            {/* Connection dots */}
                            <div className="absolute left-[-2px] top-4 w-1 h-1 bg-purple-400 rounded-full" />
                            <div className="absolute left-[-2px] bottom-4 w-1 h-1 bg-blue-400 rounded-full opacity-60" />
                            
                            <SortableContext items={groupedOptions.map(opt => opt.id)} strategy={verticalListSortingStrategy}>
                              <div className="space-y-3 py-2">
                                {groupedOptions.map((groupedOption: ConfiguratorOption, groupIndex) => {
                                  const groupedOptionIndex = options.findIndex(opt => opt.id === groupedOption.id);
                                  return (
                                    <motion.div
                                      key={groupedOption.id}
                                      layout
                                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                      animate={{ opacity: 1, x: 0, scale: 1 }}
                                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 25,
                                        delay: groupIndex * 0.05,
                                        layout: { duration: 0.3 }
                                      }}
                                      className="relative group"
                                    >
                                      {/* Subtle glow for grouped items */}
                                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                                      
                                      <DragDropOptionWrapper
                                        option={groupedOption}
                                        index={groupedOptionIndex}
                                        onMove={onMove}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onEditConditionalLogic={onEditConditionalLogic}
                                        onMoveToGroup={onMoveToGroup}
                                        isGrouped={true}
                                      />
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </SortableContext>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                } else if (!option.groupId) {
                  // Enhanced Standalone option with improved animations
                  return (
                    <motion.div
                      key={option.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        delay: index * 0.05,
                        layout: { duration: 0.3 }
                      }}
                      className="relative group"
                    >
                      {/* Enhanced glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                      
                      <DragDropOptionWrapper
                        option={option}
                        index={index}
                        onMove={onMove}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onEditConditionalLogic={onEditConditionalLogic}
                        onMoveToGroup={onMoveToGroup}
                      />
                    </motion.div>
                  );
                }
                
                // Skip options that are in groups (they're rendered above)
                return null;
              })}
            </AnimatePresence>
          </div>
        </SortableContext>
      </div>

      {/* Floating action indicator */}
      {options.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 z-20"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OptionsList;