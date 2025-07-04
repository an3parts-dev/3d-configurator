import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, X, Eye, Box, ArrowLeft } from 'lucide-react';

interface ModelComponent {
  name: string;
  mesh: any;
  visible: boolean;
  material?: any;
}

interface ComponentSelectorPanelProps {
  availableComponents: ModelComponent[];
  selectedComponents: string[];
  onSelectionChange: (components: string[]) => void;
  onCancel: () => void;
  title?: string;
  placeholder?: string;
}

// Enhanced search function with fuzzy matching
const fuzzySearch = (searchTerm: string, text: string): boolean => {
  if (!searchTerm.trim()) return true;
  
  // Normalize both strings: lowercase and remove special characters
  const normalizeString = (str: string) => 
    str.toLowerCase()
       .replace(/[_\-\s\.]/g, '') // Remove underscores, hyphens, spaces, dots
       .replace(/[^\w]/g, '');    // Remove any remaining special characters
  
  const normalizedSearch = normalizeString(searchTerm);
  const normalizedText = normalizeString(text);
  
  // If normalized search is empty after removing special chars, fall back to original
  if (!normalizedSearch) {
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  }
  
  // Check if normalized text contains normalized search
  if (normalizedText.includes(normalizedSearch)) {
    return true;
  }
  
  // Fuzzy matching: check if all characters of search exist in order
  let searchIndex = 0;
  for (let i = 0; i < normalizedText.length && searchIndex < normalizedSearch.length; i++) {
    if (normalizedText[i] === normalizedSearch[searchIndex]) {
      searchIndex++;
    }
  }
  
  return searchIndex === normalizedSearch.length;
};

