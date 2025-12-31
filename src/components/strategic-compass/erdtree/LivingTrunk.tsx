import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createLivingLightMaterial } from "./shaders/LivingLightShader";

// Bonsai-style curved trunk path points (S-curve like the reference image)
const TRUNK_CURVE_POINTS = [
  new THREE.Vector3(0, -0.5, 0),
  new THREE.Vector3(0.4, 0.5, 0.1),
  new THREE.Vector3(-0.3, 1.5, -0.15),
  new THREE.Vector3(0.5, 2.5, 0.2),
  new THREE.Vector3(0.1, 3.5, 0.05),
  new THREE.Vector3(-0.4, 4.3, 0.15),
  new THREE.Vector3(0.1, 5.2, 0),
];

// Organic branch configurations - positioned along the curved trunk
const BRANCHES = [
  { t: 0.35, angle: Math.PI * 0.2, length: 2.2, thickness: 0.11, curve: 0.7 },
  { t: 0.42, angle: -Math.PI * 0.35, length: 2.5, thickness: 0.12, curve: 0.8 },
  { t: 0.52, angle: Math.PI * 0.55, length: 2.0, thickness: 0.10, curve: 0.6 },
  { t: 0.58, angle: -Math.PI * 0.15, length: 1.8, thickness: 0.09, curve: 0.5 },
  { t: 0.68, angle: Math.PI * 0.4, length: 2.3, thickness: 0.10, curve: 0.75 },
  { t: 0.75, angle: -Math.PI * 0.5, length: 1.6, thickness: 0.08, curve: 0.55 },
  { t: 0.82, angle: Math.PI * 0.1, length: 1.4, thickness: 0.07, curve: 0.4 },
  { t: 0.88, angle: -Math.PI * 0.25, length: 1.2, thickness: 0.06, curve: 0.35 },
  { t: 0.94, angle: Math.PI * 0.05, length: 0.8, thickness: 0.05, curve: 0.2 },
];

// Root configurations - spreading organically
const ROOTS = [
  { angle: 0, length: 2.0, depth: -0.35, twist: 0.3 },
  { angle: Math.PI * 0.25, length: 2.4, depth: -0.25, twist: 0.5 },
  { angle: Math.PI * 0.5, length: 1.6, depth: -0.4, twist: 0.25 },
  { angle: Math.PI * 0.75, length: 2.1, depth: -0.3, twist: 0.4 },
  { angle: Math.PI, length: 1.9, depth: -0.28, twist: 0.55 },
  { angle: -Math.PI * 0.75, length: 2.3, depth: -0.32, twist: 0.35 },
  { angle: -Math.PI * 0.5, length: 1.7, depth: -0.38, twist: 0.45 },
  { angle: -Math.PI * 0.25, length: 2.2, depth: -0.22, twist: 0.6 },
];

// Export branch end positions for floating leaves
export const getBranchEndPositions = () => {
  const trunkCurve = new THREE.CatmullRomCurve3(TRUNK_CURVE_POINTS);
  
  return BRANCHES.map((branch) => {
    const startPoint = trunkCurve.getPoint(branch.t);
    
    // Calculate end position with organic curve
    const x = startPoint.x + Math.cos(branch.angle) * branch.length;
    const y = startPoint.y + branch.curve * 1.2;
    const z = startPoint.z + Math.sin(branch.angle) * branch.length;
    
    return { x, y, z, angle: branch.angle * (180 / Math.PI), height: y };
  });
};

// Create tube geometry from curve
const createTubeFromCurve = (points: THREE.Vector3[], radius: number, segments = 32, radialSegments = 12) => {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(curve, segments, radius, radialSegments, false);
};

