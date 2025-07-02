import React from 'react';
import { Plus, List } from 'lucide-react';
import DragDropOptionValue from '../DragDropOptionValue';
import { ConfiguratorOption, ConfiguratorOptionValue } from '../../types/ConfiguratorTypes';

interface ModelComponent {
  name: string;
  mesh: any;
  visible: boolean;
  material?: any;
}

interface OptionValuesProps {
  option?: ConfiguratorOption | null;
  formData: Omit<ConfiguratorOption, 'id' | 'values'>;
  localValues: ConfiguratorOptionValue[];
  modelComponents: ModelComponent[];
  allOptions: ConfiguratorOption[];
  onAddValue: () => void;
  onUpdateValue: (valueId: string, updates: Partial<ConfiguratorOptionValue>) => void;
  onDeleteValue: (valueId: string) => void;
  onMoveValue: (dragIndex: number, hoverIndex: number) => void;
}

const OptionValues: React.FC<OptionValuesProps> = ({
  option,
  formData,
  localValues,
  modelComponents,
  allOptions,
  onAddValue,
  onUpdateValue,
  onDeleteValue,
  onMoveValue
}) => {
  const isEditing = !!option;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-white font-semibold text-lg">Option Values</h4>
          <p className="text-gray-400 text-sm mt-1">
            Configure the different choices users can select for this option
          </p>
        </div>
        <button
          type="button"
          onClick={onAddValue}
          disabled={!isEditing}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
            isEditing
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Value</span>
        </button>
      </div>

      {!isEditing ? (
        <div className="text-center py-12 text-gray-500">
          <List className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Save option first</p>
          <p className="text-sm mt-2">You need to save the option before adding values</p>
        </div>
      ) : localValues.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <List className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No values yet</p>
          <p className="text-sm mt-2">Add your first value to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {localValues.map((value, index) => (
            <DragDropOptionValue
              key={value.id}
              value={value}
              index={index}
              manipulationType={formData.manipulationType}
              displayType={formData.displayType}
              availableComponents={modelComponents}
              targetComponents={formData.targetComponents}
              defaultBehavior={formData.defaultBehavior}
              imageSettings={formData.imageSettings}
              allOptions={allOptions}
              onMove={onMoveValue}
              onUpdate={onUpdateValue}
              onDelete={onDeleteValue}
              canDelete={localValues.length > 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OptionValues;