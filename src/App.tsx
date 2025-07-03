import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ConfiguratorBuilder from './pages/ConfiguratorBuilder';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            <Route path="/" element={<ConfiguratorBuilder />} />
            <Route path="/configurator/:id?" element={<ConfiguratorBuilder />} />
          </Routes>
        </div>
      </Router>
    </DndProvider>
  );
}

export default App;