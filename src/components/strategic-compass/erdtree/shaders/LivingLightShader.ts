import * as THREE from "three";

// Custom shader for bioluminescent energy flow
export const livingLightVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const livingLightFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uGlowColor;
  uniform float uFlowSpeed;
  uniform float uPulseIntensity;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    // Create flowing wave effect from bottom to top
    float flowPosition = fract(vPosition.y * 0.15 - uTime * uFlowSpeed);
    
    // Create smooth pulse wave
    float pulseWidth = 0.25;
    float pulse = smoothstep(0.0, pulseWidth, flowPosition) * 
                  smoothstep(pulseWidth * 2.0, pulseWidth, flowPosition);
    pulse *= uPulseIntensity;
    
    // Add secondary slower wave for depth
    float secondaryFlow = fract(vPosition.y * 0.1 - uTime * uFlowSpeed * 0.5);
    float secondaryPulse = smoothstep(0.0, 0.3, secondaryFlow) * 
                          smoothstep(0.6, 0.3, secondaryFlow) * 0.3;
    
    // Combine pulses
    float totalPulse = pulse + secondaryPulse;
    
    // Mix base color with glow based on pulse
    vec3 finalColor = mix(uBaseColor, uGlowColor, totalPulse);
    
    // Add rim lighting effect
    float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
    rim = pow(rim, 2.0) * 0.5;
    finalColor += uGlowColor * rim * 0.3;
    
    // Add base emissive
    finalColor += uBaseColor * 0.2;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const tendrilVertexShader = `
  attribute float lineDistance;
  varying float vLineDistance;
  varying vec3 vPosition;
  
  void main() {
    vLineDistance = lineDistance;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const tendrilFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uFlowSpeed;
  uniform float uOpacity;
  
  varying float vLineDistance;
  varying vec3 vPosition;
  
  void main() {
    // Create flowing pulse along the tendril
    float flow = fract(vLineDistance * 2.0 - uTime * uFlowSpeed);
    float pulse = smoothstep(0.0, 0.15, flow) * smoothstep(0.3, 0.15, flow);
    
    // Base glow with pulse
    float intensity = 0.3 + pulse * 0.7;
    
    vec3 finalColor = uColor * intensity;
    float alpha = uOpacity * (0.4 + pulse * 0.6);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const createLivingLightMaterial = (
  baseColor: string = "#8B7355",
  glowColor: string = "#FFD700",
  flowSpeed: number = 0.08,
  pulseIntensity: number = 1.5
) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(baseColor) },
      uGlowColor: { value: new THREE.Color(glowColor) },
      uFlowSpeed: { value: flowSpeed },
      uPulseIntensity: { value: pulseIntensity },
    },
    vertexShader: livingLightVertexShader,
    fragmentShader: livingLightFragmentShader,
    side: THREE.DoubleSide,
  });
};

export const createTendrilMaterial = (
  color: string = "#FFD700",
  flowSpeed: number = 0.15,
  opacity: number = 0.8
) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uFlowSpeed: { value: flowSpeed },
      uOpacity: { value: opacity },
    },
    vertexShader: tendrilVertexShader,
    fragmentShader: tendrilFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
};
