import React, { useCallback, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { Plus, Trash2, Copy, Move } from 'lucide-react';
import DraggableComponent from './DraggableComponent';
import ResizableComponent from './ResizableComponent';
import { LayoutConfiguration, LayoutComponent, DragItem } from '../../types/LayoutTypes';

interface LayoutEditorProps {
  layout: LayoutConfiguration | null;
  selectedComponent: string | null;
  viewport: 'mobile' | 'tablet' | 'desktop';
  zoom: number;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<LayoutComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (component: LayoutComponent) => void;
}

const LayoutEditor: React.FC<LayoutEditorProps> = ({
  layout,
  selectedComponent,
  viewport,
  zoom,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onAddComponent
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOverPosition, setDragOverPosition] = useState<{ x: number; y: number } | null>(null);

  // Get viewport dimensions
  const getViewportDimensions = () => {
    switch (viewport) {
      case 'mobile':
        return { width: 375, height: 667 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'desktop':
        return { width: 1200, height: 800 };
      default:
        return { width: 1200, height: 800 };
    }
  };

  const { width: viewportWidth, height: viewportHeight } = getViewportDimensions();

  // Drop zone for new components
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['component', 'layout-component'],
    drop: (item: DragItem, monitor) => {
      if (!monitor.didDrop()) {
        const offset = monitor.getClientOffset();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (offset && canvasRect) {
          const x = (offset.x - canvasRect.left) / zoom;
          const y = (offset.y - canvasRect.top) / zoom;
          
          if (item.isNew && item.type) {
            // Create new component
            const newComponent: LayoutComponent = {
              id: `component_${Date.now()}`,
              type: item.type as any,
              name: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Component`,
              props: {},
              style: {
                position: 'absolute',
                left: Math.max(0, Math.min(x - 50, viewportWidth - 100)),
                top: Math.max(0, Math.min(y - 25, viewportHeight - 50)),
                width: 200,
                height: 100
              },
              position: { x, y }
            };
            onAddComponent(newComponent);
          }
        }
      }
      setDragOverPosition(null);
    },
    hover: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      
      if (offset && canvasRect) {
        const x = (offset.x - canvasRect.left) / zoom;
        const y = (offset.y - canvasRect.top) / zoom;
        setDragOverPosition({ x, y });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  });

  const handleComponentClick = useCallback((e: React.MouseEvent, componentId: string) => {
    e.stopPropagation();
    onSelectComponent(componentId);
  }, [onSelectComponent]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectComponent(null);
    }
  }, [onSelectComponent]);

  const handleComponentMove = useCallback((id: string, position: { x: number; y: number }) => {
    onUpdateComponent(id, {
      position,
      style: {
        ...layout?.components.find(c => c.id === id)?.style,
        left: position.x,
        top: position.y
      }
    });
  }, [layout, onUpdateComponent]);

  const handleComponentResize = useCallback((id: string, size: { width: number; height: number }) => {
    onUpdateComponent(id, {
      style: {
        ...layout?.components.find(c => c.id === id)?.style,
        width: size.width,
        height: size.height
      }
    });
  }, [layout, onUpdateComponent]);

  const renderComponent = (component: LayoutComponent) => {
    const isSelected = selectedComponent === component.id;
    
    return (
      <ResizableComponent
        key={component.id}
        component={component}
        isSelected={isSelected}
        zoom={zoom}
        onResize={(size) => handleComponentResize(component.id, size)}
      >
        <DraggableComponent
          component={component}
          isSelected={isSelected}
          zoom={zoom}
          onMove={(position) => handleComponentMove(component.id, position)}
          onClick={(e) => handleComponentClick(e, component.id)}
        >
          <ComponentRenderer component={component} />
        </DraggableComponent>
      </ResizableComponent>
    );
  };

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto">
      <div className="flex items-center justify-center min-h-full p-8">
        <div
          ref={drop(canvasRef)}
          className={`relative bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden transition-all duration-200 ${
            isOver && canDrop ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
          }`}
          style={{
            width: viewportWidth * zoom,
            height: viewportHeight * zoom,
            transform: `scale(${zoom})`,
            transformOrigin: 'center'
          }}
          onClick={handleCanvasClick}
        >
          {/* Grid overlay */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Components */}
          {layout?.components.map(renderComponent)}

          {/* Drop indicator */}
          {isOver && canDrop && dragOverPosition && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute w-4 h-4 bg-blue-500 rounded-full pointer-events-none"
              style={{
                left: dragOverPosition.x - 8,
                top: dragOverPosition.y - 8,
                transform: `scale(${1 / zoom})`
              }}
            />
          )}

          {/* Empty state */}
          {(!layout?.components || layout.components.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Start Building Your Layout</p>
                <p className="text-sm mt-2">Drag components from the palette to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component renderer based on type
const ComponentRenderer: React.FC<{ component: LayoutComponent }> = ({ component }) => {
  const baseClasses = "w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg";
  
  switch (component.type) {
    case 'viewport':
      return (
        <div className={`${baseClasses} bg-gray-900 text-white`}>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-500 rounded mx-auto mb-2" />
            <span className="text-sm font-medium">3D Viewport</span>
          </div>
        </div>
      );
    
    case 'options':
      return (
        <div className={`${baseClasses} bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300`}>
          <div className="text-center">
            <div className="grid grid-cols-2 gap-1 mb-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-3 h-3 bg-current rounded opacity-60" />
              ))}
            </div>
            <span className="text-sm font-medium">Options</span>
          </div>
        </div>
      );
    
    case 'info':
      return (
        <div className={`${baseClasses} bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300`}>
          <div className="text-center">
            <div className="space-y-1 mb-2">
              <div className="w-12 h-2 bg-current rounded opacity-60" />
              <div className="w-8 h-2 bg-current rounded opacity-40" />
              <div className="w-10 h-2 bg-current rounded opacity-40" />
            </div>
            <span className="text-sm font-medium">Product Info</span>
          </div>
        </div>
      );
    
    case 'price':
      return (
        <div className={`${baseClasses} bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300`}>
          <div className="text-center">
            <div className="text-lg font-bold mb-1">$999</div>
            <span className="text-sm font-medium">Price</span>
          </div>
        </div>
      );
    
    case 'cart':
      return (
        <div className={`${baseClasses} bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300`}>
          <div className="text-center">
            <div className="w-8 h-6 bg-current rounded mb-2 opacity-60" />
            <span className="text-sm font-medium">Add to Cart</span>
          </div>
        </div>
      );
    
    case 'container':
      return (
        <div className={`${baseClasses} bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300`}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-current rounded mb-2 opacity-60" />
            <span className="text-sm font-medium">Container</span>
          </div>
        </div>
      );
    
    default:
      return (
        <div className={baseClasses}>
          <span className="text-sm font-medium text-gray-500">Unknown Component</span>
        </div>
      );
  }
};

export default LayoutEditor;