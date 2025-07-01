import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Target, 
  Edit, 
  Save, 
  X,
  MapPin,
  Info
} from 'lucide-react';
import { MeasurePoint } from '../types/ConfiguratorTypes';

interface MeasurePointEditorProps {
  measurePoints: MeasurePoint[];
  onMeasurePointsChange: (points: MeasurePoint[]) => void;
  availableComponents: string[];
  className?: string;
}

const MeasurePointEditor: React.FC<MeasurePointEditorProps> = ({
  measurePoints,
  onMeasurePointsChange,
  availableComponents,
  className = ""
}) => {
  const [editingPoint, setEditingPoint] = useState<MeasurePoint | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const addMeasurePoint = () => {
    const newPoint: MeasurePoint = {
      id: `measure_point_${Date.now()}`,
      name: 'New Measure Point',
      description: '',
      componentName: availableComponents[0] || '',
      position: { x: 0, y: 0, z: 0 },
      type: 'sealing_point'
    };
    
    onMeasurePointsChange([...measurePoints, newPoint]);
    setEditingPoint(newPoint);
    setShowAddForm(false);
  };

  const updateMeasurePoint = (pointId: string, updates: Partial<MeasurePoint>) => {
    const updatedPoints = measurePoints.map(point =>
      point.id === pointId ? { ...point, ...updates } : point
    );
    onMeasurePointsChange(updatedPoints);
  };

  const deleteMeasurePoint = (pointId: string) => {
    const updatedPoints = measurePoints.filter(point => point.id !== pointId);
    onMeasurePointsChange(updatedPoints);
    if (editingPoint?.id === pointId) {
      setEditingPoint(null);
    }
  };

  const getTypeInfo = (type: MeasurePoint['type']) => {
    switch (type) {
      case 'sealing_point':
        return {
          label: 'Sealing Point',
          description: 'Where the fitting creates a seal',
          color: 'text-blue-400'
        };
      case 'hex_surface':
        return {
          label: 'Hex Surface',
          description: 'Flat hexagonal surface of fitting',
          color: 'text-green-400'
        };
      case 'fitting_end':
        return {
          label: 'Fitting End',
          description: 'Outermost point of the fitting',
          color: 'text-purple-400'
        };
      case 'hose_end':
        return {
          label: 'Hose End',
          description: 'Where hose connects to fitting',
          color: 'text-orange-400'
        };
      default:
        return {
          label: 'Unknown',
          description: '',
          color: 'text-gray-400'
        };
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-semibold text-lg flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-400" />
            Measure Points
          </h4>
          <p className="text-gray-400 text-sm">Define measurement reference points for this fitting</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Point</span>
        </button>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h5 className="text-blue-300 font-semibold mb-2">Measurement Types</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-400 font-medium">C/C Length:</span>
                <p className="text-blue-200/80">Sealing point to sealing point</p>
              </div>
              <div>
                <span className="text-green-400 font-medium">Total Length:</span>
                <p className="text-green-200/80">Fitting end to fitting end</p>
              </div>
              <div>
                <span className="text-orange-400 font-medium">Hose Length:</span>
                <p className="text-orange-200/80">Hose end to hose end</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Measure Points List */}
      <div className="space-y-3">
        {measurePoints.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-800/50 rounded-xl border border-gray-700">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No measure points defined</p>
            <p className="text-sm mt-1">Add measure points to enable length measurements</p>
          </div>
        ) : (
          measurePoints.map((point) => {
            const typeInfo = getTypeInfo(point.type);
            const isEditing = editingPoint?.id === point.id;
            
            return (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-700 p-4 rounded-xl border border-gray-600"
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Point Name</label>
                        <input
                          type="text"
                          value={editingPoint.name}
                          onChange={(e) => setEditingPoint({ ...editingPoint, name: e.target.value })}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Component</label>
                        <select
                          value={editingPoint.componentName}
                          onChange={(e) => setEditingPoint({ ...editingPoint, componentName: e.target.value })}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        >
                          {availableComponents.map(component => (
                            <option key={component} value={component}>{component}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Description</label>
                      <input
                        type="text"
                        value={editingPoint.description}
                        onChange={(e) => setEditingPoint({ ...editingPoint, description: e.target.value })}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        placeholder="Optional description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Point Type</label>
                      <select
                        value={editingPoint.type}
                        onChange={(e) => setEditingPoint({ ...editingPoint, type: e.target.value as MeasurePoint['type'] })}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="sealing_point">Sealing Point</option>
                        <option value="hex_surface">Hex Surface</option>
                        <option value="fitting_end">Fitting End</option>
                        <option value="hose_end">Hose End</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Position (X, Y, Z)</label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={editingPoint.position.x}
                          onChange={(e) => setEditingPoint({
                            ...editingPoint,
                            position: { ...editingPoint.position, x: parseFloat(e.target.value) || 0 }
                          })}
                          className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                          placeholder="X"
                          step="0.1"
                        />
                        <input
                          type="number"
                          value={editingPoint.position.y}
                          onChange={(e) => setEditingPoint({
                            ...editingPoint,
                            position: { ...editingPoint.position, y: parseFloat(e.target.value) || 0 }
                          })}
                          className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                          placeholder="Y"
                          step="0.1"
                        />
                        <input
                          type="number"
                          value={editingPoint.position.z}
                          onChange={(e) => setEditingPoint({
                            ...editingPoint,
                            position: { ...editingPoint.position, z: parseFloat(e.target.value) || 0 }
                          })}
                          className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                          placeholder="Z"
                          step="0.1"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          updateMeasurePoint(editingPoint.id, editingPoint);
                          setEditingPoint(null);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setEditingPoint(null)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <h5 className="text-white font-semibold">{point.name}</h5>
                        <span className={`text-xs px-2 py-1 rounded-full bg-gray-600 ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p><span className="font-medium">Component:</span> {point.componentName}</p>
                        {point.description && (
                          <p><span className="font-medium">Description:</span> {point.description}</p>
                        )}
                        <p>
                          <span className="font-medium">Position:</span> 
                          ({point.position.x.toFixed(2)}, {point.position.y.toFixed(2)}, {point.position.z.toFixed(2)})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingPoint(point)}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMeasurePoint(point.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md"
            >
              <h3 className="text-white font-semibold text-lg mb-4">Add Measure Point</h3>
              <p className="text-gray-400 text-sm mb-4">
                Create a new measurement reference point for this fitting option.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addMeasurePoint}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  Add Point
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeasurePointEditor;