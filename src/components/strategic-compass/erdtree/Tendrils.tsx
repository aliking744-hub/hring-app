import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Task, DEPARTMENTS } from "./types";
import { getBranchEndPositions } from "./LivingTrunk";

interface TendrilsProps {
  tasks: Task[];
  leafPositions: Array<{
    task: Task;
    position: [number, number, number];
  }>;
}

const Tendrils = ({ leafPositions }: TendrilsProps) => {
  const materialsRef = useRef<THREE.ShaderMaterial[]>([]);
  const branchEnds = useMemo(() => getBranchEndPositions(), []);

  // Find the nearest branch for each leaf
  const tendrilData = useMemo(() => {
    return leafPositions.map(({ task, position }) => {
      const leafPos = new THREE.Vector3(position[0], position[1], position[2]);
      
      // Find nearest branch end
      let nearestBranch = branchEnds[0];
      let minDist = Infinity;
      
      branchEnds.forEach((branch) => {
        const branchPos = new THREE.Vector3(branch.x, branch.y, branch.z);
        const dist = leafPos.distanceTo(branchPos);
        if (dist < minDist) {
          minDist = dist;
          nearestBranch = branch;
        }
      });
      
      const department = DEPARTMENTS.find(d => d.id === task.departmentId);
      const color = department?.color || "#FFD700";
      
      return {
        start: new THREE.Vector3(nearestBranch.x, nearestBranch.y, nearestBranch.z),
        end: leafPos,
        color,
        taskId: task.id,
      };
    });
  }, [leafPositions, branchEnds]);

  // Create curved line geometry for each tendril
  const tendrilGeometries = useMemo(() => {
    return tendrilData.map(({ start, end }) => {
      // Create a curved path using quadratic bezier
      const midPoint = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);
      
      // Add some curve by offsetting the midpoint
      const direction = new THREE.Vector3().subVectors(end, start);
      const perpendicular = new THREE.Vector3(
        -direction.z * 0.3,
        direction.length() * 0.15,
        direction.x * 0.3
      );
      midPoint.add(perpendicular);
      
      const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
      const points = curve.getPoints(20);
      
      // Create geometry with line distance attribute for shader
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      // Calculate cumulative distances for flow animation
      const distances = new Float32Array(points.length);
      let totalDist = 0;
      distances[0] = 0;
      
      for (let i = 1; i < points.length; i++) {
        totalDist += points[i].distanceTo(points[i - 1]);
        distances[i] = totalDist;
      }
      
      // Normalize distances
      for (let i = 0; i < distances.length; i++) {
        distances[i] /= totalDist;
      }
      
      geometry.setAttribute("lineDistance", new THREE.BufferAttribute(distances, 1));
      
      return geometry;
    });
  }, [tendrilData]);

  // Create shader materials
  const materials = useMemo(() => {
    return tendrilData.map(({ color }) => {
      return new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(color) },
          uFlowSpeed: { value: 0.2 },
          uOpacity: { value: 0.7 },
        },
        vertexShader: `
          attribute float lineDistance;
          varying float vLineDistance;
          varying vec3 vPosition;
          
          void main() {
            vLineDistance = lineDistance;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          uniform float uFlowSpeed;
          uniform float uOpacity;
          
          varying float vLineDistance;
          varying vec3 vPosition;
          
          void main() {
            // Create flowing pulse along the tendril (from branch to leaf)
            float flow = fract(vLineDistance - uTime * uFlowSpeed);
            float pulse = smoothstep(0.0, 0.12, flow) * smoothstep(0.24, 0.12, flow);
            
            // Secondary slower pulse
            float flow2 = fract(vLineDistance - uTime * uFlowSpeed * 0.6 + 0.5);
            float pulse2 = smoothstep(0.0, 0.15, flow2) * smoothstep(0.3, 0.15, flow2) * 0.4;
            
            float totalPulse = pulse + pulse2;
            
            // Base glow with pulse
            float intensity = 0.35 + totalPulse * 0.65;
            
            vec3 finalColor = uColor * intensity * 1.2;
            float alpha = uOpacity * (0.3 + totalPulse * 0.7);
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
    });
  }, [tendrilData]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    materialsRef.current.forEach((mat) => {
      if (mat) {
        mat.uniforms.uTime.value = time;
      }
    });
  });

  return (
    <group>
      {tendrilGeometries.map((geometry, i) => (
        <line key={tendrilData[i].taskId}>
          <primitive object={geometry} attach="geometry" />
          <primitive 
            object={materials[i]} 
            attach="material"
            ref={(ref: THREE.ShaderMaterial) => {
              if (ref) materialsRef.current[i] = ref;
            }}
          />
        </line>
      ))}
    </group>
  );
};

export default Tendrils;
