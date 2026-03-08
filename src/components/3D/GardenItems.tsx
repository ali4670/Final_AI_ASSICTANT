import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
    Float, Sphere, Box, Cylinder, Cone, 
    Torus, MeshDistortMaterial, Html, 
    Ring, RoundedBox
} from '@react-three/drei';
import * as THREE from 'three';

// --- ANIMATION WRAPPER ---
const GamePop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const ref = useRef<THREE.Group>(null!);
    useFrame(() => {
        if (ref.current.scale.x < 1) {
            const s = THREE.MathUtils.lerp(ref.current.scale.x, 1, 0.1);
            ref.current.scale.set(s, s, s);
        }
    });
    return <group ref={ref} scale={[0, 0, 0]}>{children}</group>;
};

// --- MULTI-VARIANT TREE (MICRO SCALE) ---
export const Tree: React.FC<{ position: [number, number, number], seed?: string }> = ({ position, seed = "1" }) => {
    const variant = useMemo(() => (seed.charCodeAt(0) % 3), [seed]);
    
    return (
        <GamePop>
            <group position={position} scale={0.4}> {/* Further Reduced Scale */}
                <Cylinder args={[0.15, 0.3, 1.5]} position={[0, 0.75, 0]}>
                    <meshStandardMaterial color="#2d1a0a" />
                </Cylinder>

                {variant === 0 && (
                    <group position={[0, 1.5, 0]}>
                        <Float speed={2}><Sphere args={[0.8]}><meshStandardMaterial color="#166534" /></Sphere></Float>
                        <Sphere args={[0.6]} position={[0.4, 0.3, 0.3]}><meshStandardMaterial color="#15803d" /></Sphere>
                    </group>
                )}
                {variant === 1 && (
                    <group position={[0, 1.8, 0]}>
                        <Cone args={[0.8, 2, 8]}><meshStandardMaterial color="#064e3b" /></Cone>
                        <Cone args={[1, 1.5, 8]} position={[0, -0.8, 0]}><meshStandardMaterial color="#022c22" /></Cone>
                    </group>
                )}
                {variant === 2 && (
                    <group position={[0, 1.5, 0]}>
                        <Torus args={[0.7, 0.3, 16, 32]} rotation={[Math.PI/2, 0, 0]}><meshStandardMaterial color="#22c55e" /></Torus>
                        <Float speed={4}><Sphere args={[0.4]} position={[0, 0.4, 0]}><meshStandardMaterial color="#4ade80" /></Sphere></Float>
                    </group>
                )}
            </group>
        </GamePop>
    );
};

// --- ARCHITECTURAL VARIANCE (MICRO SCALE) ---
export const House: React.FC<{ position: [number, number, number], seed?: string }> = ({ position, seed = "1" }) => {
    const color = useMemo(() => ['#fef3c7', '#f1f5f9', '#ecfeff'][seed.charCodeAt(0) % 3], [seed]);
    return (
        <GamePop>
            <group position={position} scale={0.6}> {/* Further Reduced Scale */}
                <Box args={[1.5, 1.5, 1.5]} position={[0, 0.75, 0]}><meshStandardMaterial color={color} /></Box>
                <Cone args={[1.4, 1.2, 4]} position={[0, 2.1, 0]} rotation={[0, Math.PI/4, 0]}><meshStandardMaterial color="#7f1d1d" /></Cone>
                <Box args={[0.4, 0.4, 0.1]} position={[0, 1, 0.76]}><meshStandardMaterial color="#bae6fd" emissive="#bae6fd" emissiveIntensity={2} /></Box>
            </group>
        </GamePop>
    );
};

// --- ROBOT VARIANTS (MICRO SCALE) ---
export const RobotFarmer: React.FC<{ position: [number, number, number], seed?: string }> = ({ position, seed = "1" }) => {
    const eyeColor = useMemo(() => ['#10b981', '#3b82f6', '#f59e0b'][seed.charCodeAt(0) % 3], [seed]);
    const ref = useRef<THREE.Group>(null!);
    useFrame((state) => { ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.5; });
    
    return (
        <GamePop>
            <group ref={ref} position={position} scale={0.35}> {/* Further Reduced Scale */}
                <RoundedBox args={[1, 1, 1]} radius={0.2}><meshStandardMaterial color="#94a3b8" metalness={0.8} /></RoundedBox>
                <Sphere args={[0.1]} position={[0.2, 0.1, 0.5]}><meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={5} /></Sphere>
                <Sphere args={[0.1]} position={[-0.2, 0.1, 0.5]}><meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={5} /></Sphere>
            </group>
        </GamePop>
    );
};

