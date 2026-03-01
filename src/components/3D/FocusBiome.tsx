import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, MeshWobbleMaterial, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';

interface FocusBiomeProps {
    growth: number; // 0 to 100+
}

const FocusBiome: React.FC<FocusBiomeProps> = ({ growth }) => {
    const groupRef = useRef<THREE.Group>(null!);

    // Growth levels: 0-10 (Seed), 11-30 (Sprout), 31-60 (Plant), 61+ (Tree)
    const stage = useMemo(() => {
        if (growth <= 10) return 'seed';
        if (growth <= 30) return 'sprout';
        if (growth <= 60) return 'plant';
        return 'tree';
    }, [growth]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
        // Pulse effect based on growth
        const scale = 1 + Math.sin(t * 2) * 0.02;
        groupRef.current.scale.set(scale, scale, scale);
    });

    return (
        <group ref={groupRef}>
            {/* Base Pot / Soil */}
            <Cylinder args={[0.8, 0.6, 0.5, 32]} position={[0, -0.25, 0]}>
                <meshStandardMaterial color="#2d241e" roughness={1} />
            </Cylinder>

            {/* SEED STAGE */}
            {stage === 'seed' && (
                <Float speed={2} rotationIntensity={0.5}>
                    <Sphere args={[0.2, 16, 16]} position={[0, 0.2, 0]}>
                        <MeshDistortMaterial 
                            color="#8b5cf6" 
                            speed={2} 
                            distort={0.3} 
                            emissive="#8b5cf6" 
                            emissiveIntensity={0.5} 
                        />
                    </Sphere>
                </Float>
            )}

            {/* SPROUT STAGE */}
            {stage === 'sprout' && (
                <group position={[0, 0.1, 0]}>
                    <Cylinder args={[0.05, 0.05, 0.4]} position={[0, 0.2, 0]}>
                        <meshStandardMaterial color="#4ade80" />
                    </Cylinder>
                    <Float speed={5} rotationIntensity={2}>
                        <Box args={[0.2, 0.05, 0.3]} position={[0.1, 0.35, 0]} rotation={[0, 0, Math.PI/4]}>
                            <meshStandardMaterial color="#22c55e" />
                        </Box>
                    </Float>
                </group>
            )}

            {/* PLANT STAGE */}
            {stage === 'plant' && (
                <group position={[0, 0.1, 0]}>
                    <Cylinder args={[0.08, 0.08, 0.8]} position={[0, 0.4, 0]}>
                        <meshStandardMaterial color="#166534" />
                    </Cylinder>
                    {[0, 1, 2, 3].map((i) => (
                        <Float key={i} speed={2} position={[Math.sin(i)*0.3, 0.4 + i*0.1, Math.cos(i)*0.3]}>
                            <Sphere args={[0.15, 8, 8]} scale={[1, 0.2, 1.5]} rotation={[0, i * Math.PI/2, 0.5]}>
                                <MeshWobbleMaterial color="#22c55e" factor={0.5} speed={1} />
                            </Sphere>
                        </Float>
                    ))}
                    {/* Glowing Flower if growth is high in this stage */}
                    {growth > 50 && (
                        <Float speed={4} position={[0, 0.9, 0]}>
                            <Sphere args={[0.1, 16, 16]}>
                                <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2} />
                            </Sphere>
                        </Float>
                    )}
                </group>
            )}

            {/* TREE STAGE */}
            {stage === 'tree' && (
                <group position={[0, 0.1, 0]}>
                    {/* Trunk */}
                    <Cylinder args={[0.15, 0.25, 1.2]} position={[0, 0.6, 0]}>
                        <meshStandardMaterial color="#451a03" />
                    </Cylinder>
                    {/* Foliage Canopy */}
                    <group position={[0, 1.2, 0]}>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <Float key={i} speed={1.5} position={[Math.sin(i)*0.5, i*0.1, Math.cos(i)*0.5]}>
                                <Sphere args={[0.6, 16, 16]} scale={[1, 0.8, 1]}>
                                    <MeshDistortMaterial color="#14532d" speed={1} distort={0.2} />
                                </Sphere>
                            </Float>
                        ))}
                    </group>
                    {/* Neural Fruit (Glowing Spheres) */}
                    {[0, 1, 2].map((i) => (
                        <Float key={i} speed={3} position={[Math.sin(i)*0.6, 1.5, Math.cos(i)*0.6]}>
                            <Sphere args={[0.08, 16, 16]}>
                                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={3} />
                            </Sphere>
                        </Float>
                    ))}
                </group>
            )}

            {/* Stage Ground Glow */}
            <pointLight position={[0, 0.5, 0]} distance={3} intensity={stage === 'tree' ? 2 : 0.5} color={stage === 'tree' ? '#3b82f6' : '#4ade80'} />
        </group>
    );
};

export default FocusBiome;
