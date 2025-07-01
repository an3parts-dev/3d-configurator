import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler, ArrowLeft, ArrowRight } from 'lucide-react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { MeasurePoint, LengthSettings } from '../types/ConfiguratorTypes';

interface LengthMeasurementOverlayProps {
  measurePoints: MeasurePoint[];
  lengthValue: number;
  lengthSettings: LengthSettings;
  isVisible: boolean;
}

const MeasurementLine: React.FC<{
  start: THREE.Vector3;
  end: THREE.Vector3;
  label: string;
  color?: string;
}> = ({ start, end, label, color = '#00ff00' }) => {
  const lineRef = useRef<THREE.BufferGeometry>(null);
  const { camera } = useThree();
  
  useEffect(() => {
    if (lineRef.current) {
      const points = [start, end];
      lineRef.current.setFromPoints(points);
    }
  }, [start, end]);

  // Calculate midpoint for label positioning
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  
  // Calculate distance for arrow positioning
  const direction = new THREE.Vector3().subVectors(end, start).normalize();
  const distance = start.distanceTo(end);
  
  // Arrow positions (slightly inward from endpoints)
  const arrowOffset = Math.min(distance * 0.1, 0.2);
  const startArrow = new THREE.Vector3().addVectors(start, direction.clone().multiplyScalar(arrowOffset));
  const endArrow = new THREE.Vector3().addVectors(end, direction.clone().multiplyScalar(-arrowOffset));

  return (
    <group>
      {/* Main measurement line */}
      <line>
        <bufferGeometry ref={lineRef} />
        <lineBasicMaterial color={color} linewidth={3} />
      </line>
      
      {/* Start indicator line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              start.x, start.y - 0.1, start.z,
              start.x, start.y + 0.1, start.z
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={2} />
      </line>
      
      {/* End indicator line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              end.x, end.y - 0.1, end.z,
              end.x, end.y + 0.1, end.z
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={2} />
      </line>
      
      {/* Arrow indicators */}
      <Html position={startArrow} center>
        <div className="pointer-events-none">
          <ArrowLeft className="w-4 h-4 text-green-400" />
        </div>
      </Html>
      
      <Html position={endArrow} center>
        <div className="pointer-events-none">
          <ArrowRight className="w-4 h-4 text-green-400" />
        </div>
      </Html>
      
      {/* Length label */}
      <Html position={midpoint} center>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-green-400/30 pointer-events-none"
        >
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{label}</div>
            <div className="text-xs text-gray-300">Length</div>
          </div>
        </motion.div>
      </Html>
    </group>
  );
};

const LengthMeasurementOverlay: React.FC<LengthMeasurementOverlayProps> = ({
  measurePoints,
  lengthValue,
  lengthSettings,
  isVisible
}) => {
  const [activeMeasurement, setActiveMeasurement] = useState<{
    start: THREE.Vector3;
    end: THREE.Vector3;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (!isVisible || measurePoints.length < 2) {
      setActiveMeasurement(null);
      return;
    }

    // Sort measure points by their relevance to the measurement type
    const sortedPoints = [...measurePoints].sort((a, b) => {
      const typeOrder = {
        'sealing_point': 1,
        'hex_surface': 2,
        'fitting_end': 3,
        'hose_end': 4
      };
      return typeOrder[a.type] - typeOrder[b.type];
    });

    let startPoint: MeasurePoint;
    let endPoint: MeasurePoint;

    switch (lengthSettings.measurementType) {
      case 'cc':
        // C/C measurement: sealing point to sealing point or hex surface to hex surface
        startPoint = sortedPoints.find(p => p.type === 'sealing_point' || p.type === 'hex_surface') || sortedPoints[0];
        endPoint = sortedPoints.reverse().find(p => p.type === 'sealing_point' || p.type === 'hex_surface') || sortedPoints[sortedPoints.length - 1];
        break;
      case 'total':
        // Total length: fitting end to fitting end
        startPoint = sortedPoints.find(p => p.type === 'fitting_end') || sortedPoints[0];
        endPoint = sortedPoints.reverse().find(p => p.type === 'fitting_end') || sortedPoints[sortedPoints.length - 1];
        break;
      case 'hose':
        // Hose length: hose end to hose end
        startPoint = sortedPoints.find(p => p.type === 'hose_end') || sortedPoints[0];
        endPoint = sortedPoints.reverse().find(p => p.type === 'hose_end') || sortedPoints[sortedPoints.length - 1];
        break;
      default:
        startPoint = sortedPoints[0];
        endPoint = sortedPoints[sortedPoints.length - 1];
    }

    if (startPoint && endPoint && startPoint.id !== endPoint.id) {
      const start = new THREE.Vector3(startPoint.position.x, startPoint.position.y, startPoint.position.z);
      const end = new THREE.Vector3(endPoint.position.x, endPoint.position.y, endPoint.position.z);
      
      const measurementTypeLabels = {
        'cc': 'C/C',
        'total': 'Total',
        'hose': 'Hose'
      };
      
      const label = `${lengthValue}${lengthSettings.unit} ${measurementTypeLabels[lengthSettings.measurementType]}`;
      
      setActiveMeasurement({ start, end, label });
    }
  }, [measurePoints, lengthValue, lengthSettings, isVisible]);

  if (!isVisible || !activeMeasurement) {
    return null;
  }

  return (
    <MeasurementLine
      start={activeMeasurement.start}
      end={activeMeasurement.end}
      label={activeMeasurement.label}
      color="#00ff00"
    />
  );
};

export default LengthMeasurementOverlay;