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

// Enhanced Group Content Drop Zone Component
const GroupContentDropZone: React.FC<{
  groupId: string;
  children: React.ReactNode;
  onMoveToGroup: (optionId: string, targetGroupId: string | null) => void;
}> = ({ groupId, children, onMoveToGroup }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'option',
    drop: (item: { id: string; isGroup: boolean; currentGroupId?: string }, monitor) => {
      // Only handle the drop if it wasn't handled by a child component
      if (!monitor.didDrop() && !item.isGroup && item.currentGroupId !== groupId) {
        onMoveToGroup(item.id, groupId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop() && !monitor.getItem()?.isGroup && monitor.getItem()?.currentGroupId !== groupId,
    }),
  });

  return (
    <div 
      ref={drop}
      className={`relative transition-all duration-200 min-h-[80px] ${
        isOver && canDrop 
          ? 'bg-purple-500/10 border-2 border-dashed border-purple-400 rounded-xl' 
          : ''
      }`}
    >
      {/* Content area */}
      <div className="relative z-0 space-y-4">
        {children}
      </div>
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
              
              {/* Enhanced group content area with full coverage drop zone */}
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
                      {groupedOptions.map((groupedOption: ConfiguratorOption) => {
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
                      })}
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