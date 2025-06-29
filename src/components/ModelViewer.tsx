import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PresentationControls, Html } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { Configuration } from '../types/Configuration';
import { Loader2, Maximize2, Minimize2 } from 'lucide-react';

interface ModelViewerProps {
  configuration: Configuration;
}

const BrakeLineModel: React.FC<{ configuration: Configuration }> = ({ configuration }) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/models/brakeline.glb');
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  // Apply configuration changes to model based on the documentation logic
  React.useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof Mesh) {
          const name = child.name.toLowerCase();
          let shouldShow = true;
          
          // Handle A-side components
          if (name.startsWith('a_')) {
            shouldShow = false; // Start with hidden, then show if conditions match
            
            // A-side fitting type logic
            if (configuration.fittingType.a === 'banjo' && name.includes('banjo')) {
              shouldShow = true;
            } else if (configuration.fittingType.a === 'swivel-male' && name.includes('pin_male') && name.includes('swivel')) {
              shouldShow = true;
            } else if (configuration.fittingType.a === 'fixed-male' && name.includes('male_fixed')) {
              shouldShow = true;
            } else if (configuration.fittingType.a === 'fixed-male-extended' && name.includes('fixed_male_extended')) {
              shouldShow = true;
            } else if (configuration.fittingType.a === 'fixed-bulkhead' && name.includes('bulkhead') && !name.includes('swivel')) {
              shouldShow = true;
            } else if (configuration.fittingType.a === 'swivel-female' && name.includes('pin_female') && name.includes('swivel')) {
              shouldShow = true;
            } else if (configuration.fittingType.a === 'swivel-female-circlip' && name.includes('female_swivel_circlip')) {
              shouldShow = true;
            } else if (configuration.fittingType.a === 'fixed-female' && name.includes('female_fixed')) {
              shouldShow = true;
            } else if (configuration.fittingType.a === 'swivel-bulkhead-female' && name.includes('swivel_bulkhead')) {
              shouldShow = true;
            } else if (configuration.fittingType.a === 'tee' && name.includes('tee')) {
              shouldShow = true;
            }

            // A-side fitting size logic (only for non-banjo fittings)
            if (shouldShow && configuration.fittingType.a !== 'banjo') {
              if (configuration.fittingSize.a.includes('convex') && !name.includes('cvx')) {
                shouldShow = false;
              } else if (configuration.fittingSize.a.includes('concave') && !name.includes('ccv')) {
                shouldShow = false;
              }
            }

            // A-side fitting angle logic
            if (shouldShow) {
              const angle = configuration.fittingAngle.a;
              if (angle === 'straight-short' && !name.includes('straight') && !name.includes('_length')) {
                shouldShow = false;
              } else if (angle === 'straight' && !name.includes('straight_ml')) {
                shouldShow = false;
              } else if (angle === '20' && !name.includes('20') && !name.includes('sidebend')) {
                shouldShow = false;
              } else if (angle === '30' && !name.includes('30') && !name.includes('sidebend')) {
                shouldShow = false;
              } else if (angle === '45' && !name.includes('45') && !name.includes('sidebend')) {
                shouldShow = false;
              } else if (angle === '60' && !name.includes('60') && !name.includes('sidebend')) {
                shouldShow = false;
              } else if (angle === '70' && !name.includes('70') && !name.includes('sidebend')) {
                shouldShow = false;
              } else if (angle === '90' && !name.includes('90') && !name.includes('sidebend')) {
                shouldShow = false;
              } else if (angle.includes('sidebend')) {
                const angleNum = angle.split('-')[0];
                if (!name.includes(angleNum + 'sidebend')) {
                  shouldShow = false;
                }
              }
            }

            child.visible = shouldShow;
          }

          // Handle B-side components (mirror A-side logic)
          if (name.startsWith('b_')) {
            shouldShow = false;
            
            // B-side fitting type logic
            if (configuration.fittingType.b === 'banjo' && name.includes('banjo')) {
              shouldShow = true;
            } else if (configuration.fittingType.b === 'swivel-male' && name.includes('pin_male') && name.includes('swivel')) {
              shouldShow = true;
            } else if (configuration.fittingType.b === 'fixed-male' && name.includes('male_fixed')) {
              shouldShow = true;
            } else if (configuration.fittingType.b === 'fixed-male-extended' && name.includes('fixed_male_extended')) {
              shouldShow = true;
            } else if (configuration.fittingType.b === 'fixed-bulkhead' && name.includes('bulkhead') && !name.includes('swivel')) {
              shouldShow = true;
            } else if (configuration.fittingType.b === 'swivel-female' && name.includes('pin_female') && name.includes('swivel')) {
              shouldShow = true;
            } else if (configuration.fittingType.b === 'swivel-female-circlip' && name.includes('female_swivel_circlip')) {
              shouldShow = true;
            } else if (configuration.fittingType.b === 'fixed-female' && name.includes('female_fixed')) {
              shouldShow = true;
            } else if (configuration.fittingType.b === 'swivel-bulkhead-female' && name.includes('swivel_bulkhead')) {
              shouldShow = true;
            } else if (configuration.fittingType.b === 'tee' && name.includes('tee')) {
              shouldShow = true;
            }

            // B-side fitting size logic
            if (shouldShow && configuration.fittingType.b !== 'banjo') {
              if (configuration.fittingSize.b.includes('convex') && !name.includes('cvx')) {
                shouldShow = false;
              } else if (configuration.fittingSize.b.includes('concave') && !name.includes('ccv')) {
                shouldShow = false;
              }
            }

            // B-side fitting angle logic
            if (shouldShow) {
              const angle = configuration.fittingAngle.b;
              if (angle === 'straight-short' && !name.includes('straight') && !name.includes('_length')) {
                shouldShow = false;
              } else if (angle === 'straight' && !name.includes('straight_ml')) {
                shouldShow = false;
              } else if (angle === '20' && !name.includes('20') && !name.includes('sidebend')) {
                shouldShow = false;
              } else if (angle === '30' && !name.includes('30') && !name.includes('sidebend')) {
                shouldShow = false;
              } else if (angle === '45' && !name.includes('45') && !name.includes('sidebend')) {
                shouldShow = false;
              } else if (angle === '60' && !name.includes('60') && !name.includes('sidebend')) {
                shouldShow = false;
              } else if (angle === '70' && !name.includes('70') && !name.includes('sidebend')) {
                shouldShow = false;
              } else if (angle === '90' && !name.includes('90') && !name.includes('sidebend')) {
                shouldShow = false;
              } else if (angle.includes('sidebend')) {
                const angleNum = angle.split('-')[0];
                if (!name.includes(angleNum + 'sidebend')) {
                  shouldShow = false;
                }
              }
            }

            child.visible = shouldShow;
          }

          // Handle stealth heatshrink (cylinder components)
          if (name.includes('cylinder')) {
            child.visible = configuration.stealthHeatshrink;
          }

          // Handle hose components based on color/transparency
          if (name === 'solid_hose') {
            child.visible = !configuration.hoseColor.includes('transparent') && configuration.hoseColor !== 'clear';
          } else if (name === '15%_transparent_hose' || name === '25%_transparent_hose' || name === '50%_transparent_hose') {
            child.visible = configuration.hoseColor.includes('transparent') || configuration.hoseColor === 'clear';
          }

          // Handle stainless steel braided hose
          if (name === 'stainless_steel_braided_hose') {
            child.visible = true; // Always visible as it's the base hose structure
          }

          // Handle PVC tube components
          if (name.includes('pvc_tube') || name.includes('pvc_length')) {
            child.visible = configuration.accessories === 'pvc-tube';
          }

          // Handle support components
          if (name.includes('support')) {
            child.visible = configuration.accessories === 'hose-supports';
          }

          // Handle DOT components for car caliper purpose
          if (name.includes('d_o_t')) {
            child.visible = configuration.purpose === 'car-caliper';
          }

          // Handle copper washer components (show when banjo fittings are used)
          if (name.includes('copperwasher')) {
            child.visible = configuration.fittingType.a === 'banjo' || configuration.fittingType.b === 'banjo';
          }

          // Handle clip components
          if (name.includes('clip')) {
            child.visible = configuration.fittingType.a === 'swivel-female-circlip' || configuration.fittingType.b === 'swivel-female-circlip';
          }

          // Apply material colors and transparency
          if (child.material) {
            // Handle hose transparency
            if (name.includes('hose') && (configuration.hoseColor === 'clear' || configuration.hoseColor.includes('transparent'))) {
              child.material.transparent = true;
              child.material.opacity = configuration.hoseColor === 'clear' ? 0.15 : 0.5;
            } else if (name.includes('hose')) {
              child.material.transparent = false;
              child.material.opacity = 1.0;
            }
          }
        }
      });
    }
  }, [scene, configuration]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={[0.08, 0.08, 0.08]} />
    </group>
  );
};

