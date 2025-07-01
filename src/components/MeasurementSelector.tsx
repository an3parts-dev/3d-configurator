import React from 'react';
import { Ruler, Move3D, Cable } from 'lucide-react';
import { MEASUREMENT_TYPES, MeasurementType } from '../types/MeasurementTypes';

interface MeasurementSelectorProps {
  activeMeasurementType: string | null;
  onMeasurementTypeChange: (typeId: string | null) => void;
  availableMeasurements: string[];
}

const MeasurementSelector: React.FC<MeasurementSelectorProps> = ({
  activeMeasurementType,
  onMeasurementTypeChange,
  availableMeasurements
}) => {
  const getIcon = (typeId: string) => {
    switch (typeId) {
      case 'totalLength':
        return <Ruler className="w-4 h-4" />;
      case 'centerToCenter':
        return <Move3D className="w-4 h-4" />;
      case 'hoseLength':
        return <Cable className="w-4 h-4" />;
      default:
        return <Ruler className="w-4 h-4" />;
    }
  };

  const availableTypes = MEASUREMENT_TYPES.filter(type => 
    availableMeasurements.includes(type.id)
  );

  if (availableTypes.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h3 className="text-white font-medium mb-3 flex items-center">
        <Ruler className="w-5 h-5 mr-2" />
        Measurements
      </h3>
      
      <div className="space-y-2">
        <button
          onClick={() => onMeasurementTypeChange(null)}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            activeMeasurementType === null
              ? 'bg-gray-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          Hide Measurements
        </button>
        
        {availableTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onMeasurementTypeChange(type.id)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-3 ${
              activeMeasurementType === type.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <div style={{ color: type.color }}>
              {getIcon(type.id)}
            </div>
            <div>
              <div className="font-medium">{type.name}</div>
              <div className="text-xs opacity-80">{type.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MeasurementSelector;