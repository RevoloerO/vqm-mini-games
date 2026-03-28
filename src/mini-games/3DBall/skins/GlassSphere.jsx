import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';

export default function GlassSphere() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 128, 128]} />
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={0.5}
          chromaticAberration={0.2}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={0.1}
          ior={1.5}
          color="#88bbff"
          roughness={0.05}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh scale={0.95}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={0.08} />
      </mesh>

      {/* Fresnel rim */}
      <mesh scale={1.01}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          roughness={0}
          metalness={0.5}
          envMapIntensity={3}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </mesh>
    </group>
  );
}
