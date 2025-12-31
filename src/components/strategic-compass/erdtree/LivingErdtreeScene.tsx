import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import LivingTrunk from "./LivingTrunk";
import LivingLeafCluster from "./LivingLeafCluster";
import Particles from "./Particles";
import { Task } from "./types";

interface LivingErdtreeSceneProps {
  tasks: Task[];
  newTaskIds?: string[];
  isFullscreen?: boolean;
}

const LivingErdtreeScene = ({ tasks, newTaskIds = [], isFullscreen = false }: LivingErdtreeSceneProps) => {
  // Handle ESC key for fullscreen exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        // Parent handles this via state
      }
    };
    
    if (isFullscreen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  return (
    <div className={`w-full h-full ${isFullscreen ? '' : 'min-h-[600px]'} bg-[#050508] ${isFullscreen ? '' : 'rounded-xl'} overflow-hidden relative`}>
      <Canvas
        camera={{ 
          position: isFullscreen ? [12, 6, 12] : [10, 5, 10], 
          fov: isFullscreen ? 40 : 45 
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          {/* Dark ambient for contrast */}
          <ambientLight intensity={0.1} />
          
          {/* Main golden light from above */}
          <pointLight position={[0, 12, 0]} intensity={0.8} color="#FFD700" distance={25} />
          
          {/* Accent lights around the tree */}
          <pointLight position={[6, 4, 6]} intensity={0.3} color="#D4AF37" distance={15} />
          <pointLight position={[-6, 4, -6]} intensity={0.3} color="#B8860B" distance={15} />
          <pointLight position={[0, 0, 8]} intensity={0.2} color="#FFD700" distance={12} />
          
          {/* Subtle blue fill from below for Avatar feel */}
          <pointLight position={[0, -3, 0]} intensity={0.15} color="#4488ff" distance={10} />
          
          {/* Background stars - more dense */}
          <Stars
            radius={80}
            depth={60}
            count={isFullscreen ? 5000 : 3000}
            factor={5}
            saturation={0.3}
            fade
            speed={0.3}
          />
          
          {/* Floating particles - golden motes */}
          <Particles count={isFullscreen ? 300 : 200} />
          
          {/* The Living Erdtree */}
          <group position={[0, -2, 0]}>
            <LivingTrunk />
            <LivingLeafCluster tasks={tasks} newTaskIds={newTaskIds} />
          </group>
          
          {/* Ground plane with subtle glow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
            <circleGeometry args={[8, 64]} />
            <meshBasicMaterial 
              color="#0a0a12" 
              transparent 
              opacity={0.8}
            />
          </mesh>
          
          {/* Ground glow ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.45, 0]}>
            <ringGeometry args={[0.5, 1.2, 64]} />
            <meshBasicMaterial 
              color="#B8860B" 
              transparent 
              opacity={0.3}
            />
          </mesh>
          
          {/* Post-processing for enhanced glow effect */}
          <EffectComposer>
            <Bloom
              intensity={isFullscreen ? 2.5 : 2.0}
              luminanceThreshold={0.15}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <Vignette 
              eskil={false} 
              offset={0.1} 
              darkness={isFullscreen ? 0.6 : 0.8} 
            />
          </EffectComposer>
          
          {/* Camera controls - enhanced for fullscreen */}
          <OrbitControls
            autoRotate
            autoRotateSpeed={isFullscreen ? 0.2 : 0.3}
            enablePan={isFullscreen}
            minDistance={isFullscreen ? 4 : 5}
            maxDistance={isFullscreen ? 25 : 18}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default LivingErdtreeScene;
