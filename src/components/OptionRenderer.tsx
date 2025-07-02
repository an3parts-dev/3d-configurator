import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Image as ImageIcon } from 'lucide-react';
import { ConfiguratorOption } from '../types/ConfiguratorTypes';
import { ConditionalLogicEngine } from '../utils/ConditionalLogicEngine';

interface OptionRendererProps {
  option: ConfiguratorOption;
  selectedValue: string;
  onValueChange: (optionId: string, valueId: string) => void;
  allOptions: ConfiguratorOption[];
  selectedValues: Record<string, string>;
}

const OptionRenderer: React.FC<OptionRendererProps> = ({
  option,
  selectedValue,
  onValueChange,
  allOptions,
  selectedValues
}) => {
  const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
    option,
    selectedValues,
    allOptions
  );

  if (visibleValues.length === 0) return null;

  const isRowDirection = option.displayDirection === 'row';

  const getBorderStyles = (imageSettings?: any) => {
    if (!imageSettings?.showBorder) return {};
    
    return {
      borderRadius: `${imageSettings.borderRadius || 8}px`,
      border: '2px solid #4b5563'
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-semibold text-xl">
            {option.name}
            {option.conditionalLogic?.enabled && (
              <span className="ml-2 inline-flex items-center px-2 py-1 bg-purple-500/20 rounded-full">
                <Zap className="w-3 h-3 text-purple-400" />
              </span>
            )}
          </h4>
          {option.description && (
            <p className="text-gray-400 text-sm mt-1">{option.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span className="px-2 py-1 bg-gray-700 rounded-full capitalize font-medium">
            {option.manipulationType}
          </span>
          <span className="px-2 py-1 bg-gray-700 rounded-full capitalize font-medium flex items-center space-x-1">
            {option.displayType === 'images' && <ImageIcon className="w-3 h-3" />}
            <span>{option.displayType}</span>
          </span>
          {option.defaultBehavior && (
            <span className={`px-2 py-1 rounded-full font-medium ${
              option.defaultBehavior === 'hide' 
                ? 'bg-red-500/20 text-red-300' 
                : 'bg-green-500/20 text-green-300'
            }`}>
              {option.defaultBehavior === 'hide' ? 'Hide Default' : 'Show Default'}
            </span>
          )}
        </div>
      </div>
      
      {option.displayType === 'images' ? (
        <div className={`${isRowDirection ? 'flex gap-4 overflow-x-auto pb-2' : 'flex flex-wrap gap-4'}`}>
          {visibleValues.map((value: any) => (
            <button
              key={value.id}
              onClick={() => onValueChange(option.id, value.id)}
              className={`relative group transition-all duration-200 ${isRowDirection ? 'flex-shrink-0' : ''} ${
                selectedValue === value.id
                  ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/25 scale-105'
                  : 'hover:scale-102'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div 
                  className={`
                    flex items-center justify-center overflow-hidden
                    ${value.image ? '' : 'bg-gray-700 w-16 h-16 rounded-lg'}
                  `}
                  style={value.image ? getBorderStyles(option.imageSettings) : {}}
                >
                  {value.image ? (
                    <img
                      src={value.image}
                      alt={value.name}
                      className={`${
                        option.imageSettings?.aspectRatio === 'full' 
                          ? 'object-contain max-w-32 max-h-32' 
                          : 'object-cover'
                      } ${
                        option.imageSettings?.size === 'x-small' ? 'w-12 h-12' :
                        option.imageSettings?.size === 'small' ? 'w-16 h-16' :
                        option.imageSettings?.size === 'medium' ? 'w-20 h-20' :
                        option.imageSettings?.size === 'large' ? 'w-24 h-24' :
                        option.imageSettings?.size === 'x-large' ? 'w-32 h-32' :
                        'w-20 h-20'
                      } ${
                        option.imageSettings?.aspectRatio === '1:1' ? 'aspect-square' :
                        option.imageSettings?.aspectRatio === '4:3' ? 'aspect-[4/3]' :
                        option.imageSettings?.aspectRatio === '16:9' ? 'aspect-video' :
                        option.imageSettings?.aspectRatio === '3:2' ? 'aspect-[3/2]' :
                        option.imageSettings?.aspectRatio === '2:3' ? 'aspect-[2/3]' :
                        option.imageSettings?.aspectRatio === 'full' ? '' :
                        'aspect-square'
                      }`}
                      style={getBorderStyles(option.imageSettings)}
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                
                {!value.hideTitle && (
                  <p className="text-white text-xs font-medium text-center max-w-20 truncate">
                    {value.name}
                  </p>
                )}
              </div>
              
              {selectedValue === value.id && (
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Conditional Logic Indicator */}
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
              onClick={() => onValueChange(option.id, value.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 relative ${isRowDirection ? 'flex-shrink-0 whitespace-nowrap' : ''} ${
                selectedValue === value.id
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
              
              {/* Conditional Logic Indicator */}
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
          value={selectedValue || ''}
          onChange={(e) => onValueChange(option.id, e.target.value)}
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

export default OptionRenderer;