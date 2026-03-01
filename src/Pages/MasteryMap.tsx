import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Brain, ArrowLeft, ShieldCheck, TrendingUp, 
    Zap, Award, Loader, FileText, ChevronRight,
    Target, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import * as THREE from 'three';
import { OrbitControls, Float, Sphere, MeshDistortMaterial, Text, Points, PointMaterial } from '@react-three/drei';

interface MasteryNode {
    id: string;
    title: string;
    score: number;
    pos: THREE.Vector3;
}

const BrainNode: React.FC<{ node: MasteryNode }> = ({ node }) => {
    const color = useMemo(() => {
        if (node.score >= 80) return "#22c55e"; // Green
        if (node.score >= 50) return "#eab308"; // Yellow
        return "#ef4444"; // Red
    }, [node.score]);

    return (
        <group position={node.pos}>
            <Float speed={3} rotationIntensity={1} floatIntensity={1}>
                <Sphere args={[0.3, 16, 16]}>
                    <MeshDistortMaterial 
                        color={color}
                        speed={2}
                        distort={0.3}
                        emissive={color}
                        emissiveIntensity={1}
                    />
                </Sphere>
            </Float>
            <Text
                position={[0, 0.6, 0]}
                fontSize={0.2}
                color="white"
                maxWidth={1.5}
                textAlign="center"
            >
                {node.title.split(' ')[0]}
            </Text>
        </group>
    );
};

const BrainParticles = () => {
    const points = useMemo(() => {
        const p = new Float32Array(2000 * 3);
        for (let i = 0; i < 2000; i++) {
            // Brain shape logic (ellipsoid simplified)
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI;
            const r = 4 + Math.random() * 0.5;
            p[i*3] = r * Math.sin(v) * Math.cos(u) * 1.5; // X - wider
            p[i*3+1] = r * Math.sin(v) * Math.sin(u) * 1.2; // Y - taller
            p[i*3+2] = r * Math.cos(v) * 0.8; // Z - thinner
        }
        return p;
    }, []);

    const ref = useRef<any>();
    useFrame((state) => {
        ref.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    });

    return (
        <Points ref={ref} positions={points} stride={3}>
            <PointMaterial
                transparent
                color="#3b82f6"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.2}
            />
        </Points>
    );
};

const MasteryScene: React.FC<{ masteryData: MasteryNode[] }> = ({ masteryData }) => {
    return (
        <>
            <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.5} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            <BrainParticles />
            
            {masteryData.map(node => (
                <BrainNode key={node.id} node={node} />
            ))}
        </>
    );
};

const MasteryMap: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [data, setData] = useState<MasteryNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ average: 0, high: 0, low: 0 });

    useEffect(() => {
        fetchMasteryData();
    }, [user]);

    const fetchMasteryData = async () => {
        if (!supabase || !user) return;
        setLoading(true);
        try {
            // Fetch study sessions with scores
            const { data: sessions, error } = await supabase
                .from('study_sessions')
                .select('content_id, score')
                .eq('user_id', user.id)
                .not('score', 'is', null);
            
            if (error) throw error;

            // Fetch document titles
            const { data: docs } = await supabase.from('documents').select('id, title');
            const docMap: Record<string, string> = {};
            docs?.forEach(d => docMap[d.id] = d.title);

            // Aggregate scores
            const aggregated: Record<string, { total: number, count: number }> = {};
            sessions?.forEach(s => {
                if (!s.content_id) return;
                if (!aggregated[s.content_id]) aggregated[s.content_id] = { total: 0, count: 0 };
                aggregated[s.content_id].total += s.score || 0;
                aggregated[s.content_id].count += 1;
            });

            const nodes: MasteryNode[] = Object.keys(aggregated).map((id, i) => {
                const avg = aggregated[id].total / aggregated[id].count;
                // Position nodes inside the "brain"
                const angle = (i / Object.keys(aggregated).length) * Math.PI * 2;
                const radius = 2 + Math.random() * 2;
                return {
                    id,
                    title: docMap[id] || 'Fragment',
                    score: avg,
                    pos: new THREE.Vector3(
                        Math.cos(angle) * radius,
                        (Math.random() - 0.5) * 4,
                        Math.sin(angle) * radius
                    )
                };
            });

            setData(nodes);
            
            if (nodes.length > 0) {
                const scores = nodes.map(n => n.score);
                setStats({
                    average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
                    high: Math.max(...scores),
                    low: Math.min(...scores)
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen pt-24 px-8 relative overflow-hidden transition-colors duration-700 ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-blue-50 text-slate-900'}`}>
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
                    <MasteryScene masteryData={data} />
                </Canvas>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 pointer-events-none">
                <header className="flex justify-between items-start mb-12">
                    <div className="space-y-4">
                        <motion.button 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => onNavigate('dashboard')}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl pointer-events-auto hover:bg-white/10 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
                        >
                            <ArrowLeft size={16} /> Back to Command
                        </motion.button>
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20">
                                    <Brain className="text-indigo-500" size={24} />
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Cognitive Map</h1>
                            </div>
                            <p className="opacity-40 font-black uppercase tracking-[0.4em] text-[10px] ml-16">Neural Mastery Visualization</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pointer-events-auto">
                        <StatCard icon={<TrendingUp size={14} />} label="Global Mean" value={`${stats.average}%`} color="blue" />
                        <StatCard icon={<Award size={14} />} label="Peak Mastery" value={`${stats.high}%`} color="green" />
                        <StatCard icon={<Target size={14} />} label="Lowest Node" value={`${stats.low}%`} color="red" />
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
                    <div className="md:col-start-3 space-y-4 pointer-events-auto">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6 px-4">Neural Segments</h3>
                        <div className="max-h-[400px] overflow-y-auto pr-4 space-y-3 custom-scrollbar">
                            {data.map(node => (
                                <motion.div 
                                    key={node.id}
                                    className={`p-6 rounded-3xl border transition-all ${
                                        theme === 'dark' ? 'bg-[#0D0D0D]/80 border-white/5' : 'bg-white border-slate-100'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-black italic uppercase text-xs truncate max-w-[150px]">{node.title}</h4>
                                        <span className={`text-[10px] font-black ${node.score >= 80 ? 'text-green-500' : node.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {Math.round(node.score)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${node.score}%` }}
                                            className={`h-full ${node.score >= 80 ? 'bg-green-500' : node.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[100]">
                    <div className="text-center space-y-6">
                        <Loader className="animate-spin text-blue-500 mx-auto" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Synchronizing Neural Patterns...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, color }: any) => (
    <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl flex flex-col gap-1">
        <div className={`flex items-center gap-2 text-${color}-500`}>
            {icon}
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{label}</span>
        </div>
        <span className="text-xl font-black italic tracking-tighter">{value}</span>
    </div>
);

export default MasteryMap;
