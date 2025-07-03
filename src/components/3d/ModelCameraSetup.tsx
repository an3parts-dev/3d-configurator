import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ModelCameraSetupProps {
  model: THREE.Object3D;
  enableAutoRotation?: boolean;
  rotationSpeed?: number;
  cameraDistance?: number;
  verticalOffset?: number;
}

/**
 * Reusable component that automatically centers and scales models
 * and positions the camera optimally based on model bounds
 */
const ModelCameraSetup: React.FC<ModelCameraSetupProps> = ({
  model,
  enableAutoRotation = true,
  rotationSpeed = 0.15,
  cameraDistance = 1.5,
  verticalOffset = 0.1
}) => {
  const { camera, scene } = useThree();
  const modelRef = useRef<THREE.Group>(null);
  const setupComplete = useRef(false);

  useEffect(() => {
    if (!model || setupComplete.current) return;

    console.log('🎯 Setting up model camera positioning...');

    // Calculate model bounding box
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    console.log('📏 Model bounds:', {
      size: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
      center: { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) }
    });

    // Center the model at origin
    model.position.sub(center);
    console.log('📍 Model centered at origin');

    // Calculate optimal scale to fit in viewport
    const maxDimension = Math.max(size.x, size.y, size.z);
    const targetSize = 3; // Target size in world units
    const scale = targetSize / maxDimension;
    model.scale.setScalar(scale);
    console.log(`🔍 Model scaled by factor: ${scale.toFixed(3)}`);

    // Calculate optimal camera position
    const scaledSize = size.multiplyScalar(scale);
    const maxScaledDimension = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);
    
    // Position camera based on model size and desired distance
    const distance = maxScaledDimension * cameraDistance + 2;
    const height = scaledSize.y * verticalOffset + distance * 0.3;
    
    // Set camera position for optimal viewing angle
    camera.position.set(
      distance * 0.8,  // Slightly to the right
      height,          // Elevated view
      distance         // Distance from model
    );

    // Make camera look at the model center (now at origin)
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    console.log('📷 Camera positioned at:', {
      x: camera.position.x.toFixed(2),
      y: camera.position.y.toFixed(2),
      z: camera.position.z.toFixed(2)
    });

    setupComplete.current = true;
  }, [model, camera, cameraDistance, verticalOffset]);

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