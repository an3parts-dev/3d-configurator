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

const OptionsList: React.FC<OptionsListProps> = ({
  options,
  onMove,
  onEdit,
  onDelete,
  onEditConditionalLogic,
  onToggleGroup,
  onMoveToGroup
}) => {
  // Silent drop zone for empty space - removes items from groups without visual feedback
  const [, emptySpaceDrop] = useDrop({
    accept: 'option',
    drop: (item: { 
      id: string; 
      index: number; 
      isGroup: boolean; 
      currentGroupId?: string; 
      parentGroupId?: string;
      name?: string 
    }, monitor) => {
      // Only handle if not dropped on a specific element
      if (!monitor.didDrop() && item.currentGroupId && !item.isGroup) {
        // Remove from group and place at root level at the end
        onMoveToGroup(item.id, null);
      }
    },
    collect: () => ({}), // No visual feedback
  });

  if (options.length === 0) {
    return (
      <div ref={emptySpaceDrop} className="min-h-[200px]">
        <EmptyState
          icon={Layers}
          title="No options yet"
          description="Add your first option or group to get started"
        />
      </div>
    );
  }

  return (
    <div 
      ref={emptySpaceDrop}
      className="space-y-3 min-h-[400px] relative"
    >
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
              
              {/* Group content area - show if expanded */}
              <AnimatePresence>
                {option.groupData?.isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 mt-2"
                  >
                    <GroupContentArea
                      groupId={option.id}
                      groupedOptions={groupedOptions}
                      onMove={onMove}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onEditConditionalLogic={onEditConditionalLogic}
                      onMoveToGroup={onMoveToGroup}
                      options={options}
                    />
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

      {/* Bottom padding for better drop experience */}
      <div className="h-16" />
    </div>
  );
};

// Simplified group content area without precise positioning
const GroupContentArea: React.FC<{
  groupId: string;
  groupedOptions: ConfiguratorOption[];
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  onEditConditionalLogic: (option: ConfiguratorOption) => void;
  onMoveToGroup: (optionId: string, targetGroupId: string | null) => void;
  options: ConfiguratorOption[];
}> = ({
  groupId,
  groupedOptions,
  onMove,
  onEdit,
  onDelete,
  onEditConditionalLogic,
  onMoveToGroup,
  options
}) => {
  // Simple drop zone for empty groups
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'option',
    drop: (item: { 
      id: string; 
      index: number; 
      isGroup: boolean; 
      currentGroupId?: string; 
      parentGroupId?: string;
      name?: string 
    }, monitor) => {
      // Only handle if not dropped on a specific element and item is not already in this group
      if (!monitor.didDrop() && !item.isGroup && item.currentGroupId !== groupId) {
        onMoveToGroup(item.id, groupId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  if (groupedOptions.length === 0) {
    // Empty group - show drop zone
    return (
      <div 
        ref={drop}
        className={`relative min-h-[60px] transition-all duration-200 ${
          isOver && canDrop 
            ? 'bg-purple-500/10 border-2 border-dashed border-purple-400 rounded-lg' 
            : 'border-2 border-dashed border-gray-600/30 rounded-lg hover:border-purple-400/50'
        }`}
      >
        {isOver && canDrop ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
              Add to group
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-50">
            <div className="text-gray-500 text-sm">Drop here to add to group</div>
          </div>
        )}
      </div>
    );
  }

  // Group has items - just render them
  return (
    <div className="space-y-2">
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
            parentGroupId={groupId}
          />
        );
      })}
    </div>
  );
};

export default OptionsList;