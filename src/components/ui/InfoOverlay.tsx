import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InfoOverlayProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  icon?: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const InfoOverlay: React.FC<InfoOverlayProps> = ({
  position,
  icon: Icon,
  title,
  children,
  className = ""
}) => {
  const positionClasses = {
    'top-left': 'top-2 sm:top-4 left-2 sm:left-4',
    'top-right': 'top-2 sm:top-4 right-2 sm:right-4',
    'bottom-left': 'bottom-2 sm:bottom-4 left-2 sm:left-4',
    'bottom-right': 'bottom-2 sm:bottom-4 right-2 sm:right-4'
  };

  return (
    <div className={`absolute ${positionClasses[position]} bg-black/70 backdrop-blur-md rounded-lg sm:rounded-xl px-2 sm:px-3 lg:px-5 py-1.5 sm:py-2 lg:py-4 border border-gray-600 ${className}`}>
      {title && (
        <div className="flex items-center space-x-1 sm:space-x-2 mb-0.5 sm:mb-1">
          {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />}
          <p className="text-white text-xs sm:text-sm font-semibold">{title}</p>
        </div>
      )}
      {children}
    </div>
  );
};

export default InfoOverlay;