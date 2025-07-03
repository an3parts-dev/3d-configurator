import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowRight, Plus, Sparkles } from 'lucide-react';
import OptimizedSortableOptionItem from './OptimizedSortableOptionItem';
import { ConfiguratorOption } from '../../types/ConfiguratorTypes';

interface OptimizedUngroupedPanelProps {
  options: ConfiguratorOption[];
  onEditOption: (option: ConfiguratorOption) => void;
  onDeleteOption: (optionId: string) => void;
  dragPreview: {
    targetZone: string | null;
    position: { x: number; y: number } | null;
  };
}

const OptimizedUngroupedPanel: React.FC<OptimizedUngroupedPanelProps> = ({
  options,
  onEditOption,
  onDeleteOption,
  dragPreview
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'ungrouped-options-panel',
    data: {
      type: 'ungrouped-zone'
    }
  });

  const isTargetZone = dragPreview.targetZone === 'ungrouped';

  return (
    <div
      ref={setNodeRef}
      className={`h-full p-4 transition-all duration-300 relative ${
        isOver || isTargetZone
          ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-dashed border-blue-400' 
          : 'bg-white'
      }`}
    >
      {/* Drop Zone Indicator */}
      <AnimatePresence>
        {(isOver || isTargetZone) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-4 pointer-events-none border-2 border-dashed border-blue-400 rounded-xl bg-blue-500/10 flex items-center justify-center z-10"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Drop to ungroup</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {options.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-gray-700 font-medium text-lg mb-2">No ungrouped options</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-4">
              Create new options or drag them here from groups
            </p>
            
            {/* Visual Guide */}
            <div className="flex items-center justify-center space-x-2 text-blue-600 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Drag zone ready</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      ) : (
        <SortableContext items={options.map(opt => opt.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {/* Grid Snap Indicators */}
            <div className="grid grid-cols-1 gap-3">
              {options.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  {/* Snap Grid Indicator */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                  
                  <OptimizedSortableOptionItem
                    option={option}
                    index={index}
                    onEdit={onEditOption}
                    onDelete={onDeleteOption}
                    variant="ungrouped"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </SortableContext>
      )}
    </div>
  );
};

export default OptimizedUngroupedPanel;