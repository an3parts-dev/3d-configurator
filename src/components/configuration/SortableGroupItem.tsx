import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GripVertical, 
  Edit, 
  Trash2, 
  FolderOpen, 
  ChevronDown, 
  ChevronRight,
  Users,
  Plus
} from 'lucide-react';
import SortableOptionItem from './SortableOptionItem';
import { ConfiguratorOption, ConfiguratorOptionGroup } from '../../types/ConfiguratorTypes';

interface SortableGroupItemProps {
  group: ConfiguratorOptionGroup & { options: ConfiguratorOption[] };
  isExpanded: boolean;
  onToggleGroup: (groupId: string) => void;
  onEditOption: (option: ConfiguratorOption) => void;
  onEditGroup: (group: ConfiguratorOptionGroup) => void;
  onDeleteOption: (optionId: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

const SortableGroupItem: React.FC<SortableGroupItemProps> = ({
  group,
  isExpanded,
  onToggleGroup,
  onEditOption,
  onEditGroup,
  onDeleteOption,
  onDeleteGroup
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: group.id,
    data: {
      type: 'group',
      group
    }
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `group-${group.id}`,
    data: {
      type: 'group-drop-zone',
      groupId: group.id
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isDragging ? 0.7 : 1, 
          y: 0,
          scale: isDragging ? 1.02 : 1,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          opacity: { duration: 0.15 },
          scale: { duration: 0.15 }
        }}
        className="space-y-3"
      >
        {/* Group Header */}
        <div
          ref={setDropRef}
          className={`relative bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-xl border transition-all duration-200 group ${
            isDragging 
              ? 'border-purple-500 shadow-2xl shadow-purple-500/30 z-50' 
              : isOver
              ? 'border-purple-400 shadow-lg shadow-purple-400/20 bg-purple-500/10'
              : 'border-purple-700/50 hover:border-purple-600/50 shadow-sm'
          }`}
        >
          {/* Drop Zone Indicator */}
          {isOver && (
            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-400 rounded-xl bg-purple-500/10 flex items-center justify-center z-10">
              <div className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
                <Plus className="w-4 h-4 inline mr-1" />
                Drop to add to group
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            {/* Drag Handle */}
            <div 
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-purple-700/30 transition-colors flex-shrink-0"
            >
              <GripVertical className="w-4 h-4 text-purple-400" />
            </div>

            {/* Group Icon */}
            <div className="p-2 bg-purple-600/20 rounded-lg border border-purple-500/30 flex-shrink-0">
              <FolderOpen className="w-4 h-4 text-purple-400" />
            </div>

            {/* Group Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-semibold text-base truncate">{group.name}</h3>
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/30 flex-shrink-0">
                  GROUP
                </span>
              </div>
              {group.description && (
                <p className="text-purple-200/80 text-sm mt-1 truncate">{group.description}</p>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="text-purple-300 text-sm font-medium flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{group.options.length}</span>
              </div>

              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditGroup(group)}
                  className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                  title="Edit Group"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteGroup(group.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => onToggleGroup(group.id)}
                className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Group Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-6 pl-4 border-l-2 border-purple-500/20"
            >
              {group.options.length === 0 ? (
                <div className="text-center py-8 text-purple-300/60 bg-purple-500/5 rounded-xl border border-purple-500/20">
                  <div className="text-sm font-medium mb-1">No options in this group</div>
                  <div className="text-xs">Drag options here to add them to this group</div>
                </div>
              ) : (
                <SortableContext items={group.options.map(opt => opt.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {group.options.map((option, index) => (
                      <SortableOptionItem
                        key={option.id}
                        option={option}
                        index={index}
                        onEdit={onEditOption}
                        onDelete={onDeleteOption}
                        variant="grouped"
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SortableGroupItem;