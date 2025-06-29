import React from 'react';
import { Settings, Eye } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'configurator' | 'admin';
  onTabChange: (tab: 'configurator' | 'admin') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'configurator', label: 'Configurator', icon: Eye },
    { id: 'admin', label: 'Admin Panel', icon: Settings }
  ];

  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};