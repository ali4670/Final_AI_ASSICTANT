import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const BotScene = () => {
  const orb = useRef<THREE.Mesh>(null!);
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const elapsedTime = useRef(0);

  useFrame((_state, delta) => {
    elapsedTime.current += delta;
    const t = elapsedTime.current;
    
    if (orb.current) {
        orb.current.rotation.y = t * 0.5;
    }
    if (ring1.current) {
        ring1.current.rotation.x = t * 0.8;
        ring1.current.rotation.y = t * 0.4;
    }
    if (ring2.current) {
        ring2.current.rotation.z = t * 0.6;
        ring2.current.rotation.x = t * 0.3;
    }
  });

  return (
    <group scale={1.5}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere ref={orb} args={[1, 64, 64]}>
          <MeshDistortMaterial
            color="#3b82f6"
            speed={2}
            distort={0.4}
            radius={1}
          />
        </Sphere>
      </Float>

      {/* Orbiting Rings */}
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={2} />
      </mesh>

      <mesh ref={ring2} rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[2.2, 0.015, 16, 100]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} />
      </mesh>

      <pointLight position={[5, 5, 5]} intensity={1} color="#3b82f6" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a855f7" />
    </group>
  );
};

export default BotScene;
