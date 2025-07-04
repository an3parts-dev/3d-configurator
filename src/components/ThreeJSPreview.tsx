import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { motion } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import * as THREE from 'three';
import { ConfiguratorData, ModelComponent } from '../types/ConfiguratorTypes';
import { ConditionalLogicEngine } from '../utils/ConditionalLogicEngine';
import { LoadingSpinner, EmptyState } from './ui';
import { ModelInfoOverlays, OptionRenderer, GroupRenderer } from './preview';
import { ModelCameraSetup } from './3d';
import { Layers } from 'lucide-react';

interface ThreeJSPreviewProps {
  configuratorData: ConfiguratorData;
  onComponentsLoaded?: (components: ModelComponent[]) => void;
  isPreviewMode?: boolean;
  onTogglePreviewMode?: () => void;
}

// Enhanced GLB Model Component with automatic camera setup
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
  const [components, setComponents] = useState<ModelComponent[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [renderModel, setRenderModel] = useState<THREE.Object3D | null>(null);
  
  // Load the GLB model once
  const gltf = useLoader(GLTFLoader, modelUrl);

  // Initialize components only once when model loads
  useEffect(() => {
    if (gltf && gltf.scene && !isInitialized) {
      console.log('🔄 Initializing 3D model components...');
      
      const modelComponents: ModelComponent[] = [];
      
      // Use the original scene for rendering (don't modify it for camera setup)
      setRenderModel(gltf.scene);
      
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

  if (!gltf || !isInitialized || !renderModel) {
    return null;
  }

  return (
    <ModelCameraSetup 
      model={renderModel}
      enableAutoRotation={true}
      rotationSpeed={0.15}
      viewportCoverage={0.8}
      verticalOffset={0.1}
    />
  );
};

const ThreeJSPreview: React.FC<ThreeJSPreviewProps> = ({ 
  configuratorData, 
  onComponentsLoaded,
  isPreviewMode = false,
  onTogglePreviewMode
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

  // Helper function to get visible option values
  const getVisibleOptionValues = useCallback((option: any) => {
    return ConditionalLogicEngine.getVisibleOptionValues(
      option,
      selectedValues,
      configuratorData.options.filter(opt => !opt.isGroup)
    );
  }, [selectedValues, configuratorData.options]);

  // Organize options by groups for display - PRESERVE ORIGINAL ORDER
  const organizeOptionsForDisplay = () => {
    const organized: any[] = [];
    const processedOptionIds = new Set<string>();

    // Process options in their original order from configuratorData.options
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
      } else if (!option.isGroup) {
        // Check if this option is visible and not in a group
        const isVisible = visibleOptions.some(visOpt => visOpt.id === option.id);
        if (isVisible && !option.groupId) {
          organized.push({
            type: 'option',
            option
          });
        }
      }
      
      processedOptionIds.add(option.id);
    });

    return organized;
  };

  return (
    <div className="h-full flex flex-col">
      {/* 3D Canvas - Responsive height with white background */}
      <div className="relative h-[40vh] sm:h-[45vh] lg:h-[50vh]">
        <Canvas shadows gl={{ alpha: false }} style={{ background: 'white' }}>
          <color attach="background" args={['white']} />
          <PerspectiveCamera 
            makeDefault 
            position={[5, 3, 5]} 
            fov={20}
            near={0.1}
            far={100}
          />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={1}
            maxDistance={20}
            maxPolarAngle={Math.PI * 0.8}
            minPolarAngle={Math.PI * 0.1}
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
          
          {/* Single model instance with automatic camera setup */}
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
            <LoadingSpinner 
              size="lg" 
              text="Loading 3D Model" 
              subText="Analyzing components..." 
            />
          </div>
        )}
        
        {/* Info overlays */}
        <ModelInfoOverlays
          modelComponents={modelComponents}
          configuratorData={configuratorData}
          visibleOptionsCount={visibleOptions.length}
        />

        {/* Fullscreen Preview Button - Only show when not in preview mode */}
        {!isPreviewMode && onTogglePreviewMode && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={onTogglePreviewMode}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
              title="Fullscreen Preview"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Exit Fullscreen Button - Only show when in preview mode */}
        {isPreviewMode && onTogglePreviewMode && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={onTogglePreviewMode}
              className="bg-red-500/90 backdrop-blur-sm text-white hover:bg-red-600 p-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
              title="Exit Fullscreen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Options Panel - Updated with bright/dark theme */}
      <div className="bg-white dark:bg-gray-900 flex flex-col h-[60vh] sm:h-[55vh] lg:h-[50vh]">
        <div className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 bg-gray-50 dark:bg-gray-800">
          {organizeOptionsForDisplay().length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No options available"
              description={
                configuratorData.options.filter(opt => !opt.isGroup).length > 0 
                  ? 'Options are hidden by conditional logic'
                  : 'Add options in the left panel to see them here'
              }
              className="py-8 sm:py-12"
            />
          ) : (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {organizeOptionsForDisplay().map((item, index) => {
                if (item.type === 'group') {
                  const { group, options } = item;
                  const isExpanded = expandedGroups.has(group.id);
                  
                  return (
                    <GroupRenderer
                      key={group.id}
                      group={group}
                      options={options}
                      isExpanded={isExpanded}
                      selectedValues={selectedValues}
                      onToggleGroup={toggleGroup}
                      onValueChange={handleValueChange}
                      getVisibleOptionValues={getVisibleOptionValues}
                    />
                  );
                } else {
                  // Standalone option
                  const { option } = item;
                  return (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 sm:space-y-4"
                    >
                      <OptionRenderer
                        option={option}
                        visibleValues={getVisibleOptionValues(option)}
                        selectedValues={selectedValues}
                        onValueChange={handleValueChange}
                      />
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