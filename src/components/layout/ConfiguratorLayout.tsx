import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, 
  Minimize2, 
  PanelBottom, 
  PanelRight, 
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import Configurator3DView from '../Configurator3DView';
import ConfiguratorOptionsPanel from '../ConfiguratorOptionsPanel';
import ConfiguratorEndUserPanel from '../ConfiguratorEndUserPanel';
import { 
  ConfiguratorData, 
  ConfiguratorOption, 
  ModelComponent 
} from '../../types/ConfiguratorTypes';

export type LayoutMode = 'split' | 'fullscreen-bottom' | 'fullscreen-right' | 'fullscreen-only';
export type ViewMode = 'builder' | 'end-user';

interface ConfiguratorLayoutProps {
  // Layout configuration
  layoutMode: LayoutMode;
  viewMode: ViewMode;
  showOptionsPanel: boolean;
  
  // Data
  configuratorData: ConfiguratorData;
  modelComponents: ModelComponent[];
  lastSaved?: Date | null;
  
  // 3D View handlers
  onComponentsLoaded: (components: ModelComponent[]) => void;
  
  // Builder mode handlers (only used in builder mode)
  onCreateOption?: () => void;
  onCreateGroup?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onMoveOption?: (dragIndex: number, hoverIndex: number) => void;
  onEditOption?: (option: ConfiguratorOption) => void;
  onDeleteOption?: (optionId: string) => void;
  onEditConditionalLogic?: (option: ConfiguratorOption) => void;
  onToggleGroup?: (groupId: string) => void;
  
  // Layout controls
  onToggleOptionsPanel: () => void;
  onChangeLayoutMode: (mode: LayoutMode) => void;
  onChangeViewMode?: (mode: ViewMode) => void;
}

const ConfiguratorLayout: React.FC<ConfiguratorLayoutProps> = ({
  layoutMode,
  viewMode,
  showOptionsPanel,
  configuratorData,
  modelComponents,
  lastSaved,
  onComponentsLoaded,
  onCreateOption,
  onCreateGroup,
  onExport,
  onImport,
  onMoveOption,
  onEditOption,
  onDeleteOption,
  onEditConditionalLogic,
  onToggleGroup,
  onToggleOptionsPanel,
  onChangeLayoutMode,
  onChangeViewMode
}) => {
  // Layout control component for fullscreen modes
  const LayoutControls = () => (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-gray-600">
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle (only show in builder) */}
          {viewMode === 'builder' && onChangeViewMode && (
            <>
              <button
                onClick={() => onChangeViewMode('end-user')}
                className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                title="Switch to End User View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-600"></div>
            </>
          )}

          {/* Layout Mode Controls */}
          <button
            onClick={() => onChangeLayoutMode('split')}
            className={`p-2 rounded-lg transition-colors ${
              layoutMode === 'split'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Split View"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => onChangeLayoutMode('fullscreen-bottom')}
            className={`p-2 rounded-lg transition-colors ${
              layoutMode === 'fullscreen-bottom'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Fullscreen with Bottom Panel"
          >
            <PanelBottom className="w-4 h-4" />
          </button>

          <button
            onClick={() => onChangeLayoutMode('fullscreen-right')}
            className={`p-2 rounded-lg transition-colors ${
              layoutMode === 'fullscreen-right'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Fullscreen with Right Panel"
          >
            <PanelRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onChangeLayoutMode('fullscreen-only')}
            className={`p-2 rounded-lg transition-colors ${
              layoutMode === 'fullscreen-only'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Fullscreen Only"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Panel Toggle (for fullscreen modes) */}
          {layoutMode !== 'split' && layoutMode !== 'fullscreen-only' && (
            <>
              <div className="w-px h-6 bg-gray-600"></div>
              <button
                onClick={onToggleOptionsPanel}
                className={`p-2 rounded-lg transition-colors ${
                  showOptionsPanel
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={showOptionsPanel ? 'Hide Options Panel' : 'Show Options Panel'}
              >
                {showOptionsPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Render the appropriate options panel based on view mode
  const renderOptionsPanel = (className?: string) => {
    if (viewMode === 'end-user') {
      return (
        <div className={className}>
          <ConfiguratorEndUserPanel
            configuratorData={configuratorData}
            layoutMode={layoutMode}
          />
        </div>
      );
    } else {
      return (
        <div className={className}>
          <ConfiguratorOptionsPanel
            configuratorData={configuratorData}
            modelComponents={modelComponents}
            lastSaved={lastSaved}
            isPreviewMode={false}
            onTogglePreviewMode={onToggleOptionsPanel}
            onCreateOption={onCreateOption!}
            onCreateGroup={onCreateGroup!}
            onExport={onExport!}
            onImport={onImport!}
            onMoveOption={onMoveOption!}
            onEditOption={onEditOption!}
            onDeleteOption={onDeleteOption!}
            onEditConditionalLogic={onEditConditionalLogic!}
            onToggleGroup={onToggleGroup!}
          />
        </div>
      );
    }
  };

  switch (layoutMode) {
    case 'split':
      return (
        <div className="min-h-screen bg-gray-900 flex">
          {/* Left Panel - Options */}
          {renderOptionsPanel('w-1/2')}

          {/* Right Panel - 3D View */}
          <div className="w-1/2">
            <Configurator3DView
              configuratorData={configuratorData}
              isPreviewMode={false}
              onComponentsLoaded={onComponentsLoaded}
            />
          </div>
        </div>
      );

    case 'fullscreen-bottom':
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col relative">
          <LayoutControls />
          
          {/* Top - 3D View */}
          <div className="flex-1">
            <Configurator3DView
              configuratorData={configuratorData}
              isPreviewMode={true}
              onComponentsLoaded={onComponentsLoaded}
            />
          </div>

          {/* Bottom - Options Panel */}
          <AnimatePresence>
            {showOptionsPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="border-t border-gray-700 overflow-hidden"
              >
                <div className="h-80">
                  {renderOptionsPanel('h-full')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );

    case 'fullscreen-right':
      return (
        <div className="min-h-screen bg-gray-900 flex relative">
          <LayoutControls />
          
          {/* Left - 3D View */}
          <div className="flex-1">
            <Configurator3DView
              configuratorData={configuratorData}
              isPreviewMode={true}
              onComponentsLoaded={onComponentsLoaded}
            />
          </div>

          {/* Right - Options Panel */}
          <AnimatePresence>
            {showOptionsPanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '400px', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="border-l border-gray-700 overflow-hidden"
              >
                {renderOptionsPanel('w-full h-full')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );

    case 'fullscreen-only':
      return (
        <div className="min-h-screen bg-gray-900 relative">
          <LayoutControls />
          
          {/* Full Screen 3D View */}
          <Configurator3DView
            configuratorData={configuratorData}
            isPreviewMode={true}
            onComponentsLoaded={onComponentsLoaded}
          />
        </div>
      );

    default:
      return null;
  }
};

export default ConfiguratorLayout;