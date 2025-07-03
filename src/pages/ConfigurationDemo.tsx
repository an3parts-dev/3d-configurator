import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { OptimizedConfigurationInterface } from '../components/configuration';
import { ConfiguratorOption, ConfiguratorOptionGroup } from '../types/ConfiguratorTypes';

const ConfigurationDemo: React.FC = () => {
  // Sample data for demonstration
  const [options, setOptions] = useState<ConfiguratorOption[]>([
    {
      id: 'option-1',
      name: 'Wheel Style',
      description: 'Choose your preferred wheel design',
      displayType: 'images',
      manipulationType: 'visibility',
      targetComponents: ['wheel_front', 'wheel_rear'],
      values: [
        { id: 'wheel-1', name: 'Sport Wheels' },
        { id: 'wheel-2', name: 'Classic Wheels' },
        { id: 'wheel-3', name: 'Racing Wheels' }
      ]
    },
    {
      id: 'option-2',
      name: 'Body Color',
      description: 'Select your vehicle color',
      displayType: 'buttons',
      manipulationType: 'material',
      targetComponents: ['body'],
      values: [
        { id: 'color-1', name: 'Red', color: '#FF0000' },
        { id: 'color-2', name: 'Blue', color: '#0000FF' },
        { id: 'color-3', name: 'Black', color: '#000000' }
      ]
    },
    {
      id: 'option-3',
      name: 'Interior Trim',
      description: 'Choose interior finishing',
      displayType: 'list',
      manipulationType: 'material',
      targetComponents: ['interior'],
      groupId: 'group-1',
      values: [
        { id: 'trim-1', name: 'Wood Grain' },
        { id: 'trim-2', name: 'Carbon Fiber' },
        { id: 'trim-3', name: 'Brushed Metal' }
      ]
    },
    {
      id: 'option-4',
      name: 'Seat Material',
      description: 'Select seat upholstery',
      displayType: 'buttons',
      manipulationType: 'material',
      targetComponents: ['seats'],
      groupId: 'group-1',
      values: [
        { id: 'seat-1', name: 'Leather' },
        { id: 'seat-2', name: 'Fabric' },
        { id: 'seat-3', name: 'Alcantara' }
      ]
    },
    {
      id: 'option-5',
      name: 'Lighting Package',
      description: 'Enhanced lighting options',
      displayType: 'buttons',
      manipulationType: 'visibility',
      targetComponents: ['lights'],
      conditionalLogic: {
        id: 'logic-1',
        enabled: true,
        operator: 'AND',
        rules: []
      },
      values: [
        { id: 'light-1', name: 'Standard' },
        { id: 'light-2', name: 'LED Premium' },
        { id: 'light-3', name: 'Adaptive Matrix' }
      ]
    }
  ]);

  const [groups, setGroups] = useState<ConfiguratorOptionGroup[]>([
    {
      id: 'group-1',
      name: 'Interior Package',
      description: 'Customize your interior experience',
      isExpanded: true
    },
    {
      id: 'group-2',
      name: 'Performance Package',
      description: 'Enhance your driving performance',
      isExpanded: false
    }
  ]);

  const handleCreateOption = useCallback(() => {
    const newOption: ConfiguratorOption = {
      id: `option-${Date.now()}`,
      name: 'New Option',
      description: 'A new configuration option',
      displayType: 'buttons',
      manipulationType: 'visibility',
      targetComponents: [],
      values: [
        { id: `value-${Date.now()}`, name: 'Default Value' }
      ]
    };
    setOptions(prev => [...prev, newOption]);
  }, []);

  const handleCreateGroup = useCallback(() => {
    const newGroup: ConfiguratorOptionGroup = {
      id: `group-${Date.now()}`,
      name: 'New Group',
      description: 'A new option group',
      isExpanded: true
    };
    setGroups(prev => [...prev, newGroup]);
  }, []);

  const handleEditOption = useCallback((option: ConfiguratorOption) => {
    console.log('Edit option:', option);
    // In a real app, this would open an edit modal
  }, []);

  const handleEditGroup = useCallback((group: ConfiguratorOptionGroup) => {
    console.log('Edit group:', group);
    // In a real app, this would open an edit modal
  }, []);

  const handleDeleteOption = useCallback((optionId: string) => {
    setOptions(prev => prev.filter(opt => opt.id !== optionId));
  }, []);

  const handleDeleteGroup = useCallback((groupId: string) => {
    setGroups(prev => prev.filter(grp => grp.id !== groupId));
    // Also remove group assignment from options
    setOptions(prev => prev.map(opt => 
      opt.groupId === groupId ? { ...opt, groupId: undefined } : opt
    ));
  }, []);

  const handleReset = useCallback(() => {
    // Reset to initial state
    window.location.reload();
  }, []);

  const handleSave = useCallback(() => {
    console.log('Saving configuration...', { options, groups });
    // In a real app, this would save to backend
  }, [options, groups]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-gray-900 font-bold text-xl">Optimized Configuration Interface</h1>
              <p className="text-gray-600 text-sm">
                Enhanced drag-and-drop with cleanup, ungrouped areas, and visual feedback
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <OptimizedConfigurationInterface
          options={options}
          groups={groups}
          onOptionsChange={setOptions}
          onGroupsChange={setGroups}
          onCreateOption={handleCreateOption}
          onCreateGroup={handleCreateGroup}
          onEditOption={handleEditOption}
          onEditGroup={handleEditGroup}
          onDeleteOption={handleDeleteOption}
          onDeleteGroup={handleDeleteGroup}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6 text-gray-600">
            <span>Options: {options.filter(opt => !opt.isGroup).length}</span>
            <span>Groups: {groups.length}</span>
            <span>Ungrouped: {options.filter(opt => !opt.groupId && !opt.isGroup).length}</span>
          </div>
          <div className="text-gray-500">
            Optimized workspace with enhanced drag-and-drop features
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationDemo;