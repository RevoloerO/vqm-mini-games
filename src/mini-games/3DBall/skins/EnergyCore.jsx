import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { plasmaVertexShader, plasmaFragmentShader } from '../shaders/plasma';
import ParticleSystem from '../effects/ParticleSystem';

function LightningArc({ startAngle, radius = 1.4 }) {
  const lineRef = useRef();
  const points = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => new THREE.Vector3());
  }, []);

  useFrame((state) => {
    if (!lineRef.current) return;
    const t = state.clock.elapsedTime;
    const geom = lineRef.current.geometry;
    const positions = geom.attributes.position.array;

    for (let i = 0; i < 20; i++) {
      const frac = i / 19;
      const angle = startAngle + frac * Math.PI * 0.8;
      const r = radius + (Math.random() - 0.5) * 0.15;
      const jitter = (Math.random() - 0.5) * 0.2;

      positions[i * 3] = Math.cos(angle + t * 0.5) * r + jitter;
      positions[i * 3 + 1] = (frac - 0.5) * 2 + jitter * 0.5;
      positions[i * 3 + 2] = Math.sin(angle + t * 0.5) * r + jitter;
    }
    geom.attributes.position.needsUpdate = true;
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={20}
          array={new Float32Array(60)}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#cc88ff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </line>
  );
}

export default function EnergyCore() {
  const meshRef = useRef();
  const coreRef = useRef();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#6622cc') },
    uColor2: { value: new THREE.Color('#cc44ff') },
  }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    }
    if (coreRef.current) {
      const pulse = 0.4 + Math.sin(t * 4) * 0.08;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  const arcAngles = useMemo(() => [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5, Math.PI * 0.3, Math.PI * 1.2], []);

  return (
    <group>
      {/* Plasma shell */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <shaderMaterial
          vertexShader={plasmaVertexShader}
          fragmentShader={plasmaFragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>

      {/* Bright inner core */}
      <mesh ref={coreRef} scale={0.4}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#ee88ff"
          toneMapped={false}
        />
      </mesh>

      {/* Outer containment glow */}
      <mesh scale={1.35}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#8844cc"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Lightning arcs */}
      {arcAngles.map((angle, i) => (
        <LightningArc key={i} startAngle={angle} />
      ))}

      {/* Plasma particles orbiting */}
      <ParticleSystem
        count={200}
        color="#aa66ff"
        size={0.025}
        speed={1}
        spread={1.5}
        direction={new THREE.Vector3(0, 0, 0)}
        lifetime={3}
        opacity={0.6}
        behavior="orbit"
      />

      {/* Spark particles */}
      <ParticleSystem
        count={60}
        color="#ffffff"
        size={0.015}
        speed={2}
        spread={0.8}
        direction={new THREE.Vector3(0, 1, 0)}
        lifetime={1}
        opacity={0.9}
        behavior="explode"
      />
    </group>
  );
}
