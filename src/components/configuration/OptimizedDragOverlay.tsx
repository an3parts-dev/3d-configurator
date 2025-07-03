import React from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  FolderOpen, 
  Users, 
  Eye, 
  Palette,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';
import { ConfiguratorOption, ConfiguratorOptionGroup } from '../../types/ConfiguratorTypes';

interface OptimizedDragOverlayProps {
  item: ConfiguratorOption | ConfiguratorOptionGroup;
  type: 'option' | 'group' | null;
  dragPreview: {
    targetZone: string | null;
    position: { x: number; y: number } | null;
  };
}

const OptimizedDragOverlay: React.FC<OptimizedDragOverlayProps> = ({
  item,
  type,
  dragPreview
}) => {
  if (type === 'group') {
    const group = item as ConfiguratorOptionGroup;
    return (
      <motion.div
        initial={{ scale: 1.05, rotate: 2 }}
        animate={{ scale: 1.1, rotate: 5 }}
        className="bg-gradient-to-r from-purple-100/90 to-blue-100/90 p-4 rounded-xl border-2 border-purple-400 shadow-2xl backdrop-blur-sm relative"
      >
        {/* Target Zone Indicator */}
        {dragPreview.targetZone && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full">
            <Target className="w-3 h-3" />
          </div>
        )}

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-200/30 rounded-lg border border-purple-400/50">
            <FolderOpen className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold text-base">{group.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="bg-purple-200/30 text-purple-800 text-xs px-2 py-1 rounded-full font-medium border border-purple-400/50">
                GROUP
              </span>
              <div className="text-purple-700 text-sm flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>Group</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drop Preview */}
        {dragPreview.targetZone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center space-x-2 text-green-700 text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Moving to {dragPreview.targetZone.replace('-', ' ')}</span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (type === 'option') {
    const option = item as ConfiguratorOption;
    const hasConditionalLogic = option.conditionalLogic?.enabled;
    
    return (
      <motion.div
        initial={{ scale: 1.05, rotate: -2 }}
        animate={{ scale: 1.1, rotate: -5 }}
        className="bg-white/90 p-4 rounded-xl border-2 border-blue-400 shadow-2xl backdrop-blur-sm relative"
      >
        {/* Conditional Logic Indicator */}
        {hasConditionalLogic && (
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
            <Zap className="w-3 h-3" />
          </div>
        )}

        {/* Target Zone Indicator */}
        {dragPreview.targetZone && (
          <div className="absolute -top-2 -left-2 bg-green-500 text-white p-1 rounded-full">
            <Target className="w-3 h-3" />
          </div>
        )}

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100/30 rounded-lg border border-blue-400/50">
            <Layers className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-gray-900 font-semibold text-base">{option.name}</h4>
              {hasConditionalLogic && (
                <span className="bg-orange-100/30 text-orange-800 text-xs px-2 py-1 rounded-full font-medium border border-orange-400/50">
                  Logic
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                {option.manipulationType === 'visibility' ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <Palette className="w-3 h-3" />
                )}
                <span className="capitalize">{option.manipulationType}</span>
              </div>
              
              <span className="text-gray-500 text-xs">•</span>
              
              <span className="text-gray-600 text-xs">
                {option.values.length} values
              </span>
              
              <span className="text-gray-500 text-xs">•</span>
              
              <span className="text-gray-600 text-xs capitalize">
                {option.displayType}
              </span>
            </div>
          </div>
        </div>

        {/* Drop Preview */}
        {dragPreview.targetZone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center space-x-2 text-green-700 text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            <span>
              {dragPreview.targetZone === 'ungrouped' 
                ? 'Moving to ungrouped area' 
                : `Adding to ${dragPreview.targetZone.replace('group-', 'group ')}`
              }
            </span>
          </motion.div>
        )}

        {/* Grid Snap Indicator */}
        <div className="absolute inset-0 border-2 border-dashed border-green-400 rounded-xl bg-green-500/10 opacity-50" />
      </motion.div>
    );
  }

  return null;
};

export default OptimizedDragOverlay;