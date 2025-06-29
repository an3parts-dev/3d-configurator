import React, { useState } from 'react';
import { CustomizationOption, CustomizationOptionValue } from '../../types/AdminTypes';
import { X, Plus, Trash2, Palette, Eye, Camera, Info } from 'lucide-react';

interface CustomizationOptionFormProps {
  option?: CustomizationOption | null;
  productId: string;
  onSubmit: (optionData: Omit<CustomizationOption, 'id'>) => void;
  onCancel: () => void;
}

export const CustomizationOptionForm: React.FC<CustomizationOptionFormProps> = ({
  option,
  productId,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<CustomizationOption, 'id'>>({
    productId,
    title: option?.title || '',
    description: option?.description || '',
    type: option?.type || 'color',
    inputType: option?.inputType || 'buttons',
    isRequired: option?.isRequired || false,
    order: option?.order || 0,
    modelComponents: option?.modelComponents || [],
    options: option?.options || [],
    isBindable: option?.isBindable || false,
    variantBinding: option?.variantBinding || '',
    hideTitle: option?.hideTitle || false
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'options' | 'advanced'>('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputTypes = [
    { value: 'buttons', label: 'Buttons', icon: '🔘' },
    { value: 'dropdown', label: 'Dropdown', icon: '📋' },
    { value: 'color-palette-round', label: 'Color Palette (Round)', icon: '🎨' },
    { value: 'color-palette-square', label: 'Color Palette (Square)', icon: '⬜' },
    { value: 'range', label: 'Range Slider', icon: '📏' },
    { value: 'text', label: 'Text Input', icon: '📝' },
    { value: 'image-upload', label: 'Image Upload', icon: '🖼️' }
  ];

  const optionTypes = [
    { value: 'color', label: 'Color/Texture', description: 'Change colors and materials' },
    { value: 'visibility', label: 'Show/Hide Components', description: 'Toggle component visibility' },
    { value: 'text', label: 'Text Engraving', description: 'Add custom text' },
    { value: 'image', label: 'Image Upload', description: 'Upload custom images' },
    { value: 'dropdown', label: 'Dropdown Selection', description: 'Select from predefined options' },
    { value: 'range', label: 'Range/Size', description: 'Adjust size or quantity' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.options.length === 0 && formData.type !== 'range' && formData.type !== 'text') {
      newErrors.options = 'At least one option is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addOption = () => {
    const newOption: CustomizationOptionValue = {
      id: Date.now().toString(),
      title: '',
      value: '',
      priceModifier: 0,
      isDefault: formData.options.length === 0
    };
    
    handleInputChange('options', [...formData.options, newOption]);
  };

  const updateOption = (index: number, updates: Partial<CustomizationOptionValue>) => {
    const updatedOptions = formData.options.map((opt, i) => 
      i === index ? { ...opt, ...updates } : opt
    );
    handleInputChange('options', updatedOptions);
  };

  const removeOption = (index: number) => {
    const updatedOptions = formData.options.filter((_, i) => i !== index);
    handleInputChange('options', updatedOptions);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Settings', icon: Info },
    { id: 'options', label: 'Option Values', icon: Palette },
    { id: 'advanced', label: 'Advanced', icon: Eye }
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {option ? 'Edit Customization Option' : 'Create Customization Option'}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Settings Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Fitting Material, Hose Color"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional description to help customers understand this option"
              />
            </div>

            {/* Option Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Option Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {optionTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('type', type.value)}
                    className={`p-4 text-left border rounded-lg transition-all ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Input Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {inputTypes.map((inputType) => (
                  <button
                    key={inputType.value}
                    type="button"
                    onClick={() => handleInputChange('inputType', inputType.value)}
                    className={`p-3 text-center border rounded-lg transition-all ${
                      formData.inputType === inputType.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{inputType.icon}</div>
                    <div className="text-sm font-medium">{inputType.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => handleInputChange('isRequired', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
                  This option is required
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="hideTitle"
                  checked={formData.hideTitle}
                  onChange={(e) => handleInputChange('hideTitle', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="hideTitle" className="text-sm font-medium text-gray-700">
                  Hide title on storefront
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isBindable"
                  checked={formData.isBindable}
                  onChange={(e) => handleInputChange('isBindable', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isBindable" className="text-sm font-medium text-gray-700">
                  Bind to Shopify variants
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Options Tab */}
        {activeTab === 'options' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">Option Values</h4>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
            </div>

            {errors.options && <p className="text-red-600 text-sm">{errors.options}</p>}

            <div className="space-y-4">
              {formData.options.map((option, index) => (
                <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h5 className="font-medium text-gray-900">Option {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={option.title}
                        onChange={(e) => updateOption(index, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Option title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value *
                      </label>
                      <input
                        type="text"
                        value={option.value}
                        onChange={(e) => updateOption(index, { value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Internal value"
                      />
                    </div>

                    {(formData.inputType.includes('color-palette') || formData.type === 'color') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={option.color || '#000000'}
                            onChange={(e) => updateOption(index, { color: e.target.value })}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={option.color || ''}
                            onChange={(e) => updateOption(index, { color: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Modifier
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={option.priceModifier}
                          onChange={(e) => updateOption(index, { priceModifier: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`default-${index}`}
                      checked={option.isDefault}
                      onChange={(e) => {
                        // Only one option can be default
                        const updatedOptions = formData.options.map((opt, i) => ({
                          ...opt,
                          isDefault: i === index ? e.target.checked : false
                        }));
                        handleInputChange('options', updatedOptions);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`default-${index}`} className="text-sm font-medium text-gray-700">
                      Default option
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {formData.options.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Palette className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No options added yet</p>
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add your first option
                </button>
              </div>
            )}
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Components
              </label>
              <textarea
                value={formData.modelComponents.join(', ')}
                onChange={(e) => handleInputChange('modelComponents', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter component names separated by commas (e.g., fitting_a, fitting_b, hose)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Specify which 3D model components this option affects
              </p>
            </div>

            {formData.isBindable && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variant Binding
                </label>
                <input
                  type="text"
                  value={formData.variantBinding}
                  onChange={(e) => handleInputChange('variantBinding', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Shopify variant option name"
                />
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Camera Angle</h5>
              <p className="text-sm text-gray-600 mb-3">
                Set a custom camera angle to showcase this option (coming soon)
              </p>
              <button
                type="button"
                disabled
                className="flex items-center space-x-2 px-3 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
              >
                <Camera className="w-4 h-4" />
                <span>Select Camera Angle</span>
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Conditional Logic</h5>
              <p className="text-sm text-gray-600 mb-3">
                Show or hide this option based on other selections (coming soon)
              </p>
              <button
                type="button"
                disabled
                className="flex items-center space-x-2 px-3 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                <span>Add Conditions</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {option ? 'Update Option' : 'Create Option'}
          </button>
        </div>
      </form>
    </div>
  );
};