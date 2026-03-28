import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

function CameraRig({ target }) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0, 5));
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    const targetPos = target?.position || new THREE.Vector3(0, 0, 5);
    currentPos.current.lerp(targetPos, delta * 2);
    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
}

function DynamicEnvironment({ skinId }) {
  const envPresets = {
    'sphere': 'city',
    'pokeball': 'forest',
    'fireball': 'night',
    'ice-orb': 'night',
    'dragon-ball': 'sunset',
    'palantir': 'night',
    'energy-core': 'warehouse',
    'arc-reactor': 'night',
    'arc-reactor-classic': 'night',
    'genesis-sphere': 'forest',
  };
  return <Environment preset={envPresets[skinId] || 'city'} background={false} />;
}

function DynamicStars({ skinId }) {
  const darkSkins = ['palantir', 'energy-core', 'arc-reactor', 'arc-reactor-classic', 'fireball', 'dragon-ball', 'ice-orb'];
  if (!darkSkins.includes(skinId)) return null;
  return <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />;
}

/**
 * Cold ambient lighting for the Frozen Heart
 */
function IceOrbLighting({ skinId }) {
  if (skinId !== 'ice-orb') return null;
  return (
    <group>
      {/* Cool key light from above — moderate to avoid blowout */}
      <directionalLight position={[3, 6, 4]} intensity={0.8} color="#aaddff" />
      {/* Cold rim light */}
      <directionalLight position={[-4, 1, -5]} intensity={0.4} color="#6699cc" />
      {/* Faint blue fill from below */}
      <pointLight position={[0, -3, 3]} intensity={0.2} color="#88bbee" distance={15} decay={2} />
    </group>
  );
}

/**
 * A warm sun for the Dragon Ball scene — visible glowing sphere + directional warm light
 */
function DragonBallSun({ skinId }) {
  if (skinId !== 'dragon-ball') return null;

  return (
    <group>
      {/* Key light — strong warm golden light from upper right */}
      <directionalLight position={[5, 8, 3]} intensity={3.0} color="#ffaa22" />

      {/* Rim light — warm backlight for edge glow */}
      <directionalLight position={[-4, 2, -5]} intensity={1.5} color="#ff8800" />

      {/* Fill light — softer warm bounce from below */}
      <pointLight position={[0, -4, 4]} intensity={1.0} color="#ffcc44" distance={20} decay={2} />

      {/* Warm ambient boost */}
      <ambientLight intensity={0.4} color="#ffdd88" />
    </group>
  );
}

export default function Scene({ children, skinId, bloomIntensity = 1.5, bloomThreshold = 0.3 }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%', background: '#0a0a0f' }}
    >
      <Suspense fallback={null}>
        <DynamicEnvironment skinId={skinId} />
        <DynamicStars skinId={skinId} />
        <DragonBallSun skinId={skinId} />
        <IceOrbLighting skinId={skinId} />

        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -3, 3]} intensity={0.4} color="#4488ff" />

        {children}

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI * 3 / 4}
          rotateSpeed={0.5}
          dampingFactor={0.05}
          enableDamping
        />
      </Suspense>

      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0005, 0.0005)}
        />
        <Vignette offset={0.3} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
