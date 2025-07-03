import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Layers, ArrowRight } from 'lucide-react';
import SortableOptionItem from './SortableOptionItem';
import { ConfiguratorOption } from '../../types/ConfiguratorTypes';

interface IndividualOptionsPanelProps {
  options: ConfiguratorOption[];
  onEditOption: (option: ConfiguratorOption) => void;
  onDeleteOption: (optionId: string) => void;
}

const IndividualOptionsPanel: React.FC<IndividualOptionsPanelProps> = ({
  options,
  onEditOption,
  onDeleteOption
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'individual-options-panel',
    data: {
      type: 'individual-options-zone'
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-full p-4 transition-all duration-200 ${
        isOver 
          ? 'bg-blue-500/10 border-2 border-dashed border-blue-400' 
          : 'bg-gray-800'
      }`}
    >
      {options.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
              <Layers className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-gray-400 font-medium text-lg mb-2">No individual options</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Create new options or drag them here from groups to get started
            </p>
            {isOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 flex items-center justify-center space-x-2 text-blue-400"
              >
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm font-medium">Drop here to ungroup</span>
              </motion.div>
            )}
          </motion.div>
        </div>
      ) : (
        <SortableContext items={options.map(opt => opt.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {isOver && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-500/20 border border-blue-400 rounded-lg p-3 text-center"
              >
                <span className="text-blue-300 text-sm font-medium">
                  Drop here to remove from group
                </span>
              </motion.div>
            )}
            
            {options.map((option, index) => (
              <SortableOptionItem
                key={option.id}
                option={option}
                index={index}
                onEdit={onEditOption}
                onDelete={onDeleteOption}
                variant="individual"
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
};

export default IndividualOptionsPanel;