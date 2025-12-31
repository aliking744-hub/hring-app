import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const LivingTrunk = () => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Load the GLB model
  const { scene } = useGLTF("/models/Tree.glb");
  
  // Clone the scene to avoid shared state issues
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Apply golden material to all meshes for the strategic tree look
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#5D4E37"),
          emissive: new THREE.Color("#FFD700"),
          emissiveIntensity: 0.15,
          roughness: 0.6,
          metalness: 0.3,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    return clone;
  }, [scene]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Subtle breathing animation for the tree
    if (groupRef.current) {
      groupRef.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.01);
    }
    
    // Pulsing glow
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.1 + Math.sin(time * 1.5) * 0.05;
    }
    
    // Update emissive intensity for living effect
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissiveIntensity = 0.15 + Math.sin(time * 2 + child.position.y) * 0.08;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* The GLB tree model - scaled and positioned appropriately */}
      <primitive 
        object={clonedScene} 
        scale={[7.5, 7.5, 7.5]} 
        position={[0, -0.5, 0]} 
        rotation={[0, 0, 0]}
      />
      
      {/* Ground glow ring around the tree base */}
      <mesh 
        ref={glowRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.4, 0]}
      >
        <ringGeometry args={[0.3, 2, 64]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Energy particles around the tree */}
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#FFD700" distance={8} />
    </group>
  );
};

// Preload the model
useGLTF.preload("/models/Tree.glb");

export default LivingTrunk;
