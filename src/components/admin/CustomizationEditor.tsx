import React, { useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { CustomizationOption } from '../../types/AdminTypes';
import { Plus, Edit3, Trash2, GripVertical, Settings, Eye, AlertCircle } from 'lucide-react';
import { CustomizationOptionForm } from './CustomizationOptionForm';

export const CustomizationEditor: React.FC = () => {
  const { adminState, createCustomizationOption, updateCustomizationOption, deleteCustomizationOption } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editingOption, setEditingOption] = useState<CustomizationOption | null>(null);

  if (!adminState.selectedProduct) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Selected</h3>
        <p className="text-gray-600">Please select a product from the Products tab to manage its customization options.</p>
      </div>
    );
  }

  const productOptions = adminState.customizationOptions
    .filter(option => option.productId === adminState.selectedProduct!.id)
    .sort((a, b) => a.order - b.order);

  const handleCreateOption = (optionData: Omit<CustomizationOption, 'id'>) => {
    createCustomizationOption({
      ...optionData,
      productId: adminState.selectedProduct!.id,
      order: productOptions.length
    });
    setShowForm(false);
  };

  const handleUpdateOption = (optionData: Omit<CustomizationOption, 'id'>) => {
    if (editingOption) {
      updateCustomizationOption(editingOption.id, optionData);
      setEditingOption(null);
    }
  };

  const handleEditOption = (option: CustomizationOption) => {
    setEditingOption(option);
    setShowForm(true);
  };

  const handleDeleteOption = (optionId: string) => {
    if (confirm('Are you sure you want to delete this customization option?')) {
      deleteCustomizationOption(optionId);
    }
  };

  const getInputTypeIcon = (inputType: string) => {
    switch (inputType) {
      case 'buttons': return '🔘';
      case 'dropdown': return '📋';
      case 'color-palette-round': return '🎨';
      case 'color-palette-square': return '⬜';
      case 'range': return '📏';
      case 'text': return '📝';
      case 'image-upload': return '🖼️';
      default: return '⚙️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'color': return 'bg-purple-100 text-purple-700';
      case 'visibility': return 'bg-green-100 text-green-700';
      case 'text': return 'bg-blue-100 text-blue-700';
      case 'image': return 'bg-orange-100 text-orange-700';
      case 'dropdown': return 'bg-gray-100 text-gray-700';
      case 'range': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Customization Options</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure customization options for <span className="font-medium">{adminState.selectedProduct.name}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setEditingOption(null);
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Option</span>
        </button>
      </div>

      {/* Customization Option Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CustomizationOptionForm
              option={editingOption}
              productId={adminState.selectedProduct.id}
              onSubmit={editingOption ? handleUpdateOption : handleCreateOption}
              onCancel={() => {
                setShowForm(false);
                setEditingOption(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Options List */}
      <div className="space-y-4">
        {productOptions.map((option, index) => (
          <div
            key={option.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex items-center space-x-2 text-gray-400">
                  <GripVertical className="w-5 h-5" />
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{option.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(option.type)}`}>
                      {option.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getInputTypeIcon(option.inputType)} {option.inputType.replace('-', ' ')}
                    </span>
                    {option.isRequired && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Required
                      </span>
                    )}
                  </div>
                  
                  {option.description && (
                    <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>{option.options.length} options</span>
                    {option.modelComponents.length > 0 && (
                      <span>{option.modelComponents.length} components</span>
                    )}
                    {option.conditionalLogic?.isConditional && (
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>Conditional</span>
                      </span>
                    )}
                    {option.isBindable && (
                      <span className="text-blue-600">Bindable</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditOption(option)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteOption(option.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {productOptions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customization options yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first customization option to start building your configurator.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Option</span>
          </button>
        </div>
      )}
    </div>
  );
};