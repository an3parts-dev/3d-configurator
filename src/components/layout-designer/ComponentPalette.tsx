import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Settings, 
  Info, 
  DollarSign, 
  ShoppingCart, 
  Box,
  Search,
  Grid3X3,
  List,
  Layers
} from 'lucide-react';
import { LayoutComponent } from '../../types/LayoutTypes';

interface ComponentPaletteProps {
  onAddComponent: (component: LayoutComponent) => void;
}

interface PaletteComponent {
  type: string;
  name: string;
  icon: React.ComponentType<any>;
  category: 'layout' | 'content' | 'interactive' | 'media';
  description: string;
  defaultProps: Record<string, any>;
}

const COMPONENT_LIBRARY: PaletteComponent[] = [
  {
    type: 'viewport',
    name: '3D Viewport',
    icon: Monitor,
    category: 'media',
    description: 'Interactive 3D model viewer',
    defaultProps: {
      aspectRatio: '16:9',
      controls: { zoom: true, rotate: true, pan: true },
      showControls: true
    }
  },
  {
    type: 'options',
    name: 'Product Options',
    icon: Settings,
    category: 'interactive',
    description: 'Configurator options display',
    defaultProps: {
      layout: 'grid',
      columns: 2,
      showImages: true,
      showPrices: false
    }
  },
  {
    type: 'info',
    name: 'Product Info',
    icon: Info,
    category: 'content',
    description: 'Product details and description',
    defaultProps: {
      showTitle: true,
      showDescription: true,
      showSpecs: false
    }
  },
  {
    type: 'price',
    name: 'Price Display',
    icon: DollarSign,
    category: 'content',
    description: 'Price summary and breakdown',
    defaultProps: {
      showBreakdown: true,
      showTax: false,
      currency: 'USD'
    }
  },
  {
    type: 'cart',
    name: 'Add to Cart',
    icon: ShoppingCart,
    category: 'interactive',
    description: 'Purchase action button',
    defaultProps: {
      style: 'button',
      showQuantity: true,
      showPrice: true
    }
  },
  {
    type: 'container',
    name: 'Container',
    icon: Box,
    category: 'layout',
    description: 'Layout container for grouping',
    defaultProps: {
      direction: 'column',
      gap: 16,
      padding: 16
    }
  }
];

const DraggableComponent: React.FC<{
  component: PaletteComponent;
  onAdd: (component: LayoutComponent) => void;
}> = ({ component, onAdd }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { 
      type: component.type,
      isNew: true
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = () => {
    const newComponent: LayoutComponent = {
      id: `${component.type}_${Date.now()}`,
      type: component.type as any,
      name: component.name,
      props: component.defaultProps,
      style: {
        width: 200,
        height: 100,
        padding: { top: 16, right: 16, bottom: 16, left: 16 },
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      },
      position: { x: 100, y: 100 }
    };
    onAdd(newComponent);
  };

  return (
    <motion.div
      ref={drag}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg">
          <component.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {component.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {component.description}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          component.category === 'layout' ? 'bg-purple-100 text-purple-700 dark:bg-purple-600/20 dark:text-purple-300' :
          component.category === 'content' ? 'bg-green-100 text-green-700 dark:bg-green-600/20 dark:text-green-300' :
          component.category === 'interactive' ? 'bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-300' :
          'bg-orange-100 text-orange-700 dark:bg-orange-600/20 dark:text-orange-300'
        }`}>
          {component.category}
        </span>
      </div>
    </motion.div>
  );
};

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAddComponent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All', icon: Layers },
    { id: 'layout', name: 'Layout', icon: Grid3X3 },
    { id: 'content', name: 'Content', icon: List },
    { id: 'interactive', name: 'Interactive', icon: Settings },
    { id: 'media', name: 'Media', icon: Monitor }
  ];

  const filteredComponents = COMPONENT_LIBRARY.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Component Library
        </h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <category.icon className="w-3 h-3" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Components Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          {filteredComponents.map(component => (
            <DraggableComponent
              key={component.type}
              component={component}
              onAdd={onAddComponent}
            />
          ))}
        </div>
        
        {filteredComponents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No components found</p>
            <p className="text-xs mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 <strong>Tip:</strong> Drag components to the canvas or click to add at default position
        </p>
      </div>
    </div>
  );
};

export default ComponentPalette;