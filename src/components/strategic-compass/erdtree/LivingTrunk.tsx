import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createLivingLightMaterial } from "./shaders/LivingLightShader";

// Branch configuration - represents major projects
const MAIN_BRANCHES = [
  { angle: 0, height: 2.5, length: 2.0, thickness: 0.12, tilt: 0.6 },
  { angle: 72, height: 3.2, length: 2.2, thickness: 0.10, tilt: 0.5 },
  { angle: 144, height: 3.8, length: 1.8, thickness: 0.11, tilt: 0.55 },
  { angle: 216, height: 4.3, length: 2.1, thickness: 0.09, tilt: 0.45 },
  { angle: 288, height: 4.8, length: 1.9, thickness: 0.10, tilt: 0.5 },
  { angle: 36, height: 5.2, length: 1.6, thickness: 0.08, tilt: 0.4 },
  { angle: 108, height: 5.6, length: 1.5, thickness: 0.07, tilt: 0.35 },
  { angle: 180, height: 1.8, length: 1.7, thickness: 0.11, tilt: 0.65 },
  { angle: 252, height: 2.0, length: 1.5, thickness: 0.10, tilt: 0.6 },
  { angle: 324, height: 2.8, length: 1.4, thickness: 0.09, tilt: 0.55 },
];

// Export branch positions for tendril connections
export const getBranchEndPositions = () => {
  return MAIN_BRANCHES.map((branch) => {
    const angleRad = (branch.angle * Math.PI) / 180;
    const x = Math.cos(angleRad) * branch.length * 0.9;
    const z = Math.sin(angleRad) * branch.length * 0.9;
    const y = branch.height + Math.sin(branch.tilt) * branch.length * 0.3;
    return { x, y, z, angle: branch.angle, height: branch.height };
  });
};

const LivingTrunk = () => {
  const trunkMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const branchMaterialRefs = useRef<THREE.ShaderMaterial[]>([]);
  const rootMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Create shader materials
  const trunkMaterial = useMemo(() => 
    createLivingLightMaterial("#5D4E37", "#FFD700", 0.06, 1.8), []
  );
  
  const branchMaterial = useMemo(() => 
    createLivingLightMaterial("#6B5B3D", "#FFD700", 0.1, 2.0), []
  );
  
  const rootMaterial = useMemo(() => 
    createLivingLightMaterial("#4A3F2A", "#B8860B", 0.04, 1.2), []
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Update trunk shader
    if (trunkMaterialRef.current) {
      trunkMaterialRef.current.uniforms.uTime.value = time;
    }
    
    // Update branch shaders
    branchMaterialRefs.current.forEach((mat) => {
      if (mat) {
        mat.uniforms.uTime.value = time;
      }
    });
    
    // Update root shader
    if (rootMaterialRef.current) {
      rootMaterialRef.current.uniforms.uTime.value = time;
    }
    
    // Outer glow pulse
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.15 + Math.sin(time * 1.5) * 0.08;
    }
  });

  return (
    <group>
      {/* Root system - spreading base */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <mesh
          key={`root-${i}`}
          position={[
            Math.cos((angle * Math.PI) / 180) * 0.6,
            -0.8,
            Math.sin((angle * Math.PI) / 180) * 0.6,
          ]}
          rotation={[0.8, (angle * Math.PI) / 180, 0.3]}
        >
          <cylinderGeometry args={[0.05, 0.12, 1.2, 8]} />
          <primitive 
            object={rootMaterial.clone()} 
            ref={(ref: THREE.ShaderMaterial) => {
              if (ref) rootMaterialRef.current = ref;
            }}
          />
        </mesh>
      ))}

      {/* Root base cone */}
      <mesh position={[0, -0.5, 0]}>
        <coneGeometry args={[0.8, 1.2, 12]} />
        <primitive object={rootMaterial.clone()} />
      </mesh>

      {/* Main Trunk - with living light shader */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.25, 0.45, 7, 24]} />
        <primitive 
          object={trunkMaterial} 
          ref={trunkMaterialRef}
        />
      </mesh>

      {/* Inner energy core */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.18, 0.35, 6.8, 16]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Outer glow envelope */}
      <mesh ref={glowRef} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.35, 0.55, 7.2, 24]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main structural branches - representing major projects */}
      {MAIN_BRANCHES.map((branch, i) => {
        const angleRad = (branch.angle * Math.PI) / 180;
        
        return (
          <group 
            key={`branch-${i}`} 
            position={[0, branch.height, 0]}
            rotation={[branch.tilt, angleRad, 0]}
          >
            {/* Main branch segment */}
            <mesh position={[branch.length / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[branch.thickness * 0.6, branch.thickness, branch.length, 12]} />
              <primitive 
                object={branchMaterial.clone()}
                ref={(ref: THREE.ShaderMaterial) => {
                  if (ref) branchMaterialRefs.current[i] = ref;
                }}
              />
            </mesh>
            
            {/* Branch glow */}
            <mesh position={[branch.length / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[branch.thickness * 0.8, branch.thickness * 1.2, branch.length * 1.02, 12]} />
              <meshBasicMaterial
                color="#FFD700"
                transparent
                opacity={0.08}
                side={THREE.BackSide}
              />
            </mesh>
            
            {/* Secondary branch splits */}
            {i % 2 === 0 && (
              <>
                <mesh 
                  position={[branch.length * 0.7, 0.1, 0.1]} 
                  rotation={[0.3, 0.5, Math.PI / 2]}
                >
                  <cylinderGeometry args={[branch.thickness * 0.3, branch.thickness * 0.5, branch.length * 0.4, 8]} />
                  <primitive object={branchMaterial.clone()} />
                </mesh>
                <mesh 
                  position={[branch.length * 0.5, -0.1, -0.1]} 
                  rotation={[-0.3, -0.4, Math.PI / 2]}
                >
                  <cylinderGeometry args={[branch.thickness * 0.25, branch.thickness * 0.4, branch.length * 0.35, 8]} />
                  <primitive object={branchMaterial.clone()} />
                </mesh>
              </>
            )}
          </group>
        );
      })}

      {/* Crown - top energy bloom */}
      <mesh position={[0, 6.2, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Crown glow halo */}
      <mesh position={[0, 6.2, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

export default LivingTrunk;
