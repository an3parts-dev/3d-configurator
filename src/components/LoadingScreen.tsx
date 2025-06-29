import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading 3D Configurator</h2>
        <p className="text-gray-400">Preparing your brake line design experience...</p>
      </div>
    </div>
  );
};