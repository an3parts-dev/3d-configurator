import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Image as ImageIcon } from 'lucide-react';
import { 
  Engine, 
  Scene, 
  HemisphericLight, 
  DirectionalLight, 
  Vector3, 
  Color3,
  StandardMaterial,
  SceneLoader,
  AbstractMesh,
  Material,
  Mesh,
  Box3,
  TransformNode
} from '@babylonjs/core';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import '@babylonjs/core/Cameras/Inputs/arcRotateCameraPointersInput';
import '@babylonjs/loaders/glTF';
import { ConfiguratorData, ModelComponent } from '../types/ConfiguratorTypes';
import { ConditionalLogicEngine } from '../utils/ConditionalLogicEngine';

interface BabylonPreviewProps {
  configuratorData: ConfiguratorData;
  onComponentsLoaded?: (components: ModelComponent[]) => void;
}

const BabylonPreview: React.FC<BabylonPreviewProps> = ({ 
  configuratorData, 
  onComponentsLoaded 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [modelComponents, setModelComponents] = useState<ModelComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Babylon.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);

    // Set up camera
    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      Vector3.Zero(),
      scene
    );
    camera.attachControls(canvas, true);
    camera.setTarget(Vector3.Zero());
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 20;
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = Math.PI / 2;

    // Set up lighting
    const hemisphericLight = new HemisphericLight("hemisphericLight", new Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 0.4;

    const directionalLight = new DirectionalLight("directionalLight", new Vector3(-1, -1, -1), scene);
    directionalLight.intensity = 1.2;
    directionalLight.position = new Vector3(5, 5, 5);

    const directionalLight2 = new DirectionalLight("directionalLight2", new Vector3(1, -1, 1), scene);
    directionalLight2.intensity = 0.8;
    directionalLight2.position = new Vector3(-5, 5, -5);

    // Store references
    engineRef.current = engine;
    sceneRef.current = scene;
    cameraRef.current = camera;

    // Start render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  // Load model when configuratorData.model changes
  useEffect(() => {
    if (!sceneRef.current || !configuratorData.model) return;

    const scene = sceneRef.current;
    setIsLoading(true);

    // Clear existing meshes
    scene.meshes.forEach(mesh => {
      if (mesh.name !== '__root__') {
        mesh.dispose();
      }
    });

    // Load new model
    SceneLoader.ImportMeshAsync("", "", configuratorData.model, scene).then((result) => {
      console.log('🔄 Initializing Babylon.js model components...');
      
      const modelComponents: ModelComponent[] = [];
      
      // Calculate bounding box for scaling
      let boundingInfo = result.meshes[0]?.getBoundingInfo();
      if (result.meshes.length > 1) {
        const min = Vector3.Zero();
        const max = Vector3.Zero();
        
        result.meshes.forEach(mesh => {
          if (mesh.getBoundingInfo) {
            const meshBounds = mesh.getBoundingInfo();
            Vector3.MinimizeInPlace(min, meshBounds.minimum);
            Vector3.MaximizeInPlace(max, meshBounds.maximum);
          }
        });
        
        boundingInfo = { minimum: min, maximum: max };
      }

      if (boundingInfo) {
        const size = boundingInfo.maximum.subtract(boundingInfo.minimum);
        const center = boundingInfo.minimum.add(boundingInfo.maximum).scale(0.5);
        
        // Center the model
        result.meshes.forEach(mesh => {
          mesh.position = mesh.position.subtract(center);
        });
        
        // Scale the model
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 4;
        const scale = targetSize / maxDimension;
        
        result.meshes.forEach(mesh => {
          mesh.scaling = new Vector3(scale, scale, scale);
        });
      }

      // Process meshes and create components
      result.meshes.forEach((mesh) => {
        if (mesh.name && mesh.name !== '__root__' && mesh instanceof Mesh) {
          // Clone the original material
          const originalMaterial = mesh.material ? mesh.material.clone(mesh.material.name + '_original') : null;
          
          const component: ModelComponent = {
            name: mesh.name,
            mesh: mesh,
            visible: mesh.isVisible,
            originalVisible: mesh.isVisible,
            material: mesh.material,
            originalMaterial: originalMaterial
          };
          modelComponents.push(component);
        }
      });

      // Sort components by name
      modelComponents.sort((a, b) => a.name.localeCompare(b.name));

      console.log('✅ Babylon.js model components loaded:', modelComponents.length);
      console.log('📋 Component names:', modelComponents.map(c => c.name));

      setModelComponents(modelComponents);
      setIsLoading(false);
      
      // Notify parent component
      if (onComponentsLoaded) {
        onComponentsLoaded(modelComponents);
      }
      
      // Initialize default selections
      const defaultSelections: Record<string, string> = {};
      configuratorData.options.forEach(option => {
        const validValues = option.values.filter(Boolean);
        if (validValues.length > 0) {
          defaultSelections[option.id] = validValues[0].id;
        }
      });
      
      if (Object.keys(defaultSelections).length > 0) {
        setSelectedValues(defaultSelections);
        console.log('🎯 Default selections set:', defaultSelections);
      }

      // Position camera to view the model
      if (cameraRef.current && boundingInfo) {
        const size = boundingInfo.maximum.subtract(boundingInfo.minimum);
        const maxDimension = Math.max(size.x, size.y, size.z);
        cameraRef.current.radius = maxDimension * 2;
        cameraRef.current.setTarget(Vector3.Zero());
      }

    }).catch((error) => {
      console.error('Failed to load model:', error);
      setIsLoading(false);
    });

  }, [configuratorData.model, onComponentsLoaded]);

  // Apply configuration changes when selections change
  useEffect(() => {
    if (modelComponents.length === 0) return;

    console.log('🎛️ Applying Babylon.js configuration changes:', selectedValues);

    // Reset all components to their original state first
    modelComponents.forEach((component) => {
      component.mesh.isVisible = component.originalVisible;
      component.visible = component.originalVisible;
      
      // Reset materials to original
      if (component.originalMaterial) {
        component.mesh.material = component.originalMaterial.clone(component.originalMaterial.name + '_clone');
        component.material = component.mesh.material;
      }
    });

    // Get visible options based on conditional logic
    const visibleOptions = ConditionalLogicEngine.getVisibleOptions(
      configuratorData.options,
      selectedValues
    );

    console.log('👁️ Visible options after conditional logic:', visibleOptions.map(opt => opt.name));

    // Apply each visible option's configuration
    visibleOptions.forEach((option) => {
      const selectedValueId = selectedValues[option.id];
      if (!selectedValueId) return;

      const selectedValue = option.values.find(v => v && v.id === selectedValueId);
      if (!selectedValue) return;

      // Check if this specific value should be visible based on its conditional logic
      const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
        option,
        selectedValues,
        configuratorData.options
      );

      if (!visibleValues.some(v => v.id === selectedValueId)) {
        console.log(`🚫 Value "${selectedValue.name}" is hidden by conditional logic`);
        return;
      }

      console.log(`🔧 Applying "${option.name}" → "${selectedValue.name}"`);
      console.log(`🎯 Target components:`, option.targetComponents);

      if (option.manipulationType === 'visibility') {
        // Apply default behavior ONLY to target components
        modelComponents.forEach((component) => {
          if (isComponentTargeted(component.name, option.targetComponents)) {
            if (option.defaultBehavior === 'hide') {
              component.mesh.isVisible = false;
              component.visible = false;
              console.log(`🙈 Hiding target component by default: ${component.name}`);
            } else {
              component.mesh.isVisible = true;
              component.visible = true;
              console.log(`👁️ Showing target component by default: ${component.name}`);
            }
          }
        });

        // Apply specific visibility rules
        if (option.defaultBehavior === 'hide') {
          // Show specified components
          selectedValue.visibleComponents?.forEach(visibleName => {
            modelComponents.forEach((component) => {
              if (shouldComponentBeAffected(component.name, [visibleName]) && 
                  isComponentTargeted(component.name, option.targetComponents)) {
                component.mesh.isVisible = true;
                component.visible = true;
                console.log(`👁️ Showing specific component: ${component.name}`);
              }
            });
          });
        } else {
          // Hide specified components
          selectedValue.hiddenComponents?.forEach(hiddenName => {
            modelComponents.forEach((component) => {
              if (shouldComponentBeAffected(component.name, [hiddenName]) && 
                  isComponentTargeted(component.name, option.targetComponents)) {
                component.mesh.isVisible = false;
                component.visible = false;
                console.log(`🙈 Hiding specific component: ${component.name}`);
              }
            });
          });
        }
      } else if (option.manipulationType === 'material' && selectedValue.color) {
        // Apply material changes ONLY to exact target components
        modelComponents.forEach((component) => {
          if (isComponentTargeted(component.name, option.targetComponents) &&
              component.material instanceof StandardMaterial) {
            
            const newColor = Color3.FromHexString(selectedValue.color!);
            component.material.diffuseColor = newColor;
            console.log(`🎨 Changed material color for ${component.name} to ${selectedValue.color}`);
          }
        });
      }
    });

    // Update component state for UI
    setModelComponents(prevComponents => 
      prevComponents.map(comp => ({ 
        ...comp, 
        visible: comp.mesh.isVisible 
      }))
    );

    const visibleComponents = modelComponents.filter(c => c.mesh.isVisible).map(c => c.name);
    console.log('✅ Final visible components:', visibleComponents);

  }, [selectedValues, modelComponents, configuratorData]);

  // Helper functions for component matching
  const isComponentTargeted = (componentName: string, targetComponents: string[]): boolean => {
    const componentLower = componentName.toLowerCase();
    return targetComponents.some(target => {
      const targetLower = target.toLowerCase();
      return componentLower === targetLower;
    });
  };

  const shouldComponentBeAffected = (componentName: string, ruleComponents: string[]): boolean => {
    const componentLower = componentName.toLowerCase();
    return ruleComponents.some(rule => {
      const ruleLower = rule.toLowerCase();
      return componentLower === ruleLower;
    });
  };

  const handleValueChange = useCallback((optionId: string, valueId: string) => {
    console.log(`🔄 Option changed: ${optionId} → ${valueId}`);
    setSelectedValues(prev => ({
      ...prev,
      [optionId]: valueId
    }));
  }, []);

  // Get visible options based on conditional logic
  const visibleOptions = ConditionalLogicEngine.getVisibleOptions(
    configuratorData.options,
    selectedValues
  );

  const getBorderStyles = (imageSettings?: any) => {
    if (!imageSettings?.showBorder) return {};
    
    return {
      borderRadius: `${imageSettings.borderRadius || 8}px`,
      border: '2px solid #4b5563'
    };
  };

  const renderOption = (option: any) => {
    const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
      option,
      selectedValues,
      configuratorData.options
    );

    if (visibleValues.length === 0) return null;

    const isRowDirection = option.displayDirection === 'row';

    return (
      <div key={option.id} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-semibold text-xl">
              {option.name}
              {option.conditionalLogic?.enabled && (
                <span className="ml-2 inline-flex items-center px-2 py-1 bg-purple-500/20 rounded-full">
                  <Zap className="w-3 h-3 text-purple-400" />
                </span>
              )}
            </h4>
            {option.description && (
              <p className="text-gray-400 text-sm mt-1">{option.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span className="px-2 py-1 bg-gray-700 rounded-full capitalize font-medium">
              {option.manipulationType}
            </span>
            <span className="px-2 py-1 bg-gray-700 rounded-full capitalize font-medium flex items-center space-x-1">
              {option.displayType === 'images' && <ImageIcon className="w-3 h-3" />}
              <span>{option.displayType}</span>
            </span>
            {option.defaultBehavior && (
              <span className={`px-2 py-1 rounded-full font-medium ${
                option.defaultBehavior === 'hide' 
                  ? 'bg-red-500/20 text-red-300' 
                  : 'bg-green-500/20 text-green-300'
              }`}>
                {option.defaultBehavior === 'hide' ? 'Hide Default' : 'Show Default'}
              </span>
            )}
          </div>
        </div>
        
        {option.displayType === 'images' ? (
          <div className={`${isRowDirection ? 'flex gap-4 overflow-x-auto pb-2' : 'flex flex-wrap gap-4'}`}>
            {visibleValues.map((value: any) => (
              <button
                key={value.id}
                onClick={() => handleValueChange(option.id, value.id)}
                className={`relative group transition-all duration-200 ${isRowDirection ? 'flex-shrink-0' : ''} ${
                  selectedValues[option.id] === value.id
                    ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/25 scale-105'
                    : 'hover:scale-102'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className={`
                      flex items-center justify-center overflow-hidden
                      ${value.image ? '' : 'bg-gray-700 w-16 h-16 rounded-lg'}
                    `}
                    style={value.image ? getBorderStyles(option.imageSettings) : {}}
                  >
                    {value.image ? (
                      <img
                        src={value.image}
                        alt={value.name}
                        className={`${
                          option.imageSettings?.aspectRatio === 'full' 
                            ? 'object-contain max-w-32 max-h-32' 
                            : 'object-cover'
                        } ${
                          option.imageSettings?.size === 'x-small' ? 'w-12 h-12' :
                          option.imageSettings?.size === 'small' ? 'w-16 h-16' :
                          option.imageSettings?.size === 'medium' ? 'w-20 h-20' :
                          option.imageSettings?.size === 'large' ? 'w-24 h-24' :
                          option.imageSettings?.size === 'x-large' ? 'w-32 h-32' :
                          'w-20 h-20'
                        } ${
                          option.imageSettings?.aspectRatio === '1:1' ? 'aspect-square' :
                          option.imageSettings?.aspectRatio === '4:3' ? 'aspect-[4/3]' :
                          option.imageSettings?.aspectRatio === '16:9' ? 'aspect-video' :
                          option.imageSettings?.aspectRatio === '3:2' ? 'aspect-[3/2]' :
                          option.imageSettings?.aspectRatio === '2:3' ? 'aspect-[2/3]' :
                          option.imageSettings?.aspectRatio === 'full' ? '' :
                          'aspect-square'
                        }`}
                        style={getBorderStyles(option.imageSettings)}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  
                  {!value.hideTitle && (
                    <p className="text-white text-xs font-medium text-center max-w-20 truncate">
                      {value.name}
                    </p>
                  )}
                </div>
                
                {selectedValues[option.id] === value.id && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                {value.conditionalLogic?.enabled && (
                  <div className="absolute top-1 right-1 bg-orange-600 text-white p-1 rounded-full">
                    <Zap className="w-2 h-2" />
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : option.displayType === 'buttons' ? (
          <div className={`${isRowDirection ? 'flex gap-2 overflow-x-auto pb-2' : 'flex flex-wrap gap-2'}`}>
            {visibleValues.map((value: any) => (
              <button
                key={value.id}
                onClick={() => handleValueChange(option.id, value.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 relative ${isRowDirection ? 'flex-shrink-0 whitespace-nowrap' : ''} ${
                  selectedValues[option.id] === value.id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25 scale-105'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:border-gray-500 hover:scale-102'
                }`}
              >
                {option.manipulationType === 'material' && value.color && (
                  <div 
                    className="w-3 h-3 rounded-full border border-white/20 shadow-inner"
                    style={{ backgroundColor: value.color }}
                  />
                )}
                <span>{value.name}</span>
                
                {value.conditionalLogic?.enabled && (
                  <div className="absolute -top-1 -right-1 bg-orange-600 text-white p-0.5 rounded-full">
                    <Zap className="w-2 h-2" />
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <select
            value={selectedValues[option.id] || ''}
            onChange={(e) => handleValueChange(option.id, e.target.value)}
            className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          >
            {visibleValues.map((value: any) => (
              <option key={value.id} value={value.id}>
                {value.name} {value.conditionalLogic?.enabled ? '⚡' : ''}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 3D Canvas - 50% screen height */}
      <div className="relative" style={{ height: '50vh' }}>
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ outline: 'none' }}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-xl font-semibold">Loading 3D Model</p>
              <p className="text-gray-400 text-sm mt-2">Analyzing components...</p>
            </div>
          </div>
        )}
        
        {/* Info overlays */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md rounded-xl px-5 py-4 border border-gray-600">
          <p className="text-white text-sm font-semibold mb-1">3D Model Preview</p>
          <div className="flex items-center space-x-4 text-xs text-gray-300">
            <span>Components: {modelComponents.length}</span>
            <span>•</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              Visible: {modelComponents.filter(c => c.visible).length}
            </span>
          </div>
        </div>

        {/* Conditional Logic Status */}
        {configuratorData.options.some(opt => opt.conditionalLogic?.enabled || opt.values.some(v => v.conditionalLogic?.enabled)) && (
          <div className="absolute top-4 right-4 bg-purple-600/20 backdrop-blur-md rounded-xl px-4 py-3 border border-purple-500/30">
            <div className="flex items-center space-x-2 text-purple-300">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-4 h-4" />
              </motion.div>
              <span className="text-sm font-medium">Smart Logic Active</span>
            </div>
            <p className="text-xs text-purple-200/80 mt-1">
              {visibleOptions.length} of {configuratorData.options.length} options visible
            </p>
          </div>
        )}

        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md rounded-xl px-4 py-3 border border-gray-600">
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Drag to rotate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Scroll to zoom</span>
            </div>
          </div>
        </div>
      </div>

      {/* Options Panel - 50% screen height */}
      <div className="bg-gray-900 flex flex-col" style={{ height: '50vh' }}>
        <div className="flex-1 overflow-auto p-6">
          {visibleOptions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-gray-500 border-t-blue-400 rounded-full"
                />
              </div>
              <p className="text-lg font-medium">No options available</p>
              <p className="text-sm mt-1">
                {configuratorData.options.length > 0 
                  ? 'Options are hidden by conditional logic'
                  : 'Add options in the left panel to see them here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {visibleOptions.map((option) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {renderOption(option)}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BabylonPreview;