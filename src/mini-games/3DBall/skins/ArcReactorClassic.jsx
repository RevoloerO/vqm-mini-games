import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ParticleSystem from '../effects/ParticleSystem';

/* ────────────────────────────────────────────
   Spinning Ring — concentric energy bands
   ──────────────────────────────────────────── */
function EnergyRing({ radius, thickness = 0.02, color = '#ff8844', speed = 1, rotationAxis = [0, 1, 0], tilt = [0, 0, 0] }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.rotation.x = tilt[0] + (rotationAxis[0] ? t : 0);
    ref.current.rotation.y = tilt[1] + (rotationAxis[1] ? t : 0);
    ref.current.rotation.z = tilt[2] + (rotationAxis[2] ? t : 0);
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, thickness, 16, 100]} />
      <meshBasicMaterial
        color={color}
        toneMapped={false}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ────────────────────────────────────────────
   Energy Spokes — radiating lines from core
   ──────────────────────────────────────────── */
function EnergySpokes({ count = 10, length = 1.0, color = '#ff8844' }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = state.clock.elapsedTime * 0.15;
  });

  const spokes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return { angle, length: length * (0.7 + Math.random() * 0.3) };
    });
  }, [count, length]);

  return (
    <group ref={groupRef}>
      {spokes.map((s, i) => (
        <mesh key={i} rotation={[0, 0, s.angle]}>
          <boxGeometry args={[0.008, s.length * 2, 0.008]} />
          <meshBasicMaterial
            color={color}
            toneMapped={false}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ────────────────────────────────────────────
   Reactor Lattice — wireframe energy structure
   ──────────────────────────────────────────── */
function ReactorLattice() {
  const groupRef = useRef();

  const outerGeo = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(0.65, 1);
    return new THREE.EdgesGeometry(ico);
  }, []);

  const innerGeo = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(0.4, 0);
    return new THREE.EdgesGeometry(ico);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.x = t * 0.2;
    groupRef.current.rotation.y = t * 0.3;
    groupRef.current.rotation.z = t * 0.1;

    const pulse = 0.5 + Math.sin(t * 3) * 0.2;
    groupRef.current.children.forEach((child) => {
      if (child.material) child.material.opacity = pulse;
    });
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={outerGeo}>
        <lineBasicMaterial
          color="#ffaa44"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
      <lineSegments geometry={innerGeo}>
        <lineBasicMaterial
          color="#ffcc88"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}

/* ────────────────────────────────────────────
   Holographic HUD arcs
   ──────────────────────────────────────────── */
function HoloSegments() {
  const groupRef = useRef();

  const segments = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      angle: (i / 6) * Math.PI * 2,
      arcLen: 0.15 + Math.random() * 0.25,
      radius: 1.45 + Math.random() * 0.15,
      speed: 0.3 + Math.random() * 0.4,
      dir: Math.random() > 0.5 ? 1 : -1,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const s = segments[i];
      child.rotation.z = s.angle + t * s.speed * s.dir;
      if (child.children[0]?.material) {
        child.children[0].material.opacity = 0.25 + Math.sin(t * 2 + i) * 0.15;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {segments.map((s, i) => (
        <group key={i} rotation={[0, 0, s.angle]}>
          <mesh>
            <ringGeometry args={[s.radius - 0.02, s.radius + 0.02, 32, 1, 0, s.arcLen * Math.PI * 2]} />
            <meshBasicMaterial
              color="#ffaa44"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ────────────────────────────────────────────
   Main Arc Reactor — Classic warm variant
   ──────────────────────────────────────────── */
export default function ArcReactorClassic() {
  const groupRef = useRef();
  const coreRef = useRef();
  const pulseRef = useRef();

  const shellEdges = useMemo(() => {
    const shellGeo = new THREE.IcosahedronGeometry(1.2, 2);
    return new THREE.EdgesGeometry(shellGeo);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.08;
    }

    if (coreRef.current) {
      const heartbeat = Math.pow(Math.sin(t * 4) * 0.5 + 0.5, 3);
      const s = 0.2 + heartbeat * 0.08;
      coreRef.current.scale.setScalar(s);
    }

    if (pulseRef.current) {
      const cycle = (t * 0.5) % 1;
      const s = 1.0 + cycle * 0.6;
      pulseRef.current.scale.setScalar(s);
      pulseRef.current.material.opacity = (1 - cycle) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* === CONTAINMENT SHELL — wireframe cage === */}
      <lineSegments geometry={shellEdges}>
        <lineBasicMaterial
          color="#aa6622"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* === REACTOR LATTICE — wireframe energy structure === */}
      <ReactorLattice />

      {/* === ENERGY SPOKES — radiating lines === */}
      <EnergySpokes count={12} length={1.1} color="#ff8844" />

      {/* === CONCENTRIC ENERGY RINGS === */}
      <EnergyRing radius={0.9} thickness={0.015} color="#ff8844" speed={0.6} rotationAxis={[0, 1, 0]} />
      <EnergyRing radius={0.75} thickness={0.012} color="#ffaa55" speed={-0.9} rotationAxis={[1, 0, 0]} tilt={[0.3, 0, 0]} />
      <EnergyRing radius={0.55} thickness={0.01} color="#ffcc77" speed={1.2} rotationAxis={[0, 0, 1]} tilt={[0.5, 0.3, 0]} />
      <EnergyRing radius={1.1} thickness={0.008} color="#cc6622" speed={-0.3} rotationAxis={[0, 1, 0]} />

      {/* === BRIGHT CORE — concentrated fusion energy === */}
      <mesh ref={coreRef} scale={0.2}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial
          color="#ffffff"
          toneMapped={false}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Core glow — layered */}
      <mesh scale={0.35}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#ffaa44"
          toneMapped={false}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* === PULSE RING — expanding energy wave === */}
      <mesh ref={pulseRef}>
        <ringGeometry args={[1.15, 1.2, 64]} />
        <meshBasicMaterial
          color="#ffaa44"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* === CORE LIGHT === */}
      <pointLight color="#ff8833" intensity={5} distance={8} decay={2} />

      {/* === HOLOGRAPHIC HUD SEGMENTS === */}
      <HoloSegments />

      {/* === ENERGY FIELD AURA === */}
      <mesh scale={1.5}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#aa5500"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* === PARTICLES === */}
      <ParticleSystem
        count={120}
        color="#ffaa44"
        size={0.02}
        speed={0.8}
        spread={1.8}
        direction={new THREE.Vector3(0, 0, 0)}
        lifetime={3}
        opacity={0.6}
        behavior="orbit"
      />

      <ParticleSystem
        count={60}
        color="#ffcc88"
        size={0.015}
        speed={0.5}
        spread={1.2}
        direction={new THREE.Vector3(0, 0.5, 0)}
        lifetime={4}
        opacity={0.4}
        behavior="rise"
      />
    </group>
  );
}
