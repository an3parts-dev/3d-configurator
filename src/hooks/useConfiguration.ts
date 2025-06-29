import { useState, useCallback } from 'react';
import { Configuration } from '../types/Configuration';

const defaultConfiguration: Configuration = {
  material: 'zinc',
  fittingType: {
    a: 'banjo',
    b: 'banjo'
  },
  fittingSize: {
    a: '10mm',
    b: '10mm'
  },
  fittingAngle: {
    a: 'straight-short',
    b: 'straight-short'
  },
  hoseColor: 'clear',
  stealthHeatshrink: false,
  length: 50,
  purpose: 'other',
  accessories: 'none'
};

export const useConfiguration = () => {
  const [configuration, setConfiguration] = useState<Configuration>(defaultConfiguration);

  const updateConfiguration = useCallback((updates: Partial<Configuration>) => {
    setConfiguration(prev => {
      const newConfig = { ...prev, ...updates };
      
      // Auto-reset fitting sizes when fitting type changes to banjo
      if (updates.fittingType) {
        if (updates.fittingType.a === 'banjo' && prev.fittingType.a !== 'banjo') {
          newConfig.fittingSize.a = '10mm'; // Reset to default banjo size
        }
        if (updates.fittingType.b === 'banjo' && prev.fittingType.b !== 'banjo') {
          newConfig.fittingSize.b = '10mm'; // Reset to default banjo size
        }
      }
      
      return newConfig;
    });
  }, []);

  const resetConfiguration = useCallback(() => {
    setConfiguration(defaultConfiguration);
  }, []);

  return {
    configuration,
    updateConfiguration,
    resetConfiguration
  };
};