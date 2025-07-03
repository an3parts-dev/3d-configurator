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
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative ${sizeClasses[size]} rounded-lg transition-all duration-200
        bg-gray-200 dark:bg-gray-700 
        hover:bg-gray-300 dark:hover:bg-gray-600
        border border-gray-300 dark:border-gray-600
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${className}
      `}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          rotate: isDark ? 180 : 0,
        }}
        transition={{ duration: 0.2 }}
        className={`absolute inset-0 flex items-center justify-center text-yellow-600 ${iconSizes[size]}`}
      >
        <Sun className="w-full h-full" />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          rotate: isDark ? 0 : -180,
        }}
        transition={{ duration: 0.2 }}
        className={`absolute inset-0 flex items-center justify-center text-blue-400 ${iconSizes[size]}`}
      >
        <Moon className="w-full h-full" />
      </motion.div>
    </button>
  );
};

export default ThemeToggle;