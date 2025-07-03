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

    // Create a clone to avoid modifying the original
    const modelClone = model.clone();
    
    // Calculate model bounding box
    const box = new THREE.Box3().setFromObject(modelClone);
    const modelSize = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    console.log('📏 Model bounds:', {
      size: { x: modelSize.x.toFixed(2), y: modelSize.y.toFixed(2), z: modelSize.z.toFixed(2) },
      center: { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) }
    });

    // Center the model at origin
    model.position.sub(center);
    console.log('📍 Model centered at origin');

    // Get camera properties
    const camera3D = camera as THREE.PerspectiveCamera;
    const fov = camera3D.fov * Math.PI / 180;
    const aspect = size.width / size.height;
    
    // Calculate viewport dimensions at distance 1
    const viewportHeight = 2 * Math.tan(fov / 2);
    const viewportWidth = viewportHeight * aspect;
    
    console.log('📺 Viewport dimensions:', {
      width: viewportWidth.toFixed(2),
      height: viewportHeight.toFixed(2),
      aspect: aspect.toFixed(2),
      fov: camera3D.fov
    });

    // Calculate the maximum dimension of the model for proper scaling
    const maxModelDimension = Math.max(modelSize.x, modelSize.y, modelSize.z);
    
    // For 80% viewport coverage, we want the model to fill 80% of the viewport width
    const targetSize = viewportWidth * viewportCoverage;
    
    // Calculate scale factor to make the model fit the target size
    const scale = targetSize / maxModelDimension;
    model.scale.setScalar(scale);
    
    console.log(`🔍 Model scaled by factor: ${scale.toFixed(3)} to cover ${(viewportCoverage * 100)}% of viewport width`);

    // Calculate optimal camera distance
    // We need the scaled model to appear at the correct size in the viewport
    const scaledModelSize = modelSize.multiplyScalar(scale);
    const maxScaledDimension = Math.max(scaledModelSize.x, scaledModelSize.y, scaledModelSize.z);
    
    // Calculate distance so the model appears at the desired size
    // Using the horizontal dimension for width-based coverage
    const horizontalSize = Math.max(scaledModelSize.x, scaledModelSize.z);
    const distance = horizontalSize / (2 * Math.tan(fov / 2) * viewportCoverage);
    
    // Add padding to ensure full visibility and comfortable viewing
    const paddedDistance = distance * 1.3;
    
    // Calculate optimal camera height
    const height = scaledModelSize.y * 0.3 + paddedDistance * 0.15;
    
    // Position camera for optimal 3/4 view
    const cameraX = paddedDistance * 0.7;  // Slightly to the side
    const cameraY = height;                // Elevated view
    const cameraZ = paddedDistance * 0.8;  // Main distance
    
    camera.position.set(cameraX, cameraY, cameraZ);
    
    // Make camera look at the model center (now at origin)
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    console.log('📷 Camera positioned at:', {
      x: camera.position.x.toFixed(2),
      y: camera.position.y.toFixed(2),
      z: camera.position.z.toFixed(2),
      distance: paddedDistance.toFixed(2),
      targetSize: targetSize.toFixed(2)
    });

    console.log('✅ Model setup complete - covers 80% of viewport width');

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