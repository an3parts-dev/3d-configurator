import React, { useState, useEffect } from 'react';
import { ModelViewer } from './ModelViewer';
import { ConfigPanel } from './ConfigPanel';
import { ConfigurationSummary } from './ConfigurationSummary';
import { Header } from './Header';
import { useConfiguration } from '../hooks/useConfiguration';
import { LoadingScreen } from './LoadingScreen';

export const Configurator: React.FC = () => {
  const { configuration, updateConfiguration, resetConfiguration } = useConfiguration();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onReset={resetConfiguration} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {/* 3D Viewer - Sticky */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 space-y-6">
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <ModelViewer configuration={configuration} />
              </div>
              <ConfigurationSummary configuration={configuration} />
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            <ConfigPanel 
              configuration={configuration}
              onUpdate={updateConfiguration}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Sticky 3D Viewer for Mobile - Landscape orientation */}
          <div className="sticky top-0 z-40 mb-6">
            <div className="bg-gray-800 rounded-b-2xl shadow-2xl">
              <div className="h-[40vh] min-h-[300px]">
                <ModelViewer configuration={configuration} />
              </div>
            </div>
          </div>

          {/* Configuration Summary - Below preview on mobile */}
          <div className="mb-6">
            <ConfigurationSummary configuration={configuration} />
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            <ConfigPanel 
              configuration={configuration}
              onUpdate={updateConfiguration}
            />
          </div>
        </div>
      </div>
    </div>
  );
};