import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Task, DEPARTMENTS } from "./types";

interface LeafProps {
  task: Task;
  position: [number, number, number];
}

const Leaf = ({ task, position }: LeafProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const department = DEPARTMENTS.find(d => d.id === task.departmentId);
  const color = department?.color || "#ffffff";

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
      
      // Pulsing glow effect
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 3 + position[2]) * 0.3;
      
      // Scale on hover
      const scale = hovered ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        transparent
        opacity={0.9}
      />
      
      {hovered && (
        <Html
          position={[0, 0.2, 0]}
          center
          style={{
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <div className="bg-background/95 backdrop-blur-sm border border-[#D4AF37]/50 rounded-lg p-3 shadow-lg text-right" dir="rtl">
            <p className="font-bold text-foreground text-sm">{task.name}</p>
            <p className="text-muted-foreground text-xs mt-1">{task.ownerName}</p>
            <p className="text-xs mt-1" style={{ color }}>
              {task.departmentName} • اهمیت: {task.strategicImportance}
            </p>
          </div>
        </Html>
      )}
    </mesh>
  );
};

export default Leaf;