const LivingTrunk = () => {
  const trunkMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const foliageRefs = useRef<THREE.Mesh[]>([]);

  // Create main trunk curve
  const trunkCurve = useMemo(() => new THREE.CatmullRomCurve3(TRUNK_CURVE_POINTS), []);

  // Create trunk geometry - organic tube
  const trunkGeometry = useMemo(() => {
    return new THREE.TubeGeometry(trunkCurve, 64, 0.22, 16, false);
  }, [trunkCurve]);

  // Create branch geometries with organic curves
  const branchData = useMemo(() => {
    return BRANCHES.map((branch, idx) => {
      const startPoint = trunkCurve.getPoint(branch.t);
      
      // Create curved branch path
      const midPoint = new THREE.Vector3(
        startPoint.x + Math.cos(branch.angle) * branch.length * 0.5,
        startPoint.y + branch.curve * 0.6,
        startPoint.z + Math.sin(branch.angle) * branch.length * 0.5
      );
      
      const endPoint = new THREE.Vector3(
        startPoint.x + Math.cos(branch.angle) * branch.length,
        startPoint.y + branch.curve * 1.2,
        startPoint.z + Math.sin(branch.angle) * branch.length
      );
      
      // Add slight organic variation
      midPoint.x += (Math.sin(idx * 1.5) * 0.15);
      midPoint.z += (Math.cos(idx * 1.5) * 0.15);
      
      const geometry = createTubeFromCurve(
        [startPoint, midPoint, endPoint],
        branch.thickness,
        20,
        8
      );
      
      return { geometry, endPoint, branch };
    });
  }, [trunkCurve]);

  // Create root geometries
  const rootGeometries = useMemo(() => {
    return ROOTS.map((root, idx) => {
      const startPoint = new THREE.Vector3(0, 0, 0);
      
      const midPoint = new THREE.Vector3(
        Math.cos(root.angle) * root.length * 0.4,
        root.depth * 0.4,
        Math.sin(root.angle) * root.length * 0.4
      );
      
      // Add twist variation
      midPoint.x += root.twist * 0.2 * Math.sin(idx);
      midPoint.z += root.twist * 0.2 * Math.cos(idx);
      
      const endPoint = new THREE.Vector3(
        Math.cos(root.angle) * root.length,
        root.depth,
        Math.sin(root.angle) * root.length
      );
      
      return createTubeFromCurve([startPoint, midPoint, endPoint], 0.06, 16, 6);
    });
  }, []);

  // Create shader materials
  const trunkMaterial = useMemo(() => 
    createLivingLightMaterial("#5D4E37", "#FFD700", 0.08, 1.5), []
  );
  
  const branchMaterial = useMemo(() => 
    createLivingLightMaterial("#6B5B3D", "#FFD700", 0.12, 1.8), []
  );
  
  const rootMaterial = useMemo(() => 
    createLivingLightMaterial("#4A3F2A", "#B8860B", 0.05, 1.0), []
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Update trunk shader
    if (trunkMaterialRef.current) {
      trunkMaterialRef.current.uniforms.uTime.value = time;
    }
    
    // Outer glow pulse
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.12 + Math.sin(time * 0.8) * 0.05;
    }
    
    // Animate foliage glow
    foliageRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.6 + Math.sin(time * 1.2 + i * 0.5) * 0.15;
      }
    });
  });

  return (
    <group>
      {/* Root system - organic curves spreading outward */}
      {rootGeometries.map((geometry, i) => (
        <mesh key={`root-${i}`} geometry={geometry}>
          <primitive object={rootMaterial.clone()} />
        </mesh>
      ))}

      {/* Root base mound */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <primitive object={rootMaterial.clone()} />
      </mesh>

      {/* Main curved trunk */}
      <mesh geometry={trunkGeometry}>
        <primitive object={trunkMaterial} ref={trunkMaterialRef} />
      </mesh>

      {/* Trunk inner glow */}
      <mesh>
        <tubeGeometry args={[trunkCurve, 32, 0.15, 12, false]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.1} />
      </mesh>

      {/* Trunk outer glow envelope */}
      <mesh ref={glowRef}>
        <tubeGeometry args={[trunkCurve, 32, 0.35, 12, false]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      {/* Organic branches */}
      {branchData.map(({ geometry, endPoint, branch }, i) => (
        <group key={`branch-${i}`}>
          {/* Main branch */}
          <mesh geometry={geometry}>
            <primitive object={branchMaterial.clone()} />
          </mesh>
          
          {/* Branch glow */}
          <mesh geometry={geometry}>
            <meshBasicMaterial color="#FFD700" transparent opacity={0.06} side={THREE.BackSide} />
          </mesh>
          
          {/* Foliage cluster at branch end */}
          <group position={[endPoint.x, endPoint.y, endPoint.z]}>
            {/* Main foliage sphere - golden orange */}
            <mesh
              ref={(el) => { if (el) foliageRefs.current[i] = el; }}
            >
              <sphereGeometry args={[0.55 + (i % 3) * 0.15, 16, 16]} />
              <meshBasicMaterial color="#FFB347" transparent opacity={0.75} />
            </mesh>
            
            {/* Outer glow */}
            <mesh>
              <sphereGeometry args={[0.8 + (i % 3) * 0.2, 12, 12]} />
              <meshBasicMaterial color="#FFA500" transparent opacity={0.2} side={THREE.BackSide} />
            </mesh>
            
            {/* Inner bright core */}
            <mesh>
              <sphereGeometry args={[0.25, 12, 12]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>
            
            {/* Secondary smaller foliage nearby */}
            {i % 2 === 0 && (
              <>
                <mesh position={[0.4, 0.3, 0.2]}>
                  <sphereGeometry args={[0.35, 12, 12]} />
                  <meshBasicMaterial color="#FFCC66" transparent opacity={0.7} />
                </mesh>
                <mesh position={[-0.3, 0.2, -0.35]}>
                  <sphereGeometry args={[0.3, 12, 12]} />
                  <meshBasicMaterial color="#FFB366" transparent opacity={0.65} />
                </mesh>
              </>
            )}
          </group>
        </group>
      ))}

      {/* Crown - top energy bloom */}
      <group position={[TRUNK_CURVE_POINTS[TRUNK_CURVE_POINTS.length - 1].x, TRUNK_CURVE_POINTS[TRUNK_CURVE_POINTS.length - 1].y + 0.3, TRUNK_CURVE_POINTS[TRUNK_CURVE_POINTS.length - 1].z]}>
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color="#FFB347" transparent opacity={0.8} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.75, 16, 16]} />
          <meshBasicMaterial color="#FFA500" transparent opacity={0.25} side={THREE.BackSide} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      </group>

      {/* Ground shadow/glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
        <circleGeometry args={[3.5, 32]} />
        <meshBasicMaterial color="#4A3F2A" transparent opacity={0.25} />
      </mesh>
    </group>
  );
};

export default LivingTrunk;
