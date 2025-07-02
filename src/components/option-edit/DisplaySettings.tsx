import React from 'react';
import { List, Grid3X3, Image as ImageIcon, ChevronDown, Eye, EyeOff } from 'lucide-react';
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

  // Sample data for previews
  const sampleValues = [
    { id: '1', name: 'Option A', color: '#3B82F6', image: null },
    { id: '2', name: 'Option B', color: '#EF4444', image: null },
    { id: '3', name: 'Option C', color: '#10B981', image: null },
    { id: '4', name: 'Option D', color: '#F59E0B', image: null }
  ];

  // Find the first uploaded image from option values for preview
  const getPreviewImage = () => {
    if (option?.values) {
      const valueWithImage = option.values.find(value => value.image);
      return valueWithImage?.image;
    }
    return null;
  };

  // Generate precise preview styles based on current settings
  const getPreviewStyles = () => {
    const settings = formData.imageSettings!;
    
    let baseSizePx = 80;
    
    switch (settings.size) {
      case 'x-small': baseSizePx = 48; break;
      case 'small': baseSizePx = 64; break;
      case 'medium': baseSizePx = 80; break;
      case 'large': baseSizePx = 96; break;
      case 'x-large': baseSizePx = 128; break;
    }

    let containerStyle: React.CSSProperties = {};
    let imageObjectFitClass = 'object-cover';

    // Handle aspect ratios with precise container sizing
    switch (settings.aspectRatio) {
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
    switch (settings.cornerStyle) {
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
    if (settings.aspectRatio === 'round') {
      borderRadius = '50%';
    }

    containerStyle.borderRadius = borderRadius;

    return {
      containerStyle,
      imageObjectFitClass,
      borderRadius
    };
  };

  const { containerStyle, imageObjectFitClass, borderRadius } = getPreviewStyles();
  const isRoundAspectRatio = formData.imageSettings?.aspectRatio === 'round';
  const isAutoAspectRatio = formData.imageSettings?.aspectRatio === 'auto';
  const previewImage = getPreviewImage();
  const hideTitle = formData.imageSettings?.hideTitle || false;

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
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
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
          className={`relative group transition-all duration-200 ${
            index === 0
              ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/25 scale-105'
              : 'hover:scale-102'
          } ${direction === 'row' ? 'flex-shrink-0' : ''}`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-1">
              {previewImage && index === 0 ? (
                <div
                  className="overflow-hidden flex items-center justify-center"
                  style={containerStyle}
                >
                  <img
                    src={previewImage}
                    alt={value.name}
                    className={`w-full h-full ${imageObjectFitClass}`}
                    style={{ borderRadius }}
                  />
                </div>
              ) : (
                <div 
                  className="flex items-center justify-center"
                  style={{
                    ...containerStyle,
                    background: `linear-gradient(135deg, ${value.color}88, ${value.color})`
                  }}
                >
                  <ImageIcon className="w-6 h-6 text-white opacity-80" />
                </div>
              )}
            </div>
            
            {!hideTitle && (
              <p className="text-white text-xs font-medium text-center max-w-20 truncate">
                {value.name}
              </p>
            )}
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

  return (
    <div className="p-6 space-y-8">
      {/* Live Preview Section */}
      <div className="bg-gray-750 p-6 rounded-xl border border-gray-600">
        <h4 className="text-white font-semibold text-lg mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-blue-400" />
          Live Preview
        </h4>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="mb-4">
            <h5 className="text-white font-medium text-base mb-2">Sample Option</h5>
            <p className="text-gray-400 text-sm">This is how your option will appear to users</p>
          </div>
          
          <div className="flex items-center justify-center min-h-[120px]">
            {formData.displayType === 'list' && renderListPreview()}
            {formData.displayType === 'buttons' && renderButtonsPreview(formData.displayDirection || 'row')}
            {formData.displayType === 'images' && renderImagesPreview(formData.displayDirection || 'row')}
          </div>
        </div>
      </div>

      {/* Display Type Selection */}
      <div>
        <label className="block text-gray-400 text-sm mb-4 font-medium">
          Display Type
        </label>
        <div className="grid grid-cols-3 gap-4">
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
              
              {/* Mini Preview */}
              <div className="mt-4 flex justify-center">
                <div className="w-24 h-6 bg-gray-600 rounded border border-gray-500 flex items-center justify-between px-2">
                  <span className="text-xs text-gray-300">Select...</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              </div>
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
              
              {/* Mini Preview */}
              <div className="mt-4 flex justify-center">
                <div className="flex gap-1">
                  <div className="w-6 h-4 bg-blue-600 rounded-sm"></div>
                  <div className="w-6 h-4 bg-gray-600 rounded-sm"></div>
                  <div className="w-6 h-4 bg-gray-600 rounded-sm"></div>
                </div>
              </div>
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
              
              {/* Mini Preview */}
              <div className="mt-4 flex justify-center">
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded ring-2 ring-blue-400"></div>
                  <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-600 rounded"></div>
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded"></div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Display Direction */}
      {(formData.displayType === 'buttons' || formData.displayType === 'images') && (
        <div>
          <label className="block text-gray-400 text-sm mb-4 font-medium">
            Layout Direction
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
                <div className="font-semibold text-lg mb-2">Row Layout</div>
                <div className="text-sm opacity-80 mb-4">Horizontal arrangement</div>
                
                {/* Row Preview */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  {formData.displayType === 'buttons' && renderButtonsPreview('row')}
                  {formData.displayType === 'images' && renderImagesPreview('row')}
                </div>
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
                <div className="font-semibold text-lg mb-2">Column Layout</div>
                <div className="text-sm opacity-80 mb-4">Vertical arrangement</div>
                
                {/* Column Preview */}
                <div className="bg-gray-800 p-4 rounded-lg flex justify-center">
                  {formData.displayType === 'buttons' && renderButtonsPreview('column')}
                  {formData.displayType === 'images' && renderImagesPreview('column')}
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Image Settings */}
      {formData.displayType === 'images' && (
        <div className="space-y-6">
          <h4 className="text-white font-semibold text-lg">Image Settings</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Size and Aspect Ratio */}
            <div className="lg:col-span-2 space-y-6">
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
                  value={formData.imageSettings?.aspectRatio || 'square'}
                  onChange={(e) => {
                    const newAspectRatio = e.target.value as any;
                    updateImageSettings({ aspectRatio: newAspectRatio });
                    
                    // Auto-set corner style to rounded if round aspect ratio is selected
                    if (newAspectRatio === 'round') {
                      updateImageSettings({ aspectRatio: newAspectRatio, cornerStyle: 'softer' });
                    }
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="square">Square</option>
                  <option value="round">Round</option>
                  <option value="3:2">3:2</option>
                  <option value="2:3">2:3</option>
                  <option value="auto">Auto (adapts to image)</option>
                </select>
                {isAutoAspectRatio && (
                  <p className="text-gray-500 text-xs mt-1">
                    Images will maintain their natural proportions within the size constraints
                  </p>
                )}
              </div>

              {/* Global Hide Title Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg border border-gray-600">
                <div>
                  <label className="text-gray-400 text-sm font-medium">Show Titles</label>
                  <p className="text-gray-500 text-xs mt-1">Display option value names below images</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateImageSettings({ hideTitle: !hideTitle })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    !hideTitle ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      !hideTitle ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="flex flex-col items-center justify-center">
              <label className="block text-gray-400 text-sm mb-3 font-medium text-center">Single Image Preview</label>
              <div className="flex items-center justify-center">
                {previewImage ? (
                  <div
                    className="overflow-hidden flex items-center justify-center bg-gray-700"
                    style={containerStyle}
                  >
                    <img
                      src={previewImage}
                      alt="Preview"
                      className={`${imageObjectFitClass} ${
                        isAutoAspectRatio ? 'w-full h-full' : 'w-full h-full'
                      }`}
                      style={{ borderRadius }}
                    />
                  </div>
                ) : (
                  <div
                    className="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                    style={{
                      ...containerStyle,
                      minHeight: isAutoAspectRatio ? '48px' : containerStyle.height
                    }}
                  >
                    <ImageIcon className="w-6 h-6 text-white opacity-80" />
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-2 text-center">
                {formData.imageSettings?.size} • {formData.imageSettings?.aspectRatio} • {formData.imageSettings?.cornerStyle}
              </p>
              {previewImage && (
                <p className="text-green-400 text-xs mt-1 text-center">
                  Using uploaded image
                </p>
              )}
            </div>
          </div>

          {/* Corner Style - Hidden when Round aspect ratio is selected */}
          {!isRoundAspectRatio && (
            <div>
              <label className="block text-gray-400 text-sm mb-3 font-medium">Corner Style</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => updateImageSettings({ cornerStyle: 'squared' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.imageSettings?.cornerStyle === 'squared'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gray-500 mx-auto mb-2" style={{ borderRadius: '0px' }}></div>
                    <div className="font-semibold text-sm">Squared</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => updateImageSettings({ cornerStyle: 'soft' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.imageSettings?.cornerStyle === 'soft'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gray-500 mx-auto mb-2" style={{ borderRadius: '4px' }}></div>
                    <div className="font-semibold text-sm">Soft</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => updateImageSettings({ cornerStyle: 'softer' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.imageSettings?.cornerStyle === 'softer'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gray-500 mx-auto mb-2" style={{ borderRadius: '8px' }}></div>
                    <div className="font-semibold text-sm">Softer</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DisplaySettings;