// Virtual list item component for performance
const VirtualListItem = React.memo<{
  component: ModelComponent;
  isSelected: boolean;
  isHighlighted: boolean;
  onToggle: (componentName: string, event?: React.MouseEvent) => void;
  onHighlight: (componentName: string, event: React.MouseEvent) => void;
  style: React.CSSProperties;
}>(({ component, isSelected, isHighlighted, onToggle, onHighlight, style }) => {
  return (
    <div
      style={style}
      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
        isSelected 
          ? 'bg-blue-100 dark:bg-blue-600/20 border-blue-300 dark:border-blue-500/40 shadow-sm' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-600/50'
      } ${isHighlighted ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}
      onClick={(e) => onToggle(component.name, e)}
    >
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          isSelected 
            ? 'bg-blue-600 border-blue-600' 
            : 'border-gray-400 dark:border-gray-500 hover:border-gray-500 dark:hover:border-gray-400'
        }`}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
        
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Box className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <span className="text-gray-900 dark:text-white font-medium truncate" title={component.name}>
            {component.name}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3 flex-shrink-0">
        <div 
          className={`w-3 h-3 rounded-full ${
            component.visible ? 'bg-green-400' : 'bg-red-400'
          }`} 
          title={component.visible ? 'Visible' : 'Hidden'} 
        />
        
        <button
          onClick={(e) => onHighlight(component.name, e)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
          title="Highlight in 3D view"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

VirtualListItem.displayName = 'VirtualListItem';

// Enhanced virtual scrolling with preloading
const VirtualizedList: React.FC<{
  items: ModelComponent[];
  selectedComponents: string[];
  highlightedComponents: string[];
  onToggle: (componentName: string, event?: React.MouseEvent) => void;
  onHighlight: (componentName: string, event: React.MouseEvent) => void;
  containerHeight: number;
}> = ({ items, selectedComponents, highlightedComponents, onToggle, onHighlight, containerHeight }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const itemHeight = 80; // Height of each item in pixels
  const totalHeight = items.length * itemHeight;
  
  // Enhanced visible range calculation with preloading
  const preloadCount = 5; // Preload 5 items above and below visible area
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - preloadCount);
  const endIndex = Math.min(
    startIndex + visibleCount + (preloadCount * 2),
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-auto h-full"
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          return (
            <VirtualListItem
              key={item.name}
              component={item}
              isSelected={selectedComponents.includes(item.name)}
              isHighlighted={highlightedComponents.includes(item.name)}
              onToggle={onToggle}
              onHighlight={onHighlight}
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight - 8, // Account for gap
                margin: '4px 0'
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const ComponentSelectorPanel: React.FC<ComponentSelectorPanelProps> = ({
  availableComponents,
  selectedComponents,
  onSelectionChange,
  onCancel,
  title = "Select Components",
  placeholder = "Search components..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [highlightedComponents, setHighlightedComponents] = useState<string[]>([]);

  // Debounced search with faster response for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Enhanced filtering with fuzzy search
  const filteredComponents = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return availableComponents;
    
    return availableComponents.filter(component =>
      fuzzySearch(debouncedSearchTerm, component.name)
    );
  }, [availableComponents, debouncedSearchTerm]);

  // Memoize callbacks to prevent unnecessary re-renders
  const toggleComponent = useCallback((componentName: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const newSelection = selectedComponents.includes(componentName)
      ? selectedComponents.filter(name => name !== componentName)
      : [...selectedComponents, componentName];
    
    onSelectionChange(newSelection);
  }, [selectedComponents, onSelectionChange]);

  const selectAll = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const allFilteredNames = filteredComponents.map(c => c.name);
    const newSelection = [...new Set([...selectedComponents, ...allFilteredNames])];
    onSelectionChange(newSelection);
  }, [filteredComponents, selectedComponents, onSelectionChange]);

  const clearAll = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onSelectionChange([]);
  }, [onSelectionChange]);

  const highlightComponent = useCallback((componentName: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const component = availableComponents.find(c => c.name === componentName);
    if (component && component.mesh) {
      setHighlightedComponents([componentName]);
      
      // Highlight logic would go here - for now just visual feedback
      setTimeout(() => {
        setHighlightedComponents([]);
      }, 2000);
    }
  }, [availableComponents]);

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg border border-blue-200 dark:border-blue-500/30">
            <Box className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg sm:text-xl">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              Select from {availableComponents.length} available components
            </p>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-750 flex-shrink-0">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg pl-12 pr-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            autoFocus
          />
          {searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={selectAll}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
            >
              Select All ({filteredComponents.length})
            </button>
            <button
              onClick={clearAll}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Clear All
            </button>
          </div>
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            {selectedComponents.length} selected
          </span>
        </div>
        
        {/* Search hint */}
        {searchTerm && filteredComponents.length > 0 && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            💡 Smart search ignores underscores, hyphens, and spaces for better matching
          </div>
        )}
      </div>

      {/* Components List - Takes remaining space */}
      <div className="flex-1 overflow-hidden p-4">
        {availableComponents.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No components available</p>
            <p className="text-sm mt-2">Make sure target components are selected first</p>
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No components match your search</p>
            <p className="text-sm mt-2">Try a different search term or check for typos</p>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-md mx-auto">
              <p className="font-medium mb-1">Search tips:</p>
              <ul className="text-left space-y-1">
                <li>• Ignores underscores, hyphens, spaces</li>
                <li>• Try partial matches (e.g., "wheel" for "front_wheel_01")</li>
                <li>• Case insensitive</li>
              </ul>
            </div>
          </div>
        ) : (
          <VirtualizedList
            items={filteredComponents}
            selectedComponents={selectedComponents}
            highlightedComponents={highlightedComponents}
            onToggle={toggleComponent}
            onHighlight={highlightComponent}
            containerHeight={0} // Will be calculated by the component
          />
        )}
      </div>

      {/* Sticky Footer */}
      <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-750 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            Showing {filteredComponents.length} of {availableComponents.length} components
            {searchTerm && ` (filtered by "${searchTerm}")`}
          </span>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComponentSelectorPanel;