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
  onShowComponentSelector?: (title: string, selectedComponents: string[], onSelectionChange: (components: string[]) => void) => void;
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
  onMoveValue,
  onShowComponentSelector
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold text-lg">Option Values</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
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
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 p-4 overflow-y-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
        }}
      >
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
                onShowComponentSelector={onShowComponentSelector}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add CSS to hide scrollbars */}
      <style jsx>{`
        .flex-1::-webkit-scrollbar {
          display: none;
        }
        .flex-1 {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default OptionValues;