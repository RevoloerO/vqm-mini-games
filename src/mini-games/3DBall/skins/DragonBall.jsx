import React, { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Creates a 5-pointed star shape geometry
 */
function createStarShape(outerRadius = 1, innerRadius = 0.4, points = 5) {
  const shape = new THREE.Shape();
  const angleStep = Math.PI / points;

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * angleStep - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function Star({ position, scale = 0.12, pulseOffset = 0 }) {
  const meshRef = useRef();
  const starShape = useMemo(() => createStarShape(1, 0.38, 5), []);
  const extrudeSettings = useMemo(() => ({
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 3,
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    // Gentle warm pulse — like trapped sunlight
    const pulse = 0.12 + Math.sin(t * 1.8 + pulseOffset) * 0.06;
    meshRef.current.material.emissiveIntensity = pulse;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <extrudeGeometry args={[starShape, extrudeSettings]} />
      <meshStandardMaterial
        color="#cc4400"
        emissive="#cc3300"
        emissiveIntensity={0.12}
        roughness={0.3}
        metalness={0.3}
      />
    </mesh>
  );
}

export default function DragonBall() {
  const groupRef = useRef();
  const shellRef = useRef();
  const [starCount, setStarCount] = useState(4);

  const starPositions = useMemo(() => ({
    1: [[0, 0, 0]],
    2: [[0.2, 0.2, 0], [-0.2, -0.2, 0]],
    3: [[0, 0.3, 0], [-0.28, -0.15, 0], [0.28, -0.15, 0]],
    4: [[-0.22, 0.22, 0.1], [0.22, 0.22, -0.1], [-0.22, -0.22, -0.1], [0.22, -0.22, 0.1]],
    5: [[0, 0.35, 0], [-0.33, 0.1, 0.1], [0.33, 0.1, -0.1], [-0.2, -0.3, -0.1], [0.2, -0.3, 0.1]],
    6: [[-0.25, 0.28, 0.1], [0.25, 0.28, -0.1], [-0.35, -0.05, -0.1], [0.35, -0.05, 0.1], [-0.15, -0.35, 0.1], [0.15, -0.35, -0.1]],
    7: [[0, 0.38, 0], [-0.3, 0.18, 0.15], [0.3, 0.18, -0.15], [-0.35, -0.15, -0.1], [0.35, -0.15, 0.1], [-0.15, -0.38, 0.1], [0.15, -0.38, -0.1]],
  }), []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    setStarCount((prev) => (prev % 7) + 1);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
    }
    // Very subtle shell breathing
    if (shellRef.current) {
      const pulse = 0.02 + Math.sin(t * 0.9) * 0.01;
      shellRef.current.material.emissiveIntensity = pulse;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer shell — clear golden glass, like the reference */}
      <mesh
        ref={shellRef}
        onClick={handleClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        <sphereGeometry args={[1.2, 128, 128]} />
        <meshPhysicalMaterial
          color="#ffcc44"
          emissive="#aa5500"
          emissiveIntensity={0.02}
          metalness={0.0}
          roughness={0.0}
          transmission={0.97}
          thickness={0.15}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.0}
          envMapIntensity={0.05}
          specularIntensity={1.5}
          transparent
          opacity={0.18}
          attenuationColor="#ffaa00"
          attenuationDistance={5.0}
        />
      </mesh>

      {/* Warm interior light to give the amber its glow */}
      <pointLight color="#ffaa22" intensity={0.6} distance={2.5} decay={2} />

      {/* Stars embedded in the amber */}
      {(starPositions[starCount] || []).map((pos, i) => (
        <Star key={`${starCount}-${i}`} position={pos} pulseOffset={i * 1.2} />
      ))}
    </group>
  );
}
