import React, { useCallback, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { Plus, Trash2, Copy, Move, Grid3X3 } from 'lucide-react';
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

const GRID_SIZE = 10; // Snap grid size

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
  const [showGrid, setShowGrid] = useState(true);

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

  // Snap to grid function
  const snapToGrid = useCallback((x: number, y: number) => {
    return {
      x: Math.round(x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(y / GRID_SIZE) * GRID_SIZE
    };
  }, []);

  // Drop zone for new components
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['component', 'layout-component'],
    drop: (item: DragItem, monitor) => {
      if (!monitor.didDrop()) {
        const offset = monitor.getClientOffset();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (offset && canvasRect) {
          const rawX = (offset.x - canvasRect.left) / zoom;
          const rawY = (offset.y - canvasRect.top) / zoom;
          
          // Snap to grid
          const snapped = snapToGrid(rawX, rawY);
          
          if (item.isNew && item.type) {
            // Create new component
            const newComponent: LayoutComponent = {
              id: `component_${Date.now()}`,
              type: item.type as any,
              name: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Component`,
              props: getDefaultProps(item.type),
              style: {
                position: 'absolute',
                width: 200,
                height: 100,
                padding: { top: 16, right: 16, bottom: 16, left: 16 },
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              },
              position: { 
                x: Math.max(0, Math.min(snapped.x, viewportWidth - 200)), 
                y: Math.max(0, Math.min(snapped.y, viewportHeight - 100)) 
              }
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
        const rawX = (offset.x - canvasRect.left) / zoom;
        const rawY = (offset.y - canvasRect.top) / zoom;
        const snapped = snapToGrid(rawX, rawY);
        setDragOverPosition(snapped);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  });

  // Get default props for component types
  const getDefaultProps = (type: string) => {
    switch (type) {
      case 'viewport':
        return { aspectRatio: '16:9', showControls: true };
      case 'options':
        return { layout: 'grid', columns: 2, showImages: true };
      case 'info':
        return { showTitle: true, showDescription: true };
      case 'price':
        return { showBreakdown: true, currency: 'USD' };
      case 'cart':
        return { style: 'button', showQuantity: true };
      case 'container':
        return { direction: 'column', gap: 16 };
      default:
        return {};
    }
  };

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
    // Snap to grid and constrain to canvas bounds
    const snapped = snapToGrid(position.x, position.y);
    const component = layout?.components.find(c => c.id === id);
    
    if (component) {
      const width = typeof component.style.width === 'number' ? component.style.width : 200;
      const height = typeof component.style.height === 'number' ? component.style.height : 100;
      
      const constrainedPosition = {
        x: Math.max(0, Math.min(snapped.x, viewportWidth - width)),
        y: Math.max(0, Math.min(snapped.y, viewportHeight - height))
      };
      
      onUpdateComponent(id, {
        position: constrainedPosition,
        style: {
          ...component.style,
          left: constrainedPosition.x,
          top: constrainedPosition.y
        }
      });
    }
  }, [layout, onUpdateComponent, snapToGrid, viewportWidth, viewportHeight]);

  const handleComponentResize = useCallback((id: string, size: { width: number; height: number }) => {
    // Snap size to grid
    const snappedSize = {
      width: Math.round(size.width / GRID_SIZE) * GRID_SIZE,
      height: Math.round(size.height / GRID_SIZE) * GRID_SIZE
    };
    
    onUpdateComponent(id, {
      style: {
        ...layout?.components.find(c => c.id === id)?.style,
        width: Math.max(50, snappedSize.width),
        height: Math.max(30, snappedSize.height)
      }
    });
  }, [layout, onUpdateComponent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (selectedComponent) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onDeleteComponent(selectedComponent);
      }
      
      // Arrow key movement with snapping
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const component = layout?.components.find(c => c.id === selectedComponent);
        if (component) {
          const step = e.shiftKey ? GRID_SIZE * 5 : GRID_SIZE;
          let newX = component.position.x;
          let newY = component.position.y;
          
          switch (e.key) {
            case 'ArrowUp': newY -= step; break;
            case 'ArrowDown': newY += step; break;
            case 'ArrowLeft': newX -= step; break;
            case 'ArrowRight': newX += step; break;
          }
          
          handleComponentMove(selectedComponent, { x: newX, y: newY });
        }
      }
    }
  }, [selectedComponent, layout, onDeleteComponent, handleComponentMove]);

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
    <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto" tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {viewportWidth} × {viewportHeight} • Zoom: {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
              showGrid 
                ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Grid</span>
          </button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          💡 Use arrow keys to move selected components • Shift+Arrow for larger steps
        </div>
      </div>

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
          {showGrid && (
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
              }}
            />
          )}

          {/* Components */}
          {layout?.components.map(renderComponent)}

          {/* Drop indicator */}
          {isOver && canDrop && dragOverPosition && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute w-4 h-4 bg-blue-500 rounded-full pointer-events-none border-2 border-white shadow-lg"
              style={{
                left: dragOverPosition.x - 8,
                top: dragOverPosition.y - 8,
                transform: `scale(${1 / zoom})`
              }}
            />
          )}

          {/* Snap guides */}
          {selectedComponent && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Vertical guide lines */}
              {layout?.components
                .filter(c => c.id !== selectedComponent)
                .map(c => (
                  <div
                    key={`guide-v-${c.id}`}
                    className="absolute w-px bg-blue-400 opacity-50"
                    style={{
                      left: c.position.x,
                      top: 0,
                      height: '100%'
                    }}
                  />
                ))}
              
              {/* Horizontal guide lines */}
              {layout?.components
                .filter(c => c.id !== selectedComponent)
                .map(c => (
                  <div
                    key={`guide-h-${c.id}`}
                    className="absolute h-px bg-blue-400 opacity-50"
                    style={{
                      top: c.position.y,
                      left: 0,
                      width: '100%'
                    }}
                  />
                ))}
            </div>
          )}

          {/* Empty state */}
          {(!layout?.components || layout.components.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Start Building Your Layout</p>
                <p className="text-sm mt-2">Drag components from the palette to get started</p>
                <p className="text-xs mt-4 text-gray-400">
                  Components will snap to a {GRID_SIZE}px grid for precise alignment
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Component renderer with better styling
const ComponentRenderer: React.FC<{ component: LayoutComponent }> = ({ component }) => {
  const baseClasses = "w-full h-full flex items-center justify-center rounded-lg border-2 border-dashed transition-all";
  const padding = component.style.padding ? 
    `${component.style.padding.top || 0}px ${component.style.padding.right || 0}px ${component.style.padding.bottom || 0}px ${component.style.padding.left || 0}px` :
    '16px';
  
  const commonStyle = {
    backgroundColor: component.style.backgroundColor || '#ffffff',
    borderRadius: component.style.borderRadius || '8px',
    padding,
    border: component.style.border || '2px dashed #d1d5db'
  };
  
  switch (component.type) {
    case 'viewport':
      return (
        <div className={`${baseClasses} border-blue-300 bg-blue-50 text-blue-700`} style={commonStyle}>
          <div className="text-center">
            <div className="w-12 h-8 bg-blue-500 rounded mx-auto mb-2 opacity-60" />
            <span className="text-sm font-medium">3D Viewport</span>
            <div className="text-xs text-blue-500 mt-1">{component.props.aspectRatio || '16:9'}</div>
          </div>
        </div>
      );
    
    case 'options':
      return (
        <div className={`${baseClasses} border-green-300 bg-green-50 text-green-700`} style={commonStyle}>
          <div className="text-center">
            <div className="grid grid-cols-2 gap-1 mb-2 max-w-[60px] mx-auto">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-3 h-3 bg-green-500 rounded opacity-60" />
              ))}
            </div>
            <span className="text-sm font-medium">Options</span>
            <div className="text-xs text-green-500 mt-1">{component.props.layout || 'grid'}</div>
          </div>
        </div>
      );
    
    case 'info':
      return (
        <div className={`${baseClasses} border-purple-300 bg-purple-50 text-purple-700`} style={commonStyle}>
          <div className="text-center">
            <div className="space-y-1 mb-2 max-w-[80px] mx-auto">
              <div className="w-full h-2 bg-purple-500 rounded opacity-60" />
              <div className="w-3/4 h-2 bg-purple-500 rounded opacity-40" />
              <div className="w-5/6 h-2 bg-purple-500 rounded opacity-40" />
            </div>
            <span className="text-sm font-medium">Product Info</span>
          </div>
        </div>
      );
    
    case 'price':
      return (
        <div className={`${baseClasses} border-yellow-300 bg-yellow-50 text-yellow-700`} style={commonStyle}>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1 text-yellow-600">$999</div>
            <span className="text-sm font-medium">Price</span>
            <div className="text-xs text-yellow-500 mt-1">{component.props.currency || 'USD'}</div>
          </div>
        </div>
      );
    
    case 'cart':
      return (
        <div className={`${baseClasses} border-orange-300 bg-orange-50 text-orange-700`} style={commonStyle}>
          <div className="text-center">
            <div className="w-16 h-8 bg-orange-500 rounded mb-2 mx-auto opacity-60 flex items-center justify-center">
              <span className="text-white text-xs font-medium">ADD</span>
            </div>
            <span className="text-sm font-medium">Add to Cart</span>
          </div>
        </div>
      );
    
    case 'container':
      return (
        <div className={`${baseClasses} border-gray-400 bg-gray-50 text-gray-700`} style={commonStyle}>
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-500 rounded mb-2 mx-auto opacity-60" />
            <span className="text-sm font-medium">Container</span>
            <div className="text-xs text-gray-500 mt-1">{component.props.direction || 'column'}</div>
          </div>
        </div>
      );
    
    default:
      return (
        <div className={`${baseClasses} border-gray-300 bg-gray-50 text-gray-600`} style={commonStyle}>
          <span className="text-sm font-medium">Unknown Component</span>
        </div>
      );
  }
};

export default LayoutEditor;