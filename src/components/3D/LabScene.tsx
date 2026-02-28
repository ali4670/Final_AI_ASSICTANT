import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

const LabStudent = () => {
  const head = useRef<THREE.Mesh>(null!);
  const { mouse } = useThree();

  useFrame((state) => {
    // Make the head look at the mouse
    const targetX = (mouse.x * Math.PI) / 4;
    const targetY = -(mouse.y * Math.PI) / 4;
    
    head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, targetX, 0.1);
    head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, targetY, 0.1);
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Table */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 0.1, 2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Laptop */}
      <group position={[0, 0.1, 0.5]}>
         {/* Base */}
         <mesh>
            <boxGeometry args={[1, 0.05, 0.7]} />
            <meshStandardMaterial color="#555" />
         </mesh>
         {/* Screen */}
         <mesh position={[0, 0.35, -0.35]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[1, 0.7, 0.05]} />
            <meshStandardMaterial color="#222" />
            <mesh position={[0, 0, 0.03]}>
                <planeGeometry args={[0.9, 0.6]} />
                <meshStandardMaterial color="#000" emissive="#3b82f6" emissiveIntensity={0.5} />
            </mesh>
         </mesh>
      </group>

      {/* Student Body */}
      <mesh position={[0, 0.6, 1.2]}>
        <boxGeometry args={[0.6, 1.2, 0.3]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* Head */}
      <mesh ref={head} position={[0, 1.4, 1.2]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#fcd34d" />
        {/* Glasses/Eyes */}
        <mesh position={[0, 0.05, 0.28]}>
            <boxGeometry args={[0.4, 0.1, 0.05]} />
            <meshStandardMaterial color="#111" />
        </mesh>
      </mesh>
    </group>
  );
};

const LabScene = () => {
  return (
    <div className="w-full h-[500px] pointer-events-auto">
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Suspense fallback={null}>
          <Environment preset="night" />
          <LabStudent />
          <ContactShadows opacity={0.4} scale={10} blur={2} far={4.5} />
          <Text
            position={[0, 2.5, -2]}
            fontSize={0.5}
            color="#3b82f6"
            font="/fonts/Inter-Bold.woff"
            anchorX="center"
            anchorY="middle"
          >
            Ali Ahmed's Lab
          </Text>
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
};

export default LabScene;
