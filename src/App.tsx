import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConfiguratorBuilder from './pages/ConfiguratorBuilder';
import ConfigurationDemo from './pages/ConfigurationDemo';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<ConfiguratorBuilder />} />
          <Route path="/configurator/:id?" element={<ConfiguratorBuilder />} />
          <Route path="/demo" element={<ConfigurationDemo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;