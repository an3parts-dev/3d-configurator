import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Image as ImageIcon, 
  FolderOpen, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';
import { 
  ConfiguratorData, 
  ConfiguratorOption 
} from '../types/ConfiguratorTypes';
import { ConditionalLogicEngine } from '../utils/ConditionalLogicEngine';
import { LayoutMode } from './layout/ConfiguratorLayout';

interface ConfiguratorEndUserPanelProps {
  configuratorData: ConfiguratorData;
  layoutMode: LayoutMode;
}

const ConfiguratorEndUserPanel: React.FC<ConfiguratorEndUserPanelProps> = ({
  configuratorData,
  layoutMode
}) => {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Initialize default selections and expanded groups
  React.useEffect(() => {
    const defaultSelections: Record<string, string> = {};
    const initialExpandedGroups = new Set<string>();
    
    configuratorData.options.forEach(option => {
      if (!option.isGroup) {
        const validValues = option.values.filter(Boolean);
        if (validValues.length > 0) {
          defaultSelections[option.id] = validValues[0].id;
        }
      } else if (option.groupData?.isExpanded) {
        initialExpandedGroups.add(option.id);
      }
    });
    
    setSelectedValues(defaultSelections);
    setExpandedGroups(initialExpandedGroups);
  }, [configuratorData.options]);

  const handleValueChange = useCallback((optionId: string, valueId: string) => {
    setSelectedValues(prev => ({
      ...prev,
      [optionId]: valueId
    }));
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Get visible options based on conditional logic
  const visibleOptions = ConditionalLogicEngine.getVisibleOptions(
    configuratorData.options.filter(opt => !opt.isGroup),
    selectedValues
  );

  const getBorderStyles = (imageSettings?: any) => {
    if (!imageSettings?.cornerStyle) return {};
    
    let borderRadius = '0px';
    switch (imageSettings.cornerStyle) {
      case 'squared':
        borderRadius = '0px';
        break;
      case 'soft':
        borderRadius = '4px';
        break;
      case 'softer':
        borderRadius = '8px';
        break;
    }

    if (imageSettings.aspectRatio === 'round') {
      borderRadius = '50%';
    }
    
    return { borderRadius };
  };

  const renderOption = (option: ConfiguratorOption) => {
    const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
      option,
      selectedValues,
      configuratorData.options.filter(opt => !opt.isGroup)
    );

    if (visibleValues.length === 0) return null;

    const isRowDirection = option.displayDirection === 'row';
    const isCompactLayout = layoutMode === 'fullscreen-bottom' || layoutMode === 'fullscreen-right';

    return (
      <div key={option.id} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`text-white font-semibold ${isCompactLayout ? 'text-lg' : 'text-xl'}`}>
              {option.name}
              {option.conditionalLogic?.enabled && (
                <span className="ml-2 inline-flex items-center px-2 py-1 bg-purple-500/20 rounded-full">
                  <Zap className="w-3 h-3 text-purple-400" />
                </span>
              )}
            </h4>
            {option.description && !isCompactLayout && (
              <p className="text-gray-400 text-sm mt-1">{option.description}</p>
            )}
          </div>
        </div>
        
        {option.displayType === 'images' ? (
          <div className={`${isRowDirection ? 'flex gap-3 overflow-x-auto pb-2' : 'flex flex-wrap gap-3'}`}>
            {visibleValues.map((value: any) => (
              <button
                key={value.id}
                onClick={() => handleValueChange(option.id, value.id)}
                className={`relative group transition-all duration-200 ${isRowDirection ? 'flex-shrink-0' : ''} ${
                  selectedValues[option.id] === value.id
                    ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/25 scale-105'
                    : 'hover:scale-102'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-center overflow-hidden">
                    {value.image ? (
                      <img
                        src={value.image}
                        alt={value.name}
                        className={`${
                          option.imageSettings?.aspectRatio === 'auto' 
                            ? 'object-contain' 
                            : 'object-cover'
                        } ${
                          isCompactLayout ? (
                            option.imageSettings?.size === 'x-small' ? 'w-10 h-10' :
                            option.imageSettings?.size === 'small' ? 'w-12 h-12' :
                            option.imageSettings?.size === 'medium' ? 'w-14 h-14' :
                            option.imageSettings?.size === 'large' ? 'w-16 h-16' :
                            option.imageSettings?.size === 'x-large' ? 'w-20 h-20' :
                            'w-14 h-14'
                          ) : (
                            option.imageSettings?.size === 'x-small' ? 'w-12 h-12' :
                            option.imageSettings?.size === 'small' ? 'w-16 h-16' :
                            option.imageSettings?.size === 'medium' ? 'w-20 h-20' :
                            option.imageSettings?.size === 'large' ? 'w-24 h-24' :
                            option.imageSettings?.size === 'x-large' ? 'w-32 h-32' :
                            'w-20 h-20'
                          )
                        } ${
                          option.imageSettings?.aspectRatio === 'square' ? 'aspect-square' :
                          option.imageSettings?.aspectRatio === 'round' ? 'aspect-square' :
                          option.imageSettings?.aspectRatio === '3:2' ? 'aspect-[3/2]' :
                          option.imageSettings?.aspectRatio === '2:3' ? 'aspect-[2/3]' :
                          option.imageSettings?.aspectRatio === 'auto' ? '' :
                          'aspect-square'
                        }`}
                        style={getBorderStyles(option.imageSettings)}
                      />
                    ) : (
                      <div 
                        className={`bg-gray-700 flex items-center justify-center ${
                          isCompactLayout ? 'w-14 h-14' : 'w-20 h-20'
                        }`}
                        style={getBorderStyles(option.imageSettings)}
                      >
                        <ImageIcon className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {!value.hideTitle && (
                    <p className={`text-white text-center max-w-20 truncate ${
                      isCompactLayout ? 'text-xs' : 'text-sm'
                    } font-medium`}>
                      {value.name}
                    </p>
                  )}
                </div>
                
                {selectedValues[option.id] === value.id && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                {value.conditionalLogic?.enabled && (
                  <div className="absolute top-1 right-1 bg-orange-600 text-white p-1 rounded-full">
                    <Zap className="w-2 h-2" />
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : option.displayType === 'buttons' ? (
          <div className={`${isRowDirection ? 'flex gap-2 overflow-x-auto pb-2' : 'flex flex-wrap gap-2'}`}>
            {visibleValues.map((value: any) => (
              <button
                key={value.id}
                onClick={() => handleValueChange(option.id, value.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 relative ${isRowDirection ? 'flex-shrink-0 whitespace-nowrap' : ''} ${
                  selectedValues[option.id] === value.id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25 scale-105'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:border-gray-500 hover:scale-102'
                }`}
              >
                {option.manipulationType === 'material' && value.color && (
                  <div 
                    className="w-3 h-3 rounded-full border border-white/20 shadow-inner"
                    style={{ backgroundColor: value.color }}
                  />
                )}
                <span>{value.name}</span>
                
                {value.conditionalLogic?.enabled && (
                  <div className="absolute -top-1 -right-1 bg-orange-600 text-white p-0.5 rounded-full">
                    <Zap className="w-2 h-2" />
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <select
            value={selectedValues[option.id] || ''}
            onChange={(e) => handleValueChange(option.id, e.target.value)}
            className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          >
            {visibleValues.map((value: any) => (
              <option key={value.id} value={value.id}>
                {value.name} {value.conditionalLogic?.enabled ? '⚡' : ''}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  // Organize options by groups for display
  const organizeOptionsForDisplay = () => {
    const organized: any[] = [];
    const processedOptionIds = new Set<string>();

    configuratorData.options.forEach(option => {
      if (processedOptionIds.has(option.id)) return;

      if (option.isGroup && option.groupData) {
        const groupedOptions = visibleOptions.filter(opt => opt.groupId === option.id);
        
        if (groupedOptions.length > 0) {
          organized.push({
            type: 'group',
            group: option,
            options: groupedOptions
          });
        }
        
        groupedOptions.forEach(opt => processedOptionIds.add(opt.id));
      }
      
      processedOptionIds.add(option.id);
    });

    const standaloneOptions = visibleOptions.filter(opt => !opt.groupId);
    standaloneOptions.forEach(option => {
      if (!processedOptionIds.has(option.id)) {
        organized.push({
          type: 'option',
          option
        });
      }
    });

    return organized;
  };

  const isCompactLayout = layoutMode === 'fullscreen-bottom' || layoutMode === 'fullscreen-right';

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className={`border-b border-gray-700 bg-gray-800 ${isCompactLayout ? 'p-4' : 'p-6'}`}>
        <h2 className={`text-white font-bold ${isCompactLayout ? 'text-lg' : 'text-xl'}`}>
          {configuratorData.name}
        </h2>
        {configuratorData.description && !isCompactLayout && (
          <p className="text-gray-400 text-sm mt-1">{configuratorData.description}</p>
        )}
      </div>

      {/* Options */}
      <div className="flex-1 overflow-auto">
        <div className={`${isCompactLayout ? 'p-4 space-y-4' : 'p-6 space-y-6'}`}>
          {organizeOptionsForDisplay().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-2 border-gray-500 border-t-blue-400 rounded-full mx-auto mb-4"
              />
              <p className="text-lg font-medium">No options available</p>
              <p className="text-sm mt-1">
                {configuratorData.options.filter(opt => !opt.isGroup).length > 0 
                  ? 'Options are hidden by conditional logic'
                  : 'No options configured yet'
                }
              </p>
            </div>
          ) : (
            organizeOptionsForDisplay().map((item, index) => {
              if (item.type === 'group') {
                const { group, options } = item;
                const isExpanded = expandedGroups.has(group.id);
                
                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div 
                      className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-xl border border-purple-700/50 cursor-pointer hover:border-purple-600/50 transition-colors"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-600/20 rounded-lg border border-purple-500/30">
                            <FolderOpen className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <h3 className={`text-white font-semibold ${isCompactLayout ? 'text-base' : 'text-lg'} flex items-center space-x-2`}>
                              <span>{group.name}</span>
                              <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/30">
                                {options.length} options
                              </span>
                            </h3>
                            {group.description && !isCompactLayout && (
                              <p className="text-purple-200/80 text-sm mt-1">{group.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-purple-400">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-6 space-y-4 border-l-2 border-purple-500/20 pl-4"
                      >
                        {options.map((option: ConfiguratorOption) => (
                          <motion.div
                            key={option.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            {renderOption(option)}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                );
              } else {
                const { option } = item;
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {renderOption(option)}
                  </motion.div>
                );
              }
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorEndUserPanel;