import React from 'react';
import { Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
      <EmptyState
        icon={Layers}
        title="No options yet"
        description="Add your first option or group to get started"
      />
    );
  }

  // Get all option IDs for SortableContext
  const optionIds = options.map(option => option.id);

  return (
    <SortableContext items={optionIds} strategy={verticalListSortingStrategy}>
      <div className="space-y-4">
        {options.map((option, index) => {
          if (option.isGroup && option.groupData) {
            // Find all options that belong to this group
            const groupedOptions = options.filter(opt => 
              !opt.isGroup && opt.groupId === option.id
            );
            
            return (
              <div key={option.id}>
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
                
                {/* Group content area */}
                <AnimatePresence>
                  {option.groupData?.isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-8 mt-4"
                    >
                      <SortableContext items={groupedOptions.map(opt => opt.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4 min-h-[80px] p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                          {groupedOptions.length === 0 ? (
                            <div className="text-center py-8 text-purple-300/60">
                              <div className="text-sm font-medium mb-1">No options in this group</div>
                              <div className="text-xs">Drag options here to add them to this group</div>
                            </div>
                          ) : (
                            groupedOptions.map((groupedOption: ConfiguratorOption) => {
                              const groupedOptionIndex = options.findIndex(opt => opt.id === groupedOption.id);
                              return (
                                <DragDropOptionWrapper
                                  key={groupedOption.id}
                                  option={groupedOption}
                                  index={groupedOptionIndex}
                                  onMove={onMove}
                                  onEdit={onEdit}
                                  onDelete={onDelete}
                                  onEditConditionalLogic={onEditConditionalLogic}
                                  onMoveToGroup={onMoveToGroup}
                                  isGrouped={true}
                                />
                              );
                            })
                          )}
                        </div>
                      </SortableContext>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          } else if (!option.groupId) {
            // Standalone option (not in a group)
            return (
              <DragDropOptionWrapper
                key={option.id}
                option={option}
                index={index}
                onMove={onMove}
                onEdit={onEdit}
                onDelete={onDelete}
                onEditConditionalLogic={onEditConditionalLogic}
                onMoveToGroup={onMoveToGroup}
              />
            );
          }
          
          // Skip options that are in groups (they're rendered above)
          return null;
        })}
      </div>
    </SortableContext>
  );
};

export default OptionsList;