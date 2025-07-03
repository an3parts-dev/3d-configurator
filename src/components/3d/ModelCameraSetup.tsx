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
  viewportCoverage = 0.75, // 75% of viewport by default
  verticalOffset = 0.1
}) => {
  const { camera, size } = useThree();
  const modelRef = useRef<THREE.Group>(null);
  const setupComplete = useRef(false);

  useEffect(() => {
    if (!model || setupComplete.current) return;

    console.log('🎯 Setting up model camera positioning for 75% viewport coverage...');

    // Calculate model bounding box
    const box = new THREE.Box3().setFromObject(model);
    const modelSize = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    console.log('📏 Model bounds:', {
      size: { x: modelSize.x.toFixed(2), y: modelSize.y.toFixed(2), z: modelSize.z.toFixed(2) },
      center: { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) }
    });

    // Center the model at origin
    model.position.sub(center);
    console.log('📍 Model centered at origin');

    // Get camera FOV in radians
    const fov = (camera as THREE.PerspectiveCamera).fov * Math.PI / 180;
    
    // Calculate viewport dimensions at distance 1
    const viewportHeight = 2 * Math.tan(fov / 2);
    const viewportWidth = viewportHeight * (size.width / size.height);
    
    console.log('📺 Viewport dimensions:', {
      width: viewportWidth.toFixed(2),
      height: viewportHeight.toFixed(2),
      aspect: (size.width / size.height).toFixed(2)
    });

    // Calculate the maximum dimension of the model
    const maxModelDimension = Math.max(modelSize.x, modelSize.y, modelSize.z);
    
    // Calculate target size based on viewport coverage
    // We want the model to cover viewportCoverage% of the smaller viewport dimension
    const targetViewportDimension = Math.min(viewportWidth, viewportHeight);
    const targetModelSize = targetViewportDimension * viewportCoverage;
    
    // Calculate scale factor
    const scale = targetModelSize / maxModelDimension;
    model.scale.setScalar(scale);
    
    console.log(`🔍 Model scaled by factor: ${scale.toFixed(3)} to cover ${(viewportCoverage * 100)}% of viewport`);

    // Calculate optimal camera distance
    // We need to position the camera so the scaled model fits properly
    const scaledModelSize = modelSize.multiplyScalar(scale);
    const maxScaledDimension = Math.max(scaledModelSize.x, scaledModelSize.y, scaledModelSize.z);
    
    // Calculate distance needed for the model to appear at the desired size
    const distance = maxScaledDimension / (2 * Math.tan(fov / 2) * viewportCoverage);
    
    // Add some padding to ensure the model is fully visible
    const paddedDistance = distance * 1.2;
    
    // Calculate camera height with vertical offset
    const height = scaledModelSize.y * verticalOffset + paddedDistance * 0.2;
    
    // Position camera for optimal viewing angle
    // Slightly offset to create a more dynamic view
    camera.position.set(
      paddedDistance * 0.6,  // Slightly to the right
      height,                // Elevated view
      paddedDistance         // Main distance from model
    );

    // Make camera look at the model center (now at origin)
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    console.log('📷 Camera positioned at:', {
      x: camera.position.x.toFixed(2),
      y: camera.position.y.toFixed(2),
      z: camera.position.z.toFixed(2),
      distance: paddedDistance.toFixed(2)
    });

    console.log('✅ Model setup complete - covers 75% of viewport');

    setupComplete.current = true;
  }, [model, camera, size, viewportCoverage, verticalOffset]);

  // Optional auto-rotation
  useFrame((state) => {
    if (enableAutoRotation && modelRef.current) {
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * rotationSpeed) * 0.03;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={model} />
    </group>
  );
};

export default ModelCameraSetup;