import React from 'react';
import { Configuration } from '../types/Configuration';

interface OptionSectionProps {
  section: any;
  configuration: Configuration;
  onUpdate: (updates: Partial<Configuration>) => void;
}

export const OptionSection: React.FC<OptionSectionProps> = ({ section, configuration, onUpdate }) => {
  const getValue = (path: string) => {
    return path.split('.').reduce((obj, key) => obj?.[key], configuration);
  };

  const handleUpdate = (path: string, value: any) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      onUpdate({ [keys[0]]: value });
    } else {
      const [parent, child] = keys;
      onUpdate({
        [parent]: {
          ...configuration[parent as keyof Configuration],
          [child]: value
        }
      });
    }
  };

  if (section.type === 'range') {
    const value = getValue(section.id);
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">Length</span>
          <span className="text-sm text-blue-400">{value} {section.unit}</span>
        </div>
        <input
          type="range"
          min={section.min}
          max={section.max}
          step={section.step}
          value={value}
          onChange={(e) => handleUpdate(section.id, parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{section.min} {section.unit}</span>
          <span>{section.max} {section.unit}</span>
        </div>
      </div>
    );
  }

  if (section.subsections) {
    return (
      <div className="space-y-6">
        {section.subsections.map((subsection: any) => (
          <div key={subsection.id}>
            <h4 className="text-sm font-medium text-gray-300 mb-3">{subsection.title}</h4>
            <div className="grid grid-cols-1 gap-2">
              {subsection.options.map((option: any) => {
                const isSelected = getValue(`${section.id}.${subsection.id}`) === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleUpdate(`${section.id}.${subsection.id}`, option.value)}
                    className={`px-3 py-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border border-blue-500'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (section.options) {
    return (
      <div className="grid grid-cols-1 gap-2">
        {section.options.map((option: any) => {
          const isSelected = getValue(section.id) === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleUpdate(section.id, option.value)}
              className={`px-3 py-2 rounded-lg text-left transition-all flex items-center space-x-3 ${
                isSelected
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              {option.color && (
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{
                    backgroundColor: option.color,
                    borderColor: option.border || option.color
                  }}
                />
              )}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return null;
};