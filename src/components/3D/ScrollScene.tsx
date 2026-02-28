import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Stars, Float as FloatDrei } from '@react-three/drei';
import * as THREE from 'three';

const ScrollContent = () => {
  const group = useRef<THREE.Group>(null!);
  const box1 = useRef<THREE.Mesh>(null!);
  const box2 = useRef<THREE.Mesh>(null!);
  const box3 = useRef<THREE.Mesh>(null!);
  const elapsedTime = useRef(0);

  useFrame((_state, delta) => {
    elapsedTime.current += delta;
    const t = elapsedTime.current;
    
    box1.current.rotation.x = t * 0.2;
    box1.current.rotation.y = t * 0.3;
    
    box2.current.position.y = -4 + Math.sin(t * 0.5) * 0.5;
    box2.current.rotation.z = t * 0.1;

    box3.current.rotation.y = t * 0.2;
  });

  return (
    <group ref={group}>
      <FloatDrei speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh ref={box1} position={[-3, 1, -2]}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#3b82f6" wireframe />
        </mesh>
      </FloatDrei>

      <FloatDrei speed={3} rotationIntensity={2} floatIntensity={1}>
        <mesh ref={box2} position={[4, -2, -3]}>
          <torusGeometry args={[1, 0.3, 16, 100]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
      </FloatDrei>

      <FloatDrei speed={1.5} rotationIntensity={0.5} floatIntensity={2}>
        <mesh ref={box3} position={[-2, -5, -4]}>
          <octahedronGeometry args={[2]} />
          <meshStandardMaterial color="#ec4899" transparent opacity={0.3} />
        </mesh>
      </FloatDrei>

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={15} size={3} speed={0.4} />
    </group>
  );
};

const ScrollScene = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 0, 8], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ScrollContent />
      </Canvas>
    </div>
  );
};

export default ScrollScene;
