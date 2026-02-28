import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';

const HeroScene = () => {
  const { theme } = useTheme();
  
  return (
    <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none">
      <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 2, 8], fov: 35 }} gl={{ alpha: true }}>
        <ambientLight intensity={theme === 'dark' ? 0.5 : 1.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={theme === 'dark' ? 1 : 0.5} castShadow />
        
        <Suspense fallback={null}>
          <Environment preset={theme === 'dark' ? "city" : "apartment"} />
          
          <ContactShadows 
            position={[0, 0, 0]} 
            opacity={theme === 'dark' ? 0.6 : 0.2} 
            scale={20} 
            blur={3} 
            far={10} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroScene;
