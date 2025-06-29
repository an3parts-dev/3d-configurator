import React, { useState } from 'react';
import { Configurator } from './components/Configurator';
import { AdminPanel } from './components/AdminPanel';
import { TabNavigation } from './components/TabNavigation';

function App() {
  const [activeTab, setActiveTab] = useState<'configurator' | 'admin'>('configurator');

  return (
    <div className="min-h-screen bg-gray-900">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'configurator' && <Configurator />}
      {activeTab === 'admin' && <AdminPanel />}
    </div>
  );
}

export default App;