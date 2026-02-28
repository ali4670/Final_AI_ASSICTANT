import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WalkingStudent = () => {
  const group = useRef<THREE.Group>(null!);
  const leftLeg = useRef<THREE.Mesh>(null!);
  const rightLeg = useRef<THREE.Mesh>(null!);
  const leftArm = useRef<THREE.Mesh>(null!);
  const rightArm = useRef<THREE.Group>(null!);
  const umbrella = useRef<THREE.Group>(null!);
  const elapsedTime = useRef(0);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useFrame((_state, delta) => {
    elapsedTime.current += delta;
    const t = elapsedTime.current;
    
    // Walking animation
    const walkSpeed = 5;
    const walkAngle = Math.sin(t * walkSpeed) * 0.4;
    
    leftLeg.current.rotation.x = walkAngle;
    rightLeg.current.rotation.x = -walkAngle;
    
    leftArm.current.rotation.x = -walkAngle;
    rightArm.current.rotation.x = walkAngle;

    // Subtle bounce
    group.current.position.y = Math.abs(Math.sin(t * walkSpeed * 2)) * 0.05;

    // Umbrella animation
    if (isOpen) {
      umbrella.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      umbrella.current.position.lerp(new THREE.Vector3(0.5, 1.5, 0), 0.1);
    } else {
      umbrella.current.scale.set(0.1, 0.1, 0.1);
      umbrella.current.position.set(0.5, 0.5, 0);
    }
  });

  return (
    <group ref={group}>
      {/* Body */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.5, 0.8, 0.2]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>

      {/* Backpack */}
      <mesh position={[0, 0.8, -0.15]}>
        <boxGeometry args={[0.4, 0.5, 0.2]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>

      {/* Legs */}
      <mesh ref={leftLeg} position={[-0.15, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh ref={rightLeg} position={[0.15, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Arms */}
      <mesh ref={leftArm} position={[-0.35, 0.8, 0]}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <group ref={rightArm} position={[0.35, 0.8, 0]}>
         <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.12, 0.5, 0.12]} />
            <meshStandardMaterial color="#3b82f6" />
         </mesh>
         
         {/* Umbrella */}
         <group ref={umbrella}>
            {/* Handle */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 1.5]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            {/* Canopy */}
            <mesh position={[0, 0.7, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[1, 0.4, 32]} />
                <meshStandardMaterial color="#2563eb" transparent opacity={0.9} side={THREE.DoubleSide} />
            </mesh>
         </group>
      </group>
    </group>
  );
};

export default WalkingStudent;
