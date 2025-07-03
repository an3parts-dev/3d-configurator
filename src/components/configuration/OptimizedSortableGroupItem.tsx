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
  Plus,
  Target,
  Grid
} from 'lucide-react';
import OptimizedSortableOptionItem from './OptimizedSortableOptionItem';
import { ConfiguratorOption, ConfiguratorOptionGroup } from '../../types/ConfiguratorTypes';

interface OptimizedSortableGroupItemProps {
  group: ConfiguratorOptionGroup & { options: ConfiguratorOption[] };
  isExpanded: boolean;
  onToggleGroup: (groupId: string) => void;
  onEditOption: (option: ConfiguratorOption) => void;
  onEditGroup: (group: ConfiguratorOptionGroup) => void;
  onDeleteOption: (optionId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  dragPreview: {
    targetZone: string | null;
    position: { x: number; y: number } | null;
  };
}

const OptimizedSortableGroupItem: React.FC<OptimizedSortableGroupItemProps> = ({
  group,
  isExpanded,
  onToggleGroup,
  onEditOption,
  onEditGroup,
  onDeleteOption,
  onDeleteGroup,
  dragPreview
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

  const isTargetZone = dragPreview.targetZone === `group-${group.id}`;

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
          className={`relative bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border-2 transition-all duration-200 group ${
            isDragging 
              ? 'border-purple-500 shadow-2xl shadow-purple-500/30 z-50' 
              : isOver || isTargetZone
              ? 'border-purple-400 shadow-lg shadow-purple-400/20 bg-purple-100/50'
              : 'border-purple-200 hover:border-purple-300 shadow-sm'
          }`}
        >
          {/* Drop Zone Indicator */}
          <AnimatePresence>
            {(isOver || isTargetZone) && (
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-400 rounded-xl bg-purple-500/10 flex items-center justify-center z-10">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Drop to add to group</span>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <div className="flex items-center space-x-3 relative z-20">
            {/* Drag Handle */}
            <div 
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-purple-100 transition-colors flex-shrink-0 group/handle"
            >
              <GripVertical className="w-4 h-4 text-purple-500 group-hover/handle:text-purple-600 transition-colors" />
            </div>

            {/* Group Icon */}
            <div className="p-2 bg-purple-100 rounded-lg border border-purple-200 flex-shrink-0">
              <FolderOpen className="w-4 h-4 text-purple-600" />
            </div>

            {/* Group Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-gray-900 font-semibold text-base truncate">{group.name}</h3>
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium border border-purple-200 flex-shrink-0">
                  GROUP
                </span>
              </div>
              {group.description && (
                <p className="text-purple-700/80 text-sm mt-1 truncate">{group.description}</p>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="text-purple-700 text-sm font-medium flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-lg border border-purple-200">
                <Users className="w-4 h-4" />
                <span>{group.options.length}</span>
              </div>

              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditGroup(group)}
                  className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Edit Group"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteGroup(group.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => onToggleGroup(group.id)}
                className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
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

        {/* Group Content with Grid Snap System */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-6 pl-4 border-l-2 border-purple-200"
            >
              {group.options.length === 0 ? (
                <div className="text-center py-8 text-purple-600/60 bg-purple-50 rounded-xl border-2 border-dashed border-purple-200">
                  <Grid className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm font-medium mb-1">No options in this group</div>
                  <div className="text-xs">Drag options here to add them to this group</div>
                </div>
              ) : (
                <SortableContext items={group.options.map(opt => opt.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {/* Grid Layout for Better Organization */}
                    <div className="grid grid-cols-1 gap-3">
                      {group.options.map((option, index) => (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative"
                        >
                          {/* Snap Grid Indicator */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/20 to-blue-200/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                          
                          <OptimizedSortableOptionItem
                            option={option}
                            index={index}
                            onEdit={onEditOption}
                            onDelete={onDeleteOption}
                            variant="grouped"
                          />
                        </motion.div>
                      ))}
                    </div>
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

export default OptimizedSortableGroupItem;