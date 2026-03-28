import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fireVertexShader, fireFragmentShader } from '../shaders/fire';
import ParticleSystem from '../effects/ParticleSystem';

export default function Fireball() {
  const meshRef = useRef();
  const glowRef = useRef();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#ff4400') },
    uColor2: { value: new THREE.Color('#ff8800') },
    uColor3: { value: new THREE.Color('#441100') },
  }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.3 + Math.sin(t * 3) * 0.05);
    }
  });

  return (
    <group>
      {/* Core fire sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <shaderMaterial
          vertexShader={fireVertexShader}
          fragmentShader={fireFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Inner hot core */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial color="#ffcc44" transparent opacity={0.6} toneMapped={false} />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef} scale={1.3}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Fire particles rising */}
      <ParticleSystem
        count={300}
        color="#ff6600"
        size={0.04}
        speed={2}
        spread={1.5}
        direction={new THREE.Vector3(0, 1, 0)}
        gravity={-0.5}
        lifetime={2}
        emissiveIntensity={3}
        opacity={0.7}
        behavior="rise"
      />

      {/* Ember particles */}
      <ParticleSystem
        count={100}
        color="#ffaa00"
        size={0.02}
        speed={1.5}
        spread={2}
        direction={new THREE.Vector3(0, 1.5, 0)}
        gravity={-0.2}
        lifetime={3}
        opacity={0.9}
        behavior="rise"
      />

      {/* Heat distortion particles (subtle) */}
      <ParticleSystem
        count={50}
        color="#ff2200"
        size={0.08}
        speed={0.5}
        spread={1}
        direction={new THREE.Vector3(0, 0.5, 0)}
        lifetime={1.5}
        opacity={0.15}
        behavior="float"
      />
    </group>
  );
}
