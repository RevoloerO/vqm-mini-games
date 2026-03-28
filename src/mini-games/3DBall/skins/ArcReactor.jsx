import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ParticleSystem from '../effects/ParticleSystem';

/* ────────────────────────────────────────────
   Data Ring — spinning data bands with gaps
   ──────────────────────────────────────────── */
function DataRing({ radius, thickness = 0.015, color = '#00ccff', speed = 1, tilt = [0, 0, 0], segments = 8, gapRatio = 0.3 }) {
  const groupRef = useRef();

  const arcs = useMemo(() => {
    const arcAngle = (Math.PI * 2 / segments) * (1 - gapRatio);
    return Array.from({ length: segments }, (_, i) => {
      const startAngle = (i / segments) * Math.PI * 2;
      return { startAngle, arcAngle };
    });
  }, [segments, gapRatio]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed;
    groupRef.current.rotation.set(tilt[0] + t * 0.1, tilt[1] + t, tilt[2]);
  });

  return (
    <group ref={groupRef}>
      {arcs.map((arc, i) => (
        <mesh key={i}>
          <torusGeometry args={[radius, thickness, 8, 24, arc.arcAngle]} />
          <meshBasicMaterial
            color={color}
            toneMapped={false}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
          <group rotation={[0, 0, arc.startAngle]} />
        </mesh>
      ))}
    </group>
  );
}

/* ────────────────────────────────────────────
   Neural Network — interconnected nodes
   ──────────────────────────────────────────── */
function NeuralNetwork() {
  const groupRef = useRef();
  const nodesRef = useRef([]);

  const nodes = useMemo(() => {
    const pts = [];
    // Distribute nodes on a sphere surface
    for (let i = 0; i < 20; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 0.5 + Math.random() * 0.3;
      pts.push({
        pos: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * r,
          Math.cos(phi) * r,
          Math.sin(phi) * Math.sin(theta) * r
        ),
        baseScale: 0.015 + Math.random() * 0.02,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 1.5 + Math.random() * 2,
      });
    }
    return pts;
  }, []);

  // Build connections between nearby nodes
  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].pos.distanceTo(nodes[j].pos);
        if (dist < 0.7) {
          const geo = new THREE.BufferGeometry().setFromPoints([nodes[i].pos, nodes[j].pos]);
          lines.push({ geo, dist });
        }
      }
    }
    return lines;
  }, [nodes]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;

    // Pulse individual nodes
    nodesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const n = nodes[i];
      const pulse = 1 + Math.sin(t * n.pulseSpeed + n.pulseOffset) * 0.5;
      mesh.scale.setScalar(n.baseScale * pulse);
      mesh.material.opacity = 0.5 + pulse * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodes.map((n, i) => (
        <mesh
          key={`node-${i}`}
          ref={(el) => (nodesRef.current[i] = el)}
          position={n.pos}
          scale={n.baseScale}
        >
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#00eeff"
            toneMapped={false}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Connection lines */}
      {connections.map((c, i) => (
        <lineSegments key={`conn-${i}`} geometry={c.geo}>
          <lineBasicMaterial
            color="#0088cc"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      ))}
    </group>
  );
}

/* ────────────────────────────────────────────
   Scan Beam — rotating scanner line
   ──────────────────────────────────────────── */
function ScanBeam({ color = '#00ffcc', speed = 0.5, radius = 1.3 }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * speed;
  });

  return (
    <group ref={ref}>
      <mesh>
        <planeGeometry args={[radius * 2, 0.005]} />
        <meshBasicMaterial
          color={color}
          toneMapped={false}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Scan dot at end */}
      <mesh position={[radius, 0, 0]} scale={0.025}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          color={color}
          toneMapped={false}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[-radius, 0, 0]} scale={0.025}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          color={color}
          toneMapped={false}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ────────────────────────────────────────────
   Data Stream Lines — flowing vertical streams
   ──────────────────────────────────────────── */
function DataStreams() {
  const groupRef = useRef();
  const streamsRef = useRef([]);

  const streams = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const r = 1.0 + Math.random() * 0.3;
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        speed: 0.5 + Math.random() * 1.5,
        offset: Math.random() * Math.PI * 2,
        height: 0.3 + Math.random() * 0.5,
      };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    streamsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const s = streams[i];
      // Stream moves up and down
      const y = Math.sin(t * s.speed + s.offset) * 0.8;
      mesh.position.y = y;
      mesh.material.opacity = 0.15 + Math.abs(Math.sin(t * s.speed * 2 + s.offset)) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {streams.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => (streamsRef.current[i] = el)}
          position={[s.x, 0, s.z]}
        >
          <boxGeometry args={[0.004, s.height, 0.004]} />
          <meshBasicMaterial
            color="#00ccff"
            toneMapped={false}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ────────────────────────────────────────────
   Holographic Data Arcs — orbiting UI segments
   ──────────────────────────────────────────── */
function HoloArcs() {
  const groupRef = useRef();

  const arcs = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      arcLen: 0.08 + Math.random() * 0.15,
      radius: 1.4 + (i % 3) * 0.08,
      speed: 0.2 + Math.random() * 0.3,
      dir: i % 2 === 0 ? 1 : -1,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const a = arcs[i];
      child.rotation.z = a.angle + t * a.speed * a.dir;
      if (child.children[0]?.material) {
        child.children[0].material.opacity = 0.2 + Math.sin(t * 1.5 + i * 0.8) * 0.1;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {arcs.map((a, i) => (
        <group key={i} rotation={[0, 0, a.angle]}>
          <mesh>
            <ringGeometry args={[a.radius - 0.015, a.radius + 0.015, 32, 1, 0, a.arcLen * Math.PI * 2]} />
            <meshBasicMaterial
              color="#00ddff"
              transparent
              opacity={0.25}
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
   Main AI Data Core
   ──────────────────────────────────────────── */
export default function ArcReactor() {
  const groupRef = useRef();
  const coreRef = useRef();
  const pulseRef = useRef();

  // Containment shell geometry (memoized)
  const shellEdges = useMemo(() => {
    const shellGeo = new THREE.IcosahedronGeometry(1.2, 2);
    return new THREE.EdgesGeometry(shellGeo);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.06;
    }

    // Core pulsing — processing heartbeat
    if (coreRef.current) {
      const heartbeat = Math.pow(Math.sin(t * 3) * 0.5 + 0.5, 2);
      const s = 0.18 + heartbeat * 0.06;
      coreRef.current.scale.setScalar(s);
    }

    // Pulse ring — data broadcast wave
    if (pulseRef.current) {
      const cycle = (t * 0.4) % 1;
      const s = 1.0 + cycle * 0.8;
      pulseRef.current.scale.setScalar(s);
      pulseRef.current.material.opacity = (1 - cycle) * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      {/* === CONTAINMENT SHELL — geo wireframe cage === */}
      <lineSegments geometry={shellEdges}>
        <lineBasicMaterial
          color="#115588"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* === NEURAL NETWORK — interconnected data nodes === */}
      <NeuralNetwork />

      {/* === DATA RINGS — segmented spinning bands === */}
      <DataRing radius={0.9} thickness={0.012} color="#00ccff" speed={0.5} segments={10} gapRatio={0.25} />
      <DataRing radius={0.75} thickness={0.01} color="#00aadd" speed={-0.7} tilt={[0.4, 0, 0]} segments={8} gapRatio={0.3} />
      <DataRing radius={0.55} thickness={0.008} color="#0088bb" speed={0.9} tilt={[0.6, 0.3, 0]} segments={6} gapRatio={0.35} />
      <DataRing radius={1.1} thickness={0.006} color="#006699" speed={-0.25} segments={12} gapRatio={0.2} />

      {/* === SCAN BEAMS — rotating scanner lines === */}
      <ScanBeam color="#00ffcc" speed={0.3} radius={1.25} />
      <ScanBeam color="#00aaff" speed={-0.2} radius={1.15} />

      {/* === DATA STREAMS — flowing vertical lines === */}
      <DataStreams />

      {/* === BRIGHT CORE — AI consciousness === */}
      <mesh ref={coreRef} scale={0.18}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial
          color="#ffffff"
          toneMapped={false}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Core inner glow */}
      <mesh scale={0.3}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#44ddff"
          toneMapped={false}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Core outer haze */}
      <mesh scale={0.5}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#0088cc"
          toneMapped={false}
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* === PULSE RING — data broadcast wave === */}
      <mesh ref={pulseRef}>
        <ringGeometry args={[1.15, 1.19, 64]} />
        <meshBasicMaterial
          color="#00ddff"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* === CORE LIGHT === */}
      <pointLight color="#00bbff" intensity={4} distance={8} decay={2} />

      {/* === HOLOGRAPHIC DATA ARCS === */}
      <HoloArcs />

      {/* === CONTAINMENT FIELD AURA === */}
      <mesh scale={1.5}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#0055aa"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* === PARTICLES === */}
      {/* Data bits — orbiting */}
      <ParticleSystem
        count={150}
        color="#00ccff"
        size={0.015}
        speed={0.6}
        spread={1.8}
        direction={new THREE.Vector3(0, 0, 0)}
        lifetime={4}
        opacity={0.5}
        behavior="orbit"
      />

      {/* Rising data wisps */}
      <ParticleSystem
        count={80}
        color="#00ffdd"
        size={0.01}
        speed={0.3}
        spread={1.5}
        direction={new THREE.Vector3(0, 0.4, 0)}
        lifetime={5}
        opacity={0.3}
        behavior="rise"
      />
    </group>
  );
}
