import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './pages/Dashboard';
import ConfiguratorBuilder from './pages/ConfiguratorBuilder';
import LayoutDesigner from './components/layout-designer/LayoutDesigner';

interface Project {
  id: string;
  name: string;
  description?: string;
  model: string;
  optionsCount: number;
  lastModified: Date;
  thumbnail?: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'configurator' | 'layout-designer'>('dashboard');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const handleConfigureProject = (project: Project) => {
    setCurrentProject(project);
    setCurrentView('configurator');
  };

  const handleNavigateHome = () => {
    setCurrentView('dashboard');
    setCurrentProject(null);
  };

  const handleNavigateToLayoutDesigner = () => {
    setCurrentView('layout-designer');
  };

  return (
    <ThemeProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          {currentView === 'dashboard' && (
            <Dashboard 
              onConfigureProject={handleConfigureProject}
              onNavigateToLayoutDesigner={handleNavigateToLayoutDesigner}
            />
          )}
          
          {currentView === 'configurator' && (
            <ConfiguratorBuilder 
              project={currentProject}
              onNavigateHome={handleNavigateHome}
            />
          )}
          
          {currentView === 'layout-designer' && (
            <LayoutDesigner 
              onNavigateHome={handleNavigateHome}
            />
          )}
        </div>
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;