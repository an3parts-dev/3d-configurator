import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatusBadgeProps {
  type: 'success' | 'warning' | 'error' | 'info' | 'purple' | 'orange';
  icon?: LucideIcon;
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  icon: Icon,
  children,
  size = 'sm'
}) => {
  const typeStyles = {
    success: 'bg-green-500/20 text-green-300 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  };

  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 sm:px-3 py-1 sm:py-1.5'
  };

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full font-medium border ${typeStyles[type]} ${sizeStyles[size]}`}>
      {Icon && <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
      <span className="truncate">{children}</span>
    </span>
  );
};

export default StatusBadge;