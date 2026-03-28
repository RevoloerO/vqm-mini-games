import React, { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ParticleSystem from '../effects/ParticleSystem';

/**
 * Energy creature silhouette that emerges from the Pokeball when opened.
 * Built from basic shapes to suggest a small creature form.
 */
function EnergySilhouette({ progress }) {
  const creatureRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (!creatureRef.current) return;
    const t = state.clock.elapsedTime;

    // Float and bob
    creatureRef.current.position.y = 0.6 + progress * 1.8 + Math.sin(t * 2) * 0.1 * progress;
    creatureRef.current.rotation.y = t * 1.5;

    // Scale in as ball opens
    const s = progress * 0.9;
    creatureRef.current.scale.setScalar(s);

    // Glow pulse
    if (glowRef.current) {
      glowRef.current.scale.setScalar(s * (1.3 + Math.sin(t * 4) * 0.15));
    }
  });

  if (progress < 0.05) return null;

  return (
    <group ref={creatureRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} toneMapped={false} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} toneMapped={false} />
      </mesh>

      {/* Left ear */}
      <mesh position={[-0.15, 0.58, 0]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.06, 0.22, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} toneMapped={false} />
      </mesh>

      {/* Right ear */}
      <mesh position={[0.15, 0.58, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.06, 0.22, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} toneMapped={false} />
      </mesh>

      {/* Tail */}
      <mesh position={[-0.2, 0.1, -0.15]} rotation={[0.3, 0.5, 0.8]}>
        <boxGeometry args={[0.05, 0.3, 0.03]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh position={[-0.3, 0.25, -0.18]} rotation={[0.3, 0.3, 0.3]}>
        <boxGeometry args={[0.15, 0.05, 0.03]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} toneMapped={false} />
      </mesh>

      {/* Eyes - small dark dots */}
      <mesh position={[-0.08, 0.38, 0.18]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#88bbff" toneMapped={false} />
      </mesh>
      <mesh position={[0.08, 0.38, 0.18]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#88bbff" toneMapped={false} />
      </mesh>

      {/* Cheek marks */}
      <mesh position={[-0.16, 0.32, 0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ffcc44" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <mesh position={[0.16, 0.32, 0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ffcc44" transparent opacity={0.6} toneMapped={false} />
      </mesh>

      {/* Energy glow aura */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial
          color="#88ccff"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default function Pokeball() {
  const groupRef = useRef();
  const topRef = useRef();
  const bottomRef = useRef();
  const buttonRef = useRef();
  const lightRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const openProgress = useRef(0);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pointer = state.pointer;

    if (groupRef.current) {
      // Mouse-based tilt
      groupRef.current.rotation.x = -pointer.y * 0.3;
      groupRef.current.rotation.y = pointer.x * 0.3 + t * 0.1;
    }

    // Animate open/close
    const target = isOpen ? 1 : 0;
    openProgress.current += (target - openProgress.current) * 0.05;

    if (topRef.current) {
      topRef.current.rotation.x = -openProgress.current * 0.6;
      topRef.current.position.y = openProgress.current * 0.3;
    }

    if (buttonRef.current) {
      const pulse = 1 + Math.sin(t * 3) * 0.05;
      buttonRef.current.scale.setScalar(pulse);
    }

    if (lightRef.current) {
      lightRef.current.intensity = openProgress.current * 5;
    }
  });

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  return (
    <group ref={groupRef}>
      {/* Top half - red */}
      <group ref={topRef}>
        <mesh>
          <sphereGeometry args={[1.2, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#cc0000"
            metalness={0.3}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.5}
          />
        </mesh>
      </group>

      {/* Bottom half - white */}
      <mesh ref={bottomRef}>
        <sphereGeometry args={[1.2, 64, 64, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#eeeeee"
          metalness={0.2}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Center band - black, rotated to horizontal equator */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.04, 16, 64]} />
        <meshPhysicalMaterial
          color="#222222"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Button assembly - sits proud on the sphere surface
           Layers (outside→in): black border → white ring → white center button */}
      <group position={[0, 0, 1.21]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Layer 1: Black outer border */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.05, 48]} />
          <meshPhysicalMaterial
            color="#1a1a1a"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>

        {/* Layer 2: White ring */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.05, 48]} />
          <meshPhysicalMaterial
            color="#e8e8e8"
            metalness={0.3}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>

        {/* Layer 3: White center button - subtle glow when closed, off when open */}
        <mesh
          ref={buttonRef}
          position={[0, 0.06, 0]}
          onClick={handleClick}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'default'}
        >
          <cylinderGeometry args={[0.14, 0.14, 0.05, 48]} />
          <meshPhysicalMaterial
            color="#f0f0f0"
            metalness={0.3}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.05}
            emissive={isOpen ? "#000000" : "#ffffff"}
            emissiveIntensity={isOpen ? 0 : 0.15}
          />
        </mesh>
      </group>

      {/* Subtle button glow light - only when closed */}
      {!isOpen && (
        <pointLight color="#ffffff" intensity={0.5} distance={1.2} position={[0, 0, 1.35]} />
      )}

      {/* Interior light when open */}
      <pointLight ref={lightRef} color="#88ccff" intensity={0} distance={4} position={[0, 0.5, 0]} />

      {/* Energy creature emerging when open */}
      <EnergySilhouette progress={openProgress.current} />

      {/* Shine effect */}
      <mesh scale={1.22}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          roughness={0}
          metalness={0.3}
          envMapIntensity={2}
          clearcoat={1}
        />
      </mesh>

      {/* Release energy particles when open */}
      {isOpen && (
        <>
          {/* White burst */}
          <ParticleSystem
            count={60}
            color="#ffffff"
            size={0.04}
            speed={1.5}
            spread={0.5}
            direction={new THREE.Vector3(0, 1, 0)}
            lifetime={1.5}
            opacity={0.8}
            behavior="explode"
            origin={new THREE.Vector3(0, 0.5, 0)}
          />
          {/* Blue energy sparkles around creature */}
          <ParticleSystem
            count={40}
            color="#88ccff"
            size={0.025}
            speed={0.5}
            spread={1}
            direction={new THREE.Vector3(0, 0.3, 0)}
            lifetime={2}
            opacity={0.6}
            behavior="orbit"
            origin={new THREE.Vector3(0, 2, 0)}
          />
          {/* Golden sparkle trail */}
          <ParticleSystem
            count={30}
            color="#ffdd66"
            size={0.02}
            speed={0.3}
            spread={0.8}
            direction={new THREE.Vector3(0, 0.5, 0)}
            lifetime={1.5}
            opacity={0.7}
            behavior="float"
            origin={new THREE.Vector3(0, 1.5, 0)}
          />
        </>
      )}
    </group>
  );
}