const LoadingFallback = () => (
  <Html center>
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
      <p className="text-white text-sm">Loading 3D Model...</p>
    </div>
  </Html>
);

export const ModelViewer: React.FC<ModelViewerProps> = ({ configuration }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'h-96 lg:h-[600px]'} rounded-xl overflow-hidden`}>
      <Canvas
        camera={{ position: [0, 0, 75], fov: 50 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <spotLight position={[-10, -10, -5]} intensity={1.0} />
        
        <Suspense fallback={<LoadingFallback />}>
          <PresentationControls
            global
            zoom={0.1}
            rotation={[0, Math.PI / 4, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 2, Math.PI / 2]}
          >
            <BrakeLineModel configuration={configuration} />
          </PresentationControls>
          <Environment preset="studio" />
        </Suspense>
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={25}
          maxDistance={150}
          target={[0, 0, 0]}
        />
      </Canvas>
      
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-4 right-4 p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-colors z-10"
      >
        {isFullscreen ? (
          <Minimize2 className="w-5 h-5 text-white" />
        ) : (
          <Maximize2 className="w-5 h-5 text-white" />
        )}
      </button>
      
      <div className="absolute bottom-4 left-4 bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2">
        <p className="text-white text-xs lg:text-sm">
          <span className="hidden sm:inline">Drag to rotate • Scroll to zoom • Right-click to pan</span>
          <span className="sm:hidden">Touch to rotate • Pinch to zoom</span>
        </p>
      </div>
    </div>
  );
};