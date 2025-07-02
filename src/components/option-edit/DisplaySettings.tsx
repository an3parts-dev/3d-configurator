import React from 'react';
import { List, Grid3X3, Image as ImageIcon } from 'lucide-react';
import { ConfiguratorOption, ImageSettings } from '../../types/ConfiguratorTypes';

interface DisplaySettingsProps {
  formData: Omit<ConfiguratorOption, 'id' | 'values'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<ConfiguratorOption, 'id' | 'values'>>>;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  formData,
  setFormData
}) => {
  const updateImageSettings = (updates: Partial<ImageSettings>) => {
    setFormData(prev => ({
      ...prev,
      imageSettings: { ...prev.imageSettings!, ...updates }
    }));
  };

  // Generate preview image based on current settings
  const getPreviewImageStyles = () => {
    const settings = formData.imageSettings!;
    
    let baseSize = 80;
    
    switch (settings.size) {
      case 'x-small': baseSize = 48; break;
      case 'small': baseSize = 64; break;
      case 'medium': baseSize = 80; break;
      case 'large': baseSize = 96; break;
      case 'x-large': baseSize = 128; break;
    }

    let width = baseSize;
    let height = baseSize;

    // Handle new aspect ratios
    switch (settings.aspectRatio) {
      case 'square':
        width = baseSize;
        height = baseSize;
        break;
      case 'round':
        width = baseSize;
        height = baseSize;
        break;
      case '3:2':
        width = baseSize;
        height = Math.round(baseSize * 2 / 3);
        break;
      case '2:3':
        width = Math.round(baseSize * 2 / 3);
        height = baseSize;
        break;
      case 'auto':
        width = baseSize;
        height = baseSize; // Default to square for preview
        break;
    }

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

    return {
      width: `${width}px`,
      height: `${height}px`,
      borderRadius,
      maxWidth: '120px',
      maxHeight: '120px'
    };
  };

  const previewStyles = getPreviewImageStyles();
  const isRoundAspectRatio = formData.imageSettings?.aspectRatio === 'round';

  return (
    <div className="p-6 space-y-6">
      {/* Display Type */}
      <div>
        <label className="block text-gray-400 text-sm mb-3 font-medium">
          Display Type
        </label>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, displayType: 'list' }))}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.displayType === 'list'
                ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <List className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">List</div>
              <div className="text-sm opacity-80">Dropdown list</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, displayType: 'buttons' }))}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.displayType === 'buttons'
                ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <Grid3X3 className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Buttons</div>
              <div className="text-sm opacity-80">Button grid</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, displayType: 'images' }))}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.displayType === 'images'
                ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <ImageIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Images</div>
              <div className="text-sm opacity-80">Image gallery</div>
            </div>
          </button>
        </div>
      </div>

      {/* Display Direction */}
      {(formData.displayType === 'buttons' || formData.displayType === 'images') && (
        <div>
          <label className="block text-gray-400 text-sm mb-3 font-medium">
            Direction
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, displayDirection: 'row' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.displayDirection === 'row'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">Row</div>
                <div className="text-sm opacity-80">Horizontal layout</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, displayDirection: 'column' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.displayDirection === 'column'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">Column</div>
                <div className="text-sm opacity-80">Vertical layout</div>
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="square">Square</option>
                  <option value="round">Round</option>
                  <option value="3:2">3:2</option>
                  <option value="2:3">2:3</option>
                  <option value="auto">Auto (adapts to image)</option>
                </select>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="flex flex-col items-center justify-center">
              <label className="block text-gray-400 text-sm mb-3 font-medium text-center">Preview</label>
              <div className="flex items-center justify-center">
                <div
                  className="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                  style={{
                    width: previewStyles.width,
                    height: previewStyles.height,
                    borderRadius: previewStyles.borderRadius,
                    maxWidth: previewStyles.maxWidth,
                    maxHeight: previewStyles.maxHeight
                  }}
                >
                  <ImageIcon className="w-6 h-6 text-white opacity-80" />
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-2 text-center">
                {formData.imageSettings?.size} • {formData.imageSettings?.aspectRatio} • {formData.imageSettings?.cornerStyle}
              </p>
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
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.imageSettings?.cornerStyle === 'squared'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-500 mx-auto mb-2" style={{ borderRadius: '0px' }}></div>
                    <div className="font-semibold text-sm">Squared</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => updateImageSettings({ cornerStyle: 'soft' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.imageSettings?.cornerStyle === 'soft'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-500 mx-auto mb-2" style={{ borderRadius: '4px' }}></div>
                    <div className="font-semibold text-sm">Soft</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => updateImageSettings({ cornerStyle: 'softer' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.imageSettings?.cornerStyle === 'softer'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-500 mx-auto mb-2" style={{ borderRadius: '8px' }}></div>
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