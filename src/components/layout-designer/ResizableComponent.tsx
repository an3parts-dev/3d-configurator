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

  const handleSize = 12; // Size of resize handles
  const handleOffset = handleSize / 2;

  return (
    <div className="relative">
      {children}
      
      {/* Resize Handles - Positioned at exact corners and edges */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner Handles */}
        <div
          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-nw-resize pointer-events-auto shadow-lg hover:bg-blue-600 transition-colors"
          style={{
            width: handleSize,
            height: handleSize,
            left: -handleOffset,
            top: -handleOffset
          }}
          onMouseDown={(e) => handleMouseDown(e, 'top-left')}
          title="Resize top-left"
        />
        <div
          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-ne-resize pointer-events-auto shadow-lg hover:bg-blue-600 transition-colors"
          style={{
            width: handleSize,
            height: handleSize,
            right: -handleOffset,
            top: -handleOffset
          }}
          onMouseDown={(e) => handleMouseDown(e, 'top-right')}
          title="Resize top-right"
        />
        <div
          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-sw-resize pointer-events-auto shadow-lg hover:bg-blue-600 transition-colors"
          style={{
            width: handleSize,
            height: handleSize,
            left: -handleOffset,
            bottom: -handleOffset
          }}
          onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
          title="Resize bottom-left"
        />
        <div
          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-se-resize pointer-events-auto shadow-lg hover:bg-blue-600 transition-colors"
          style={{
            width: handleSize,
            height: handleSize,
            right: -handleOffset,
            bottom: -handleOffset
          }}
          onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
          title="Resize bottom-right"
        />
        
        {/* Edge Handles */}
        <div
          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-n-resize pointer-events-auto shadow-lg hover:bg-blue-600 transition-colors"
          style={{
            width: handleSize,
            height: handleSize,
            left: '50%',
            top: -handleOffset,
            transform: 'translateX(-50%)'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'top')}
          title="Resize top"
        />
        <div
          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-s-resize pointer-events-auto shadow-lg hover:bg-blue-600 transition-colors"
          style={{
            width: handleSize,
            height: handleSize,
            left: '50%',
            bottom: -handleOffset,
            transform: 'translateX(-50%)'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'bottom')}
          title="Resize bottom"
        />
        <div
          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-w-resize pointer-events-auto shadow-lg hover:bg-blue-600 transition-colors"
          style={{
            width: handleSize,
            height: handleSize,
            left: -handleOffset,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'left')}
          title="Resize left"
        />
        <div
          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-e-resize pointer-events-auto shadow-lg hover:bg-blue-600 transition-colors"
          style={{
            width: handleSize,
            height: handleSize,
            right: -handleOffset,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'right')}
          title="Resize right"
        />
      </div>
      
      {/* Size Indicator */}
      {isResizing && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded text-xs font-mono whitespace-nowrap shadow-lg z-50">
          {Math.round(typeof component.style.width === 'number' ? component.style.width : 200)} × {Math.round(typeof component.style.height === 'number' ? component.style.height : 100)}
        </div>
      )}
    </div>
  );
};

export default ResizableComponent;