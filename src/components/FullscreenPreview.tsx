import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Zap, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { ConfiguratorData, ModelComponent } from '../types/ConfiguratorTypes';
import { ConditionalLogicEngine } from '../utils/ConditionalLogicEngine';

interface FullscreenPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  configuratorData: ConfiguratorData;
  onComponentsLoaded?: (components: ModelComponent[]) => void;
}

// Enhanced GLB Model Component for fullscreen
const GLBModel = ({ 
  modelUrl, 
  selectedValues, 
  onComponentsLoaded,
  configuratorData
}: { 
  modelUrl: string;
  selectedValues: Record<string, string>;
  onComponentsLoaded: (components: ModelComponent[]) => void;
  configuratorData: ConfiguratorData;
}) => {
  const groupRef = React.useRef<THREE.Group>(null);
  const [components, setComponents] = useState<ModelComponent[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const gltf = useLoader(GLTFLoader, modelUrl);

  useEffect(() => {
    if (gltf && gltf.scene && !isInitialized) {
      const modelComponents: ModelComponent[] = [];
      
      // Calculate model bounds for optimal scaling
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      // Center the model
      gltf.scene.position.sub(center);
      
      // Scale the model to fill viewport optimally
      const maxDimension = Math.max(size.x, size.y, size.z);
      const targetSize = 4;
      const scale = targetSize / maxDimension;
      gltf.scene.scale.setScalar(scale);
      
      // Traverse scene to collect all mesh components
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name) {
          const originalMaterial = child.material instanceof THREE.Material 
            ? child.material.clone() 
            : child.material;
            
          const component: ModelComponent = {
            name: child.name,
            mesh: child,
            visible: child.visible,
            originalVisible: child.visible,
            material: child.material as THREE.Material,
            originalMaterial: originalMaterial as THREE.Material
          };
          modelComponents.push(component);
        }
      });

      modelComponents.sort((a, b) => a.name.localeCompare(b.name));
      setComponents(modelComponents);
      setIsInitialized(true);
      onComponentsLoaded(modelComponents);
    }
  }, [gltf, isInitialized, onComponentsLoaded]);

  // Apply configuration changes
  useEffect(() => {
    if (!isInitialized || components.length === 0) return;

    // Reset all components to original state
    components.forEach((component) => {
      component.mesh.visible = component.originalVisible;
      component.visible = component.originalVisible;
      
      if (component.originalMaterial) {
        component.mesh.material = component.originalMaterial.clone();
        component.material = component.mesh.material as THREE.Material;
      }
    });

    // Get visible options based on conditional logic
    const visibleOptions = ConditionalLogicEngine.getVisibleOptions(
      configuratorData.options,
      selectedValues
    );

    // Apply each visible option's configuration
    visibleOptions.forEach((option) => {
      const selectedValueId = selectedValues[option.id];
      if (!selectedValueId) return;

      const selectedValue = option.values.find(v => v && v.id === selectedValueId);
      if (!selectedValue) return;

      // Check if this specific value should be visible
      const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
        option,
        selectedValues,
        configuratorData.options
      );

      if (!visibleValues.some(v => v.id === selectedValueId)) return;

      if (option.manipulationType === 'visibility') {
        // Apply default behavior ONLY to target components
        components.forEach((component) => {
          const isTargeted = option.targetComponents.some(target => 
            component.name.toLowerCase() === target.toLowerCase()
          );
          
          if (isTargeted) {
            if (option.defaultBehavior === 'hide') {
              component.mesh.visible = false;
              component.visible = false;
            } else {
              component.mesh.visible = true;
              component.visible = true;
            }
          }
        });

        // Apply specific visibility rules
        if (option.defaultBehavior === 'hide') {
          selectedValue.visibleComponents?.forEach(visibleName => {
            components.forEach((component) => {
              if (component.name.toLowerCase() === visibleName.toLowerCase() && 
                  option.targetComponents.some(target => 
                    component.name.toLowerCase() === target.toLowerCase()
                  )) {
                component.mesh.visible = true;
                component.visible = true;
              }
            });
          });
        } else {
          selectedValue.hiddenComponents?.forEach(hiddenName => {
            components.forEach((component) => {
              if (component.name.toLowerCase() === hiddenName.toLowerCase() && 
                  option.targetComponents.some(target => 
                    component.name.toLowerCase() === target.toLowerCase()
                  )) {
                component.mesh.visible = false;
                component.visible = false;
              }
            });
          });
        }
      } else if (option.manipulationType === 'material' && selectedValue.color) {
        components.forEach((component) => {
          const isTargeted = option.targetComponents.some(target => 
            component.name.toLowerCase() === target.toLowerCase()
          );
          
          if (isTargeted && component.material instanceof THREE.MeshStandardMaterial) {
            const colorHex = selectedValue.color!.replace('#', '0x');
            const newColor = new THREE.Color(parseInt(colorHex, 16));
            component.material.color.copy(newColor);
          }
        });
      }
    });

    setComponents(prevComponents => 
      prevComponents.map(comp => ({ 
        ...comp, 
        visible: comp.mesh.visible 
      }))
    );

  }, [selectedValues, components, configuratorData, isInitialized]);

  // Subtle animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  if (!gltf || !isInitialized) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
};

const FullscreenPreview: React.FC<FullscreenPreviewProps> = ({ 
  isOpen, 
  onClose, 
  configuratorData,
  onComponentsLoaded 
}) => {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [modelComponents, setModelComponents] = useState<ModelComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleComponentsLoaded = useCallback((components: ModelComponent[]) => {
    setModelComponents(components);
    setIsLoading(false);
    
    if (onComponentsLoaded) {
      onComponentsLoaded(components);
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
    }
  }, [onComponentsLoaded, configuratorData.options]);

  const handleValueChange = useCallback((optionId: string, valueId: string) => {
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
      border: '2px solid rgba(255, 255, 255, 0.1)'
    };
  };

  const renderOption = (option: any) => {
    const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
      option,
      selectedValues,
      configuratorData.options
    );

    if (visibleValues.length === 0) return null;

    return (
      <div key={option.id} className="flex-shrink-0 w-80 bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10">
        <div className="mb-6">
          <h3 className="text-white font-semibold text-lg mb-1">
            {option.name}
            {option.conditionalLogic?.enabled && (
              <span className="ml-2 inline-flex items-center px-2 py-1 bg-purple-500/20 rounded-full">
                <Zap className="w-3 h-3 text-purple-400" />
              </span>
            )}
          </h3>
          {option.description && (
            <p className="text-gray-300 text-sm">{option.description}</p>
          )}
        </div>
        
        {option.displayType === 'images' ? (
          <div className="grid grid-cols-3 gap-3">
            {visibleValues.map((value: any) => (
              <button
                key={value.id}
                onClick={() => handleValueChange(option.id, value.id)}
                className={`relative group transition-all duration-200 ${
                  selectedValues[option.id] === value.id
                    ? 'ring-2 ring-white shadow-lg scale-105'
                    : 'hover:scale-102 hover:ring-1 hover:ring-white/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className={`
                      flex items-center justify-center overflow-hidden bg-white/5 rounded-xl
                      ${value.image ? '' : 'w-16 h-16'}
                    `}
                    style={value.image ? getBorderStyles(option.imageSettings) : {}}
                  >
                    {value.image ? (
                      <img
                        src={value.image}
                        alt={value.name}
                        className={`${
                          option.imageSettings?.aspectRatio === 'full' 
                            ? 'object-contain max-w-20 max-h-20' 
                            : 'object-cover'
                        } ${
                          option.imageSettings?.size === 'x-small' ? 'w-12 h-12' :
                          option.imageSettings?.size === 'small' ? 'w-14 h-14' :
                          option.imageSettings?.size === 'medium' ? 'w-16 h-16' :
                          option.imageSettings?.size === 'large' ? 'w-18 h-18' :
                          option.imageSettings?.size === 'x-large' ? 'w-20 h-20' :
                          'w-16 h-16'
                        } ${
                          option.imageSettings?.aspectRatio === '1:1' ? 'aspect-square' :
                          option.imageSettings?.aspectRatio === '4:3' ? 'aspect-[4/3]' :
                          option.imageSettings?.aspectRatio === '16:9' ? 'aspect-video' :
                          option.imageSettings?.aspectRatio === '3:2' ? 'aspect-[3/2]' :
                          option.imageSettings?.aspectRatio === '2:3' ? 'aspect-[2/3]' :
                          option.imageSettings?.aspectRatio === 'full' ? '' :
                          'aspect-square'
                        } rounded-xl`}
                        style={getBorderStyles(option.imageSettings)}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  
                  {!value.hideTitle && (
                    <p className="text-white text-xs font-medium text-center max-w-16 truncate">
                      {value.name}
                    </p>
                  )}
                </div>
                
                {selectedValues[option.id] === value.id && (
                  <div className="absolute -top-1 -right-1 bg-white text-black p-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                {value.conditionalLogic?.enabled && (
                  <div className="absolute top-1 left-1 bg-orange-600 text-white p-1 rounded-full">
                    <Zap className="w-2 h-2" />
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : option.displayType === 'buttons' ? (
          <div className="flex flex-col gap-2">
            {visibleValues.map((value: any) => (
              <button
                key={value.id}
                onClick={() => handleValueChange(option.id, value.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  selectedValues[option.id] === value.id
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {option.manipulationType === 'material' && value.color && (
                    <div 
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: value.color }}
                    />
                  )}
                  <span>{value.name}</span>
                </div>
                
                {selectedValues[option.id] === value.id && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                
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
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-medium focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-colors backdrop-blur-sm"
          >
            {visibleValues.map((value: any) => (
              <option key={value.id} value={value.id} className="bg-gray-800 text-white">
                {value.name} {value.conditionalLogic?.enabled ? '⚡' : ''}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black z-[1000] flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div>
            <h1 className="text-white font-bold text-2xl">{configuratorData.name}</h1>
            <p className="text-gray-300 text-sm">{configuratorData.description}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Model Info */}
            <div className="bg-black/40 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
              <div className="flex items-center space-x-3 text-sm text-white">
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
              <div className="bg-purple-600/20 backdrop-blur-md rounded-xl px-4 py-2 border border-purple-500/30">
                <div className="flex items-center space-x-2 text-purple-300">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                  <span className="text-sm font-medium">Smart Logic Active</span>
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="bg-black/40 backdrop-blur-md hover:bg-black/60 text-white p-3 rounded-xl border border-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 3D Canvas - Full Screen */}
        <div className="flex-1 relative">
          <Canvas shadows>
            <PerspectiveCamera 
              makeDefault 
              position={[3, 2, 4]} 
              fov={50}
              near={0.1}
              far={100}
            />
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              minDistance={2}
              maxDistance={10}
              maxPolarAngle={Math.PI * 0.8}
              minPolarAngle={Math.PI * 0.2}
              target={[0, 0, 0]}
              enableDamping={true}
              dampingFactor={0.05}
            />
            
            {/* Professional lighting setup */}
            <ambientLight intensity={0.3} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1.5} 
              castShadow 
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <directionalLight position={[-10, 10, -5]} intensity={0.8} />
            <pointLight position={[0, 15, 0]} intensity={0.6} />
            <spotLight 
              position={[0, 12, 8]} 
              intensity={1.2} 
              angle={0.3} 
              penumbra={0.5} 
              castShadow
            />
            
            <Environment preset="studio" />
            
            <GLBModel 
              key={configuratorData.model}
              modelUrl={configuratorData.model}
              selectedValues={selectedValues}
              onComponentsLoaded={handleComponentsLoaded}
              configuratorData={configuratorData}
            />
          </Canvas>
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-white text-2xl font-bold">Loading 3D Model</p>
                <p className="text-gray-400 text-lg mt-2">Analyzing components...</p>
              </div>
            </div>
          )}

          {/* Controls hint */}
          <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
            <div className="text-xs text-gray-300 space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Drag to rotate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Scroll to zoom</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Right-click + drag to pan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Options Panel - Nike Style */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent">
          <div className="p-6">
            {visibleOptions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-gray-500 border-t-white rounded-full"
                  />
                </div>
                <p className="text-lg font-medium text-white">No options available</p>
                <p className="text-sm mt-1">
                  {configuratorData.options.length > 0 
                    ? 'Options are hidden by conditional logic'
                    : 'Add options in the builder to see them here'
                  }
                </p>
              </div>
            ) : (
              <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                {visibleOptions.map((option) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderOption(option)}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default FullscreenPreview;