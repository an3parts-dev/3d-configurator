import React from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Zap } from 'lucide-react';
import { StatusBadge } from '../ui';
import { ConfiguratorOption, ConfiguratorOptionValue } from '../../types/ConfiguratorTypes';

interface OptionRendererProps {
  option: ConfiguratorOption;
  visibleValues: ConfiguratorOptionValue[];
  selectedValues: Record<string, string>;
  onValueChange: (optionId: string, valueId: string) => void;
}

const OptionRenderer: React.FC<OptionRendererProps> = ({
  option,
  visibleValues,
  selectedValues,
  onValueChange
}) => {
  // Helper function to get layout classes based on display direction and settings
  const getLayoutClasses = () => {
    const direction = option.displayDirection || 'row';
    
    if (direction === 'grid') {
      const gridSettings = option.gridSettings || { columns: 3, gap: 'medium' };
      const gapClass = gridSettings.gap === 'small' ? 'gap-2' : gridSettings.gap === 'large' ? 'gap-4 sm:gap-6' : 'gap-3 sm:gap-4';
      
      if (gridSettings.autoFit) {
        return `grid ${gapClass}`;
      } else {
        return `grid grid-cols-1 sm:grid-cols-${gridSettings.columnsTablet || 2} lg:grid-cols-${gridSettings.columns || 3} ${gapClass}`;
      }
    } else if (direction === 'row') {
      return 'flex gap-2 sm:gap-3 lg:gap-4 overflow-x-auto pb-2';
    } else {
      // Column layout
      const columnSettings = option.columnSettings || { alignment: 'left', spacing: 'normal' };
      const alignmentClass = columnSettings.alignment === 'center' ? 'items-center' : columnSettings.alignment === 'right' ? 'items-end' : 'items-start';
      const spacingClass = columnSettings.spacing === 'compact' ? 'gap-2' : columnSettings.spacing === 'relaxed' ? 'gap-4 sm:gap-6' : 'gap-3 sm:gap-4';
      return `flex flex-col ${alignmentClass} ${spacingClass}`;
    }
  };

  // Helper function to render image with title positioning
  const renderImageWithTitle = (value: ConfiguratorOptionValue, isSelected: boolean = false) => {
    const imageSettings = option.imageSettings;
    const hideTitle = value.hideTitle || imageSettings?.hideTitle || false;
    const titlePosition = imageSettings?.titlePosition || 'below';
    const direction = option.displayDirection || 'row';

    // Generate precise image styles based on settings
    const getImageStyles = () => {
      if (!imageSettings) {
        return {
          containerStyle: { width: '64px', height: '64px' },
          imageObjectFitClass: 'object-cover',
          borderRadius: '8px'
        };
      }
      
      let baseSizePx = 64; // Smaller default for mobile
      
      switch (imageSettings.size) {
        case 'x-small': baseSizePx = 40; break;
        case 'small': baseSizePx = 48; break;
        case 'medium': baseSizePx = 64; break;
        case 'large': baseSizePx = 80; break;
        case 'x-large': baseSizePx = 96; break;
      }

      // Responsive sizing - smaller on mobile
      const mobileSizePx = Math.max(32, baseSizePx * 0.75);

      let containerStyle: React.CSSProperties = {};
      let imageObjectFitClass = 'object-cover';

      // Handle aspect ratios with precise container sizing
      switch (imageSettings.aspectRatio) {
        case 'square':
          containerStyle = {
            width: `${baseSizePx}px`,
            height: `${baseSizePx}px`
          };
          imageObjectFitClass = 'object-cover';
          break;
        case 'round':
          containerStyle = {
            width: `${baseSizePx}px`,
            height: `${baseSizePx}px`
          };
          imageObjectFitClass = 'object-cover';
          break;
        case '3:2':
          containerStyle = {
            width: `${baseSizePx}px`,
            height: `${Math.round(baseSizePx * 2 / 3)}px`
          };
          imageObjectFitClass = 'object-cover';
          break;
        case '2:3':
          containerStyle = {
            width: `${Math.round(baseSizePx * 2 / 3)}px`,
            height: `${baseSizePx}px`
          };
          imageObjectFitClass = 'object-cover';
          break;
        case 'auto':
          containerStyle = {
            width: 'auto',
            height: 'auto',
            maxWidth: `${baseSizePx}px`,
            maxHeight: `${baseSizePx}px`
          };
          imageObjectFitClass = 'object-contain';
          break;
      }

      // Handle corner styles
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

      // Force round shape for round aspect ratio
      if (imageSettings.aspectRatio === 'round') {
        borderRadius = '50%';
      }

      containerStyle.borderRadius = borderRadius;

      return {
        containerStyle,
        imageObjectFitClass,
        borderRadius
      };
    };

    const { containerStyle, imageObjectFitClass, borderRadius } = getImageStyles();

    const imageElement = (
      <div className="p-1 sm:p-2">
        <div
          className="overflow-hidden flex items-center justify-center"
          style={containerStyle}
        >
          {value.image ? (
            <img
              src={value.image}
              alt={value.name}
              className={`w-full h-full ${imageObjectFitClass}`}
              style={{ borderRadius }}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ 
                borderRadius,
                background: `linear-gradient(135deg, ${value.color || '#3B82F6'}88, ${value.color || '#3B82F6'})`
              }}
            >
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white opacity-80" />
            </div>
          )}
        </div>
      </div>
    );

    const titleElement = !hideTitle ? (
      <p className="text-white text-xs sm:text-sm font-medium text-center max-w-16 sm:max-w-20 truncate">
        {value.name}
      </p>
    ) : null;

    // Use proper layout based on direction and title position
    if (direction === 'row') {
      // For row layout, always use flex-col for individual items
      switch (titlePosition) {
        case 'above':
          return (
            <div className="flex flex-col items-center space-y-1 flex-shrink-0">
              {titleElement}
              {imageElement}
            </div>
          );
        case 'below':
          return (
            <div className="flex flex-col items-center space-y-1 flex-shrink-0">
              {imageElement}
              {titleElement}
            </div>
          );
        case 'left':
          return (
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {titleElement}
              {imageElement}
            </div>
          );
        case 'right':
          return (
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {imageElement}
              {titleElement}
            </div>
          );
        case 'center':
          return (
            <div className="relative flex-shrink-0">
              {imageElement}
              {titleElement && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 backdrop-blur-sm px-1 sm:px-2 py-0.5 sm:py-1 rounded text-white text-xs font-medium">
                    {value.name}
                  </div>
                </div>
              )}
            </div>
          );
        default:
          return (
            <div className="flex flex-col items-center space-y-1 flex-shrink-0">
              {imageElement}
              {titleElement}
            </div>
          );
      }
    } else {
      // For column and grid layouts, use the original logic
      switch (titlePosition) {
        case 'above':
          return (
            <div className="flex flex-col items-center space-y-1">
              {titleElement}
              {imageElement}
            </div>
          );
        case 'below':
          return (
            <div className="flex flex-col items-center space-y-1">
              {imageElement}
              {titleElement}
            </div>
          );
        case 'left':
          return (
            <div className="flex items-center space-x-1 sm:space-x-2">
              {titleElement}
              {imageElement}
            </div>
          );
        case 'right':
          return (
            <div className="flex items-center space-x-1 sm:space-x-2">
              {imageElement}
              {titleElement}
            </div>
          );
        case 'center':
          return (
            <div className="relative">
              {imageElement}
              {titleElement && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 backdrop-blur-sm px-1 sm:px-2 py-0.5 sm:py-1 rounded text-white text-xs font-medium">
                    {value.name}
                  </div>
                </div>
              )}
            </div>
          );
        default:
          return (
            <div className="flex flex-col items-center space-y-1">
              {imageElement}
              {titleElement}
            </div>
          );
      }
    }
  };

  if (visibleValues.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="text-white font-semibold text-lg sm:text-xl lg:text-2xl">
            {option.name}
            {option.conditionalLogic?.enabled && (
              <span className="ml-2 inline-flex items-center px-2 py-1 bg-purple-500/20 rounded-full">
                <Zap className="w-3 h-3 text-purple-400" />
              </span>
            )}
          </h4>
          {option.description && (
            <p className="text-gray-400 text-sm sm:text-base mt-1">{option.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-400 ml-3 flex-shrink-0">
          <StatusBadge type="info" size="sm">
            {option.manipulationType}
          </StatusBadge>
          <StatusBadge type="info" size="sm">
            <ImageIcon className="w-3 h-3" />
            {option.displayType}
          </StatusBadge>
          {option.displayDirection && (
            <StatusBadge type="info" size="sm">
              {option.displayDirection}
            </StatusBadge>
          )}
          {option.defaultBehavior && (
            <StatusBadge 
              type={option.defaultBehavior === 'hide' ? 'error' : 'success'} 
              size="sm"
            >
              {option.defaultBehavior === 'hide' ? 'Hide Default' : 'Show Default'}
            </StatusBadge>
          )}
        </div>
      </div>
      
      {option.displayType === 'images' ? (
        <div className={getLayoutClasses()}>
          {visibleValues.map((value) => (
            <button
              key={value.id}
              onClick={() => onValueChange(option.id, value.id)}
              className={`relative group transition-all duration-200 ${
                selectedValues[option.id] === value.id
                  ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/25 scale-105'
                  : 'hover:scale-102'
              }`}
            >
              {renderImageWithTitle(value, selectedValues[option.id] === value.id)}
              
              {selectedValues[option.id] === value.id && (
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Conditional Logic Indicator */}
              {value.conditionalLogic?.enabled && (
                <div className="absolute top-1 right-1 bg-orange-600 text-white p-0.5 sm:p-1 rounded-full">
                  <Zap className="w-2 h-2" />
                </div>
              )}
            </button>
          ))}
        </div>
      ) : option.displayType === 'buttons' ? (
        <div className={getLayoutClasses()}>
          {visibleValues.map((value) => (
            <button
              key={value.id}
              onClick={() => onValueChange(option.id, value.id)}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border-2 relative flex-shrink-0 whitespace-nowrap ${
                selectedValues[option.id] === value.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25 scale-105'
                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:border-gray-500 hover:scale-102'
              }`}
            >
              {option.manipulationType === 'material' && value.color && (
                <div 
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-white/20 shadow-inner flex-shrink-0"
                  style={{ backgroundColor: value.color }}
                />
              )}
              <span className="truncate">{value.name}</span>
              
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
          value={selectedValues[option.id] || ''}
          onChange={(e) => onValueChange(option.id, e.target.value)}
          className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
        >
          {visibleValues.map((value) => (
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