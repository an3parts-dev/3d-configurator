import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { FolderPlus } from 'lucide-react';
import SortableGroupItem from './SortableGroupItem';
import { ConfiguratorOption, ConfiguratorOptionGroup } from '../../types/ConfiguratorTypes';

interface GroupsPanelProps {
  groups: Array<ConfiguratorOptionGroup & { options: ConfiguratorOption[] }>;
  expandedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onEditOption: (option: ConfiguratorOption) => void;
  onEditGroup: (group: ConfiguratorOptionGroup) => void;
  onDeleteOption: (optionId: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

const GroupsPanel: React.FC<GroupsPanelProps> = ({
  groups,
  expandedGroups,
  onToggleGroup,
  onEditOption,
  onEditGroup,
  onDeleteOption,
  onDeleteGroup
}) => {
  if (groups.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-800 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <FolderPlus className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-gray-400 font-medium text-lg mb-2">No groups created</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Create your first group to organize related options together
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-800 p-4">
      <SortableContext items={groups.map(grp => grp.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {groups.map((group) => (
            <SortableGroupItem
              key={group.id}
              group={group}
              isExpanded={expandedGroups.has(group.id)}
              onToggleGroup={onToggleGroup}
              onEditOption={onEditOption}
              onEditGroup={onEditGroup}
              onDeleteOption={onDeleteOption}
              onDeleteGroup={onDeleteGroup}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default GroupsPanel;