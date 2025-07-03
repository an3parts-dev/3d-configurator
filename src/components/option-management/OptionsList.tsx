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
                    <GroupContentDropZone
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

// Enhanced component for group content with precise positioning using spacing
const GroupContentDropZone: React.FC<{
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
  if (groupedOptions.length === 0) {
    // Empty group - single large drop zone
    return (
      <EmptyGroupDropZone
        groupId={groupId}
        onMoveToGroup={onMoveToGroup}
      />
    );
  }

  return (
    <div className="space-y-2">
      {/* Render existing options with drop zones in the spacing between them */}
      {groupedOptions.map((groupedOption: ConfiguratorOption, groupIndex) => {
        const groupedOptionIndex = options.findIndex(opt => opt.id === groupedOption.id);
        return (
          <React.Fragment key={groupedOption.id}>
            {/* Drop zone before first item */}
            {groupIndex === 0 && (
              <DropZone
                position={0}
                groupId={groupId}
                onMoveToGroup={onMoveToGroup}
                onInsertAtPosition={(draggedId) => {
                  // Insert at beginning of group
                  onMoveToGroup(draggedId, groupId);
                  // TODO: Add precise positioning logic here
                }}
              />
            )}
            
            <DragDropOptionWrapper
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
            
            {/* Drop zone after each option */}
            <DropZone
              position={groupIndex + 1}
              groupId={groupId}
              onMoveToGroup={onMoveToGroup}
              onInsertAtPosition={(draggedId) => {
                // Insert after this item
                onMoveToGroup(draggedId, groupId);
                // TODO: Add precise positioning logic here
              }}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Empty group drop zone
const EmptyGroupDropZone: React.FC<{
  groupId: string;
  onMoveToGroup: (optionId: string, targetGroupId: string | null) => void;
}> = ({ groupId, onMoveToGroup }) => {
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
      if (!monitor.didDrop() && !item.isGroup && item.currentGroupId !== groupId) {
        onMoveToGroup(item.id, groupId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div 
      ref={drop}
      className={`min-h-[60px] border-2 border-dashed rounded-lg transition-colors ${
        isOver && canDrop 
          ? 'border-purple-400 bg-purple-500/5' 
          : 'border-gray-600/30 hover:border-purple-400/50'
      }`}
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-sm">
          {isOver && canDrop ? 'Drop to add to group' : 'Drag options here'}
        </div>
      </div>
    </div>
  );
};

// Invisible drop zone that uses the spacing between elements
const DropZone: React.FC<{
  position: number;
  groupId: string;
  onMoveToGroup: (optionId: string, targetGroupId: string | null) => void;
  onInsertAtPosition: (draggedId: string) => void;
}> = ({ position, groupId, onMoveToGroup, onInsertAtPosition }) => {
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
      if (!monitor.didDrop() && !item.isGroup) {
        // If item is not in this group, add it to the group
        if (item.currentGroupId !== groupId) {
          onMoveToGroup(item.id, groupId);
        }
        // Call the position-specific handler
        onInsertAtPosition(item.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Use the existing spacing (margin/padding) as the drop zone
  // No visual changes, just an invisible drop target
  return (
    <div 
      ref={drop}
      className="h-2 -my-1" // Use negative margin to overlap with existing spacing
      style={{ 
        // Make it completely invisible but still functional
        backgroundColor: 'transparent',
        border: 'none'
      }}
    />
  );
};

export default OptionsList;