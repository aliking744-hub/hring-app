import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Custom shader for flowing light veins effect
const flowingLightVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const flowingLightFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uGlowColor;
  uniform float uEmissiveIntensity;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Noise function for organic veins
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for(int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  
  void main() {
    // Base material color (golden brown bark)
    vec3 baseColor = uBaseColor;
    
    // Create flowing veins based on Y position (height on tree)
    float flowSpeed = 0.3;
    float flowOffset = uTime * flowSpeed;
    
    // Vein pattern - organic branching lines
    float veinPattern = 0.0;
    
    // Multiple vein streams at different angles
    for(float i = 0.0; i < 6.0; i++) {
      float angle = i * 1.047; // ~60 degrees apart
      vec2 rotatedUV = vec2(
        vUv.x * cos(angle) - vUv.y * sin(angle),
        vUv.x * sin(angle) + vUv.y * cos(angle)
      );
      
      // Create wavy vein line
      float veinX = rotatedUV.x * 8.0 + fbm(rotatedUV * 3.0) * 2.0;
      float vein = smoothstep(0.02, 0.0, abs(fract(veinX) - 0.5) - 0.4);
      
      // Flow animation - light travels upward
      float flow = sin((vPosition.y * 2.0 - flowOffset + i * 0.5) * 3.14159) * 0.5 + 0.5;
      flow = pow(flow, 3.0); // Sharper pulses
      
      veinPattern += vein * flow * 0.4;
    }
    
    // Main upward energy flow
    float mainFlow = sin((vPosition.y * 1.5 - uTime * 0.4) * 3.14159) * 0.5 + 0.5;
    mainFlow = pow(mainFlow, 2.0);
    
    // Combine base color with glowing veins
    float totalGlow = veinPattern + mainFlow * 0.3;
    totalGlow = clamp(totalGlow, 0.0, 1.0);
    
    // Add edge glow (fresnel effect)
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    totalGlow += fresnel * 0.3;
    
    vec3 finalColor = mix(baseColor, uGlowColor, totalGlow * uEmissiveIntensity);
    
    // Add emissive component
    vec3 emissive = uGlowColor * totalGlow * uEmissiveIntensity * 0.8;
    
    gl_FragColor = vec4(finalColor + emissive, 1.0);
  }
`;

const LivingTrunk = () => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const materialsRef = useRef<THREE.ShaderMaterial[]>([]);
  
  // Load the GLB model
  const { scene } = useGLTF("/models/Tree.glb");
  
  // Clone the scene and apply custom shader material
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    materialsRef.current = [];
    
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Create custom shader material with flowing light
        const customMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uBaseColor: { value: new THREE.Color("#4A3A2A") },
            uGlowColor: { value: new THREE.Color("#FFD700") },
            uEmissiveIntensity: { value: 1.2 },
          },
          vertexShader: flowingLightVertexShader,
          fragmentShader: flowingLightFragmentShader,
          side: THREE.DoubleSide,
        });
        
        child.material = customMaterial;
        materialsRef.current.push(customMaterial);
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
      groupRef.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.005);
    }
    
    // Update shader time uniforms
    materialsRef.current.forEach((mat) => {
      if (mat.uniforms.uTime) {
        mat.uniforms.uTime.value = time;
      }
    });
    
    // Pulsing ground glow
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.2 + Math.sin(time * 1.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* The GLB tree model */}
      <primitive 
        object={clonedScene} 
        scale={[7.5, 7.5, 7.5]} 
        position={[0, -0.5, 0]} 
        rotation={[0, 0, 0]}
      />
      
      {/* Enhanced ground glow ring */}
      <mesh 
        ref={glowRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.4, 0]}
      >
        <ringGeometry args={[0.2, 3, 64]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner glow ring */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.35, 0]}
      >
        <ringGeometry args={[0.1, 1.5, 64]} />
        <meshBasicMaterial
          color="#FFA500"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Enhanced golden lights */}
      <pointLight position={[0, 4, 0]} intensity={1.2} color="#FFD700" distance={12} />
      <pointLight position={[2, 2, 2]} intensity={0.6} color="#FFA500" distance={8} />
      <pointLight position={[-2, 3, -2]} intensity={0.6} color="#FFD700" distance={8} />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#B8860B" distance={6} />
    </group>
  );
};

// Preload the model
useGLTF.preload("/models/Tree.glb");

export default LivingTrunk;
