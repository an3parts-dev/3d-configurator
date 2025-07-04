import React, { useState, useRef } from 'react';
import { LayoutComponent } from '../../types/LayoutTypes';

interface ResizableComponentProps {
  component: LayoutComponent;
  isSelected: boolean;
  zoom: number;
  onResize: (size: { width: number; height: number }) => void;
  children: React.ReactNode;
}

const ResizableComponent: React.FC<ResizableComponentProps> = ({
  component,
  isSelected,
  zoom,
  onResize,
  children
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeDirection(direction);
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = {
      width: typeof component.style.width === 'number' ? component.style.width : 200,
      height: typeof component.style.height === 'number' ? component.style.height : 100
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startPos.current.x) / zoom;
      const deltaY = (e.clientY - startPos.current.y) / zoom;
      
      let newWidth = startSize.current.width;
      let newHeight = startSize.current.height;

      if (direction.includes('right')) {
        newWidth = Math.max(50, startSize.current.width + deltaX);
      }
      if (direction.includes('left')) {
        newWidth = Math.max(50, startSize.current.width - deltaX);
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(30, startSize.current.height + deltaY);
      }
      if (direction.includes('top')) {
        newHeight = Math.max(30, startSize.current.height - deltaY);
      }

      onResize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection('');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!isSelected) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      
      {/* Resize Handles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner Handles */}
        <div
          className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'top-left')}
        />
        <div
          className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'top-right')}
        />
        <div
          className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
        />
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
        />
        
        {/* Edge Handles */}
        <div
          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-n-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'top')}
        />
        <div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-s-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'bottom')}
        />
        <div
          className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-w-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'left')}
        />
        <div
          className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-e-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'right')}
        />
      </div>
    </div>
  );
};

export default ResizableComponent;