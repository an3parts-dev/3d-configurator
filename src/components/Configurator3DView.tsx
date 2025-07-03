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
  onTogglePreviewMode: () => void;
}

const Configurator3DView: React.FC<Configurator3DViewProps> = ({
  configuratorData,
  isPreviewMode,
  onComponentsLoaded,
  onTogglePreviewMode
}) => {
  return (
    <div className={`transition-all duration-300 ${
      isPreviewMode ? 'w-full' : 'w-full sm:w-1/2'
    }`}>
      <ThreeJSPreview
        configuratorData={configuratorData}
        onComponentsLoaded={onComponentsLoaded}
        isPreviewMode={isPreviewMode}
        onTogglePreviewMode={onTogglePreviewMode}
      />
    </div>
  );
};

export default Configurator3DView;