import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, Tablet, Eye, Play, Settings } from 'lucide-react';
import { LayoutConfiguration } from '../../types/LayoutTypes';
import { ConfiguratorData } from '../../types/ConfiguratorTypes';
import ThreeJSPreview from '../ThreeJSPreview';

interface LayoutPreviewProps {
  layout: LayoutConfiguration | null;
  viewport: 'mobile' | 'tablet' | 'desktop';
  configuration?: ConfiguratorData | null;
}

const LayoutPreview: React.FC<LayoutPreviewProps> = ({ 
  layout, 
  viewport, 
  configuration 
}) => {
  const [isLivePreview, setIsLivePreview] = useState(false);

  useEffect(() => {
    setIsLivePreview(!!configuration);
  }, [configuration]);

  const getViewportDimensions = () => {
    switch (viewport) {
      case 'mobile':
        return { width: 375, height: 667, scale: 0.8 };
      case 'tablet':
        return { width: 768, height: 1024, scale: 0.6 };
      case 'desktop':
        return { width: 1200, height: 800, scale: 0.5 };
      default:
        return { width: 1200, height: 800, scale: 0.5 };
    }
  };

  const { width, height, scale } = getViewportDimensions();

  const renderComponent = (component: any) => {
    const style = {
      ...component.style,
      position: 'absolute' as const,
      left: component.position?.x || 0,
      top: component.position?.y || 0,
      padding: component.style.padding ? 
        `${component.style.padding.top || 0}px ${component.style.padding.right || 0}px ${component.style.padding.bottom || 0}px ${component.style.padding.left || 0}px` :
        '16px'
    };

    // If this is a viewport component and we have a live configuration, render the actual 3D preview
    if (component.type === 'viewport' && isLivePreview && configuration) {
      return (
        <div key={component.id} style={style} className="border border-gray-300 rounded-lg overflow-hidden">
          <ThreeJSPreview
            configuratorData={configuration}
            isPreviewMode={true}
          />
        </div>
      );
    }

    // Static component previews
    switch (component.type) {
      case 'viewport':
        return (
          <div key={component.id} style={style} className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-lg">
            <div className="w-full h-full flex items-center justify-center text-blue-600">
              <div className="text-center">
                <Monitor className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-medium">3D Viewport</span>
                <div className="text-xs text-blue-500 mt-1">{component.props.aspectRatio || '16:9'}</div>
                {!isLivePreview && (
                  <div className="text-xs text-blue-400 mt-2 flex items-center justify-center">
                    <Play className="w-3 h-3 mr-1" />
                    Select config for live preview
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'options':
        return (
          <div key={component.id} style={style} className="border-2 border-dashed border-green-300 bg-green-50/50 rounded-lg">
            <div className="w-full h-full flex items-center justify-center text-green-600">
              <div className="text-center">
                {isLivePreview && configuration ? (
                  <div className="space-y-2">
                    {configuration.options.filter(opt => !opt.isGroup).slice(0, 3).map((option, idx) => (
                      <div key={idx} className="bg-white rounded px-3 py-1 text-xs">
                        {option.name}
                      </div>
                    ))}
                    {configuration.options.filter(opt => !opt.isGroup).length > 3 && (
                      <div className="text-xs text-green-500">
                        +{configuration.options.filter(opt => !opt.isGroup).length - 3} more
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-4 h-4 bg-green-300 rounded opacity-60" />
                      ))}
                    </div>
                    <span className="text-sm font-medium">Product Options</span>
                    <div className="text-xs text-green-500 mt-1">{component.props.layout || 'grid'}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'info':
        return (
          <div key={component.id} style={style} className="border-2 border-dashed border-purple-300 bg-purple-50/50 rounded-lg">
            <div className="w-full h-full flex items-center justify-center text-purple-600">
              <div className="text-center">
                {isLivePreview && configuration ? (
                  <div className="text-left space-y-1">
                    <div className="font-semibold text-sm">{configuration.name}</div>
                    <div className="text-xs opacity-75 line-clamp-2">{configuration.description}</div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1 mb-2">
                      <div className="w-16 h-2 bg-purple-300 rounded opacity-60" />
                      <div className="w-12 h-2 bg-purple-300 rounded opacity-40" />
                      <div className="w-14 h-2 bg-purple-300 rounded opacity-40" />
                    </div>
                    <span className="text-sm font-medium">Product Info</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'price':
        return (
          <div key={component.id} style={style} className="border-2 border-dashed border-yellow-300 bg-yellow-50/50 rounded-lg">
            <div className="w-full h-full flex items-center justify-center text-yellow-600">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">$999</div>
                <span className="text-sm font-medium">Price Display</span>
                {isLivePreview && (
                  <div className="text-xs text-yellow-500 mt-1">Live pricing</div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'cart':
        return (
          <div key={component.id} style={style} className="border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-lg">
            <div className="w-full h-full flex items-center justify-center text-orange-600">
              <div className="text-center">
                <div className="w-12 h-8 bg-orange-300 rounded mb-2 opacity-60" />
                <span className="text-sm font-medium">Add to Cart</span>
                {isLivePreview && (
                  <div className="text-xs text-orange-500 mt-1">Interactive</div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'container':
        return (
          <div key={component.id} style={style} className="border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-lg">
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-gray-400 rounded mb-2 opacity-60" />
                <span className="text-sm font-medium">Container</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div key={component.id} style={style} className="border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-lg">
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <span className="text-sm font-medium">Unknown Component</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto">
      {/* Preview Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Layout Preview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isLivePreview ? `Live preview with ${configuration?.name}` : 'Static layout preview'}
              </p>
            </div>
          </div>
          
          {isLivePreview && (
            <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Live Preview</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center min-h-full p-8">
        <motion.div
          key={viewport}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden relative"
          style={{
            width: width * scale,
            height: height * scale,
            transform: `scale(${scale})`,
            transformOrigin: 'center'
          }}
        >
          {/* Viewport Header */}
          <div className="absolute top-0 left-0 right-0 bg-gray-900 text-white p-2 flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
              {viewport === 'mobile' && <Smartphone className="w-4 h-4" />}
              {viewport === 'tablet' && <Tablet className="w-4 h-4" />}
              {viewport === 'desktop' && <Monitor className="w-4 h-4" />}
              <span className="text-sm font-medium capitalize">{viewport} Preview</span>
            </div>
            <div className="flex items-center space-x-2">
              {isLivePreview && (
                <div className="flex items-center space-x-1">
                  <Settings className="w-3 h-3" />
                  <span className="text-xs">Live</span>
                </div>
              )}
              <span className="text-xs">{width}×{height}</span>
            </div>
          </div>

          {/* Layout Content */}
          <div className="relative w-full h-full pt-10" style={{ width, height }}>
            {layout?.components.map(renderComponent)}
            
            {/* Empty State */}
            {(!layout?.components || layout.components.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Preview Mode</p>
                  <p className="text-sm mt-2">Add components to see them here</p>
                  {configuration && (
                    <p className="text-xs mt-4 text-green-600 dark:text-green-400">
                      Live preview ready with {configuration.name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LayoutPreview;