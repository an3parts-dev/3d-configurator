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
  const lineRef = useRef<THREE.Line>(null);
  const arrowStartRef = useRef<THREE.Mesh>(null);
  const arrowEndRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null);

  // Calculate line geometry and arrow positions
  const { lineGeometry, arrowPositions, textPosition, lineDirection } = useMemo(() => {
    const start = new THREE.Vector3(...dimension.startPoint);
    const end = new THREE.Vector3(...dimension.endPoint);
    const direction = end.clone().sub(start).normalize();
    
    // Offset the dimension line slightly away from the object
    const offset = new THREE.Vector3(0, 0.5, 0); // Offset upward
    const offsetStart = start.clone().add(offset);
    const offsetEnd = end.clone().add(offset);
    
    // Create line geometry
    const points = [offsetStart, offsetEnd];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Calculate arrow positions (slightly inset from line ends)
    const arrowOffset = 0.1;
    const arrowStart = offsetStart.clone().add(direction.clone().multiplyScalar(arrowOffset));
    const arrowEnd = offsetEnd.clone().sub(direction.clone().multiplyScalar(arrowOffset));
    
    // Text position (center of line, slightly above)
    const textPos = offsetStart.clone().lerp(offsetEnd, 0.5).add(new THREE.Vector3(0, 0.2, 0));
    
    return {
      lineGeometry: geometry,
      arrowPositions: { start: arrowStart, end: arrowEnd },
      textPosition: textPos,
      lineDirection: direction
    };
  }, [dimension.startPoint, dimension.endPoint]);

  // Create arrow geometry
  const arrowGeometry = useMemo(() => {
    return new THREE.ConeGeometry(0.05, 0.15, 8);
  }, []);

  // Update arrow orientations
  useFrame(() => {
    if (arrowStartRef.current && arrowEndRef.current) {
      // Point arrows toward each other
      arrowStartRef.current.lookAt(arrowPositions.end);
      arrowEndRef.current.lookAt(arrowPositions.start);
      
      // Rotate arrows to point along the line
      arrowStartRef.current.rotateX(Math.PI / 2);
      arrowEndRef.current.rotateX(-Math.PI / 2);
    }

    // Make text face camera
    if (textRef.current && camera) {
      textRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main dimension line */}
      <line ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial color={dimension.color} linewidth={2} />
      </line>
      
      {/* Extension lines */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              ...dimension.startPoint,
              dimension.startPoint[0], dimension.startPoint[1] + 0.5, dimension.startPoint[2]
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={dimension.color} linewidth={1} opacity={0.7} transparent />
      </line>
      
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              ...dimension.endPoint,
              dimension.endPoint[0], dimension.endPoint[1] + 0.5, dimension.endPoint[2]
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={dimension.color} linewidth={1} opacity={0.7} transparent />
      </line>

      {/* Start arrow */}
      <mesh
        ref={arrowStartRef}
        position={arrowPositions.start}
        geometry={arrowGeometry}
      >
        <meshBasicMaterial color={dimension.color} />
      </mesh>

      {/* End arrow */}
      <mesh
        ref={arrowEndRef}
        position={arrowPositions.end}
        geometry={arrowGeometry}
      >
        <meshBasicMaterial color={dimension.color} />
      </mesh>

      {/* Dimension label */}
      <Text
        ref={textRef}
        position={textPosition}
        fontSize={0.15}
        color={dimension.color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-medium.woff"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {dimension.label}
      </Text>
    </group>
  );
};

export default DimensionLine;