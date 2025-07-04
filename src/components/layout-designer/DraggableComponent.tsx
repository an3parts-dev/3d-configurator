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
    item: { id: component.id, type: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const newPosition = {
          x: Math.round(component.position.x + delta.x / zoom),
          y: Math.round(component.position.y + delta.y / zoom)
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
      className={`absolute cursor-move transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${isDragging ? 'opacity-50 z-50' : 'z-10'}`}
      style={{
        left: component.position.x,
        top: component.position.y,
        width: component.style.width,
        height: component.style.height,
      }}
    >
      {children}
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -inset-1 border-2 border-blue-500 rounded pointer-events-none">
          <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            {component.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableComponent;