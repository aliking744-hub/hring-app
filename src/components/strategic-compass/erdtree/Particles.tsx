import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Particles = ({ count = 200 }: { count?: number }) => {
  const meshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spread particles in a large cylinder around the tree
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 8;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 12 - 2;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Golden/white particles
      const isGolden = Math.random() > 0.5;
      if (isGolden) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.84;
        colors[i * 3 + 2] = 0;
      } else {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      }
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        // Slow upward float
        positions[i * 3 + 1] += 0.005;
        
        // Reset when too high
        if (positions[i * 3 + 1] > 10) {
          positions[i * 3 + 1] = -2;
        }
        
        // Gentle horizontal drift
        positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.001;
        positions[i * 3 + 2] += Math.cos(state.clock.elapsedTime + i) * 0.001;
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export default Particles;
