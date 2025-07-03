import React from 'react';
import { Layers } from 'lucide-react';
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
}

const OptionsList: React.FC<OptionsListProps> = ({
  options,
  onMove,
  onEdit,
  onDelete,
  onEditConditionalLogic,
  onToggleGroup
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
                groupedOptions={groupedOptions}
              />
              
              {/* Render grouped options when expanded */}
              <AnimatePresence>
                {option.groupData?.isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-8 mt-4 space-y-4"
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
                          isGrouped={true}
                        />
                      );
                    })}
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