import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Eye, Star, Filter } from 'lucide-react';
import { LayoutConfiguration, LayoutTemplate } from '../../types/LayoutTypes';

interface TemplateLibraryProps {
  onClose: () => void;
  onSelectTemplate: (template: LayoutConfiguration) => void;
  templates: LayoutTemplate[];
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onClose,
  onSelectTemplate,
  templates
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'showcase', name: 'Showcase' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template: LayoutTemplate) => {
    const layoutConfig: LayoutConfiguration = {
      id: `layout_${Date.now()}`,
      name: `${template.name} Copy`,
      description: template.description,
      template: template.id,
      components: [...template.components],
      responsive: template.responsive,
      theme: {
        colors: {
          primary: '#3b82f6',
          secondary: '#6b7280',
          accent: '#8b5cf6',
          background: '#ffffff',
          surface: '#f9fafb',
          text: '#111827',
          textSecondary: '#6b7280',
          border: '#e5e7eb',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem'
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          },
          lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem'
        },
        borderRadius: {
          none: '0',
          sm: '0.125rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          full: '9999px'
        },
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
        }
      },
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onSelectTemplate(layoutConfig);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Template Library
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose a template to start your layout design
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer group"
                onClick={() => handleSelectTemplate(template)}
              >
                {/* Template Preview */}
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="flex space-x-2">
                      <button className="bg-white/90 text-gray-900 p-2 rounded-lg hover:bg-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {template.name}
                    </h4>
                    <div className="flex items-center space-x-1 text-yellow-500 ml-2">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs">4.8</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      template.category === 'ecommerce' ? 'bg-green-100 text-green-700 dark:bg-green-600/20 dark:text-green-300' :
                      template.category === 'showcase' ? 'bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-300' :
                      template.category === 'minimal' ? 'bg-gray-100 text-gray-700 dark:bg-gray-600/20 dark:text-gray-300' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-600/20 dark:text-purple-300'
                    }`}>
                      {template.category}
                    </span>
                    
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {template.components.length} components
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No templates found</p>
                <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TemplateLibrary;