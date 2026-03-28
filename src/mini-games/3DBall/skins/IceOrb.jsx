import React, { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
// Using meshPhysicalMaterial with transmission for more controlled ice look
import * as THREE from 'three';
import ParticleSystem from '../effects/ParticleSystem';

/* ────────────────────────────────────────────
   Frost surface shader — animated branching ice
   ──────────────────────────────────────────── */
const frostVertex = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frostFragment = `
  uniform float uTime;
  uniform float uCrack;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  // Voronoi for ice crystal cells
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  float voronoi(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float minDist = 1.0;
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        vec2 neighbor = vec2(float(x), float(y));
        vec2 point = hash2(i + neighbor);
        point = 0.5 + 0.5 * sin(uTime * 0.3 + 6.2831 * point);
        float d = length(neighbor + point - f);
        minDist = min(minDist, d);
      }
    }
    return minDist;
  }

  // Edge detection for cracks
  float voronoiEdge(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float d1 = 1.0, d2 = 1.0;
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        vec2 neighbor = vec2(float(x), float(y));
        vec2 point = hash2(i + neighbor);
        point = 0.5 + 0.5 * sin(uTime * 0.1 + 6.2831 * point);
        float d = length(neighbor + point - f);
        if (d < d1) { d2 = d1; d1 = d; }
        else if (d < d2) { d2 = d; }
      }
    }
    return d2 - d1;
  }

  void main() {
    // Map UVs to sphere coordinates for seamless tiling
    vec2 uv = vUv * 6.0;

    // Frost crystal pattern
    float cells = voronoi(uv);
    float edges = voronoiEdge(uv * 1.5);

    // Crack lines — intensify with uCrack
    float crackLines = smoothstep(0.02, 0.0, edges) * uCrack;

    // Base frost color — pale blue-white
    vec3 frostColor = mix(vec3(0.75, 0.88, 0.95), vec3(0.9, 0.95, 1.0), cells);

    // Add crack glow — cyan light bleeding through cracks
    vec3 crackGlow = vec3(0.3, 0.8, 1.0) * crackLines * 3.0;

    // Surface frost opacity — more visible when cracked
    float frostAlpha = 0.06 + cells * 0.08 + crackLines * 0.5;

    // Fresnel — frost is more visible at edges
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
    fresnel = pow(fresnel, 2.0);
    frostAlpha += fresnel * 0.15;

    // Shimmer — sparkle effect
    float shimmer = sin(uv.x * 40.0 + uTime * 2.0) * sin(uv.y * 40.0 - uTime * 1.5);
    shimmer = max(0.0, shimmer) * 0.3;

    gl_FragColor = vec4(frostColor + crackGlow + shimmer, frostAlpha);
  }
`;

/* ────────────────────────────────────────────
   Crystal Lattice — sacred geometry wireframe
   ──────────────────────────────────────────── */
function CrystalLattice({ cracked }) {
  const groupRef = useRef();
  const edgesGeo = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(0.55, 0);
    return new THREE.EdgesGeometry(ico);
  }, []);

  // Secondary inner dodecahedron
  const innerGeo = useMemo(() => {
    const dodeca = new THREE.DodecahedronGeometry(0.35, 0);
    return new THREE.EdgesGeometry(dodeca);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.x = t * 0.12;
    groupRef.current.rotation.y = t * 0.18;
    groupRef.current.rotation.z = t * 0.08;

    // Pulse intensity when cracked
    const children = groupRef.current.children;
    if (children[0]?.material) {
      const intensity = cracked
        ? 0.8 + Math.sin(t * 3) * 0.4
        : 0.3 + Math.sin(t * 1.5) * 0.15;
      children[0].material.opacity = intensity;
      children[1].material.opacity = intensity * 0.7;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer icosahedron wireframe */}
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial
          color="#88ddff"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
      {/* Inner dodecahedron wireframe */}
      <lineSegments geometry={innerGeo}>
        <lineBasicMaterial
          color="#aaeeff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}

/* ────────────────────────────────────────────
   Ice Shard — floating crystal fragments
   ──────────────────────────────────────────── */
function IceShards({ cracked }) {
  const shardsRef = useRef();

  const shards = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const theta = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.5 + Math.random() * 0.35;
      return {
        basePos: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * r,
          Math.cos(phi) * r,
          Math.sin(phi) * Math.sin(theta) * r
        ),
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: 0.04 + Math.random() * 0.08,
        driftSpeed: 0.5 + Math.random() * 1.0,
        driftOffset: Math.random() * Math.PI * 2,
        burstDir: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta)
        ).normalize(),
      };
    });
  }, []);

  useFrame((state) => {
    if (!shardsRef.current) return;
    const t = state.clock.elapsedTime;

    shardsRef.current.children.forEach((child, i) => {
      const s = shards[i];
      if (cracked) {
        // Shards drift outward when cracked
        const burst = 0.3 + Math.sin(t * 2 + s.driftOffset) * 0.1;
        child.position.copy(s.basePos).addScaledVector(s.burstDir, burst);
      } else {
        // Gentle float inside
        child.position.copy(s.basePos);
        child.position.y += Math.sin(t * s.driftSpeed + s.driftOffset) * 0.03;
      }
      child.rotation.x += 0.005;
      child.rotation.z += 0.003;
    });
  });

  return (
    <group ref={shardsRef}>
      {shards.map((s, i) => (
        <mesh key={i} position={s.basePos.toArray()} rotation={s.rotation} scale={s.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#ccefff"
            emissive="#55ccff"
            emissiveIntensity={0.2}
            metalness={0.1}
            roughness={0.05}
            transparent
            opacity={0.6}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ────────────────────────────────────────────
   Main Ice Orb Component
   ──────────────────────────────────────────── */
export default function IceOrb() {
  const shellRef = useRef();
  const frostRef = useRef();
  const groupRef = useRef();
  const [cracked, setCracked] = useState(false);

  // Frost shader uniforms
  const frostUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uCrack: { value: 0 },
  }), []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    setCracked((prev) => !prev);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Slow rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.08;
    }

    // Shell breathing
    if (shellRef.current) {
      const breathe = 1.0 + Math.sin(t * 0.8) * 0.005;
      shellRef.current.scale.setScalar(breathe);
    }

    // Frost shader updates
    if (frostRef.current?.material?.uniforms) {
      frostRef.current.material.uniforms.uTime.value = t;
      // Smooth crack transition
      const targetCrack = cracked ? 1.0 : 0.0;
      const current = frostRef.current.material.uniforms.uCrack.value;
      frostRef.current.material.uniforms.uCrack.value += (targetCrack - current) * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {/* === OUTER ICE SHELL — clear glacial ice === */}
      <mesh
        ref={shellRef}
        onClick={handleClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <sphereGeometry args={[1.2, 128, 128]} />
        <meshPhysicalMaterial
          color={cracked ? '#88bbdd' : '#99ccee'}
          metalness={0.0}
          roughness={0.0}
          transmission={cracked ? 0.85 : 0.7}
          thickness={cracked ? 0.3 : 0.8}
          ior={1.31}
          clearcoat={1}
          clearcoatRoughness={0.0}
          envMapIntensity={1.5}
          specularIntensity={1.0}
          transparent
          opacity={cracked ? 0.25 : 0.4}
          attenuationColor="#88ccff"
          attenuationDistance={2.0}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* === FROST SURFACE LAYER — animated ice crystals === */}
      <mesh ref={frostRef} scale={1.22}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <shaderMaterial
          vertexShader={frostVertex}
          fragmentShader={frostFragment}
          uniforms={frostUniforms}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
          blending={THREE.NormalBlending}
        />
      </mesh>

      {/* === CRYSTAL LATTICE — sacred geometry inside === */}
      <CrystalLattice cracked={cracked} />

      {/* === ICE SHARDS — floating crystal fragments === */}
      <IceShards cracked={cracked} />

      {/* === FROZEN CORE — captured starlight === */}
      <mesh scale={cracked ? 0.15 : 0.1}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial
          color="#88ccee"
          transparent
          opacity={cracked ? 0.6 : 0.3}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Core point light — pulses when cracked */}
      <pointLight
        color="#88ddff"
        intensity={cracked ? 1.0 : 0.2}
        distance={2.5}
        decay={2}
      />

      {/* === COLD AURA — frosty rim glow === */}
      <mesh scale={1.38}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#3399cc"
          transparent
          opacity={cracked ? 0.12 : 0.04}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* === PARTICLES === */}
      {/* Falling ice mist — cold air sinks */}
      <ParticleSystem
        count={120}
        color="#bbddff"
        size={0.03}
        speed={0.25}
        spread={2.8}
        direction={new THREE.Vector3(0, -0.3, 0)}
        lifetime={6}
        opacity={0.35}
        behavior="float"
      />

      {/* Diamond sparkles — tiny sharp flashes */}
      <ParticleSystem
        count={60}
        color="#ffffff"
        size={0.012}
        speed={0.15}
        spread={1.6}
        direction={new THREE.Vector3(0, 0.05, 0)}
        lifetime={1.5}
        opacity={1.0}
        behavior="orbit"
        origin={new THREE.Vector3(0, 0, 0)}
      />

      {/* Snowfall — gentle flakes drifting around the orb */}
      <ParticleSystem
        count={200}
        color="#ffffff"
        size={0.025}
        speed={0.4}
        spread={5.0}
        direction={new THREE.Vector3(0, -1, 0)}
        lifetime={8}
        opacity={0.6}
        behavior="float"
        origin={new THREE.Vector3(0, 2.5, 0)}
      />

      {/* Burst particles when cracked */}
      {cracked && (
        <ParticleSystem
          count={80}
          color="#66ccff"
          size={0.04}
          speed={1.5}
          spread={0.5}
          direction={new THREE.Vector3(0, 0.5, 0)}
          lifetime={2}
          opacity={0.7}
          behavior="explode"
          origin={new THREE.Vector3(0, 0, 0)}
        />
      )}
    </group>
  );
}
