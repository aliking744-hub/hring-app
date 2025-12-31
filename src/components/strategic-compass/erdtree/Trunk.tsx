import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Trunk = () => {
  const trunkRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group>
      {/* Main Trunk */}
      <mesh ref={trunkRef} position={[0, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 6, 32]} />
        <meshStandardMaterial
          color="#D4AF37"
          emissive="#B8860B"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Inner Glow */}
      <mesh ref={glowRef} position={[0, 2, 0]}>
        <cylinderGeometry args={[0.35, 0.55, 6.1, 32]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Root base */}
      <mesh position={[0, -1.2, 0]}>
        <coneGeometry args={[0.8, 0.8, 8]} />
        <meshStandardMaterial
          color="#8B7355"
          emissive="#5D4E37"
          emissiveIntensity={0.2}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Main branches */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <group key={i} rotation={[0, (angle * Math.PI) / 180, 0]}>
          <mesh position={[0.3, 3 + i * 0.3, 0]} rotation={[0, 0, -0.5 + i * 0.1]}>
            <cylinderGeometry args={[0.08, 0.12, 1.5 + i * 0.2, 8]} />
            <meshStandardMaterial
              color="#D4AF37"
              emissive="#B8860B"
              emissiveIntensity={0.4}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default Trunk;
