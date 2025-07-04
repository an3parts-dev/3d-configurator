import { useState, useCallback } from 'react';
import { LayoutConfiguration, LayoutTemplate } from '../types/LayoutTypes';

const STORAGE_KEY = 'layout_configurations';
const TEMPLATES_KEY = 'layout_templates';

export const useLayoutPersistence = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Save layout configuration
  const saveLayout = useCallback(async (layout: LayoutConfiguration) => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const layouts: LayoutConfiguration[] = stored ? JSON.parse(stored) : [];
      
      const existingIndex = layouts.findIndex(l => l.id === layout.id);
      if (existingIndex >= 0) {
        layouts[existingIndex] = { ...layout, updatedAt: new Date() };
      } else {
        layouts.push(layout);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
      console.log('Layout saved successfully');
    } catch (error) {
      console.error('Failed to save layout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load layout configuration
  const loadLayout = useCallback(async (layoutId: string): Promise<LayoutConfiguration | null> => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const layouts: LayoutConfiguration[] = stored ? JSON.parse(stored) : [];
      
      const layout = layouts.find(l => l.id === layoutId);
      return layout || null;
    } catch (error) {
      console.error('Failed to load layout:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get all layouts
  const getAllLayouts = useCallback(async (): Promise<LayoutConfiguration[]> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get layouts:', error);
      return [];
    }
  }, []);

  // Delete layout
  const deleteLayout = useCallback(async (layoutId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const layouts: LayoutConfiguration[] = stored ? JSON.parse(stored) : [];
      
      const filteredLayouts = layouts.filter(l => l.id !== layoutId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLayouts));
      
      console.log('Layout deleted successfully');
    } catch (error) {
      console.error('Failed to delete layout:', error);
      throw error;
    }
  }, []);

  // Export layout to JSON
  const exportLayout = useCallback(async (layout: LayoutConfiguration) => {
    try {
      const dataStr = JSON.stringify(layout, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `layout-${layout.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('Layout exported successfully');
    } catch (error) {
      console.error('Failed to export layout:', error);
      throw error;
    }
  }, []);

  // Import layout from JSON
  const importLayout = useCallback(async (): Promise<LayoutConfiguration> => {
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
            const layout: LayoutConfiguration = JSON.parse(content);
            
            // Validate layout structure
            if (!layout.id || !layout.name || !layout.components) {
              throw new Error('Invalid layout file format');
            }

            // Generate new ID to avoid conflicts
            layout.id = `layout_${Date.now()}`;
            layout.name = `${layout.name} (Imported)`;
            layout.updatedAt = new Date();
            
            resolve(layout);
          } catch (error) {
            reject(new Error('Failed to parse layout file'));
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

  // Get templates (mock data for now)
  const getTemplates = useCallback((): LayoutTemplate[] => {
    return [
      {
        id: 'ecommerce-standard',
        name: 'E-commerce Standard',
        description: 'Classic e-commerce layout with product viewer, options, and cart',
        thumbnail: '/templates/ecommerce-standard.jpg',
        category: 'ecommerce',
        components: [
          {
            id: 'viewport-1',
            type: 'viewport',
            name: '3D Viewport',
            props: { aspectRatio: '16:9', showControls: true },
            style: { width: 600, height: 400, backgroundColor: '#f8fafc' },
            position: { x: 50, y: 50 }
          },
          {
            id: 'options-1',
            type: 'options',
            name: 'Product Options',
            props: { layout: 'grid', columns: 2, showImages: true },
            style: { width: 300, height: 400, backgroundColor: '#ffffff' },
            position: { x: 700, y: 50 }
          },
          {
            id: 'info-1',
            type: 'info',
            name: 'Product Info',
            props: { showTitle: true, showDescription: true },
            style: { width: 600, height: 150, backgroundColor: '#ffffff' },
            position: { x: 50, y: 500 }
          },
          {
            id: 'cart-1',
            type: 'cart',
            name: 'Add to Cart',
            props: { style: 'button', showQuantity: true },
            style: { width: 300, height: 150, backgroundColor: '#ffffff' },
            position: { x: 700, y: 500 }
          }
        ],
        responsive: {
          breakpoints: { mobile: 768, tablet: 1024, desktop: 1200 },
          layouts: { mobile: [], tablet: [], desktop: [] }
        },
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'showcase-minimal',
        name: 'Minimal Showcase',
        description: 'Clean, minimal layout focusing on the 3D model',
        thumbnail: '/templates/showcase-minimal.jpg',
        category: 'minimal',
        components: [
          {
            id: 'viewport-2',
            type: 'viewport',
            name: '3D Viewport',
            props: { aspectRatio: '1:1', showControls: false },
            style: { width: 800, height: 600, backgroundColor: '#ffffff' },
            position: { x: 200, y: 100 }
          },
          {
            id: 'options-2',
            type: 'options',
            name: 'Product Options',
            props: { layout: 'list', showImages: false },
            style: { width: 800, height: 100, backgroundColor: '#ffffff' },
            position: { x: 200, y: 750 }
          }
        ],
        responsive: {
          breakpoints: { mobile: 768, tablet: 1024, desktop: 1200 },
          layouts: { mobile: [], tablet: [], desktop: [] }
        },
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }, []);

  return {
    isLoading,
    saveLayout,
    loadLayout,
    getAllLayouts,
    deleteLayout,
    exportLayout,
    importLayout,
    getTemplates
  };
};