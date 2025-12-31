import { useRef, useState, useEffect } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Task, DEPARTMENTS } from "./types";

interface LivingLeafProps {
  task: Task;
  position: [number, number, number];
  isNew?: boolean;
  isExpired?: boolean;
  onTaskClick?: (task: Task) => void;
}

const LivingLeaf = ({ task, position, isNew = false, isExpired = false, onTaskClick }: LivingLeafProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [growthProgress, setGrowthProgress] = useState(isNew ? 0 : 1);
  
  const department = DEPARTMENTS.find(d => d.id === task.departmentId);
  const color = department?.color || "#ffffff";

  // Growth animation for new leaves
  useEffect(() => {
    if (isNew) {
      setGrowthProgress(0);
      const duration = 2000; // 2 seconds for more dramatic effect
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing function for elastic growth
        const eased = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        setGrowthProgress(eased);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isNew]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (meshRef.current) {
      if (isExpired) {
        // Expired leaves: lay flat on ground with no animation
        meshRef.current.position.y = position[1];
        meshRef.current.rotation.x = Math.PI / 2 + Math.sin(position[0]) * 0.2;
        meshRef.current.rotation.z = Math.sin(position[2]) * 0.3;
      } else {
        // Gentle floating animation for active leaves
        meshRef.current.position.y = position[1] + Math.sin(time * 1.5 + position[0] * 2) * 0.03;
      }
      
      // Pulsing emissive - synced with tree's energy flow
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      
      if (isExpired) {
        // Static dim appearance for expired - no animation, keep department color but muted
        material.emissiveIntensity = 0.3;
      } else {
        // Calculate pulse based on position (energy flows upward)
        const flowPhase = (position[1] * 0.15 - time * 0.08) % 1;
        const energyPulse = Math.max(0, Math.sin(flowPhase * Math.PI * 2)) * 0.5;
        
        const baseIntensity = isNew && growthProgress < 1 ? 2.5 : 1.0;
        material.emissiveIntensity = baseIntensity + energyPulse + Math.sin(time * 2) * 0.2;
      }
      
      // Scale on hover + growth animation
      const baseScale = growthProgress * (isExpired ? 0.07 : 0.1);
      const hoverScale = hovered ? 1.8 : 1;
      const targetScale = baseScale * hoverScale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    
    if (glowRef.current) {
      // Outer glow pulse - reduced glow for expired
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      if (isExpired) {
        material.opacity = 0.1;
      } else {
        const flowPhase = (position[1] * 0.15 - time * 0.08) % 1;
        const energyPulse = Math.max(0, Math.sin(flowPhase * Math.PI * 2)) * 0.3;
        material.opacity = (0.2 + energyPulse) * growthProgress;
      }
    }
  });

  // Don't render if not grown yet
  if (growthProgress === 0 && !isNew) return null;

  return (
    <group position={position}>
      {/* Inner glowing core */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onTaskClick?.(task);
        }}
      >
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isExpired ? 0.3 : 1.2}
          transparent
          opacity={(isExpired ? 0.6 : 0.95) * growthProgress}
          metalness={isExpired ? 0.1 : 0.3}
          roughness={isExpired ? 0.7 : 0.4}
        />
      </mesh>
      
      {/* Outer glow halo */}
      <mesh ref={glowRef} scale={growthProgress * 0.18}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Energy ring */}
      <mesh 
        scale={growthProgress * 0.12} 
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[1.2, 0.05, 8, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4 * growthProgress}
        />
      </mesh>
      
      {hovered && growthProgress > 0.5 && (
        <Html
          position={[0, 0.3, 0]}
          center
          style={{
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <div className="bg-background/95 backdrop-blur-sm border border-[#D4AF37]/50 rounded-lg p-3 shadow-lg text-right min-w-[180px]" dir="rtl">
            <p className="font-bold text-foreground text-sm">{task.name}</p>
            <p className="text-muted-foreground text-xs mt-1">{task.ownerName}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                {task.departmentName}
              </span>
              <span className="text-xs text-[#D4AF37]">
                اهمیت: {task.strategicImportance}
              </span>
            </div>
            {isNew && (
              <p className="text-[#D4AF37] text-xs mt-2 font-bold text-center">✨ تازه اضافه شده!</p>
            )}
            {isExpired && (
              <p className="text-red-400 text-xs mt-2 font-bold text-center">⚠️ منقضی شده</p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

export default LivingLeaf;
