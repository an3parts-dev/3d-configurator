import React from 'react';
import { Settings, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold text-white">Brake Line Configurator</h1>
              <p className="text-xs lg:text-sm text-gray-400 hidden sm:block">Design your custom brake line</p>
            </div>
          </div>
          
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-3 py-2 lg:px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};