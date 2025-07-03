import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ModelCameraSetupProps {
  model: THREE.Object3D;
  enableAutoRotation?: boolean;
  rotationSpeed?: number;
  viewportCoverage?: number; // Percentage of viewport to cover (0.0 - 1.0)
  verticalOffset?: number;
}

/**
 * Reusable component that automatically centers and scales models
 * and positions the camera optimally based on model bounds
 * Ensures the model covers a specific percentage of the viewport
 */
const ModelCameraSetup: React.FC<ModelCameraSetupProps> = ({
  model,
  enableAutoRotation = true,
  rotationSpeed = 0.15,
  viewportCoverage = 0.8, // 80% of viewport by default
  verticalOffset = 0.1
}) => {
  const { camera, size, gl } = useThree();
  const modelRef = useRef<THREE.Group>(null);
  const setupComplete = useRef(false);

  useEffect(() => {
    if (!model || setupComplete.current) return;

    console.log('🎯 Setting up model camera positioning for 80% viewport coverage...');

    // Step 1: Calculate original model bounds BEFORE any modifications
    const originalBox = new THREE.Box3().setFromObject(model);
    const originalSize = originalBox.getSize(new THREE.Vector3());
    const originalCenter = originalBox.getCenter(new THREE.Vector3());

    console.log('📏 Original model bounds:', {
      size: { x: originalSize.x.toFixed(2), y: originalSize.y.toFixed(2), z: originalSize.z.toFixed(2) },
      center: { x: originalCenter.x.toFixed(2), y: originalCenter.y.toFixed(2), z: originalCenter.z.toFixed(2) }
    });

    // Step 2: Center the model at origin
    model.position.copy(originalCenter.negate());
    console.log('📍 Model centered at origin');

    // Step 3: Calculate viewport dimensions and target size
    const camera3D = camera as THREE.PerspectiveCamera;
    const fov = camera3D.fov * Math.PI / 180;
    const aspect = size.width / size.height;
    
    // Step 4: Calculate how much space the model should occupy
    const maxOriginalDimension = Math.max(originalSize.x, originalSize.y, originalSize.z);
    
    // We want the model to appear to cover 80% of the viewport width
    // Calculate the scale needed to achieve this
    const targetWorldSize = 4; // Target size in world units
    const scale = targetWorldSize / maxOriginalDimension;
    model.scale.setScalar(scale);
    
    console.log(`🔍 Model scaled by factor: ${scale.toFixed(3)}`);

    // Step 5: Calculate optimal camera distance
    // After scaling, calculate the new model dimensions
    const scaledSize = originalSize.clone().multiplyScalar(scale);
    const maxScaledDimension = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);
    
    // Calculate distance so the scaled model covers the desired viewport percentage
    // Using trigonometry: distance = (model_size / 2) / tan(fov/2) / coverage_percentage
    const distance = (maxScaledDimension / 2) / Math.tan(fov / 2) / viewportCoverage;
    
    // Add some padding for comfortable viewing
    const finalDistance = distance * 1.2;
    
    // Step 6: Position camera for optimal viewing angle
    const cameraHeight = scaledSize.y * 0.4; // Slightly above center
    const cameraX = finalDistance * 0.6;     // Slightly to the side for 3/4 view
    const cameraZ = finalDistance * 0.8;     // Main viewing distance
    
    // Set camera position
    camera.position.set(cameraX, cameraHeight, cameraZ);
    
    // Make camera look at the model center (now at origin)
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    console.log('📷 Camera positioned at:', {
      x: camera.position.x.toFixed(2),
      y: camera.position.y.toFixed(2),
      z: camera.position.z.toFixed(2),
      distance: finalDistance.toFixed(2),
      scaledModelSize: maxScaledDimension.toFixed(2)
    });

    console.log('✅ Model setup complete - should cover 80% of viewport');

    setupComplete.current = true;
  }, [model, camera, size, viewportCoverage, verticalOffset]);

  // Optional auto-rotation with subtle movement
  useFrame((state) => {
    if (enableAutoRotation && modelRef.current) {
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * rotationSpeed) * 0.02;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={model} />
    </group>
  );
};

export default ModelCameraSetup;