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
              
              {/* Group content area - show if expanded (even if empty for drop zones) */}
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

// Enhanced component for group content with precise positioning
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
  return (
    <div className="space-y-2">
      {/* Top drop zone - for inserting at the beginning */}
      <DropZone
        position="top"
        groupId={groupId}
        onMoveToGroup={onMoveToGroup}
        isEmpty={groupedOptions.length === 0}
      />

      {/* Render existing options with drop zones between them */}
      {groupedOptions.map((groupedOption: ConfiguratorOption, groupIndex) => {
        const groupedOptionIndex = options.findIndex(opt => opt.id === groupedOption.id);
        return (
          <React.Fragment key={groupedOption.id}>
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
            
            {/* Drop zone after each option (except the last one) */}
            {groupIndex < groupedOptions.length - 1 && (
              <DropZone
                position="between"
                groupId={groupId}
                onMoveToGroup={onMoveToGroup}
                targetIndex={groupIndex + 1}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Bottom drop zone - for inserting at the end */}
      {groupedOptions.length > 0 && (
        <DropZone
          position="bottom"
          groupId={groupId}
          onMoveToGroup={onMoveToGroup}
          targetIndex={groupedOptions.length}
        />
      )}
    </div>
  );
};

// Precise drop zone component for positioning
const DropZone: React.FC<{
  position: 'top' | 'between' | 'bottom';
  groupId: string;
  onMoveToGroup: (optionId: string, targetGroupId: string | null) => void;
  targetIndex?: number;
  isEmpty?: boolean;
}> = ({ position, groupId, onMoveToGroup, targetIndex = 0, isEmpty = false }) => {
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
        // Add to this group at the specific position
        onMoveToGroup(item.id, groupId);
        // Note: For now we're using the basic moveToGroup, but this could be enhanced
        // to support precise positioning with a new callback
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Different styling based on position and state
  const getDropZoneClasses = () => {
    const baseClasses = "transition-all duration-200";
    
    if (isEmpty) {
      // Empty group - larger drop zone
      return `${baseClasses} min-h-[80px] ${
        isOver && canDrop 
          ? 'bg-purple-500/10 border-2 border-dashed border-purple-400 rounded-lg' 
          : 'border-2 border-dashed border-gray-600/30 rounded-lg hover:border-purple-400/50'
      }`;
    } else {
      // Between items - smaller drop zone
      return `${baseClasses} h-2 ${
        isOver && canDrop 
          ? 'bg-purple-500/20 border-t-2 border-purple-400' 
          : 'hover:bg-purple-500/10 hover:border-t-2 hover:border-purple-400/50'
      }`;
    }
  };

  const getDropIndicator = () => {
    if (isEmpty) {
      return isOver && canDrop ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            Add to group
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <div className="text-gray-500 text-sm">Drop here to add to group</div>
        </div>
      );
    } else {
      return isOver && canDrop ? (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-medium shadow-lg">
            Insert here
          </div>
        </div>
      ) : null;
    }
  };

  return (
    <div 
      ref={drop}
      className={`relative ${getDropZoneClasses()}`}
    >
      {getDropIndicator()}
    </div>
  );
};

export default OptionsList;