import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface ConfirmationPanelProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  details?: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationPanel: React.FC<ConfirmationPanelProps> = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  details = [],
  onConfirm,
  onCancel
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-400',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          border: 'border-red-500/30'
        };
      case 'warning':
        return {
          icon: 'text-yellow-400',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          border: 'border-yellow-500/30'
        };
      default:
        return {
          icon: 'text-blue-400',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          border: 'border-blue-500/30'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700 bg-gray-750 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full bg-gray-700 ${styles.icon}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold text-xl">{title}</h3>
        </div>
      </div>

      {/* Content - Takes remaining space */}
      <div className="flex-1 p-6">
        <p className="text-gray-300 mb-4 leading-relaxed">{message}</p>
        
        {details.length > 0 && (
          <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700">
            <p className="text-gray-400 text-sm font-medium mb-2">This action will affect:</p>
            <ul className="space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2 flex-shrink-0"></span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
          <p className="text-yellow-300 text-sm font-medium flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            This action cannot be undone
          </p>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="p-6 border-t border-gray-700 bg-gray-750 flex space-x-3 flex-shrink-0">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 text-white py-3 px-4 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 ${styles.confirmButton}`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPanel;