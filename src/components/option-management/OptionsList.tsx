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

// Ungrouped Options Drop Zone Component
const UngroupedDropZone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'ungrouped-options-zone',
    data: {
      type: 'ungrouped-zone'
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isOver 
          ? 'bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-lg p-2' 
          : ''
      }`}
    >
      {children}
    </div>
  );
};

// Group Drop Zone Component
const GroupDropZone: React.FC<{ 
  groupId: string; 
  isExpanded: boolean;
  children: React.ReactNode;
}> = ({ groupId, isExpanded, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `group-drop-zone-${groupId}`,
    data: {
      type: 'group-drop-zone',
      groupId: groupId
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative transition-all duration-200 ${
        isOver && isExpanded
          ? 'bg-purple-500/10 border-2 border-dashed border-purple-400 rounded-lg' 
          : ''
      }`}
    >
      {children}
      {isOver && isExpanded && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <div className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
            Drop to add to group
          </div>
        </div>
      )}
    </div>
  );
};

// Ungroup Drop Zone Component (for removing items from groups)
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

  // Separate ungrouped options for the drop zone
  const ungroupedOptions = options.filter(option => !option.isGroup && !option.groupId);

  return (
    <SortableContext items={optionIds} strategy={verticalListSortingStrategy}>
      <div className="space-y-4">
        {/* Ungrouped Options Section */}
        {ungroupedOptions.length > 0 && (
          <UngroupedDropZone>
            <div className="space-y-3">
              {ungroupedOptions.map((option) => {
                const optionIndex = options.findIndex(opt => opt.id === option.id);
                return (
                  <DragDropOptionWrapper
                    key={option.id}
                    option={option}
                    index={optionIndex}
                    onMove={onMove}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onEditConditionalLogic={onEditConditionalLogic}
                    onMoveToGroup={onMoveToGroup}
                  />
                );
              })}
            </div>
          </UngroupedDropZone>
        )}

        {/* Groups Section */}
        {options.map((option, index) => {
          if (option.isGroup && option.groupData) {
            // Find all options that belong to this group
            const groupedOptions = options.filter(opt => 
              !opt.isGroup && opt.groupId === option.id
            );
            
            return (
              <div key={option.id} className="space-y-3">
                {/* Group Header - Fixed Position */}
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
                
                {/* Grouped Options - With Drop Zone */}
                {option.groupData?.isExpanded && (
                  <GroupDropZone 
                    groupId={option.id} 
                    isExpanded={option.groupData.isExpanded}
                  >
                    <div className="relative">
                      {/* Ungroup Drop Zone - Left side */}
                      <UngroupDropZone />
                      
                      {/* Grouped Options Container */}
                      <div className="ml-6 space-y-3 min-h-[60px] py-2">
                        {groupedOptions.length > 0 ? (
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
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            Drop options here to add them to this group
                          </div>
                        )}
                      </div>
                    </div>
                  </GroupDropZone>
                )}
              </div>
            );
          }
          
          // Skip non-group options here as they're handled in the ungrouped section
          return null;
        })}
      </div>
    </SortableContext>
  );
};

export default OptionsList;