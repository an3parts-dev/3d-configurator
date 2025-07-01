import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Zap, Image as ImageIcon } from 'lucide-react';
import BabylonPreview from './BabylonPreview';
import { ConfiguratorData, ModelComponent } from '../types/ConfiguratorTypes';

interface FullscreenPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  configuratorData: ConfiguratorData;
  onComponentsLoaded?: (components: ModelComponent[]) => void;
}

const FullscreenPreview: React.FC<FullscreenPreviewProps> = ({
  isOpen,
  onClose,
  configuratorData,
  onComponentsLoaded
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black z-[1000] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between flex-shrink-0"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">{configuratorData.name}</h1>
                <p className="text-gray-400 text-sm">{configuratorData.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleFullscreen}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Fullscreen</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Main Content - Nike-style Layout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex overflow-hidden"
        >
          {/* Left Side - 3D Model (60% width) */}
          <div className="w-3/5 bg-gray-900 relative">
            <BabylonPreview
              configuratorData={configuratorData}
              onComponentsLoaded={onComponentsLoaded}
            />
          </div>

          {/* Right Side - Options Panel (40% width) */}
          <div className="w-2/5 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-white font-semibold text-lg">Customize Your Product</h2>
              <p className="text-gray-400 text-sm mt-1">Select options to see changes in real-time</p>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {/* Options will be rendered by BabylonPreview component */}
              <div className="text-center py-8 text-gray-500">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-gray-500 border-t-blue-400 rounded-full"
                  />
                </div>
                <p className="text-sm">Options panel will appear here</p>
                <p className="text-xs mt-1 text-gray-600">Configure options in the main editor first</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-gray-900 border-t border-gray-700 px-6 py-4 flex items-center justify-between flex-shrink-0"
        >
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Press ESC to close</span>
            <span>•</span>
            <span>Drag to rotate • Scroll to zoom</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Live Preview Active</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FullscreenPreview;