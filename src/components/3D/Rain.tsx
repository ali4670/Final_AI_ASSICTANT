import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Rain = ({ count = 1000 }) => {
  const points = useRef<THREE.Points>(null!);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [count]);

  useFrame((state, delta) => {
    const positionAttribute = points.current.geometry.getAttribute('position');
    for (let i = 0; i < count; i++) {
      let y = positionAttribute.getY(i);
      y -= delta * 15; // Rain speed
      if (y < -5) y = 15;
      positionAttribute.setY(i, y);
    }
    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#4fa9ff" transparent opacity={0.6} />
    </points>
  );
};

export default Rain;
