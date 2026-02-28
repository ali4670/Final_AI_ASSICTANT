import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

const RealHumanWalking = () => {
  const group = useRef<THREE.Group>(null!);
  const elapsedTime = useRef(0);
  
  // Realistic PNG image of a student with umbrella walking in rain (high quality placeholder)
  let texture;
  try {
    texture = useTexture('https://cdn.pixabay.com/photo/2017/08/06/15/44/walking-2593603_1280.jpg');
  } catch (e) {
    console.error("Failed to load human texture", e);
  }

  useFrame((_state, delta) => {
    if (!group.current) return;
    elapsedTime.current += delta;
    const t = elapsedTime.current;
    
    // Smooth walking path
    group.current.position.x = Math.sin(t * 0.3) * 3;
    group.current.position.y = Math.sin(t * 10) * 0.05; 
    group.current.rotation.y = Math.sin(t * 0.3) * 0.5;
  });

  return (
    <group ref={group}>
      <mesh position={[0, 2, 0]}>
        <planeGeometry args={[3.5, 4.5]} />
        {texture ? (
          <meshBasicMaterial 
            map={texture} 
            transparent 
            opacity={0.95} 
            side={THREE.DoubleSide}
          />
        ) : (
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        )}
      </mesh>
      
      {/* Rain ripple effect on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
         <ringGeometry args={[0, 0.5, 32]} />
         <meshStandardMaterial color="#4fa9ff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export default RealHumanWalking;
