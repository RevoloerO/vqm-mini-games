import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ParticleSystem from '../effects/ParticleSystem';

// --- Phase-specific sub-components ---

function RockSphere({ progress, cracking }) {
  const meshRef = useRef();
  const crackGlowRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.05;
    }
    if (crackGlowRef.current) {
      crackGlowRef.current.material.opacity = cracking ? 0.3 + Math.sin(t * 5) * 0.15 : 0;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshPhysicalMaterial
          color={new THREE.Color().lerpColors(
            new THREE.Color('#665544'),
            new THREE.Color('#44663a'),
            progress
          )}
          metalness={0.1}
          roughness={0.85}
          envMapIntensity={0.5}
        />
      </mesh>
      {/* Green glow through cracks when transitioning */}
      <mesh ref={crackGlowRef} scale={1.01}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#44ff44"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function GreenSphere() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshPhysicalMaterial
          color="#338833"
          metalness={0.05}
          roughness={0.6}
          envMapIntensity={1}
        />
      </mesh>
      {/* Life glow */}
      <mesh scale={1.3}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#22aa22"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function LavaSphere({ heatIntensity }) {
  const meshRef = useRef();
  const lavaRef = useRef();

  const lavaUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHeat: { value: 0 },
  }), []);

  const lavaVertex = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    void main() {
      vUv = uv;
      vPosition = position;
      float displacement = sin(position.x * 10.0 + uTime) * sin(position.y * 10.0 + uTime) * 0.03;
      vec3 newPos = position + normal * displacement;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `;

  const lavaFragment = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uHeat;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float v = 0.0; float a = 0.5;
      for (int i = 0; i < 4; i++) { v += a*noise(p); p *= 2.0; a *= 0.5; }
      return v;
    }

    void main() {
      vec2 uv = vUv * 4.0;
      float n = fbm(uv + uTime * 0.3);
      float cracks = smoothstep(0.45, 0.5, n) * smoothstep(0.55, 0.5, n);

      vec3 rockColor = vec3(0.15, 0.1, 0.08);
      vec3 lavaColor = mix(vec3(1.0, 0.3, 0.0), vec3(1.0, 0.8, 0.0), n);
      vec3 color = mix(rockColor, lavaColor, cracks * uHeat + uHeat * 0.2);

      // Emissive lava glow
      float glow = cracks * uHeat * 2.0;
      color += lavaColor * glow;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    lavaUniforms.uTime.value = t;
    lavaUniforms.uHeat.value = heatIntensity;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <shaderMaterial
          vertexShader={lavaVertex}
          fragmentShader={lavaFragment}
          uniforms={lavaUniforms}
        />
      </mesh>
      {/* Heat glow */}
      <mesh scale={1.3}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={heatIntensity * 0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function WaterSphere() {
  const meshRef = useRef();
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  const waterVertex = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      float wave = sin(position.x * 8.0 + uTime * 2.0) * sin(position.z * 8.0 + uTime * 1.5) * 0.03;
      wave += sin(position.y * 12.0 + uTime * 3.0) * 0.015;
      vec3 newPos = position + normal * wave;
      vPosition = newPos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `;

  const waterFragment = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;

    void main() {
      vec3 deepColor = vec3(0.0, 0.15, 0.35);
      vec3 surfaceColor = vec3(0.1, 0.5, 0.7);
      vec3 foamColor = vec3(0.7, 0.9, 1.0);

      // Fresnel for depth feel
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);

      vec3 color = mix(deepColor, surfaceColor, fresnel);

      // Caustics pattern
      float caustic = sin(vUv.x * 20.0 + uTime) * sin(vUv.y * 20.0 + uTime * 0.7);
      caustic = smoothstep(0.3, 0.5, caustic * 0.5 + 0.5);
      color += foamColor * caustic * 0.15;

      // Rim light
      color += vec3(0.3, 0.6, 0.8) * fresnel * 0.8;

      gl_FragColor = vec4(color, 0.9);
    }
  `;

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <shaderMaterial
          vertexShader={waterVertex}
          fragmentShader={waterFragment}
          uniforms={uniforms}
          transparent
        />
      </mesh>
      <mesh scale={1.25}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#2288aa"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// --- Main Genesis Sphere ---

const PHASE_DURATIONS = {
  seeding: Infinity,
  growth: 20000,
  destruction: 12000,
  restoration: 18000,
};

const PHASE_ORDER = ['seeding', 'growth', 'destruction', 'restoration'];

export default function GenesisSphere({ onPhaseChange }) {
  const [phase, setPhase] = useState('seeding');
  const [seedProgress, setSeedProgress] = useState(0);
  const [heatIntensity, setHeatIntensity] = useState(0);
  const [cycleCount, setCycleCount] = useState(1);
  const [transitionActive, setTransitionActive] = useState(false);
  const phaseTimerRef = useRef(null);
  const seedCountRef = useRef(0);
  const groupRef = useRef();

  const TOTAL_SEEDS = 15;

  // Handle click to plant seeds
  const handleClick = useCallback((e) => {
    if (phase !== 'seeding' || transitionActive) return;
    e.stopPropagation();

    seedCountRef.current++;
    const progress = Math.min(seedCountRef.current / TOTAL_SEEDS, 1);
    setSeedProgress(progress);

    if (progress >= 1) {
      transitionTo('growth');
    }
  }, [phase, transitionActive]);

  const transitionTo = useCallback((nextPhase) => {
    setTransitionActive(true);

    setTimeout(() => {
      setPhase(nextPhase);
      setTransitionActive(false);
      onPhaseChange?.(nextPhase);

      if (nextPhase === 'destruction') {
        // Gradually increase heat
        let heat = 0;
        const heatInterval = setInterval(() => {
          heat += 0.02;
          setHeatIntensity(Math.min(heat, 1));
          if (heat >= 1) clearInterval(heatInterval);
        }, 100);
      }
      if (nextPhase === 'restoration') {
        setHeatIntensity(0);
      }
      if (nextPhase === 'seeding') {
        seedCountRef.current = 0;
        setSeedProgress(0);
        setHeatIntensity(0);
      }
    }, 2000); // 2 second transition
  }, [onPhaseChange]);

  // Phase timer
  useEffect(() => {
    if (transitionActive) return;
    const duration = PHASE_DURATIONS[phase];
    if (duration === Infinity) return;

    phaseTimerRef.current = setTimeout(() => {
      const currentIdx = PHASE_ORDER.indexOf(phase);
      const nextIdx = (currentIdx + 1) % PHASE_ORDER.length;
      const nextPhase = PHASE_ORDER[nextIdx];

      if (nextPhase === 'seeding') {
        setCycleCount(c => c + 1);
      }

      transitionTo(nextPhase);
    }, duration);

    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, [phase, transitionActive, transitionTo]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Phase-specific sphere */}
      {phase === 'seeding' && (
        <RockSphere progress={seedProgress} cracking={transitionActive} />
      )}
      {phase === 'growth' && <GreenSphere />}
      {phase === 'destruction' && <LavaSphere heatIntensity={heatIntensity} />}
      {phase === 'restoration' && <WaterSphere />}

      {/* Phase-specific particles */}
      {phase === 'seeding' && (
        <ParticleSystem
          count={30 + Math.floor(seedProgress * 70)}
          color="#88aa44"
          size={0.02}
          speed={0.3}
          spread={2}
          direction={new THREE.Vector3(0, 0.2, 0)}
          lifetime={3}
          opacity={0.4 + seedProgress * 0.4}
          behavior="float"
        />
      )}

      {phase === 'growth' && (
        <>
          {/* Flower petals */}
          <ParticleSystem
            count={150}
            color="#ff88aa"
            size={0.04}
            speed={0.5}
            spread={2.5}
            direction={new THREE.Vector3(0, 0.5, 0)}
            lifetime={4}
            opacity={0.7}
            behavior="float"
          />
          {/* Pollen */}
          <ParticleSystem
            count={100}
            color="#ffee88"
            size={0.015}
            speed={0.2}
            spread={3}
            direction={new THREE.Vector3(0, 0.3, 0)}
            lifetime={5}
            opacity={0.5}
            behavior="float"
          />
          {/* Leaf particles */}
          <ParticleSystem
            count={60}
            color="#44aa44"
            size={0.035}
            speed={0.4}
            spread={2}
            direction={new THREE.Vector3(0, -0.1, 0)}
            lifetime={4}
            opacity={0.6}
            behavior="float"
          />
        </>
      )}

      {phase === 'destruction' && (
        <>
          {/* Embers */}
          <ParticleSystem
            count={250}
            color="#ff6600"
            size={0.03}
            speed={2}
            spread={1.5}
            direction={new THREE.Vector3(0, 2, 0)}
            gravity={-0.5}
            lifetime={2.5}
            opacity={0.8}
            behavior="rise"
          />
          {/* Smoke */}
          <ParticleSystem
            count={100}
            color="#333333"
            size={0.12}
            speed={0.8}
            spread={1.5}
            direction={new THREE.Vector3(0, 1.5, 0)}
            lifetime={4}
            opacity={0.3}
            behavior="rise"
            blending={THREE.NormalBlending}
          />
          {/* Sparks */}
          <ParticleSystem
            count={80}
            color="#ffcc00"
            size={0.015}
            speed={3}
            spread={1}
            direction={new THREE.Vector3(0, 1, 0)}
            lifetime={1}
            opacity={1}
            behavior="explode"
          />
        </>
      )}

      {phase === 'restoration' && (
        <>
          {/* Rain */}
          <ParticleSystem
            count={200}
            color="#88bbff"
            size={0.02}
            speed={3}
            spread={4}
            direction={new THREE.Vector3(0, -3, 0)}
            lifetime={1.5}
            opacity={0.5}
            behavior="rise"
            origin={new THREE.Vector3(0, 3, 0)}
          />
          {/* Bubbles */}
          <ParticleSystem
            count={50}
            color="#aaddff"
            size={0.04}
            speed={0.3}
            spread={1.5}
            direction={new THREE.Vector3(0, 0.5, 0)}
            lifetime={3}
            opacity={0.4}
            behavior="float"
          />
          {/* Healing sparkles */}
          <ParticleSystem
            count={80}
            color="#44ffaa"
            size={0.025}
            speed={0.5}
            spread={2}
            direction={new THREE.Vector3(0, 0.3, 0)}
            lifetime={2.5}
            opacity={0.6}
            behavior="orbit"
          />
        </>
      )}

      {/* Transition burst */}
      {transitionActive && (
        <ParticleSystem
          count={200}
          color="#ffffff"
          size={0.05}
          speed={4}
          spread={0.5}
          direction={new THREE.Vector3(0, 0, 0)}
          lifetime={2}
          opacity={0.9}
          behavior="explode"
        />
      )}
    </group>
  );
}

// Export phase info for UI
export { PHASE_ORDER, PHASE_DURATIONS };
