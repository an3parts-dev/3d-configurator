import React from 'react';
import { Configuration } from '../types/Configuration';
import { ShoppingCart, Download, Share2 } from 'lucide-react';

interface ConfigurationSummaryProps {
  configuration: Configuration;
}

export const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({ configuration }) => {
  const calculatePrice = () => {
    let basePrice = 45.00;
    
    // Material premium
    if (configuration.material === 'stainless') {
      basePrice += 15.00;
    }
    
    // Length pricing
    if (configuration.length > 100) {
      basePrice += (configuration.length - 100) * 0.20;
    }
    
    // Stealth heatshrink
    if (configuration.stealthHeatshrink) {
      basePrice += 8.00;
    }
    
    return basePrice.toFixed(2);
  };

  const getConfigSummary = () => {
    return [
      { label: 'Material', value: configuration.material === 'zinc' ? 'Zinc Plated Steel' : 'Stainless Steel' },
      { label: 'A-Fitting', value: `${configuration.fittingType.a} - ${configuration.fittingSize.a} - ${configuration.fittingAngle.a}` },
      { label: 'B-Fitting', value: `${configuration.fittingType.b} - ${configuration.fittingSize.b} - ${configuration.fittingAngle.b}` },
      { label: 'Hose Color', value: configuration.hoseColor },
      { label: 'Length', value: `${configuration.length} cm` },
      { label: 'Stealth Heatshrink', value: configuration.stealthHeatshrink ? 'Yes' : 'No' },
      { label: 'Purpose', value: configuration.purpose }
    ];
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-xl font-bold mb-6 text-white">Configuration Summary</h3>
      
      <div className="space-y-3 mb-6">
        {getConfigSummary().map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
            <span className="text-gray-400 text-sm">{item.label}</span>
            <span className="text-white text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-700 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-white">Total Price</span>
          <span className="text-2xl font-bold text-orange-400">${calculatePrice()}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">*Excluding shipping and taxes</p>
      </div>
      
      <div className="space-y-3">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Cart</span>
        </button>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};