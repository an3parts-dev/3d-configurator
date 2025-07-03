import React from 'react';
import ThreeJSPreview from './ThreeJSPreview';
import { 
  ConfiguratorData, 
  ModelComponent 
} from '../types/ConfiguratorTypes';

interface Configurator3DViewProps {
  configuratorData: ConfiguratorData;
  isPreviewMode: boolean;
  onComponentsLoaded: (components: ModelComponent[]) => void;
  showMobilePreviewToggle?: boolean;
  onToggleMobilePreview?: () => void;
  isMobilePreviewMode?: boolean;
}

const Configurator3DView: React.FC<Configurator3DViewProps> = ({
  configuratorData,
  isPreviewMode,
  onComponentsLoaded,
  showMobilePreviewToggle = false,
  onToggleMobilePreview,
  isMobilePreviewMode = false
}) => {
  return (
    <div className={`transition-all duration-300 ${
      isPreviewMode ? 'w-full' : 'w-1/2'
    }`}>
      <ThreeJSPreview
        configuratorData={configuratorData}
        onComponentsLoaded={onComponentsLoaded}
        showMobilePreviewToggle={showMobilePreviewToggle}
        onToggleMobilePreview={onToggleMobilePreview}
        isMobilePreviewMode={isMobilePreviewMode}
      />
    </div>
  );
};

export default Configurator3DView;