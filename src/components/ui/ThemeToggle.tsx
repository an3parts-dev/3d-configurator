import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-7 h-4',
    md: 'w-9 h-5',
    lg: 'w-11 h-6'
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative ${sizeClasses[size]} rounded-full transition-all duration-300 ease-in-out
        ${isDark 
          ? 'bg-gray-700 border border-gray-600' 
          : 'bg-gray-200 border border-gray-300'
        }
        hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-1
        ${className}
      `}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Toggle Track */}
      <motion.div
        animate={{
          x: isDark ? '50%' : '0%',
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          duration: 0.3 
        }}
        className={`
          absolute top-0.5 left-0.5 rounded-full transition-all duration-300
          ${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}
          ${isDark 
            ? 'bg-blue-500 shadow-sm' 
            : 'bg-white shadow-md border border-gray-200'
          }
          flex items-center justify-center
        `}
      >
        {/* Icon Container */}
        <div className="relative">
          {/* Sun Icon */}
          <motion.div
            animate={{
              scale: isDark ? 0 : 1,
              opacity: isDark ? 0 : 1,
              rotate: isDark ? 90 : 0,
            }}
            transition={{ duration: 0.2 }}
            className={`absolute inset-0 flex items-center justify-center ${iconSizes[size]}`}
          >
            <Sun className="w-full h-full text-yellow-500" />
          </motion.div>
          
          {/* Moon Icon */}
          <motion.div
            animate={{
              scale: isDark ? 1 : 0,
              opacity: isDark ? 1 : 0,
              rotate: isDark ? 0 : -90,
            }}
            transition={{ duration: 0.2 }}
            className={`flex items-center justify-center ${iconSizes[size]}`}
          >
            <Moon className="w-full h-full text-white" />
          </motion.div>
        </div>
      </motion.div>
    </button>
  );
};

export default ThemeToggle;