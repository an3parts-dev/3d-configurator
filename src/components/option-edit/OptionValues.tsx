import React from 'react';
import { Plus } from 'lucide-react';
import DragDropOptionValue from '../DragDropOptionValue';
import { EmptyState } from '../ui';
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Value</span>
        </button>
      </div>

      {localValues.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No values yet"
          description="Add your first value to get started"
        />
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