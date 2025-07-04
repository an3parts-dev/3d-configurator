import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Settings, Eye, Layers, ChevronDown } from 'lucide-react';
import { ConfiguratorData } from '../../types/ConfiguratorTypes';

interface ConfigurationSelectorProps {
  configurations: ConfiguratorData[];
  selectedConfiguration: ConfiguratorData | null;
  onSelectConfiguration: (config: ConfiguratorData | null) => void;
  onLoadConfiguration: () => void;
  isLoading?: boolean;
}

const ConfigurationSelector: React.FC<ConfigurationSelectorProps> = ({
  configurations,
  selectedConfiguration,
  onSelectConfiguration,
  onLoadConfiguration,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
          <Settings className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          Live Preview Configuration
        </h4>
        
        {selectedConfiguration && (
          <button
            onClick={onLoadConfiguration}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
          >
            <Play className="w-3 h-3" />
            <span>{isLoading ? 'Loading...' : 'Load Preview'}</span>
          </button>
        )}
      </div>

      {/* Configuration Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm">
              {selectedConfiguration ? selectedConfiguration.name : 'Select a configuration...'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-auto"
          >
            <div className="p-2">
              {/* None option */}
              <button
                onClick={() => {
                  onSelectConfiguration(null);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                  !selectedConfiguration
                    ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 opacity-50" />
                  <span>No Configuration (Static Preview)</span>
                </div>
              </button>

              {/* Configuration options */}
              {configurations.map(config => (
                <button
                  key={config.id}
                  onClick={() => {
                    onSelectConfiguration(config);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                    selectedConfiguration?.id === config.id
                      ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 opacity-50" />
                      <div>
                        <div className="font-medium">{config.name}</div>
                        {config.description && (
                          <div className="text-xs opacity-75 truncate max-w-[200px]">
                            {config.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                      {config.options.filter(opt => !opt.isGroup).length} options
                    </span>
                  </div>
                </button>
              ))}

              {configurations.length === 0 && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No configurations available</p>
                  <p className="text-xs mt-1">Create a configurator first to see live previews</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Configuration Info */}
      {selectedConfiguration && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
          <div className="flex items-start space-x-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedConfiguration.name}
              </p>
              {selectedConfiguration.description && (
                <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                  {selectedConfiguration.description}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600 dark:text-blue-300">
                <span>{selectedConfiguration.options.filter(opt => !opt.isGroup).length} options</span>
                <span>•</span>
                <span>{selectedConfiguration.options.filter(opt => opt.isGroup).length} groups</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        💡 Select a configurator to see live 3D preview with interactive options in your layout
      </p>
    </div>
  );
};

export default ConfigurationSelector;