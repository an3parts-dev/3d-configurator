import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Palette, 
  Layout, 
  Type, 
  Spacing,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { LayoutComponent, LayoutConfiguration } from '../../types/LayoutTypes';

interface PropertyPanelProps {
  selectedComponent: string | null;
  layout: LayoutConfiguration | null;
  onUpdateComponent: (id: string, updates: Partial<LayoutComponent>) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedComponent,
  layout,
  onUpdateComponent
}) => {
  const component = selectedComponent && layout 
    ? layout.components.find(c => c.id === selectedComponent)
    : null;

  if (!component) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Properties
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select a component to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const updateStyle = (styleUpdates: any) => {
    onUpdateComponent(component.id, {
      style: { ...component.style, ...styleUpdates }
    });
  };

  const updateProps = (propUpdates: any) => {
    onUpdateComponent(component.id, {
      props: { ...component.props, ...propUpdates }
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Properties
        </h3>
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-blue-100 dark:bg-blue-600/20 rounded">
            <Settings className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {component.name}
          </span>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {/* Basic Properties */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Layout className="w-4 h-4 mr-2" />
              Basic
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Component Name
                </label>
                <input
                  type="text"
                  value={component.name}
                  onChange={(e) => onUpdateComponent(component.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Spacing className="w-4 h-4 mr-2" />
              Dimensions
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={component.style.width || ''}
                  onChange={(e) => updateStyle({ width: parseInt(e.target.value) || 'auto' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="auto"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={component.style.height || ''}
                  onChange={(e) => updateStyle({ height: parseInt(e.target.value) || 'auto' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="auto"
                />
              </div>
            </div>
          </div>

          {/* Spacing */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Spacing className="w-4 h-4 mr-2" />
              Spacing
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Padding
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={component.style.padding?.top || 0}
                    onChange={(e) => updateStyle({ 
                      padding: { 
                        ...component.style.padding, 
                        top: parseInt(e.target.value) || 0 
                      } 
                    })}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    placeholder="Top"
                  />
                  <input
                    type="number"
                    value={component.style.padding?.right || 0}
                    onChange={(e) => updateStyle({ 
                      padding: { 
                        ...component.style.padding, 
                        right: parseInt(e.target.value) || 0 
                      } 
                    })}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    placeholder="Right"
                  />
                  <input
                    type="number"
                    value={component.style.padding?.bottom || 0}
                    onChange={(e) => updateStyle({ 
                      padding: { 
                        ...component.style.padding, 
                        bottom: parseInt(e.target.value) || 0 
                      } 
                    })}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    placeholder="Bottom"
                  />
                  <input
                    type="number"
                    value={component.style.padding?.left || 0}
                    onChange={(e) => updateStyle({ 
                      padding: { 
                        ...component.style.padding, 
                        left: parseInt(e.target.value) || 0 
                      } 
                    })}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    placeholder="Left"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Background Color
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={component.style.backgroundColor || '#ffffff'}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                    className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={component.style.backgroundColor || '#ffffff'}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Border Radius
                </label>
                <input
                  type="text"
                  value={component.style.borderRadius || '0px'}
                  onChange={(e) => updateStyle({ borderRadius: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0px"
                />
              </div>
            </div>
          </div>

          {/* Component-specific Properties */}
          {component.type === 'viewport' && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Monitor className="w-4 h-4 mr-2" />
                Viewport Settings
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={component.props.aspectRatio || '16:9'}
                    onChange={(e) => updateProps({ aspectRatio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="16:9">16:9</option>
                    <option value="4:3">4:3</option>
                    <option value="1:1">1:1</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showControls"
                    checked={component.props.showControls || false}
                    onChange={(e) => updateProps({ showControls: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showControls" className="text-xs text-gray-700 dark:text-gray-300">
                    Show Controls
                  </label>
                </div>
              </div>
            </div>
          )}

          {component.type === 'options' && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Options Display
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Layout
                  </label>
                  <select
                    value={component.props.layout || 'grid'}
                    onChange={(e) => updateProps({ layout: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                    <option value="tabs">Tabs</option>
                    <option value="accordion">Accordion</option>
                  </select>
                </div>
                
                {component.props.layout === 'grid' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Columns
                    </label>
                    <input
                      type="number"
                      value={component.props.columns || 2}
                      onChange={(e) => updateProps({ columns: parseInt(e.target.value) || 2 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="6"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showImages"
                      checked={component.props.showImages || false}
                      onChange={(e) => updateProps({ showImages: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="showImages" className="text-xs text-gray-700 dark:text-gray-300">
                      Show Images
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showPrices"
                      checked={component.props.showPrices || false}
                      onChange={(e) => updateProps({ showPrices: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="showPrices" className="text-xs text-gray-700 dark:text-gray-300">
                      Show Prices
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;