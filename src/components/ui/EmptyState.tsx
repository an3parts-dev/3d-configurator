import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ""
}) => {
  return (
    <div className={`text-center py-12 text-gray-500 ${className}`}>
      <Icon className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm mt-2">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;