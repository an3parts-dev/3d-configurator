import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, Plus, Sparkles } from 'lucide-react';
import OptimizedSortableGroupItem from './OptimizedSortableGroupItem';
import { ConfiguratorOption, ConfiguratorOptionGroup } from '../../types/ConfiguratorTypes';

interface OptimizedGroupsPanelProps {
  groups: Array<ConfiguratorOptionGroup & { options: ConfiguratorOption[] }>;
  expandedGroups: Set<string>;
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

const OptimizedGroupsPanel: React.FC<OptimizedGroupsPanelProps> = ({
  groups,
  expandedGroups,
  onToggleGroup,
  onEditOption,
  onEditGroup,
  onDeleteOption,
  onDeleteGroup,
  dragPreview
}) => {
  if (groups.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
            <Grid className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-gray-700 font-medium text-lg mb-2">No groups created</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto mb-4">
            Create your first group to organize related options together
          </p>
          
          {/* Visual Guide */}
          <div className="flex items-center justify-center space-x-2 text-purple-600 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Ready for organization</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white p-4">
      <SortableContext items={groups.map(grp => grp.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Grid Snap Indicator */}
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-200/20 to-blue-200/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              
              <OptimizedSortableGroupItem
                group={group}
                isExpanded={expandedGroups.has(group.id)}
                onToggleGroup={onToggleGroup}
                onEditOption={onEditOption}
                onEditGroup={onEditGroup}
                onDeleteOption={onDeleteOption}
                onDeleteGroup={onDeleteGroup}
                dragPreview={dragPreview}
              />
            </motion.div>
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default OptimizedGroupsPanel;