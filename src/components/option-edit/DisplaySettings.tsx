import React from 'react';
import { List, Grid3X3, Image as ImageIcon, ChevronDown, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import { ConfiguratorOption, ImageSettings } from '../../types/ConfiguratorTypes';

interface DisplaySettingsProps {
  formData: Omit<ConfiguratorOption, 'id' | 'values'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<ConfiguratorOption, 'id' | 'values'>>>;
  option?: ConfiguratorOption | null;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  formData,
  setFormData,
  option
}) => {
  const updateImageSettings = (updates: Partial<ImageSettings>) => {
    setFormData(prev => ({
      ...prev,
      imageSettings: { ...prev.imageSettings!, ...updates }
    }));
  };

  // Sample data for previews - use real images if available
  const getSampleValues = () => {
    const baseValues = [
      { id: '1', name: 'Option A', color: '#3B82F6' },
      { id: '2', name: 'Option B', color: '#EF4444' },
      { id: '3', name: 'Option C', color: '#10B981' },
      { id: '4', name: 'Option D', color: '#F59E0B' },
      { id: '5', name: 'Option E', color: '#8B5CF6' },
      { id: '6', name: 'Option F', color: '#F97316' }
    ];

    // Use real images from option values if available
    if (option?.values) {
      return baseValues.map((baseValue, index) => {
        const realValue = option.values[index];
        return {
          ...baseValue,
          image: realValue?.image || null,
          name: realValue?.name || baseValue.name
        };
      });
    }

    return baseValues.map(value => ({ ...value, image: null }));
  };

  const sampleValues = getSampleValues();

  // Preview Components
  const renderListPreview = () => (
    <div className="w-full max-w-xs">
      <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm">
        <option>Choose an option...</option>
        {sampleValues.map(value => (
          <option key={value.id} value={value.id}>{value.name}</option>
        ))}
      </select>
    </div>
  );

  const renderButtonsPreview = (direction: 'row' | 'column') => (
    <div className={`flex ${direction === 'row' ? 'flex-row gap-2 flex-wrap' : 'flex-col gap-2'} ${direction === 'row' ? 'max-w-md' : 'max-w-xs'}`}>
      {sampleValues.slice(0, direction === 'row' ? 4 : 3).map((value, index) => (
        <button
          key={value.id}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 cursor-pointer ${
            index === 0
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
          } ${direction === 'row' ? 'flex-shrink-0' : ''}`}
        >
          {formData.manipulationType === 'material' && (
            <div 
              className="w-3 h-3 rounded-full border border-white/20"
              style={{ backgroundColor: value.color }}
            />
          )}
          <span>{value.name}</span>
        </button>
      ))}
    </div>
  );

  const renderImagesPreview = (direction: 'row' | 'column') => (
    <div className={`flex ${direction === 'row' ? 'flex-row gap-4 flex-wrap' : 'flex-col gap-4'} ${direction === 'row' ? 'max-w-lg' : 'max-w-xs'}`}>
      {sampleValues.slice(0, direction === 'row' ? 4 : 3).map((value, index) => (
        <button
          key={value.id}
          className={`relative group transition-all duration-200 cursor-pointer ${
            index === 0
              ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/25 scale-105'
              : 'hover:scale-102'
          } ${direction === 'row' ? 'flex-shrink-0' : ''}`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center">
              {value.image ? (
                <img
                  src={value.image}
                  alt={value.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${value.color}88, ${value.color})` }}
                >
                  <ImageIcon className="w-6 h-6 text-white opacity-80" />
                </div>
              )}
            </div>
            <p className="text-white text-xs font-medium text-center max-w-20 truncate">
              {value.name}
            </p>
          </div>
          
          {index === 0 && (
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );

  const renderGridPreview = () => (
    <div className="grid grid-cols-3 gap-3 max-w-sm">
      {sampleValues.slice(0, 6).map((value, index) => (
        <button
          key={value.id}
          className={`relative group transition-all duration-200 cursor-pointer ${
            index === 0
              ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/25 scale-105'
              : 'hover:scale-102'
          }`}
        >
          {formData.displayType === 'grid' && formData.manipulationType === 'material' ? (
            // Grid with color buttons
            <div className="flex flex-col items-center space-y-2">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-gray-600"
                style={{ backgroundColor: value.color }}
              />
              <p className="text-white text-xs font-medium text-center truncate w-full">
                {value.name}
              </p>
            </div>
          ) : (
            // Grid with images
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
                {value.image ? (
                  <img
                    src={value.image}
                    alt={value.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${value.color}88, ${value.color})` }}
                  >
                    <ImageIcon className="w-4 h-4 text-white opacity-80" />
                  </div>
                )}
              </div>
              <p className="text-white text-xs font-medium text-center truncate w-full">
                {value.name}
              </p>
            </div>
          )}
          
          {index === 0 && (
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Live Preview Section */}
      <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
        <h4 className="text-white font-semibold text-lg mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-blue-400" />
          Live Preview
        </h4>
        
        <div className="flex items-center justify-center min-h-[120px]">
          {formData.displayType === 'list' && renderListPreview()}
          {formData.displayType === 'buttons' && renderButtonsPreview(formData.displayDirection || 'row')}
          {formData.displayType === 'images' && renderImagesPreview(formData.displayDirection || 'row')}
          {formData.displayType === 'grid' && renderGridPreview()}
        </div>
      </div>

      {/* Display Type Selection */}
      <div>
        <label className="block text-gray-400 text-sm mb-4 font-medium">
          Display Type
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, displayType: 'list' }))}
            className={`p-6 rounded-xl border-2 transition-all ${
              formData.displayType === 'list'
                ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <List className="w-8 h-8 mx-auto mb-3" />
              <div className="font-semibold text-lg">List</div>
              <div className="text-sm opacity-80 mt-1">Dropdown selection</div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, displayType: 'buttons' }))}
            className={`p-6 rounded-xl border-2 transition-all ${
              formData.displayType === 'buttons'
                ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <Grid3X3 className="w-8 h-8 mx-auto mb-3" />
              <div className="font-semibold text-lg">Buttons</div>
              <div className="text-sm opacity-80 mt-1">Button selection</div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, displayType: 'images' }))}
            className={`p-6 rounded-xl border-2 transition-all ${
              formData.displayType === 'images'
                ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <ImageIcon className="w-8 h-8 mx-auto mb-3" />
              <div className="font-semibold text-lg">Images</div>
              <div className="text-sm opacity-80 mt-1">Visual selection</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, displayType: 'grid' }))}
            className={`p-6 rounded-xl border-2 transition-all ${
              formData.displayType === 'grid'
                ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <LayoutGrid className="w-8 h-8 mx-auto mb-3" />
              <div className="font-semibold text-lg">Grid</div>
              <div className="text-sm opacity-80 mt-1">Grid layout</div>
            </div>
          </button>
        </div>
      </div>

      {/* Layout - Only show for buttons, images, and grid */}
      {(formData.displayType === 'buttons' || formData.displayType === 'images') && (
        <div>
          <label className="block text-gray-400 text-sm mb-4 font-medium">
            Layout
          </label>
          <div className="grid grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, displayDirection: 'row' }))}
              className={`p-6 rounded-xl border-2 transition-all ${
                formData.displayDirection === 'row'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold text-lg mb-2">Row</div>
                <div className="text-sm opacity-80">Horizontal arrangement</div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, displayDirection: 'column' }))}
              className={`p-6 rounded-xl border-2 transition-all ${
                formData.displayDirection === 'column'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold text-lg mb-2">Column</div>
                <div className="text-sm opacity-80">Vertical arrangement</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Image Settings */}
      {formData.displayType === 'images' && (
        <div className="space-y-6">
          <h4 className="text-white font-semibold text-lg">Image Settings</h4>
          
          {/* Image Size */}
          <div>
            <label className="block text-gray-400 text-sm mb-2 font-medium">Size</label>
            <select
              value={formData.imageSettings?.size || 'medium'}
              onChange={(e) => updateImageSettings({ size: e.target.value as any })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="x-small">Extra Small (48px)</option>
              <option value="small">Small (64px)</option>
              <option value="medium">Medium (80px)</option>
              <option value="large">Large (96px)</option>
              <option value="x-large">Extra Large (128px)</option>
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-gray-400 text-sm mb-2 font-medium">Aspect Ratio</label>
            <select
              value={formData.imageSettings?.aspectRatio || '1:1'}
              onChange={(e) => updateImageSettings({ aspectRatio: e.target.value as any })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1:1">Square (1:1)</option>
              <option value="4:3">Standard (4:3)</option>
              <option value="16:9">Widescreen (16:9)</option>
              <option value="3:2">Photo (3:2)</option>
              <option value="2:3">Portrait (2:3)</option>
              <option value="full">Full Size</option>
            </select>
          </div>

          {/* Border Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-400 text-sm font-medium">Show Border</label>
              <button
                type="button"
                onClick={() => updateImageSettings({ showBorder: !formData.imageSettings?.showBorder })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.imageSettings?.showBorder ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.imageSettings?.showBorder ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {formData.imageSettings?.showBorder && (
              <div>
                <label className="block text-gray-400 text-sm mb-1 font-medium">Border Radius</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={formData.imageSettings?.borderRadius || 8}
                  onChange={(e) => updateImageSettings({ borderRadius: parseInt(e.target.value) })}
                  className="w-full slider"
                />
                <div className="text-center text-gray-500 text-xs mt-1">
                  {formData.imageSettings?.borderRadius || 8}px
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplaySettings;