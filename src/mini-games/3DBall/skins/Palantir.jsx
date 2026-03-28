import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ParticleSystem from '../effects/ParticleSystem';

function SmokeShaderMaterial() {
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 5; i++) {
        value += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv;

      // Swirling smoke
      float n1 = fbm(uv * 3.0 + uTime * 0.2);
      float n2 = fbm(uv * 5.0 - uTime * 0.3 + vec2(n1 * 2.0));
      float n3 = fbm(uv * 2.0 + vec2(n2, n1) + uTime * 0.1);

      float smoke = n3 * 0.7;

      // Eerie green/dark color
      vec3 color = mix(
        vec3(0.0, 0.02, 0.01),
        vec3(0.0, 0.3, 0.1),
        smoke
      );

      // Eye-like bright spot in center
      float dist = length(uv - 0.5);
      float eye = smoothstep(0.2, 0.05, dist);
      color += vec3(0.8, 0.2, 0.0) * eye * (sin(uTime) * 0.3 + 0.7);

      float alpha = smoke * 0.8 + eye * 0.5;

      gl_FragColor = vec4(color, alpha);
    }
  `;

  return (
    <shaderMaterial
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      transparent
      depthWrite={false}
      side={THREE.DoubleSide}
      ref={(mat) => {
        if (mat) mat._uniforms = uniforms;
      }}
    />
  );
}

export default function Palantir() {
  const groupRef = useRef();
  const smokeRef = useRef();
  const pupilRef = useRef();
  const shieldRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pointer = state.pointer;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
    }

    // Animate smoke inner sphere
    if (smokeRef.current) {
      const mat = smokeRef.current.material;
      if (mat._uniforms) {
        mat._uniforms.uTime.value = t;
      }
      smokeRef.current.rotation.y = t * 0.2;
      smokeRef.current.rotation.x = t * 0.15;
    }

    // Track pupil to mouse
    if (pupilRef.current) {
      pupilRef.current.position.x = pointer.x * 0.3;
      pupilRef.current.position.y = pointer.y * 0.3;

      // Angry pulsing when mouse is near center
      const dist = Math.sqrt(pointer.x ** 2 + pointer.y ** 2);
      const angry = Math.max(0, 1 - dist * 2);
      const scale = 0.15 + angry * 0.1 + Math.sin(t * 8) * angry * 0.03;
      pupilRef.current.scale.setScalar(scale);

      // Shield glow
      if (shieldRef.current) {
        shieldRef.current.material.opacity = angry * 0.15;
        shieldRef.current.material.color.setHSL(angry * 0.05, 1, 0.5);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer dark glass sphere */}
      <mesh>
        <sphereGeometry args={[1.2, 128, 128]} />
        <meshPhysicalMaterial
          color="#111122"
          metalness={0.8}
          roughness={0.05}
          transmission={0.3}
          thickness={2}
          ior={2.0}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Internal smoke volume */}
      <mesh ref={smokeRef} scale={0.9}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <SmokeShaderMaterial />
      </mesh>

      {/* Eye / pupil */}
      <mesh ref={pupilRef} position={[0, 0, 1.0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#ff4400"
          toneMapped={false}
        />
      </mesh>

      {/* Shield / anger aura */}
      <mesh ref={shieldRef} scale={1.3}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#ff2200"
          transparent
          opacity={0}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Dark mist particles */}
      <ParticleSystem
        count={80}
        color="#224422"
        size={0.06}
        speed={0.2}
        spread={2}
        direction={new THREE.Vector3(0, 0.1, 0)}
        lifetime={4}
        opacity={0.3}
        behavior="float"
      />
    </group>
  );
}
