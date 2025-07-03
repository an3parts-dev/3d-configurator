import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  subText?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading',
  subText
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 sm:w-8 sm:h-8',
    md: 'w-12 h-12 sm:w-16 sm:h-16',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl'
  };

  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <div className={`${sizeClasses[size]} border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4`}></div>
        <p className={`text-white font-semibold ${textSizeClasses[size]}`}>{text}</p>
        {subText && (
          <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">{subText}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;