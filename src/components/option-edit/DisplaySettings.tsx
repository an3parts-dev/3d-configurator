import React from 'react';
import { List, Grid3X3, Image as ImageIcon, Eye, Grid2X2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { ConfiguratorOption, ImageSettings, GridSettings, ColumnSettings } from '../../types/ConfiguratorTypes';

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

  const updateGridSettings = (updates: Partial<GridSettings>) => {
    setFormData(prev => ({
      ...prev,
      gridSettings: { 
        ...prev.gridSettings || {
          columns: 3,
          columnsTablet: 2,
          columnsMobile: 1,
          gap: 'medium',
          autoFit: false,
          minItemWidth: 120
        }, 
        ...updates 
      }
    }));
  };

  const updateColumnSettings = (updates: Partial<ColumnSettings>) => {
    setFormData(prev => ({
      ...prev,
      columnSettings: { 
        ...prev.columnSettings || {
          alignment: 'left',
          spacing: 'normal'
        }, 
        ...updates 
      }
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
  const hideTitle = formData.imageSettings?.hideTitle || false;
  const titlePosition = formData.imageSettings?.titlePosition || 'below';

  // Helper function to render title based on position
  const renderTitle = (value: any, position: string) => {
    if (hideTitle) return null;
    
    const titleElement = (
      <p className="text-gray-900 dark:text-white text-xs font-medium text-center max-w-20 truncate">
        {value.name}
      </p>
    );

    return titleElement;
  };

  // Helper function to render image with title positioning
  const renderImageWithTitle = (value: any, index: number, isSelected: boolean = false) => {
    const imageElement = (
      <div className="p-2">
        {value.image ? (
          <div
            className="overflow-hidden flex items-center justify-center"
            style={containerStyle}
          >
            <img
              src={value.image}
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
    );

    const titleElement = renderTitle(value, titlePosition);

    // Arrange image and title based on position
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
          <div className="flex items-center space-x-2">
            {titleElement}
            {imageElement}
          </div>
        );
      case 'right':
        return (
          <div className="flex items-center space-x-2">
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
                <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-medium">
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
  };

  // Preview Components
  const renderListPreview = () => (
    <div className="w-full max-w-xs">
      <select className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-sm">
        <option>Choose an option...</option>
        {sampleValues.map(value => (
          <option key={value.id} value={value.id}>{value.name}</option>
        ))}
      </select>
    </div>
  );

  const renderButtonsPreview = (direction: 'row' | 'column' | 'grid') => {
    const getLayoutClasses = () => {
      if (direction === 'grid') {
        const gridSettings = formData.gridSettings || { columns: 3, gap: 'medium' };
        const gapClass = gridSettings.gap === 'small' ? 'gap-2' : gridSettings.gap === 'large' ? 'gap-6' : 'gap-4';
        return `grid grid-cols-${Math.min(gridSettings.columns, 3)} ${gapClass} max-w-sm`;
      } else if (direction === 'row') {
        return 'flex flex-row gap-2 flex-wrap max-w-md';
      } else {
        const columnSettings = formData.columnSettings || { alignment: 'left', spacing: 'normal' };
        const alignmentClass = columnSettings.alignment === 'center' ? 'items-center' : columnSettings.alignment === 'right' ? 'items-end' : 'items-start';
        const spacingClass = columnSettings.spacing === 'compact' ? 'gap-1' : columnSettings.spacing === 'relaxed' ? 'gap-4' : 'gap-2';
        return `flex flex-col ${alignmentClass} ${spacingClass} max-w-xs`;
      }
    };

    const itemCount = direction === 'grid' ? 4 : direction === 'row' ? 4 : 3;

    return (
      <div className={getLayoutClasses()}>
        {sampleValues.slice(0, itemCount).map((value, index) => (
          <button
            key={value.id}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 cursor-pointer ${
              index === 0
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
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
  };

  const renderImagesPreview = (direction: 'row' | 'column' | 'grid') => {
    const getLayoutClasses = () => {
      if (direction === 'grid') {
        const gridSettings = formData.gridSettings || { columns: 3, gap: 'medium' };
        const gapClass = gridSettings.gap === 'small' ? 'gap-2' : gridSettings.gap === 'large' ? 'gap-6' : 'gap-4';
        return `grid grid-cols-${Math.min(gridSettings.columns, 3)} ${gapClass} max-w-md`;
      } else if (direction === 'row') {
        return 'flex flex-row gap-4 flex-wrap max-w-lg';
      } else {
        const columnSettings = formData.columnSettings || { alignment: 'left', spacing: 'normal' };
        const alignmentClass = columnSettings.alignment === 'center' ? 'items-center' : columnSettings.alignment === 'right' ? 'items-end' : 'items-start';
        const spacingClass = columnSettings.spacing === 'compact' ? 'gap-2' : columnSettings.spacing === 'relaxed' ? 'gap-6' : 'gap-4';
        return `flex flex-col ${alignmentClass} ${spacingClass} max-w-xs`;
      }
    };

    const itemCount = direction === 'grid' ? 4 : direction === 'row' ? 4 : 3;

    return (
      <div className={getLayoutClasses()}>
        {sampleValues.slice(0, itemCount).map((value, index) => (
          <button
            key={value.id}
            className={`relative group transition-all duration-200 cursor-pointer ${
              index === 0
                ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/25 scale-105'
                : 'hover:scale-102'
            } ${direction === 'row' ? 'flex-shrink-0' : ''}`}
          >
            {renderImageWithTitle(value, index, index === 0)}
            
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
  };

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* Live Preview Section - Now at the top */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
        <h4 className="text-gray-900 dark:text-white font-semibold text-lg mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Live Preview
        </h4>
        
        <div className="flex items-center justify-center min-h-[100px] sm:min-h-[120px]">
          {formData.displayType === 'list' && renderListPreview()}
          {formData.displayType === 'buttons' && renderButtonsPreview(formData.displayDirection || 'row')}
          {formData.displayType === 'images' && renderImagesPreview(formData.displayDirection || 'row')}
        </div>
      </div>

      {/* Display Type Selection - Minimal Card Design */}
      <div>
        <label className="block text-gray-700 dark:text-gray-300 text-sm mb-4 font-medium">
          Display Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, displayType: 'list' }))}
            className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-center ${
              formData.displayType === 'list'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <List className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3" />
            <div className="font-semibold text-base sm:text-lg">List</div>
            <div className="text-xs sm:text-sm opacity-80 mt-1">Dropdown selection</div>
          </button>
          
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, displayType: 'buttons' }))}
            className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-center ${
              formData.displayType === 'buttons'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Grid3X3 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3" />
            <div className="font-semibold text-base sm:text-lg">Buttons</div>
            <div className="text-xs sm:text-sm opacity-80 mt-1">Button selection</div>
          </button>
          
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, displayType: 'images' }))}
            className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-center ${
              formData.displayType === 'images'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3" />
            <div className="font-semibold text-base sm:text-lg">Images</div>
            <div className="text-xs sm:text-sm opacity-80 mt-1">Visual selection</div>
          </button>
        </div>
      </div>

      {/* Layout - Minimal Card Design */}
      {(formData.displayType === 'buttons' || formData.displayType === 'images') && (
        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm mb-4 font-medium">
            Layout
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, displayDirection: 'row' }))}
              className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-center ${
                formData.displayDirection === 'row'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex justify-center mb-2 sm:mb-3">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-current rounded"></div>
                  <div className="w-3 h-3 bg-current rounded"></div>
                  <div className="w-3 h-3 bg-current rounded"></div>
                </div>
              </div>
              <div className="font-semibold text-base sm:text-lg">Row</div>
              <div className="text-xs sm:text-sm opacity-80">Horizontal arrangement</div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, displayDirection: 'column' }))}
              className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-center ${
                formData.displayDirection === 'column'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex justify-center mb-2 sm:mb-3">
                <div className="flex flex-col space-y-1">
                  <div className="w-3 h-3 bg-current rounded"></div>
                  <div className="w-3 h-3 bg-current rounded"></div>
                  <div className="w-3 h-3 bg-current rounded"></div>
                </div>
              </div>
              <div className="font-semibold text-base sm:text-lg">Column</div>
              <div className="text-xs sm:text-sm opacity-80">Vertical arrangement</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, displayDirection: 'grid' }))}
              className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-center ${
                formData.displayDirection === 'grid'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex justify-center mb-2 sm:mb-3">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-3 h-3 bg-current rounded"></div>
                  <div className="w-3 h-3 bg-current rounded"></div>
                  <div className="w-3 h-3 bg-current rounded"></div>
                  <div className="w-3 h-3 bg-current rounded"></div>
                </div>
              </div>
              <div className="font-semibold text-base sm:text-lg">Grid</div>
              <div className="text-xs sm:text-sm opacity-80">Grid arrangement</div>
            </button>
          </div>
        </div>
      )}

      {/* Grid Settings */}
      {(formData.displayType === 'buttons' || formData.displayType === 'images') && formData.displayDirection === 'grid' && (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-600 space-y-6">
          <h4 className="text-gray-900 dark:text-white font-semibold text-lg flex items-center">
            <Grid2X2 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Grid Settings
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columns Configuration */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">Desktop Columns</label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={formData.gridSettings?.columns || 3}
                  onChange={(e) => updateGridSettings({ columns: parseInt(e.target.value) })}
                  className="w-full slider"
                />
                <div className="text-center text-gray-700 dark:text-gray-300 text-sm mt-1">
                  {formData.gridSettings?.columns || 3} columns
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">Tablet Columns</label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={formData.gridSettings?.columnsTablet || 2}
                  onChange={(e) => updateGridSettings({ columnsTablet: parseInt(e.target.value) })}
                  className="w-full slider"
                />
                <div className="text-center text-gray-700 dark:text-gray-300 text-sm mt-1">
                  {formData.gridSettings?.columnsTablet || 2} columns
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">Mobile Columns</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={formData.gridSettings?.columnsMobile || 1}
                  onChange={(e) => updateGridSettings({ columnsMobile: parseInt(e.target.value) })}
                  className="w-full slider"
                />
                <div className="text-center text-gray-700 dark:text-gray-300 text-sm mt-1">
                  {formData.gridSettings?.columnsMobile || 1} columns
                </div>
              </div>
            </div>

            {/* Gap and Auto-fit */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-3 font-medium">Gap Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {['small', 'medium', 'large'].map((gap) => (
                    <button
                      key={gap}
                      type="button"
                      onClick={() => updateGridSettings({ gap: gap as any })}
                      className={`p-3 rounded-lg border-2 transition-all capitalize ${
                        (formData.gridSettings?.gap || 'medium') === gap
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {gap}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div>
                  <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Auto-fit Items</label>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Automatically adjust columns based on item width</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateGridSettings({ autoFit: !formData.gridSettings?.autoFit })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.gridSettings?.autoFit ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.gridSettings?.autoFit ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {formData.gridSettings?.autoFit && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">Minimum Item Width (px)</label>
                  <input
                    type="range"
                    min="80"
                    max="300"
                    step="10"
                    value={formData.gridSettings?.minItemWidth || 120}
                    onChange={(e) => updateGridSettings({ minItemWidth: parseInt(e.target.value) })}
                    className="w-full slider"
                  />
                  <div className="text-center text-gray-700 dark:text-gray-300 text-sm mt-1">
                    {formData.gridSettings?.minItemWidth || 120}px
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Column Settings */}
      {(formData.displayType === 'buttons' || formData.displayType === 'images') && formData.displayDirection === 'column' && (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-600 space-y-6">
          <h4 className="text-gray-900 dark:text-white font-semibold text-lg flex items-center">
            <AlignLeft className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Column Settings
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alignment */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-3 font-medium">Alignment</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => updateColumnSettings({ alignment: 'left' })}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    (formData.columnSettings?.alignment || 'left') === 'left'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <AlignLeft className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold text-sm">Left</div>
                </button>
                <button
                  type="button"
                  onClick={() => updateColumnSettings({ alignment: 'center' })}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    (formData.columnSettings?.alignment || 'left') === 'center'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <AlignCenter className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold text-sm">Center</div>
                </button>
                <button
                  type="button"
                  onClick={() => updateColumnSettings({ alignment: 'right' })}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    (formData.columnSettings?.alignment || 'left') === 'right'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <AlignRight className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold text-sm">Right</div>
                </button>
              </div>
            </div>

            {/* Spacing */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-3 font-medium">Spacing</label>
              <div className="grid grid-cols-3 gap-3">
                {['compact', 'normal', 'relaxed'].map((spacing) => (
                  <button
                    key={spacing}
                    type="button"
                    onClick={() => updateColumnSettings({ spacing: spacing as any })}
                    className={`p-4 rounded-lg border-2 transition-all capitalize text-center ${
                      (formData.columnSettings?.spacing || 'normal') === spacing
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1 mb-2">
                      <div className="w-6 h-1 bg-current rounded"></div>
                      <div className={`w-6 h-1 bg-current rounded ${
                        spacing === 'compact' ? 'mt-0.5' : spacing === 'relaxed' ? 'mt-2' : 'mt-1'
                      }`}></div>
                      <div className={`w-6 h-1 bg-current rounded ${
                        spacing === 'compact' ? 'mt-0.5' : spacing === 'relaxed' ? 'mt-2' : 'mt-1'
                      }`}></div>
                    </div>
                    <div className="font-semibold text-sm">{spacing}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Settings */}
      {formData.displayType === 'images' && (
        <div className="space-y-6">
          <h4 className="text-gray-900 dark:text-white font-semibold text-lg">Image Settings</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Size and Aspect Ratio */}
            <div className="space-y-6">
              {/* Image Size */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">Size</label>
                <select
                  value={formData.imageSettings?.size || 'medium'}
                  onChange={(e) => updateImageSettings({ size: e.target.value as any })}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">Aspect Ratio</label>
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
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="square">Square</option>
                  <option value="round">Round</option>
                  <option value="3:2">3:2</option>
                  <option value="2:3">2:3</option>
                  <option value="auto">Auto (adapts to image)</option>
                </select>
                {isAutoAspectRatio && (
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Images will maintain their natural proportions within the size constraints
                  </p>
                )}
              </div>

              {/* Title Settings */}
              <div className="space-y-4">
                {/* Global Hide Title Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Show Titles</label>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Display option value names with images</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateImageSettings({ hideTitle: !hideTitle })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      !hideTitle ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        !hideTitle ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Title Position */}
                {!hideTitle && (
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm mb-3 font-medium">Title Position</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => updateImageSettings({ titlePosition: 'above' })}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          titlePosition === 'above'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="text-xs font-medium mb-1">Text</div>
                        <div className="w-8 h-6 bg-gray-400 dark:bg-gray-500 mx-auto rounded"></div>
                        <div className="font-semibold text-sm mt-2">Above</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateImageSettings({ titlePosition: 'below' })}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          titlePosition === 'below'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="w-8 h-6 bg-gray-400 dark:bg-gray-500 mx-auto rounded"></div>
                        <div className="text-xs font-medium mt-1 mb-1">Text</div>
                        <div className="font-semibold text-sm">Below</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateImageSettings({ titlePosition: 'center' })}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          titlePosition === 'center'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="relative w-8 h-6 bg-gray-400 dark:bg-gray-500 mx-auto rounded">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-xs font-bold text-white">T</div>
                          </div>
                        </div>
                        <div className="font-semibold text-sm mt-2">Center</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateImageSettings({ titlePosition: 'left' })}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          titlePosition === 'left'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <div className="text-xs font-medium">T</div>
                          <div className="w-6 h-4 bg-gray-400 dark:bg-gray-500 rounded"></div>
                        </div>
                        <div className="font-semibold text-sm mt-2">Left</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateImageSettings({ titlePosition: 'right' })}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          titlePosition === 'right'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <div className="w-6 h-4 bg-gray-400 dark:bg-gray-500 rounded"></div>
                          <div className="text-xs font-medium">T</div>
                        </div>
                        <div className="font-semibold text-sm mt-2">Right</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Corner Style */}
            <div className="space-y-6">
              {/* Corner Style - Hidden when Round aspect ratio is selected */}
              {!isRoundAspectRatio && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-3 font-medium">Corner Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => updateImageSettings({ cornerStyle: 'squared' })}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        formData.imageSettings?.cornerStyle === 'squared'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="w-10 h-10 bg-gray-400 dark:bg-gray-500 mx-auto mb-2" style={{ borderRadius: '0px' }}></div>
                      <div className="font-semibold text-sm">Squared</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateImageSettings({ cornerStyle: 'soft' })}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        formData.imageSettings?.cornerStyle === 'soft'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="w-10 h-10 bg-gray-400 dark:bg-gray-500 mx-auto mb-2" style={{ borderRadius: '4px' }}></div>
                      <div className="font-semibold text-sm">Soft</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateImageSettings({ cornerStyle: 'softer' })}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        formData.imageSettings?.cornerStyle === 'softer'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="w-10 h-10 bg-gray-400 dark:bg-gray-500 mx-auto mb-2" style={{ borderRadius: '8px' }}></div>
                      <div className="font-semibold text-sm">Softer</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplaySettings;