import React, { useState } from 'react';
import { ProductManager } from './admin/ProductManager';
import { CustomizationEditor } from './admin/CustomizationEditor';
import { useAdmin } from '../hooks/useAdmin';
import { Package, Settings, Eye, Plus } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'customization'>('products');
  const { adminState, selectProduct } = useAdmin();

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customization', label: 'Customization', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Manage your 3D configurators</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {adminState.selectedProduct && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {adminState.selectedProduct.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'customization' && <CustomizationEditor />}
      </div>
    </div>
  );
};