import { useState, useEffect, useCallback } from 'react';
import { ConfiguratorData } from '../types/ConfiguratorTypes';

const STORAGE_KEY = 'configurator_data';
const STORAGE_VERSION = '1.0';

interface StorageData {
  version: string;
  timestamp: number;
  configurators: ConfiguratorData[];
  activeConfiguratorId: string;
}

export const useConfiguratorPersistence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data from localStorage
  const loadFromStorage = useCallback((): { configurators: ConfiguratorData[], activeId: string } | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data: StorageData = JSON.parse(stored);
      
      // Version check for future compatibility
      if (data.version !== STORAGE_VERSION) {
        console.warn('Storage version mismatch, using defaults');
        return null;
      }

      console.log('✅ Loaded configurations from storage:', data.configurators.length);
      return {
        configurators: data.configurators,
        activeId: data.activeConfiguratorId
      };
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return null;
    }
  }, []);

  // Save data to localStorage
  const saveToStorage = useCallback((configurators: ConfiguratorData[], activeId: string) => {
    try {
      const data: StorageData = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        configurators,
        activeConfiguratorId: activeId
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSaved(new Date());
      console.log('💾 Saved configurations to storage');
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }, []);

  // Export configurations to JSON file
  const exportConfigurations = useCallback((configurators: ConfiguratorData[], activeId: string) => {
    try {
      const exportData: StorageData = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        configurators,
        activeConfiguratorId: activeId
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `configurator-export-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('📤 Exported configurations');
    } catch (error) {
      console.error('Failed to export configurations:', error);
      throw error;
    }
  }, []);

  // Import configurations from JSON file
  const importConfigurations = useCallback((): Promise<{ configurators: ConfiguratorData[], activeId: string }> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const data: StorageData = JSON.parse(content);
            
            // Validate imported data
            if (!data.configurators || !Array.isArray(data.configurators)) {
              throw new Error('Invalid file format: missing configurators array');
            }

            if (!data.activeConfiguratorId) {
              throw new Error('Invalid file format: missing active configurator ID');
            }

            console.log('📥 Imported configurations:', data.configurators.length);
            resolve({
              configurators: data.configurators,
              activeId: data.activeConfiguratorId
            });
          } catch (error) {
            console.error('Failed to parse imported file:', error);
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
      };

      input.click();
    });
  }, []);

  // Clear all stored data
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setLastSaved(null);
      console.log('🗑️ Cleared storage');
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }, []);

  // Initialize loading state
  useEffect(() => {
    // Small delay to prevent flash
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    isLoading,
    lastSaved,
    loadFromStorage,
    saveToStorage,
    exportConfigurations,
    importConfigurations,
    clearStorage
  };
};