export const Barn = ({ position }: any) => (
    <GamePop><group position={position} scale={0.75}> {/* Further Reduced Scale */}
        <Box args={[2, 1.5, 3]} position={[0, 0.75, 0]}><meshStandardMaterial color="#991b1b" /></Box>
        <Box args={[2.2, 0.4, 3.2]} position={[0, 1.7, 0]} rotation={[0, 0, 0.5]}><meshStandardMaterial color="#450a0a" /></Box>
    </group></GamePop>
);

export const Windmill = ({ position }: any) => {
    const ref = useRef<THREE.Group>(null!);
    useFrame(() => { if (ref.current) ref.current.rotation.z += 0.05; });
    return (
        <GamePop><group position={position} scale={0.6}> {/* Further Reduced Scale */}
            <Cylinder args={[0.4, 0.6, 3]} position={[0, 1.5, 0]}><meshStandardMaterial color="#cbd5e1" /></Cylinder>
            <group ref={ref} position={[0, 2.5, 0.5]}>
                {[0, 1, 2, 3].map(i => <Box key={i} args={[0.1, 4, 0.05]} rotation={[0, 0, (i * Math.PI)/2]}><meshStandardMaterial color="white" /></Box>)}
            </group>
        </group></GamePop>
    );
};

export const Sheep = ({ position }: any) => (
    <GamePop><group position={position} scale={0.4}> {/* Further Reduced Scale */}
        <RoundedBox args={[1, 0.8, 1.2]} radius={0.2} position={[0, 0.4, 0]}><meshStandardMaterial color="white" /></RoundedBox>
        <Box args={[0.4, 0.4, 0.4]} position={[0, 0.6, 0.6]}><meshStandardMaterial color="#1e293b" /></Box>
    </group></GamePop>
);

export const Fountain = ({ position }: any) => (
    <GamePop><group position={position} scale={0.6}> {/* Further Reduced Scale */}
        <Cylinder args={[1.2, 1.5, 0.3]}><meshStandardMaterial color="#475569" /></Cylinder>
        <Float speed={5}><Sphere args={[0.5]} position={[0, 0.8, 0]}><MeshDistortMaterial color="#60a5fa" distort={0.5} /></Sphere></Float>
    </group></GamePop>
);

export const Bush = ({ position }: any) => (<GamePop><group position={position} scale={0.5}><Sphere args={[0.5]}><meshStandardMaterial color="#065f46" /></Sphere></group></GamePop>);
export const Grass = ({ position }: any) => (<GamePop><group position={position} scale={0.4}><Box args={[0.1, 0.4, 0.1]}><meshStandardMaterial color="#4ade80" /></Box></group></GamePop>);
export const Monolith = ({ position }: any) => (<GamePop><group position={position} scale={0.6}><Box args={[0.4, 3, 0.4]}><meshStandardMaterial color="#020617" emissive="#6366f1" emissiveIntensity={4} /></Box></group></GamePop>);
export const Farmer = ({ position }: any) => (<GamePop><group position={position} scale={0.5}><Cylinder args={[0.15, 0.25, 0.8]}><meshStandardMaterial color="#1d4ed8" /></Cylinder><Sphere args={[0.15]} position={[0, 0.6, 0]}><meshStandardMaterial color="#ffcc99" /></Sphere></group></GamePop>);
export const Fence = ({ position, rotation }: any) => (<GamePop><group position={position} rotation={[0, rotation || 0, 0]} scale={0.6}><Box args={[0.1, 0.8, 0.1]} position={[-0.45, 0.4, 0]}><meshStandardMaterial color="#451a03" /></Box><Box args={[0.1, 0.8, 0.1]} position={[0.45, 0.4, 0]}><meshStandardMaterial color="#451a03" /></Box><Box args={[1, 0.1, 0.1]} position={[0, 0.6, 0]}><meshStandardMaterial color="#451a03" /></Box></group></GamePop>);
export const Cloud3D = ({ position }: any) => (<group position={position} scale={1.0}><Float speed={1}><Sphere args={[1.5]}><meshStandardMaterial color="white" transparent opacity={0.3} /></Sphere></Float></group>);

export const GardenFloor: React.FC = () => (
    <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <circleGeometry args={[100, 64]} />
            <meshStandardMaterial color="#022c22" />
        </mesh>
        <gridHelper args={[200, 40, "#ffffff10", "#ffffff05"]} position={[0, 0.01, 0]} />
    </group>
);
