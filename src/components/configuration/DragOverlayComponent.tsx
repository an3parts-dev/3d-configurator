import React from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  FolderOpen, 
  Users, 
  Eye, 
  Palette,
  Zap
} from 'lucide-react';
import { ConfiguratorOption, ConfiguratorOptionGroup } from '../../types/ConfiguratorTypes';

interface DragOverlayComponentProps {
  item: ConfiguratorOption | ConfiguratorOptionGroup;
  type: 'option' | 'group' | null;
}

const DragOverlayComponent: React.FC<DragOverlayComponentProps> = ({
  item,
  type
}) => {
  if (type === 'group') {
    const group = item as ConfiguratorOptionGroup;
    return (
      <motion.div
        initial={{ scale: 1.05, rotate: 2 }}
        animate={{ scale: 1.1, rotate: 5 }}
        className="bg-gradient-to-r from-purple-900/90 to-blue-900/90 p-4 rounded-xl border border-purple-500 shadow-2xl backdrop-blur-sm"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/30 rounded-lg border border-purple-500/50">
            <FolderOpen className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">{group.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="bg-purple-500/30 text-purple-200 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/50">
                GROUP
              </span>
              <div className="text-purple-300 text-sm flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>Group</span>
              </div>
            </div>
          </div>
        </div>
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
        className="bg-gray-800/90 p-4 rounded-xl border border-blue-500 shadow-2xl backdrop-blur-sm relative"
      >
        {/* Conditional Logic Indicator */}
        {hasConditionalLogic && (
          <div className="absolute -top-2 -right-2 bg-orange-600 text-white p-1.5 rounded-full shadow-lg border-2 border-gray-800">
            <Zap className="w-3 h-3" />
          </div>
        )}

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/30 rounded-lg border border-blue-500/50">
            <Layers className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-white font-semibold text-base">{option.name}</h4>
              {hasConditionalLogic && (
                <span className="bg-orange-500/30 text-orange-200 text-xs px-2 py-1 rounded-full font-medium border border-orange-500/50">
                  Logic
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-1 text-xs text-gray-300">
                {option.manipulationType === 'visibility' ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <Palette className="w-3 h-3" />
                )}
                <span className="capitalize">{option.manipulationType}</span>
              </div>
              
              <span className="text-gray-500 text-xs">•</span>
              
              <span className="text-gray-300 text-xs">
                {option.values.length} values
              </span>
              
              <span className="text-gray-500 text-xs">•</span>
              
              <span className="text-gray-300 text-xs capitalize">
                {option.displayType}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default DragOverlayComponent;