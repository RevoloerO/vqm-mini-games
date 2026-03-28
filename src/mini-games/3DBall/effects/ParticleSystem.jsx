import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * GPU-instanced particle system. Supports:
 * - count: number of particles
 * - color: base THREE.Color
 * - size: base particle size
 * - speed: movement speed
 * - spread: spawn volume radius
 * - direction: THREE.Vector3 main movement direction
 * - gravity: gravity factor
 * - lifetime: particle lifetime in seconds
 * - emissive: emissive intensity
 * - opacity: base opacity
 * - behavior: 'rise' | 'orbit' | 'explode' | 'float'
 */
export default function ParticleSystem({
  count = 200,
  color = new THREE.Color('#ff6600'),
  color2,
  size = 0.05,
  speed = 1,
  spread = 2,
  direction = new THREE.Vector3(0, 1, 0),
  gravity = 0,
  lifetime = 3,
  emissiveIntensity = 2,
  opacity = 0.8,
  behavior = 'rise',
  blending = THREE.AdditiveBlending,
  origin = new THREE.Vector3(0, 0, 0),
}) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * spread + origin.x,
        (Math.random() - 0.5) * spread + origin.y,
        (Math.random() - 0.5) * spread + origin.z,
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * speed * 0.5,
        direction.y * speed * (0.5 + Math.random()),
        (Math.random() - 0.5) * speed * 0.5,
      ),
      life: Math.random() * lifetime,
      maxLife: lifetime,
      scale: size * (0.5 + Math.random()),
      orbitAngle: Math.random() * Math.PI * 2,
      orbitSpeed: (Math.random() - 0.5) * 2,
      orbitRadius: 1 + Math.random() * spread,
    }));
  }, [count, spread, speed, direction, lifetime, size, origin]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    particles.forEach((p, i) => {
      p.life -= delta;

      if (p.life <= 0) {
        // Respawn
        p.position.set(
          (Math.random() - 0.5) * spread + origin.x,
          (Math.random() - 0.5) * spread + origin.y,
          (Math.random() - 0.5) * spread + origin.z,
        );
        p.velocity.set(
          (Math.random() - 0.5) * speed * 0.5,
          direction.y * speed * (0.5 + Math.random()),
          (Math.random() - 0.5) * speed * 0.5,
        );
        p.life = p.maxLife;
        p.orbitAngle = Math.random() * Math.PI * 2;
      }

      switch (behavior) {
        case 'rise':
          p.position.add(p.velocity.clone().multiplyScalar(delta));
          p.velocity.y -= gravity * delta;
          break;
        case 'orbit':
          p.orbitAngle += p.orbitSpeed * delta;
          p.position.x = Math.cos(p.orbitAngle) * p.orbitRadius + origin.x;
          p.position.z = Math.sin(p.orbitAngle) * p.orbitRadius + origin.z;
          p.position.y += Math.sin(p.orbitAngle * 2) * delta * 0.5;
          break;
        case 'explode':
          p.position.add(p.velocity.clone().multiplyScalar(delta));
          p.velocity.multiplyScalar(0.98);
          break;
        case 'float':
          p.position.x += Math.sin(p.life * 2 + p.orbitAngle) * delta * speed * 0.3;
          p.position.y += delta * speed * 0.2;
          p.position.z += Math.cos(p.life * 2 + p.orbitAngle) * delta * speed * 0.3;
          break;
        default:
          p.position.add(p.velocity.clone().multiplyScalar(delta));
      }

      const lifeRatio = p.life / p.maxLife;
      const s = p.scale * lifeRatio;

      dummy.position.copy(p.position);
      dummy.scale.setScalar(Math.max(s, 0.001));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const particleColor = useMemo(() => color instanceof THREE.Color ? color : new THREE.Color(color), [color]);

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color={particleColor}
        transparent
        opacity={opacity}
        blending={blending}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
