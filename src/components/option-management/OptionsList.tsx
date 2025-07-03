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
  // Organize options by groups for display
  const organizeOptionsForDisplay = () => {
    const organized: any[] = [];
    const processedOptionIds = new Set<string>();

    options.forEach(option => {
      if (processedOptionIds.has(option.id)) return;

      if (option.isGroup && option.groupData) {
        // Find all options that belong to this group
        const groupedOptions = options.filter(opt => 
          !opt.isGroup && opt.groupId === option.id
        );
        
        // Mark grouped options as processed
        groupedOptions.forEach(opt => processedOptionIds.add(opt.id));
        
        organized.push({
          type: 'group',
          group: option,
          options: groupedOptions
        });
      } else if (!option.groupId) {
        // Standalone option (not in a group)
        organized.push({
          type: 'option',
          option
        });
      }
      
      processedOptionIds.add(option.id);
    });

    return organized;
  };

  const organizedOptions = organizeOptionsForDisplay();

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
      {organizedOptions.map((item, index) => {
        if (item.type === 'group') {
          const { group, options: groupedOptions } = item;
          return (
            <div key={group.id}>
              <DragDropOptionWrapper
                option={group}
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
                {group.groupData?.isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-8 mt-4 space-y-4"
                  >
                    {groupedOptions.map((option: ConfiguratorOption) => (
                      <DragDropOptionWrapper
                        key={option.id}
                        option={option}
                        index={options.findIndex(opt => opt.id === option.id)}
                        onMove={onMove}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onEditConditionalLogic={onEditConditionalLogic}
                        isGrouped={true}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        } else {
          // Standalone option
          const { option } = item;
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
      })}
    </div>
  );
};

export default OptionsList;