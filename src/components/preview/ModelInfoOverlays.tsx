import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Eye } from 'lucide-react';
import { InfoOverlay, StatusBadge } from '../ui';
import { ModelComponent, ConfiguratorOption } from '../../types/ConfiguratorTypes';

interface ModelInfoOverlaysProps {
  modelComponents: ModelComponent[];
  configuratorData: { options: ConfiguratorOption[] };
  visibleOptionsCount: number;
}

const ModelInfoOverlays: React.FC<ModelInfoOverlaysProps> = ({
  modelComponents,
  configuratorData,
  visibleOptionsCount
}) => {
  const hasConditionalLogic = configuratorData.options.some(opt => 
    opt.conditionalLogic?.enabled || opt.values.some(v => v.conditionalLogic?.enabled)
  );

  return (
    <>
      {/* Model Info */}
      <InfoOverlay position="top-left" title="3D Model Preview">
        <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-gray-300">
          <span>Components: {modelComponents.length}</span>
          <span>•</span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            Visible: {modelComponents.filter(c => c.visible).length}
          </span>
        </div>
      </InfoOverlay>

      {/* Conditional Logic Status */}
      {hasConditionalLogic && (
        <InfoOverlay position="top-right" className="bg-purple-600/20 border-purple-500/30">
          <div className="flex items-center space-x-2 text-purple-300">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.div>
            <span className="text-xs sm:text-sm font-medium">Smart Logic Active</span>
          </div>
          <p className="text-xs text-purple-200/80 mt-1">
            {visibleOptionsCount} of {configuratorData.options.filter(opt => !opt.isGroup).length} options visible
          </p>
        </InfoOverlay>
      )}

      {/* Controls Info */}
      <InfoOverlay position="bottom-right" title="">
        <div className="text-xs text-gray-300 space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Drag to rotate</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Scroll to zoom</span>
          </div>
        </div>
      </InfoOverlay>
    </>
  );
};

export default ModelInfoOverlays;