import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Task, DEPARTMENTS } from "./types";

interface LeafProps {
  task: Task;
  position: [number, number, number];
  isNew?: boolean;
}

const Leaf = ({ task, position, isNew = false }: LeafProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [growthProgress, setGrowthProgress] = useState(isNew ? 0 : 1);
  
  const department = DEPARTMENTS.find(d => d.id === task.departmentId);
  const color = department?.color || "#ffffff";

  // Growth animation for new leaves
  useEffect(() => {
    if (isNew) {
      setGrowthProgress(0);
      const duration = 1500; // 1.5 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing function for smooth growth
        const eased = 1 - Math.pow(1 - progress, 3);
        setGrowthProgress(eased);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isNew]);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
      
      // Pulsing glow effect - stronger for new leaves
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      const baseIntensity = isNew && growthProgress < 1 ? 2 : 0.8;
      material.emissiveIntensity = baseIntensity + Math.sin(state.clock.elapsedTime * 3 + position[2]) * 0.3;
      
      // Scale on hover + growth animation
      const baseScale = growthProgress;
      const hoverScale = hovered ? 1.5 : 1;
      const targetScale = baseScale * hoverScale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  // Don't render if not grown yet
  if (growthProgress === 0 && !isNew) return null;

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
        opacity={0.9 * growthProgress}
      />
      
      {hovered && growthProgress > 0.5 && (
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
            {isNew && (
              <p className="text-[#D4AF37] text-xs mt-1 font-bold">✨ تازه اضافه شده!</p>
            )}
          </div>
        </Html>
      )}
    </mesh>
  );
};

export default Leaf;
