import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Trunk from "./Trunk";
import LeafCluster from "./LeafCluster";
import Particles from "./Particles";
import { Task } from "./types";

interface ErdtreeSceneProps {
  tasks: Task[];
  newTaskIds?: string[];
}

const ErdtreeScene = ({ tasks, newTaskIds = [] }: ErdtreeSceneProps) => {
  return (
    <div className="w-full h-full min-h-[600px] bg-[#0a0a12] rounded-xl overflow-hidden relative">
      <Canvas
        camera={{ position: [8, 4, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 10, 0]} intensity={1} color="#FFD700" />
          <pointLight position={[5, 5, 5]} intensity={0.5} color="#D4AF37" />
          <pointLight position={[-5, 3, -5]} intensity={0.3} color="#B8860B" />
          
          {/* Background stars */}
          <Stars
            radius={50}
            depth={50}
            count={2000}
            factor={4}
            saturation={0.5}
            fade
            speed={0.5}
          />
          
          {/* Floating particles */}
          <Particles count={150} />
          
          {/* The Erdtree */}
          <group position={[0, -1, 0]}>
            <Trunk />
            <LeafCluster tasks={tasks} newTaskIds={newTaskIds} />
          </group>
          
          {/* Post-processing for glow effect */}
          <EffectComposer>
            <Bloom
              intensity={1.5}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
          
          {/* Camera controls */}
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.5}
            enablePan={false}
            minDistance={4}
            maxDistance={15}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ErdtreeScene;
