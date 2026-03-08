import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

const FloatingShape = ({ position, color, scale, speed, type }: any) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x = state.clock.elapsedTime * speed;
        meshRef.current.rotation.y = state.clock.elapsedTime * (speed * 0.8);
    });

    return (
        <Float speed={2} rotationIntensity={1.5} posIntensity={1.5}>
            <mesh ref={meshRef} position={position} scale={scale}>
                {type === 'icosahedron' && <icosahedronGeometry args={[1, 0]} />}
                {type === 'torus' && <torusGeometry args={[1, 0.3, 16, 32]} />}
                {type === 'dodecahedron' && <dodecahedronGeometry args={[1, 0]} />}
                
                <MeshDistortMaterial
                    ref={materialRef}
                    color={color}
                    envMapIntensity={1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    metalness={0.8}
                    roughness={0.2}
                    distort={0.3}
                    speed={2}
                />
            </mesh>
        </Float>
    );
};

const ParticleField = () => {
    const ref = useRef<THREE.Points>(null);
    const count = 300;
    
    const [positions] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for(let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 20;
        }
        return [positions];
    }, []);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.02;
            ref.current.rotation.x = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#3b82f6" transparent opacity={0.4} sizeAttenuation={true} />
        </points>
    );
};

const FloatingAssets = ({ theme }: { theme: string }) => {
    return (
        <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
            <Canvas 
                camera={{ position: [0, 0, 10], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={theme === 'dark' ? 0.2 : 0.8} />
                <directionalLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
                <directionalLight position={[-10, -10, -10]} intensity={1} color="#ec4899" />
                <Environment preset="city" />

                <ParticleField />

                {/* Left Cluster */}
                <FloatingShape position={[-6, 3, -5]} color="#3b82f6" scale={1.5} speed={0.2} type="icosahedron" />
                <FloatingShape position={[-8, -2, -8]} color="#ec4899" scale={1} speed={0.3} type="torus" />

                {/* Right Cluster */}
                <FloatingShape position={[6, -3, -4]} color="#6366f1" scale={2} speed={0.15} type="dodecahedron" />
                <FloatingShape position={[8, 4, -6]} color="#8b5cf6" scale={1.2} speed={0.25} type="icosahedron" />
            </Canvas>
            
            {/* Massive Glowing Orbs behind the canvas for glassmorphism blending */}
            <div className={`absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-300'}`} />
            <div className={`absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-300'}`} />
            <div className={`absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 ${theme === 'dark' ? 'bg-rose-600' : 'bg-rose-300'}`} />
        </div>
    );
};

export default FloatingAssets;
