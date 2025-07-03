import React from 'react';
import { Layers, ArrowLeft } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
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
              <div key={option.id} className="space-y-3">
                {/* Group Header */}
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
                
                {/* Grouped Options - Displayed inline when group is expanded */}
                {option.groupData?.isExpanded && groupedOptions.length > 0 && (
                  <div className="relative">
                    {/* Ungroup Drop Zone - Left side */}
                    <UngroupDropZone />
                    
                    {/* Grouped Options Container */}
                    <div className="ml-6 space-y-3">
                      <SortableContext items={groupedOptions.map(opt => opt.id)} strategy={verticalListSortingStrategy}>
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
                      </SortableContext>
                    </div>
                  </div>
                )}
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

// Ungroup Drop Zone Component
const UngroupDropZone: React.FC = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'ungroup-drop-zone',
    data: {
      type: 'ungroup-zone'
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`absolute left-0 top-0 bottom-0 w-6 transition-all duration-200 ${
        isOver 
          ? 'bg-blue-500/20 border-r-2 border-blue-400' 
          : 'bg-transparent hover:bg-gray-600/10'
      }`}
    >
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg">
            <ArrowLeft className="w-3 h-3" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionsList;