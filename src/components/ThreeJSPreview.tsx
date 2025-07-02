import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { motion } from 'framer-motion';
import { Zap, Image as ImageIcon, Maximize2 } from 'lucide-react';
import * as THREE from 'three';
import { ConfiguratorData, ModelComponent } from '../types/ConfiguratorTypes';
import { ConditionalLogicEngine } from '../utils/ConditionalLogicEngine';
import { ModelSceneManager } from '../utils/ModelSceneManager';
import { OptionRenderer } from './OptionRenderer';

interface ThreeJSPreviewProps {
  configuratorData: ConfiguratorData;
  onComponentsLoaded?: (components: ModelComponent[]) => void;
}

// Enhanced GLB Model Component with precise component targeting
const GLBModel = ({ 
  modelUrl, 
  selectedValues, 
  onComponentsLoaded,
  configuratorData,
  onScaleInfo,
  onSelectionChange
}: { 
  modelUrl: string;
  selectedValues: Record<string, string>;
  onComponentsLoaded: (components: ModelComponent[]) => void;
  configuratorData: ConfiguratorData;
  onScaleInfo: (info: { originalSize: number; scaledSize: number; scaleFactor: number }) => void;
  onSelectionChange: (optionId: string, valueId: string) => void;
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
      
      // Scale the model to ideal size - increased from 4 to 8 for better visibility
      const maxDimension = Math.max(size.x, size.y, size.z);
      const targetSize = 8; // Increased from 4 to 8 for ideal viewing size
      const scaleFactor = targetSize / maxDimension;
      gltf.scene.scale.setScalar(scaleFactor);
      
      // Report scale information
      onScaleInfo({
        originalSize: maxDimension,
        scaledSize: targetSize,
        scaleFactor: scaleFactor
      });
      
      console.log(`📏 Model scaling: ${maxDimension.toFixed(2)} → ${targetSize} (${scaleFactor.toFixed(2)}x)`);
      
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
  }, [gltf, isInitialized, onComponentsLoaded, onScaleInfo]);

  // Apply configuration changes when selections change
  useEffect(() => {
    if (!isInitialized || components.length === 0) return;

    console.log('🎛️ Applying configuration changes:', selectedValues);

    // Apply model scene changes using the new manager
    ModelSceneManager.applyConfiguration(
      components,
      configuratorData,
      selectedValues,
      onSelectionChange
    );

    // Update component state for UI
    setComponents(prevComponents => 
      prevComponents.map(comp => ({ 
        ...comp, 
        visible: comp.mesh.visible 
      }))
    );

    const visibleComponents = components.filter(c => c.mesh.visible).map(c => c.name);
    console.log('✅ Final visible components:', visibleComponents);

  }, [selectedValues, components, configuratorData, isInitialized, onSelectionChange]);

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
  const [scaleInfo, setScaleInfo] = useState<{
    originalSize: number;
    scaledSize: number;
    scaleFactor: number;
  } | null>(null);

  const handleComponentsLoaded = useCallback((components: ModelComponent[]) => {
    console.log('📦 Components loaded in preview:', components.length);
    
    setModelComponents(components);
    setIsLoading(false);
    
    // Notify parent component
    if (onComponentsLoaded) {
      onComponentsLoaded(components);
    }
    
    // Initialize default selections for all options
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
  }, [onComponentsLoaded, configuratorData.options]);

  const handleValueChange = useCallback((optionId: string, valueId: string) => {
    console.log(`🔄 Option changed: ${optionId} → ${valueId}`);
    setSelectedValues(prev => ({
      ...prev,
      [optionId]: valueId
    }));
  }, []);

  const handleScaleInfo = useCallback((info: { originalSize: number; scaledSize: number; scaleFactor: number }) => {
    setScaleInfo(info);
  }, []);

  // Get visible options based on conditional logic
  const visibleOptions = ConditionalLogicEngine.getVisibleOptions(
    configuratorData.options,
    selectedValues
  );

  return (
    <div className="h-full flex flex-col">
      {/* 3D Canvas - 50% screen height */}
      <div className="relative" style={{ height: '50vh' }}>
        <Canvas shadows>
          <PerspectiveCamera 
            makeDefault 
            position={[3, 2, 4]} 
            fov={45}
            near={0.1}
            far={100}
          />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={2}
            maxDistance={12}
            maxPolarAngle={Math.PI * 0.75}
            minPolarAngle={Math.PI * 0.25}
            target={[0, 0, 0]}
            enableDamping={true}
            dampingFactor={0.05}
          />
          
          {/* Enhanced professional lighting setup for better contrast */}
          <ambientLight intensity={0.6} color="#ffffff" />
          
          {/* Key light - main directional light */}
          <directionalLight 
            position={[8, 8, 8]} 
            intensity={1.5} 
            color="#ffffff"
            castShadow 
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          
          {/* Fill lights from multiple directions for even illumination */}
          <directionalLight position={[-8, 6, -8]} intensity={0.8} color="#f0f8ff" />
          <directionalLight position={[8, 6, -8]} intensity={0.7} color="#fff8f0" />
          <directionalLight position={[-8, 6, 8]} intensity={0.7} color="#f8fff0" />
          
          {/* Rim lights for edge definition */}
          <pointLight position={[0, 12, 0]} intensity={0.8} color="#ffffff" />
          <pointLight position={[0, -8, 0]} intensity={0.4} color="#e6f3ff" />
          
          {/* Accent lights for depth */}
          <spotLight 
            position={[6, 10, 6]} 
            intensity={1.2} 
            angle={0.3} 
            penumbra={0.4} 
            color="#ffffff"
            castShadow
          />
          <spotLight 
            position={[-6, 10, -6]} 
            intensity={0.8} 
            angle={0.4} 
            penumbra={0.5} 
            color="#f0f8ff"
          />
          
          <Environment preset="studio" />
          
          {/* Single model instance */}
          <GLBModel 
            key={configuratorData.model} // Force remount on model change
            modelUrl={configuratorData.model}
            selectedValues={selectedValues}
            onComponentsLoaded={handleComponentsLoaded}
            configuratorData={configuratorData}
            onScaleInfo={handleScaleInfo}
            onSelectionChange={handleValueChange}
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
        
        {/* Enhanced info overlays */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md rounded-xl px-5 py-4 border border-gray-600">
          <p className="text-white text-sm font-semibold mb-2 flex items-center">
            <Maximize2 className="w-4 h-4 mr-2 text-blue-400" />
            3D Model Preview
          </p>
          <div className="space-y-2 text-xs text-gray-300">
            <div className="flex items-center justify-between space-x-4">
              <span>Components:</span>
              <span className="font-medium">{modelComponents.length}</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Visible:
              </span>
              <span className="font-medium">{modelComponents.filter(c => c.visible).length}</span>
            </div>
            {scaleInfo && (
              <>
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex items-center justify-between space-x-4">
                    <span>Scale Factor:</span>
                    <span className="font-medium text-blue-300">{scaleInfo.scaleFactor.toFixed(2)}x</span>
                  </div>
                  <div className="flex items-center justify-between space-x-4">
                    <span>Original Size:</span>
                    <span className="font-medium">{scaleInfo.originalSize.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between space-x-4">
                    <span>Scaled Size:</span>
                    <span className="font-medium text-green-300">{scaleInfo.scaledSize}</span>
                  </div>
                </div>
              </>
            )}
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

      {/* Options Panel - 50% screen height with clean design */}
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
                  <OptionRenderer
                    option={option}
                    selectedValue={selectedValues[option.id]}
                    onValueChange={handleValueChange}
                    allOptions={configuratorData.options}
                    selectedValues={selectedValues}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreeJSPreview;