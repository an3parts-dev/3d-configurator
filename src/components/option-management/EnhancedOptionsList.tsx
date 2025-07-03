import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrop } from 'react-dnd';
import DragDropOptionWrapper from './DragDropOptionWrapper';
import HierarchicalDropZone from './HierarchicalDropZone';
import { EmptyState } from '../ui';
import { ConfiguratorOption } from '../../types/ConfiguratorTypes';

interface EnhancedOptionsListProps {
  options: ConfiguratorOption[];
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (option: ConfiguratorOption) => void;
  onDelete: (optionId: string) => void;
  onEditConditionalLogic: (option: ConfiguratorOption) => void;
  onToggleGroup: (groupId: string) => void;
  onMoveToGroup: (optionId: string, targetGroupId: string | null) => void;
  onInsertAtPosition: (draggedItemId: string, targetIndex: number, targetGroupId?: string) => void;
}

const EnhancedOptionsList: React.FC<EnhancedOptionsListProps> = ({
  options,
  onMove,
  onEdit,
  onDelete,
  onEditConditionalLogic,
  onToggleGroup,
  onMoveToGroup,
  onInsertAtPosition
}) => {
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [showDropZones, setShowDropZones] = useState(false);

  // Root level drop zone
  const [{ isOver: isRootOver }, rootDrop] = useDrop({
    accept: 'option',
    drop: (item: any, monitor) => {
      if (!monitor.didDrop()) {
        // Handle root level drops
        onMoveToGroup(item.id, null);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  const handleDropAtPosition = (draggedItem: any, position: 'before' | 'after' | 'inside', targetOption?: ConfiguratorOption, targetIndex?: number) => {
    if (!draggedItem || !targetOption) return;

    switch (position) {
      case 'before':
        onInsertAtPosition(draggedItem.id, targetIndex || 0);
        break;
      case 'after':
        onInsertAtPosition(draggedItem.id, (targetIndex || 0) + 1);
        break;
      case 'inside':
        if (targetOption.isGroup) {
          onMoveToGroup(draggedItem.id, targetOption.id);
        }
        break;
    }
  };

  if (options.length === 0) {
    return (
      <div ref={rootDrop}>
        <EmptyState
          icon={Layers}
          title="No options yet"
          description="Add your first option or group to get started"
        />
      </div>
    );
  }

  const renderOption = (option: ConfiguratorOption, index: number, isGrouped: boolean = false) => {
    return (
      <div key={option.id} className="relative">
        {/* Drop zone before option */}
        <HierarchicalDropZone
          onDrop={(item, pos) => handleDropAtPosition(item, pos, option, index)}
          position="before"
          isVisible={showDropZones}
        />

        {/* Option wrapper */}
        <DragDropOptionWrapper
          option={option}
          index={index}
          onMove={onMove}
          onEdit={onEdit}
          onDelete={onDelete}
          onEditConditionalLogic={onEditConditionalLogic}
          onToggleGroup={onToggleGroup}
          onMoveToGroup={onMoveToGroup}
          isGrouped={isGrouped}
        />

        {/* Drop zone inside group (if it's a group) */}
        {option.isGroup && option.groupData?.isExpanded && (
          <HierarchicalDropZone
            onDrop={(item, pos) => handleDropAtPosition(item, pos, option, index)}
            position="inside"
            isGroup={true}
            isVisible={showDropZones}
            className="ml-8 mt-2"
          />
        )}

        {/* Drop zone after option */}
        <HierarchicalDropZone
          onDrop={(item, pos) => handleDropAtPosition(item, pos, option, index)}
          position="after"
          isVisible={showDropZones}
        />
      </div>
    );
  };

  return (
    <div 
      ref={rootDrop}
      className={`space-y-2 ${isRootOver ? 'bg-blue-500/5 rounded-lg p-2' : ''}`}
      onDragEnter={() => setShowDropZones(true)}
      onDragLeave={() => setShowDropZones(false)}
    >
      {options.map((option, index) => {
        if (option.isGroup && option.groupData) {
          // Find all options that belong to this group
          const groupedOptions = options.filter(opt => 
            !opt.isGroup && opt.groupId === option.id
          );
          
          return (
            <div key={option.id} className="space-y-2">
              {renderOption(option, index)}
              
              {/* Group content area */}
              <AnimatePresence>
                {option.groupData?.isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-8 space-y-2 border-l-2 border-purple-500/20 pl-4"
                  >
                    {groupedOptions.map((groupedOption: ConfiguratorOption) => {
                      const groupedOptionIndex = options.findIndex(opt => opt.id === groupedOption.id);
                      return renderOption(groupedOption, groupedOptionIndex, true);
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        } else if (!option.groupId) {
          // Standalone option (not in a group)
          return renderOption(option, index);
        }
        
        // Skip options that are in groups (they're rendered above)
        return null;
      })}
    </div>
  );
};

export default EnhancedOptionsList;