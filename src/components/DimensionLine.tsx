import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { DimensionLine as DimensionLineType } from '../types/MeasurementTypes';

interface DimensionLineProps {
  dimension: DimensionLineType;
  camera: THREE.Camera;
}

const DimensionLine: React.FC<DimensionLineProps> = ({ dimension, camera }) => {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<any>(null);

  // Calculate line geometry and positions
  const { 
    mainLinePoints, 
    extensionLine1Points, 
    extensionLine2Points, 
    arrowPositions, 
    textPosition 
  } = useMemo(() => {
    const start = new THREE.Vector3(...dimension.startPoint);
    const end = new THREE.Vector3(...dimension.endPoint);
    const direction = end.clone().sub(start).normalize();
    
    // Calculate offset for dimension line (perpendicular to the line)
    const perpendicular = new THREE.Vector3(0, 1, 0);
    if (Math.abs(direction.dot(perpendicular)) > 0.9) {
      perpendicular.set(1, 0, 0); // Use X if line is vertical
    }
    perpendicular.cross(direction).normalize();
    
    const offset = perpendicular.multiplyScalar(0.3); // Offset distance
    
    // Main dimension line points (offset from actual measurement points)
    const offsetStart = start.clone().add(offset);
    const offsetEnd = end.clone().add(offset);
    
    // Extension lines (from measurement points to dimension line)
    const extensionOffset = perpendicular.clone().multiplyScalar(0.1);
    const ext1Start = start.clone().sub(extensionOffset);
    const ext1End = offsetStart.clone().add(extensionOffset);
    const ext2Start = end.clone().sub(extensionOffset);
    const ext2End = offsetEnd.clone().add(extensionOffset);
    
    // Arrow positions (slightly inset from dimension line ends)
    const arrowInset = 0.08;
    const lineDirection = offsetEnd.clone().sub(offsetStart).normalize();
    const arrowStart = offsetStart.clone().add(lineDirection.clone().multiplyScalar(arrowInset));
    const arrowEnd = offsetEnd.clone().sub(lineDirection.clone().multiplyScalar(arrowInset));
    
    // Text position (center of dimension line, slightly offset)
    const textPos = offsetStart.clone().lerp(offsetEnd, 0.5);
    textPos.add(perpendicular.clone().multiplyScalar(0.15));
    
    return {
      mainLinePoints: [offsetStart, offsetEnd],
      extensionLine1Points: [ext1Start, ext1End],
      extensionLine2Points: [ext2Start, ext2End],
      arrowPositions: { start: arrowStart, end: arrowEnd, direction: lineDirection },
      textPosition: textPos
    };
  }, [dimension.startPoint, dimension.endPoint]);

  // Create arrow geometry
  const arrowGeometry = useMemo(() => {
    return new THREE.ConeGeometry(0.03, 0.1, 6);
  }, []);

  // Update text to face camera
  useFrame(() => {
    if (textRef.current && camera) {
      textRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main dimension line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              ...mainLinePoints[0].toArray(),
              ...mainLinePoints[1].toArray()
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={dimension.color} linewidth={3} />
      </line>
      
      {/* Extension line 1 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              ...extensionLine1Points[0].toArray(),
              ...extensionLine1Points[1].toArray()
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={dimension.color} linewidth={1} opacity={0.7} transparent />
      </line>
      
      {/* Extension line 2 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              ...extensionLine2Points[0].toArray(),
              ...extensionLine2Points[1].toArray()
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={dimension.color} linewidth={1} opacity={0.7} transparent />
      </line>

      {/* Start arrow */}
      <mesh
        position={arrowPositions.start}
        geometry={arrowGeometry}
        lookAt={arrowPositions.start.clone().add(arrowPositions.direction)}
      >
        <meshBasicMaterial color={dimension.color} />
      </mesh>

      {/* End arrow */}
      <mesh
        position={arrowPositions.end}
        geometry={arrowGeometry}
        lookAt={arrowPositions.end.clone().sub(arrowPositions.direction)}
      >
        <meshBasicMaterial color={dimension.color} />
      </mesh>

      {/* Dimension label */}
      <Text
        ref={textRef}
        position={textPosition}
        fontSize={0.12}
        color={dimension.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
      >
        {dimension.label}
      </Text>
    </group>
  );
};

export default DimensionLine;