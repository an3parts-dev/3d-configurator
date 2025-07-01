import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Info, Settings } from 'lucide-react';
import { LengthSettings } from '../types/ConfiguratorTypes';

interface LengthInputControlProps {
  lengthSettings: LengthSettings;
  currentValue: number;
  onValueChange: (value: number) => void;
  onSettingsChange: (settings: LengthSettings) => void;
  className?: string;
}

const LengthInputControl: React.FC<LengthInputControlProps> = ({
  lengthSettings,
  currentValue,
  onValueChange,
  onSettingsChange,
  className = ""
}) => {
  const [inputValue, setInputValue] = useState(currentValue.toString());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setInputValue(currentValue.toString());
  }, [currentValue]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= lengthSettings.minValue && numValue <= lengthSettings.maxValue) {
      onValueChange(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < lengthSettings.minValue || numValue > lengthSettings.maxValue) {
      setInputValue(currentValue.toString());
    }
  };

  const getMeasurementTypeInfo = () => {
    switch (lengthSettings.measurementType) {
      case 'cc':
        return {
          title: 'C/C Length',
          description: 'Measured from sealing point to sealing point or hex surface to hex surface, depending on fitting type.'
        };
      case 'total':
        return {
          title: 'Total Length',
          description: 'Complete measurement including hose and fittings, from fitting end to fitting end.'
        };
      case 'hose':
        return {
          title: 'Hose Length',
          description: 'Actual length of the hose excluding fittings.'
        };
      default:
        return { title: 'Length', description: 'Custom length measurement.' };
    }
  };

  const measurementInfo = getMeasurementTypeInfo();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Measurement Type Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Ruler className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-blue-300 font-semibold">{measurementInfo.title}</h4>
            <p className="text-blue-200/80 text-sm">{measurementInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Length Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-gray-400 text-sm font-medium">Length Value</label>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
            title="Length Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={handleInputBlur}
              min={lengthSettings.minValue}
              max={lengthSettings.maxValue}
              step={lengthSettings.step}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter length"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
              {lengthSettings.unit}
            </div>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            value={currentValue}
            onChange={(e) => onValueChange(parseFloat(e.target.value))}
            min={lengthSettings.minValue}
            max={lengthSettings.maxValue}
            step={lengthSettings.step}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{lengthSettings.minValue}{lengthSettings.unit}</span>
            <span>{lengthSettings.maxValue}{lengthSettings.unit}</span>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-750 p-4 rounded-xl border border-gray-600 space-y-4"
        >
          <h5 className="text-white font-semibold">Length Settings</h5>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Measurement Type</label>
              <select
                value={lengthSettings.measurementType}
                onChange={(e) => onSettingsChange({
                  ...lengthSettings,
                  measurementType: e.target.value as 'cc' | 'total' | 'hose'
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="cc">C/C Length</option>
                <option value="total">Total Length</option>
                <option value="hose">Hose Length</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Unit</label>
              <select
                value={lengthSettings.unit}
                onChange={(e) => onSettingsChange({
                  ...lengthSettings,
                  unit: e.target.value as 'mm' | 'cm' | 'in' | 'ft'
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="mm">Millimeters (mm)</option>
                <option value="cm">Centimeters (cm)</option>
                <option value="in">Inches (in)</option>
                <option value="ft">Feet (ft)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Min Value</label>
              <input
                type="number"
                value={lengthSettings.minValue}
                onChange={(e) => onSettingsChange({
                  ...lengthSettings,
                  minValue: parseFloat(e.target.value) || 0
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Max Value</label>
              <input
                type="number"
                value={lengthSettings.maxValue}
                onChange={(e) => onSettingsChange({
                  ...lengthSettings,
                  maxValue: parseFloat(e.target.value) || 1000
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Step</label>
              <input
                type="number"
                value={lengthSettings.step}
                onChange={(e) => onSettingsChange({
                  ...lengthSettings,
                  step: parseFloat(e.target.value) || 1
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                step="0.1"
              />
            </div>
          </div>
        </motion.div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default LengthInputControl;