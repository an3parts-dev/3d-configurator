import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Dashboard from './pages/Dashboard';
import ConfiguratorBuilder from './pages/ConfiguratorBuilder';

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
  const [currentView, setCurrentView] = useState<'dashboard' | 'configurator'>('dashboard');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const handleConfigureProject = (project: Project) => {
    setCurrentProject(project);
    setCurrentView('configurator');
  };

  const handleNavigateHome = () => {
    setCurrentView('dashboard');
    setCurrentProject(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-900">
        {currentView === 'dashboard' ? (
          <Dashboard onConfigureProject={handleConfigureProject} />
        ) : (
          <ConfiguratorBuilder 
            project={currentProject}
            onNavigateHome={handleNavigateHome}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;