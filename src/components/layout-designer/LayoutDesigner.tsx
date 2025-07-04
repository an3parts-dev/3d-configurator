import React, { useState, useCallback, useReducer, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';
import { 
  Layout, 
  Smartphone, 
  Tablet, 
  Monitor, 
  ZoomIn, 
  ZoomOut,
  Undo,
  Redo,
  Save,
  Download,
  Upload,
  Eye,
  Settings,
  Play
} from 'lucide-react';

import LayoutEditor from './LayoutEditor';
import LayoutPreview from './LayoutPreview';
import ComponentPalette from './ComponentPalette';
import PropertyPanel from './PropertyPanel';
import TemplateLibrary from './TemplateLibrary';
import ConfigurationSelector from './ConfigurationSelector';
import { layoutReducer, initialLayoutState } from './layoutReducer';
import { LayoutConfiguration, LayoutComponent, LayoutState } from '../../types/LayoutTypes';
import { ConfiguratorData } from '../../types/ConfiguratorTypes';
import { useLayoutPersistence } from '../../hooks/useLayoutPersistence';
import { useConfiguratorPersistence } from '../../hooks/useConfiguratorPersistence';
import DashboardHeader from '../layout/DashboardHeader';

interface LayoutDesignerProps {
  onNavigateHome: () => void;
}

const LayoutDesigner: React.FC<LayoutDesignerProps> = ({ onNavigateHome }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialLayoutState);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [leftPanelView, setLeftPanelView] = useState<'components' | 'properties' | 'preview'>('components');
  const [configurations, setConfigurations] = useState<ConfiguratorData[]>([]);
  const [selectedConfiguration, setSelectedConfiguration] = useState<ConfiguratorData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  const {
    saveLayout,
    loadLayout,
    exportLayout,
    importLayout,
    getTemplates
  } = useLayoutPersistence();

  const {
    loadFromStorage: loadConfigurations
  } = useConfiguratorPersistence();

  // Load available configurations on mount
  useEffect(() => {
    const stored = loadConfigurations();
    if (stored && stored.configurators.length > 0) {
      setConfigurations(stored.configurators);
    }
  }, [loadConfigurations]);

  // Initialize with empty layout
  useEffect(() => {
    dispatch({ type: 'RESET_LAYOUT' });
  }, []);

  // Viewport controls
  const handleViewportChange = useCallback((viewport: 'mobile' | 'tablet' | 'desktop') => {
    dispatch({ type: 'SET_VIEWPORT', payload: viewport });
  }, []);

  const handleZoomChange = useCallback((delta: number) => {
    const newZoom = Math.max(0.25, Math.min(2, state.zoom + delta));
    dispatch({ type: 'SET_ZOOM', payload: newZoom });
  }, [state.zoom]);

  // Component operations
  const handleAddComponent = useCallback((component: LayoutComponent) => {
    dispatch({ type: 'ADD_COMPONENT', payload: component });
  }, []);

  const handleUpdateComponent = useCallback((id: string, updates: Partial<LayoutComponent>) => {
    dispatch({ type: 'UPDATE_COMPONENT', payload: { id, updates } });
  }, []);

  const handleDeleteComponent = useCallback((id: string) => {
    dispatch({ type: 'DELETE_COMPONENT', payload: id });
  }, []);

  const handleSelectComponent = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_COMPONENT', payload: id });
    if (id) {
      setLeftPanelView('properties');
    }
  }, []);

  // Layout operations
  const handleSaveLayout = useCallback(async () => {
    if (state.currentLayout) {
      try {
        await saveLayout(state.currentLayout);
        // Show success notification
      } catch (error) {
        console.error('Failed to save layout:', error);
        // Show error notification
      }
    }
  }, [state.currentLayout, saveLayout]);

  const handleLoadTemplate = useCallback((template: LayoutConfiguration) => {
    dispatch({ type: 'LOAD_LAYOUT', payload: template });
    setShowTemplateLibrary(false);
  }, []);

  const handleExportLayout = useCallback(async () => {
    if (state.currentLayout) {
      try {
        await exportLayout(state.currentLayout);
      } catch (error) {
        console.error('Failed to export layout:', error);
      }
    }
  }, [state.currentLayout, exportLayout]);

  const handleImportLayout = useCallback(async () => {
    try {
      const layout = await importLayout();
      dispatch({ type: 'LOAD_LAYOUT', payload: layout });
    } catch (error) {
      console.error('Failed to import layout:', error);
    }
  }, [importLayout]);

  // History operations
  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const handleRedo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  // Preview operations
  const handleLoadConfiguration = useCallback(async () => {
    if (selectedConfiguration) {
      setIsLoadingPreview(true);
      // Simulate loading time for better UX
      setTimeout(() => {
        setIsLoadingPreview(false);
        setShowPreview(true);
      }, 1000);
    }
  }, [selectedConfiguration]);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0">
          <DashboardHeader
            projectName="Layout Designer"
            onNavigateHome={onNavigateHome}
          />
        </div>

        {/* Toolbar */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Viewport Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {[
                  { key: 'mobile', icon: Smartphone, label: 'Mobile' },
                  { key: 'tablet', icon: Tablet, label: 'Tablet' },
                  { key: 'desktop', icon: Monitor, label: 'Desktop' }
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => handleViewportChange(key as any)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      state.viewport === key
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleZoomChange(-0.25)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[4rem] text-center">
                  {Math.round(state.zoom * 100)}%
                </span>
                <button
                  onClick={() => handleZoomChange(0.25)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center: History Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className={`p-2 rounded-lg transition-colors ${
                  canUndo
                    ? 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className={`p-2 rounded-lg transition-colors ${
                  canRedo
                    ? 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTemplateLibrary(true)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Layout className="w-4 h-4" />
                <span className="hidden sm:inline">Templates</span>
              </button>
              
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  showPreview
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </button>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

              <button
                onClick={handleImportLayout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Import Layout"
              >
                <Upload className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportLayout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Export Layout"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleSaveLayout}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          {!showPreview && (
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Panel Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setLeftPanelView('components')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    leftPanelView === 'components'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Components
                </button>
                <button
                  onClick={() => setLeftPanelView('properties')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    leftPanelView === 'properties'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Properties
                </button>
                <button
                  onClick={() => setLeftPanelView('preview')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    leftPanelView === 'preview'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Live Preview
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                {leftPanelView === 'components' && (
                  <ComponentPalette onAddComponent={handleAddComponent} />
                )}
                
                {leftPanelView === 'properties' && (
                  <PropertyPanel
                    selectedComponent={state.selectedComponent}
                    layout={state.currentLayout}
                    onUpdateComponent={handleUpdateComponent}
                  />
                )}
                
                {leftPanelView === 'preview' && (
                  <div className="p-4 space-y-4">
                    <ConfigurationSelector
                      configurations={configurations}
                      selectedConfiguration={selectedConfiguration}
                      onSelectConfiguration={setSelectedConfiguration}
                      onLoadConfiguration={handleLoadConfiguration}
                      isLoading={isLoadingPreview}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Center: Editor/Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {showPreview ? (
              <LayoutPreview
                layout={state.currentLayout}
                viewport={state.viewport}
                configuration={selectedConfiguration}
              />
            ) : (
              <LayoutEditor
                layout={state.currentLayout}
                selectedComponent={state.selectedComponent}
                viewport={state.viewport}
                zoom={state.zoom}
                onSelectComponent={handleSelectComponent}
                onUpdateComponent={handleUpdateComponent}
                onDeleteComponent={handleDeleteComponent}
                onAddComponent={handleAddComponent}
              />
            )}
          </div>
        </div>

        {/* Template Library Modal */}
        {showTemplateLibrary && (
          <TemplateLibrary
            onClose={() => setShowTemplateLibrary(false)}
            onSelectTemplate={handleLoadTemplate}
            templates={getTemplates()}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default LayoutDesigner;