import React from 'react';
import { Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrop } from 'react-dnd';
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

// Group Content Drop Zone Component
const GroupContentDropZone: React.FC<{
  groupId: string;
  children: React.ReactNode;
  onMoveToGroup: (optionId: string, targetGroupId: string | null) => void;
}> = ({ groupId, children, onMoveToGroup }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'option',
    drop: (item: { id: string; isGroup: boolean; currentGroupId?: string }, monitor) => {
      if (!monitor.didDrop() && !item.isGroup) {
        // Moving an option into this group
        onMoveToGroup(item.id, groupId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop() && !monitor.getItem()?.isGroup,
    }),
  });

  return (
    <div 
      ref={drop}
      className={`relative transition-all duration-200 ${
        isOver && canDrop 
          ? 'bg-purple-500/10 border-2 border-dashed border-purple-400 rounded-xl' 
          : ''
      }`}
    >
      {children}
      
      {/* Drop zone indicator */}
      {isOver && canDrop && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-purple-500/5 rounded-xl">
          <div className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            Drop here to add to group
          </div>
        </div>
      )}
    </div>
  );
};

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

  return (
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
              
              {/* Enhanced group content area with drop zone */}
              <AnimatePresence>
                {option.groupData?.isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-8 mt-4"
                  >
                    <GroupContentDropZone
                      groupId={option.id}
                      onMoveToGroup={onMoveToGroup}
                    >
                      <div className="space-y-4 min-h-[60px] p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
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
                    </GroupContentDropZone>
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
  );
};

export default OptionsList;