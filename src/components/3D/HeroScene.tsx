import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows, MeshTransmissionMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';

// Orbiting text rings around the orb
const OrbitingText = ({ radius, speed, text, color, yOffset = 0 }: { radius: number, speed: number, text: string, color: string, yOffset?: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * speed;
            // Add a subtle wobble to the ring
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
            groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    const words = text.split(" ");
    const segments = words.length;

    return (
        <group ref={groupRef} position={[0, yOffset, 0]}>
            {words.map((word, i) => {
                const angle = (i / segments) * Math.PI * 2;
                return (
                    <Text
                        key={i}
                        position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                        rotation={[0, -angle + Math.PI / 2, 0]}
                        fontSize={0.25}
                        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf"
                        color={color}
                        anchorX="center"
                        anchorY="middle"
                        material-toneMapped={false}
                    >
                        {word}
                    </Text>
                );
            })}
        </group>
    );
};

// Subtle particle field floating around the core
const PointsOrbit = () => {
    const ref = useRef<THREE.Points>(null);
    
    const count = 200;
    const [positions, scales] = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const r = 2.5 + Math.random() * 4;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            p[i * 3 + 2] = r * Math.cos(phi);
            
            s[i] = Math.random();
        }
        return [p, s];
    }, [count]);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.05;
            ref.current.rotation.z = state.clock.elapsedTime * 0.02;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-scale" count={count} array={scales} itemSize={1} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#8b5cf6" transparent opacity={0.6} sizeAttenuation={true} />
        </points>
    );
};

const NeuralCore = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
        if (materialRef.current) {
            // Animate refraction/dispersion subtly
            materialRef.current.time = state.clock.elapsedTime;
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* The main refractive orb */}
            <Float speed={2} rotationIntensity={0.5} posIntensity={0.5}>
                <mesh ref={meshRef} castShadow receiveShadow>
                    <icosahedronGeometry args={[2, 16]} />
                    <MeshTransmissionMaterial
                        ref={materialRef}
                        resolution={1024}
                        thickness={2.5}
                        roughness={0.1}
                        transmission={1}
                        ior={1.4}
                        chromaticAberration={0.8}
                        anisotropy={1}
                        distortion={0.5}
                        distortionScale={0.4}
                        temporalDistortion={0.1}
                        clearcoat={1}
                        attenuationDistance={1}
                        attenuationColor="#3b82f6"
                        color="#ffffff"
                        bg="#020202"
                    />
                </mesh>
            </Float>

            {/* Inner Power Core Light */}
            <pointLight intensity={3} distance={5} color="#ec4899" position={[0,0,0]} />
            <pointLight intensity={2} distance={8} color="#3b82f6" position={[0,0,0]} />

            {/* Orbiting UI Rings */}
            <OrbitingText radius={3.5} speed={0.4} text="NEURAL SYNTHESIS ALWAYS EVOLVING" color="#ffffff" yOffset={0.5} />
            <OrbitingText radius={4.5} speed={-0.2} text="DATA DRIVEN INSIGHTS AUTOMATED WORKFLOWS" color="#6366f1" yOffset={-0.5} />
            
            {/* Ambient floating dust inside the core area */}
            <PointsOrbit />
        </group>
    );
};

const HeroScene = () => {
    return (
        <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none">
            <Canvas 
                shadows 
                camera={{ position: [0, 0, 10], fov: 45 }}
                gl={{ antialias: true, alpha: true, toneMappingExposure: 1.2 }}
            >
                {/* Removed background color to allow CSS to shine through */}
                
                {/* Advanced Light Setup */}
                <ambientLight intensity={0.1} />
                <spotLight position={[10, 20, 10]} angle={0.2} penumbra={1} intensity={2} color="#8b5cf6" castShadow />
                <directionalLight position={[-10, 0, -10]} intensity={1.5} color="#3b82f6" />
                
                <Suspense fallback={null}>
                    <NeuralCore />
                    
                    {/* City environment yields excellent reflections on the TransmissionMaterial */}
                    <Environment preset="city" />
                    
                    {/* Shadow Stage for grounding */}
                    <ContactShadows 
                        position={[0, -4, 0]} 
                        opacity={0.6} 
                        scale={30} 
                        blur={2} 
                        far={10} 
                        color="#000000"
                    />
                </Suspense>
            </Canvas>
            
            {/* CSS Overlay Gradients for Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-[#020202]/50 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-transparent to-[#020202] pointer-events-none" />
        </div>
    );
};

export default HeroScene;
