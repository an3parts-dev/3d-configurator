import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, X, Eye, Box, Maximize2 } from 'lucide-react';
import * as THREE from 'three';

interface ModelComponent {
  name: string;
  mesh: THREE.Mesh;
  visible: boolean;
  material?: THREE.Material;
}

interface ComponentSelectorProps {
  availableComponents: ModelComponent[];
  selectedComponents: string[];
  onSelectionChange: (components: string[]) => void;
  placeholder?: string;
  label?: string;
  alwaysModal?: boolean;
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
          ? 'bg-blue-600/20 border-blue-500/40 shadow-sm' 
          : 'hover:bg-gray-700/50 border-gray-600/50'
      } ${isHighlighted ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}
      onClick={(e) => onToggle(component.name, e)}
    >
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          isSelected 
            ? 'bg-blue-600 border-blue-600' 
            : 'border-gray-500 hover:border-gray-400'
        }`}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
        
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Box className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className="text-white font-medium truncate" title={component.name}>
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
          className="p-2 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-yellow-400 transition-colors"
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
  height: number;
}> = ({ items, selectedComponents, highlightedComponents, onToggle, onHighlight, height }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const itemHeight = 80; // Height of each item in pixels
  const containerHeight = height;
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
      className="overflow-auto"
      style={{ height: containerHeight }}
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

const ComponentSelector: React.FC<ComponentSelectorProps> = ({
  availableComponents,
  selectedComponents,
  onSelectionChange,
  placeholder = "Select components...",
  label = "Target Components",
  alwaysModal = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [highlightedComponents, setHighlightedComponents] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Debounced search with faster response for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 100); // Reduced from 150ms to 100ms for snappier response
    
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
      
      const originalMaterial = component.mesh.material;
      const highlightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        transparent: true, 
        opacity: 0.7 
      });
      component.mesh.material = highlightMaterial;
      
      setTimeout(() => {
        if (component.mesh) {
          component.mesh.material = originalMaterial;
        }
        setHighlightedComponents([]);
      }, 2000);
    }
  }, [availableComponents]);

  const handleTriggerClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setShowModal(true);
  }, []);

  const handleRemoveTag = useCallback((componentName: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleComponent(componentName);
  }, [toggleComponent]);

  const ComponentList = () => (
    <div className="h-full flex flex-col">
      {/* Search and Actions Header */}
      <div className="p-6 border-b border-gray-700 bg-gray-750 rounded-t-xl flex-shrink-0">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search components... (ignores _, -, spaces)"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            autoFocus
          />
          {searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
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
              className="text-blue-400 hover:text-blue-300 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-500/10 transition-colors"
            >
              Select All ({filteredComponents.length})
            </button>
            <button
              onClick={clearAll}
              className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              Clear All
            </button>
          </div>
          <span className="text-gray-400 text-sm font-medium">
            {selectedComponents.length} selected
          </span>
        </div>
        
        {/* Search hint */}
        {searchTerm && filteredComponents.length > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            💡 Smart search ignores underscores, hyphens, and spaces for better matching
          </div>
        )}
      </div>

      {/* Components List with Enhanced Virtualization */}
      <div className="flex-1 overflow-hidden p-4">
        {availableComponents.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No components available</p>
            <p className="text-sm mt-2">Make sure target components are selected first</p>
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No components match your search</p>
            <p className="text-sm mt-2">Try a different search term or check for typos</p>
            <div className="mt-4 text-xs text-gray-500 bg-gray-800 rounded-lg p-3 max-w-md mx-auto">
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
            height={400} // Fixed height for virtualization
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-700 bg-gray-750 rounded-b-xl flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm font-medium">
            Showing {filteredComponents.length} of {availableComponents.length} components
            {searchTerm && ` (filtered by "${searchTerm}")`}
          </span>
          <button
            onClick={() => setShowModal(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <label className="block text-gray-400 text-sm mb-2 font-medium">{label}</label>
      
      {/* Selected Components Display - Always triggers modal */}
      <div 
        ref={triggerRef}
        onClick={handleTriggerClick}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white cursor-pointer hover:bg-gray-650 hover:border-gray-500 transition-all duration-200 flex items-center justify-between min-h-[48px] focus-within:ring-2 focus-within:ring-blue-500/50"
      >
        <div className="flex-1 min-w-0">
          {selectedComponents.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedComponents.slice(0, 4).map(componentName => (
                <span
                  key={componentName}
                  className="inline-flex items-center bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium shadow-sm"
                >
                  <span className="truncate max-w-[140px]" title={componentName}>
                    {componentName}
                  </span>
                  <button
                    onClick={(e) => handleRemoveTag(componentName, e)}
                    className="ml-2 hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedComponents.length > 4 && (
                <span className="text-gray-400 text-sm px-3 py-1 bg-gray-600 rounded-full font-medium">
                  +{selectedComponents.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
          <Maximize2 className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Full Screen Modal - Always used */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 rounded-xl border border-gray-600 shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col"
              role="dialog"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-750 rounded-t-xl flex-shrink-0">
                <div>
                  <h3 className="text-white font-semibold text-xl">{label}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Select from {availableComponents.length} available components
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-hidden">
                <ComponentList />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComponentSelector;