import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { motion } from 'framer-motion';
import { Zap, Image as ImageIcon, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import * as THREE from 'three';
import { ConfiguratorData, ModelComponent, ImageSettings } from '../types/ConfiguratorTypes';
import { ConditionalLogicEngine } from '../utils/ConditionalLogicEngine';

interface ThreeJSPreviewProps {
  configuratorData: ConfiguratorData;
  onComponentsLoaded?: (components: ModelComponent[]) => void;
}

// Enhanced GLB Model Component with precise component targeting
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
  const groupRef = useRef<THREE.Group>(null);
  const [components, setComponents] = useState<ModelComponent[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load the GLB model once
  const gltf = useLoader(GLTFLoader, modelUrl);

  // Initialize components only once when model loads
  useEffect(() => {
    if (gltf && gltf.scene && !isInitialized) {
      console.log('🔄 Initializing 3D model components...');
      
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
          // Clone the original material to preserve it
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

      // Sort components by name for consistent ordering
      modelComponents.sort((a, b) => a.name.localeCompare(b.name));

      console.log('✅ Model components loaded:', modelComponents.length);
      console.log('📋 Component names:', modelComponents.map(c => c.name));

      setComponents(modelComponents);
      setIsInitialized(true);
      
      // Notify parent component
      onComponentsLoaded(modelComponents);
    }
  }, [gltf, isInitialized, onComponentsLoaded]);

  // Precise component matching function
  const isComponentTargeted = (componentName: string, targetComponents: string[]): boolean => {
    const componentLower = componentName.toLowerCase();
    
    return targetComponents.some(target => {
      const targetLower = target.toLowerCase();
      // Only exact matches - no partial matching to prevent unintended changes
      return componentLower === targetLower;
    });
  };

  // Precise component matching for visibility rules
  const shouldComponentBeAffected = (componentName: string, ruleComponents: string[]): boolean => {
    const componentLower = componentName.toLowerCase();
    
    return ruleComponents.some(rule => {
      const ruleLower = rule.toLowerCase();
      // Only exact matches for precise control
      return componentLower === ruleLower;
    });
  };

  // Apply configuration changes when selections change
  useEffect(() => {
    if (!isInitialized || components.length === 0) return;

    console.log('🎛️ Applying configuration changes:', selectedValues);

    // Reset all components to their original state first
    components.forEach((component) => {
      component.mesh.visible = component.originalVisible;
      component.visible = component.originalVisible;
      
      // Reset materials to original
      if (component.originalMaterial) {
        component.mesh.material = component.originalMaterial.clone();
        component.material = component.mesh.material as THREE.Material;
      }
    });

    // Get visible options based on conditional logic
    const visibleOptions = ConditionalLogicEngine.getVisibleOptions(
      configuratorData.options.filter(opt => !opt.isGroup),
      selectedValues
    );

    console.log('👁️ Visible options after conditional logic:', visibleOptions.map(opt => opt.name));

    // Apply each visible option's configuration with precise targeting
    visibleOptions.forEach((option) => {
      const selectedValueId = selectedValues[option.id];
      if (!selectedValueId) return;

      const selectedValue = option.values.find(v => v && v.id === selectedValueId);
      if (!selectedValue) return;

      // Check if this specific value should be visible based on its conditional logic
      const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
        option,
        selectedValues,
        configuratorData.options.filter(opt => !opt.isGroup)
      );

      if (!visibleValues.some(v => v.id === selectedValueId)) {
        console.log(`🚫 Value "${selectedValue.name}" is hidden by conditional logic`);
        return;
      }

      console.log(`🔧 Applying "${option.name}" → "${selectedValue.name}"`);
      console.log(`🎯 Target components:`, option.targetComponents);

      if (option.manipulationType === 'visibility') {
        // Apply default behavior ONLY to target components
        components.forEach((component) => {
          if (isComponentTargeted(component.name, option.targetComponents)) {
            if (option.defaultBehavior === 'hide') {
              component.mesh.visible = false;
              component.visible = false;
              console.log(`🙈 Hiding target component by default: ${component.name}`);
            } else {
              component.mesh.visible = true;
              component.visible = true;
              console.log(`👁️ Showing target component by default: ${component.name}`);
            }
          }
        });

        // Apply specific visibility rules
        if (option.defaultBehavior === 'hide') {
          // Show specified components (only if they are target components)
          selectedValue.visibleComponents?.forEach(visibleName => {
            components.forEach((component) => {
              if (shouldComponentBeAffected(component.name, [visibleName]) && 
                  isComponentTargeted(component.name, option.targetComponents)) {
                component.mesh.visible = true;
                component.visible = true;
                console.log(`👁️ Showing specific component: ${component.name}`);
              }
            });
          });
        } else {
          // Hide specified components (only if they are target components)
          selectedValue.hiddenComponents?.forEach(hiddenName => {
            components.forEach((component) => {
              if (shouldComponentBeAffected(component.name, [hiddenName]) && 
                  isComponentTargeted(component.name, option.targetComponents)) {
                component.mesh.visible = false;
                component.visible = false;
                console.log(`🙈 Hiding specific component: ${component.name}`);
              }
            });
          });
        }
      } else if (option.manipulationType === 'material' && selectedValue.color) {
        // Apply material changes ONLY to exact target components
        components.forEach((component) => {
          if (isComponentTargeted(component.name, option.targetComponents) &&
              component.material instanceof THREE.MeshStandardMaterial) {
            
            const colorHex = selectedValue.color!.replace('#', '0x');
            const newColor = new THREE.Color(parseInt(colorHex, 16));
            component.material.color.copy(newColor);
            console.log(`🎨 Changed material color for ${component.name} to ${selectedValue.color}`);
          }
        });
      }
    });

    // Update component state for UI
    setComponents(prevComponents => 
      prevComponents.map(comp => ({ 
        ...comp, 
        visible: comp.mesh.visible 
      }))
    );

    const visibleComponents = components.filter(c => c.mesh.visible).map(c => c.name);
    console.log('✅ Final visible components:', visibleComponents);

  }, [selectedValues, components, configuratorData, isInitialized]);

  // Subtle animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.03;
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

const ThreeJSPreview: React.FC<ThreeJSPreviewProps> = ({ 
  configuratorData, 
  onComponentsLoaded 
}) => {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [modelComponents, setModelComponents] = useState<ModelComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const handleComponentsLoaded = useCallback((components: ModelComponent[]) => {
    console.log('📦 Components loaded in preview:', components.length);
    
    setModelComponents(components);
    setIsLoading(false);
    
    // Notify parent component
    if (onComponentsLoaded) {
      onComponentsLoaded(components);
    }
    
    // Initialize default selections for all non-group options
    const defaultSelections: Record<string, string> = {};
    configuratorData.options.forEach(option => {
      if (!option.isGroup) {
        const validValues = option.values.filter(Boolean);
        if (validValues.length > 0) {
          defaultSelections[option.id] = validValues[0].id;
        }
      }
    });
    
    // Initialize expanded groups
    const initialExpandedGroups = new Set<string>();
    configuratorData.options.forEach(option => {
      if (option.isGroup && option.groupData?.isExpanded) {
        initialExpandedGroups.add(option.id);
      }
    });
    setExpandedGroups(initialExpandedGroups);
    
    if (Object.keys(defaultSelections).length > 0) {
      setSelectedValues(defaultSelections);
      console.log('🎯 Default selections set:', defaultSelections);
    }
  }, [onComponentsLoaded, configuratorData.options]);

  const handleValueChange = useCallback((optionId: string, valueId: string) => {
    console.log(`🔄 Option changed: ${optionId} → ${valueId}`);
    setSelectedValues(prev => ({
      ...prev,
      [optionId]: valueId
    }));
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Get visible options based on conditional logic (excluding groups)
  const visibleOptions = ConditionalLogicEngine.getVisibleOptions(
    configuratorData.options.filter(opt => !opt.isGroup),
    selectedValues
  );

  // Helper function to get option image styles with proper padding and no background
  const getOptionImageStyles = (imageSettings?: ImageSettings) => {
    if (!imageSettings) {
      return {
        containerStyle: { width: '80px', height: '80px' },
        imageClass: 'object-cover'
      };
    }
    
    let baseSizePx = 80;
    
    switch (imageSettings.size) {
      case 'x-small': baseSizePx = 48; break;
      case 'small': baseSizePx = 64; break;
      case 'medium': baseSizePx = 80; break;
      case 'large': baseSizePx = 96; break;
      case 'x-large': baseSizePx = 128; break;
    }

    let containerStyle: React.CSSProperties = {};
    let imageClass = 'object-cover';

    // Handle aspect ratios with precise container sizing
    switch (imageSettings.aspectRatio) {
      case 'square':
        containerStyle = {
          width: `${baseSizePx}px`,
          height: `${baseSizePx}px`
        };
        imageClass = 'object-cover';
        break;
      case 'round':
        containerStyle = {
          width: `${baseSizePx}px`,
          height: `${baseSizePx}px`
        };
        imageClass = 'object-cover';
        break;
      case '3:2':
        containerStyle = {
          width: `${baseSizePx}px`,
          height: `${Math.round(baseSizePx * 2 / 3)}px`
        };
        imageClass = 'object-cover';
        break;
      case '2:3':
        containerStyle = {
          width: `${Math.round(baseSizePx * 2 / 3)}px`,
          height: `${baseSizePx}px`
        };
        imageClass = 'object-cover';
        break;
      case 'auto':
        containerStyle = {
          width: 'auto',
          height: 'auto',
          maxWidth: `${baseSizePx}px`,
          maxHeight: `${baseSizePx}px`
        };
        imageClass = 'object-contain';
        break;
    }

    // Handle corner styles
    let borderRadius = '0px';
    switch (imageSettings.cornerStyle) {
      case 'squared': 
        borderRadius = '0px'; 
        break;
      case 'soft': 
        borderRadius = '4px'; 
        break;
      case 'softer': 
        borderRadius = '8px'; 
        break;
    }

    // Force round shape for round aspect ratio
    if (imageSettings.aspectRatio === 'round') {
      borderRadius = '50%';
    }

    containerStyle.borderRadius = borderRadius;

    return {
      containerStyle,
      imageClass
    };
  };

  const renderOption = (option: any) => {
    const visibleValues = ConditionalLogicEngine.getVisibleOptionValues(
      option,
      selectedValues,
      configuratorData.options.filter(opt => !opt.isGroup)
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
            {visibleValues.map((value: any) => {
              const { containerStyle, imageClass } = getOptionImageStyles(option.imageSettings);
              
              return (
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
                    {/* Image container with proper padding to prevent clipping and no background */}
                    <div className="p-2">
                      {value.image ? (
                        <div
                          className="overflow-hidden flex items-center justify-center"
                          style={containerStyle}
                        >
                          <img
                            src={value.image}
                            alt={value.name}
                            className={`w-full h-full ${imageClass}`}
                            style={{ borderRadius: containerStyle.borderRadius }}
                          />
                        </div>
                      ) : (
                        <div 
                          className="bg-gray-700 flex items-center justify-center"
                          style={containerStyle}
                        >
                          <ImageIcon className="w-6 h-6 text-gray-500" />
                        </div>
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

                  {/* Conditional Logic Indicator */}
                  {value.conditionalLogic?.enabled && (
                    <div className="absolute top-1 right-1 bg-orange-600 text-white p-1 rounded-full">
                      <Zap className="w-2 h-2" />
                    </div>
                  )}
                </button>
              );
            })}
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
                
                {/* Conditional Logic Indicator */}
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

  // FIXED: Organize options by groups for display - ensuring standalone options are shown
  const organizeOptionsForDisplay = () => {
    const organized: any[] = [];
    const processedOptionIds = new Set<string>();

    // First, process groups and their options
    configuratorData.options.forEach(option => {
      if (processedOptionIds.has(option.id)) return;

      if (option.isGroup && option.groupData) {
        // Find all visible options that belong to this group
        const groupedOptions = visibleOptions.filter(opt => opt.groupId === option.id);
        
        if (groupedOptions.length > 0) {
          organized.push({
            type: 'group',
            group: option,
            options: groupedOptions
          });
        }
        
        // Mark grouped options as processed
        groupedOptions.forEach(opt => processedOptionIds.add(opt.id));
      }
      
      processedOptionIds.add(option.id);
    });

    // CRITICAL FIX: Add standalone options (not in groups) - this was missing before
    const standaloneOptions = visibleOptions.filter(opt => !opt.groupId && !processedOptionIds.has(opt.id));
    standaloneOptions.forEach(option => {
      organized.push({
        type: 'option',
        option
      });
      processedOptionIds.add(option.id);
    });

    return organized;
  };

  return (
    <div className="h-full flex flex-col">
      {/* 3D Canvas - 50% screen height */}
      <div className="relative" style={{ height: '50vh' }}>
        <Canvas shadows>
          <PerspectiveCamera 
            makeDefault 
            position={[2, 1.5, 3]} 
            fov={45}
            near={0.1}
            far={100}
          />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={1.5}
            maxDistance={8}
            maxPolarAngle={Math.PI * 0.75}
            minPolarAngle={Math.PI * 0.25}
            target={[0, 0, 0]}
            enableDamping={true}
            dampingFactor={0.05}
          />
          
          {/* Professional lighting setup */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.8} />
          <pointLight position={[0, 10, 0]} intensity={0.6} />
          <spotLight 
            position={[0, 8, 4]} 
            intensity={1} 
            angle={0.4} 
            penumbra={0.5} 
            castShadow
          />
          
          <Environment preset="studio" />
          
          {/* Single model instance */}
          <GLBModel 
            key={configuratorData.model} // Force remount on model change
            modelUrl={configuratorData.model}
            selectedValues={selectedValues}
            onComponentsLoaded={handleComponentsLoaded}
            configuratorData={configuratorData}
          />
        </Canvas>
        
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
              {visibleOptions.length} of {configuratorData.options.filter(opt => !opt.isGroup).length} options visible
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

      {/* Options Panel - 50% screen height with clean design */}
      <div className="bg-gray-900 flex flex-col" style={{ height: '50vh' }}>
        <div className="flex-1 overflow-auto p-6">
          {organizeOptionsForDisplay().length === 0 ? (
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
                {configuratorData.options.filter(opt => !opt.isGroup).length > 0 
                  ? 'Options are hidden by conditional logic'
                  : 'Add options in the left panel to see them here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {organizeOptionsForDisplay().map((item, index) => {
                if (item.type === 'group') {
                  const { group, options } = item;
                  const isExpanded = expandedGroups.has(group.id);
                  
                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Group Header */}
                      <div 
                        className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-xl border border-purple-700/50 cursor-pointer hover:border-purple-600/50 transition-colors"
                        onClick={() => toggleGroup(group.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-600/20 rounded-lg border border-purple-500/30">
                              <FolderOpen className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold text-lg flex items-center space-x-2">
                                <span>{group.name}</span>
                                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full font-medium border border-purple-500/30">
                                  {options.length} options
                                </span>
                              </h3>
                              {group.description && (
                                <p className="text-purple-200/80 text-sm mt-1">{group.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-purple-400">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Group Options */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-6 space-y-6 border-l-2 border-purple-500/20 pl-6"
                        >
                          {options.map((option: any) => (
                            <motion.div
                              key={option.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="space-y-4"
                            >
                              {renderOption(option)}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                } else {
                  // Standalone option
                  const { option } = item;
                  return (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {renderOption(option)}
                    </motion.div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreeJSPreview;