import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { LayoutComponent } from '../../types/LayoutTypes';

interface DraggableComponentProps {
  component: LayoutComponent;
  isSelected: boolean;
  zoom: number;
  onMove: (position: { x: number; y: number }) => void;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  isSelected,
  zoom,
  onMove,
  onClick,
  children
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'layout-component',
    item: { 
      id: component.id, 
      type: component.type,
      isNew: false
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const newPosition = {
          x: component.position.x + delta.x / zoom,
          y: component.position.y + delta.y / zoom
        };
        onMove(newPosition);
      }
    },
  });

  drag(ref);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`absolute cursor-move transition-all duration-200 select-none ${
        isSelected ? 'z-30' : 'z-10'
      } ${isDragging ? 'opacity-50 z-50' : ''}`}
      style={{
        left: component.position.x,
        top: component.position.y,
        width: component.style.width,
        height: component.style.height,
      }}
    >
      {children}
      
      {/* Selection Indicator */}
      {isSelected && !isDragging && (
        <div className="absolute -inset-1 border-2 border-blue-500 rounded pointer-events-none">
          {/* Component Label */}
          <div className="absolute -top-7 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg">
            {component.name}
          </div>
          
          {/* Position Indicator */}
          <div className="absolute -bottom-7 right-0 bg-gray-900 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap shadow-lg">
            {Math.round(component.position.x)}, {Math.round(component.position.y)}
          </div>
        </div>
      )}
      
      {/* Drag Indicator */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-100/20 rounded pointer-events-none" />
      )}
    </div>
  );
};

export default DraggableComponent;