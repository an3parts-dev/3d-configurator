import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import OptionRenderer from './OptionRenderer';
import { ConfiguratorOption, ConfiguratorOptionValue } from '../../types/ConfiguratorTypes';

interface GroupRendererProps {
  group: ConfiguratorOption;
  options: ConfiguratorOption[];
  isExpanded: boolean;
  selectedValues: Record<string, string>;
  onToggleGroup: (groupId: string) => void;
  onValueChange: (optionId: string, valueId: string) => void;
  getVisibleOptionValues: (option: ConfiguratorOption) => ConfiguratorOptionValue[];
}

const GroupRenderer: React.FC<GroupRendererProps> = ({
  group,
  options,
  isExpanded,
  selectedValues,
  onToggleGroup,
  onValueChange,
  getVisibleOptionValues
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Group Header */}
      <div 
        className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-3 sm:p-4 rounded-xl border border-purple-700/50 cursor-pointer hover:border-purple-600/50 transition-colors"
        onClick={() => onToggleGroup(group.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/20 rounded-lg border border-purple-500/30">
              <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base sm:text-lg flex items-center space-x-2">
                <span>{group.name}</span>
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/30">
                  {options.length} options
                </span>
              </h3>
              {group.description && (
                <p className="text-purple-200/80 text-xs sm:text-sm mt-1">{group.description}</p>
              )}
            </div>
          </div>
          <div className="text-purple-400">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Group Options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-3 sm:ml-6 space-y-4 sm:space-y-6 border-l-2 border-purple-500/20 pl-3 sm:pl-6"
          >
            {options.map((option) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <OptionRenderer
                  option={option}
                  visibleValues={getVisibleOptionValues(option)}
                  selectedValues={selectedValues}
                  onValueChange={onValueChange}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GroupRenderer;