import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Lock, Star, Zap, Brain, 
    BookOpen, Calculator, FlaskConical, Globe, 
    PenTool, ChevronRight, Award, Sparkles,
    Shield, Target, Activity, Hexagon,
    Boxes, Cpu, Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, MeshDistortMaterial, Points, PointMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface SkillNode {
    id: string;
    label: string;
    description: string;
    icon: any;
    xp_required: number;
    parents: string[];
    position: { x: number, y: number };
    category: 'core' | 'science' | 'arts' | 'tech';
    reward?: string;
}

const NODES: SkillNode[] = [
    { id: 'core_1', label: 'Neural Link', description: 'Initialize neural synchronization.', icon: Zap, xp_required: 0, parents: [], position: { x: 50, y: 15 }, category: 'core', reward: 'Basic Access' },
    { id: 'math_1', label: 'Logic Gate', description: 'Master algebraic logic fragments.', icon: Calculator, xp_required: 200, parents: ['core_1'], position: { x: 30, y: 35 }, category: 'science', reward: 'Calculator Skin' },
    { id: 'lang_1', label: 'Linguistic Core', description: 'Synthesize complex grammar.', icon: PenTool, xp_required: 200, parents: ['core_1'], position: { x: 70, y: 35 }, category: 'arts', reward: 'Translator Plus' },
    { id: 'sci_1', label: 'Matter Analysis', description: 'Physical property simulation.', icon: FlaskConical, xp_required: 600, parents: ['math_1'], position: { x: 20, y: 55 }, category: 'science', reward: 'Lab Theme' },
    { id: 'tech_1', label: 'Digital Synapse', description: 'Advanced algorithm design.', icon: Cpu, xp_required: 600, parents: ['math_1'], position: { x: 45, y: 55 }, category: 'tech', reward: 'Admin Terminal' },
    { id: 'hist_1', label: 'Temporal Archive', description: 'Historical data mapping.', icon: Globe, xp_required: 600, parents: ['lang_1'], position: { x: 80, y: 55 }, category: 'arts', reward: 'Global Map' },
    { id: 'mastery', label: 'Ascension', description: 'Peak cognitive synchronization.', icon: Star, xp_required: 1500, parents: ['sci_1', 'tech_1', 'hist_1'], position: { x: 50, y: 80 }, category: 'core', reward: 'Master Aura' },
];

const NeuralTreeScene = () => {
    const points = useMemo(() => {
        const p = new Float32Array(500 * 3);
        for (let i = 0; i < 500; i++) {
            p[i*3] = (Math.random() - 0.5) * 20;
            p[i*3+1] = (Math.random() - 0.5) * 20;
            p[i*3+2] = (Math.random() - 0.5) * 20;
        }
        return p;
    }, []);

    const ref = useRef<any>();
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.1;
        }
    });

    return (
        <group>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Sphere args={[2, 32, 32]}>
                    <MeshDistortMaterial 
                        color="#3b82f6"
                        speed={2}
                        distort={0.4}
                        wireframe
                        opacity={0.1}
                        transparent
                    />
                </Sphere>
            </Float>
            <Points ref={ref} positions={points} stride={3}>
                <PointMaterial transparent color="#3b82f6" size={0.05} sizeAttenuation opacity={0.3} />
            </Points>
        </group>
    );
};

const SkillTree: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [userXP, setUserXP] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

    useEffect(() => {
        const fetchXP = async () => {
            if (!user) return;
            const { data } = await supabase.from('profiles').select('xp').eq('id', user.id).single();
            if (data) setUserXP(data.xp || 0);
            setLoading(false);
        };
        fetchXP();
    }, [user]);

    const isUnlocked = (node: SkillNode) => {
        if (userXP < node.xp_required) return false;
        if (node.parents.length === 0) return true;
        return node.parents.every(pid => {
            const parent = NODES.find(n => n.id === pid);
            return parent && userXP >= parent.xp_required;
        });
    };

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'science': return '#10b981';
            case 'arts': return '#f59e0b';
            case 'tech': return '#8b5cf6';
            default: return '#3b82f6';
        }
    };

    return (
        <div className={`min-h-screen relative z-10 pt-24 px-6 md:px-12 pb-20 transition-all duration-1000 ${theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-slate-50 text-slate-900'}`}>
            
            {/* Background 3D */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                    <NeuralTreeScene />
                </Canvas>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 h-full flex flex-col">
                
                <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <motion.button 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => onNavigate('dashboard')} 
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-all"
                        >
                            <ArrowLeft size={14} /> Back to Command
                        </motion.button>
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] rotate-3">
                                <Database className="text-white -rotate-3" size={36} />
                            </div>
                            <div>
                                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-2">Skill Tree</h1>
                                <p className="opacity-40 font-black uppercase tracking-[0.5em] text-[10px]">Cognitive Evolution Protocol</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <div className="px-8 py-5 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center gap-4 shadow-2xl">
                            <Zap className="text-blue-500 animate-pulse" size={24} />
                            <div>
                                <p className="text-2xl font-black italic tracking-tighter leading-none">{userXP} XP</p>
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Neural Energy Level</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 min-h-[600px]">
                    
                    {/* Tree Map */}
                    <div className={`lg:col-span-8 rounded-[4rem] border relative overflow-hidden group ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-2xl'}`}>
                        {/* Connecting Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                            {NODES.map(node => node.parents.map(pid => {
                                const parent = NODES.find(n => n.id === pid);
                                if (!parent) return null;
                                const unlocked = isUnlocked(node);
                                return (
                                    <motion.line 
                                        key={`${pid}-${node.id}`}
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        x1={`${parent.position.x}%`} y1={`${parent.position.y}%`}
                                        x2={`${node.position.x}%`} y2={`${node.position.y}%`}
                                        stroke={unlocked ? getCategoryColor(node.category) : 'rgba(255,255,255,0.1)'}
                                        strokeWidth={unlocked ? "3" : "1"}
                                        strokeDasharray={unlocked ? "0" : "5,5"}
                                    />
                                );
                            }))}
                        </svg>

                        {/* Node Grid */}
                        {NODES.map((node) => {
                            const unlocked = isUnlocked(node);
                            const color = getCategoryColor(node.category);
                            return (
                                <motion.div
                                    key={node.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    onClick={() => setSelectedNode(node)}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 group cursor-pointer"
                                    style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
                                >
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-4 transition-all duration-700 ${
                                            unlocked 
                                            ? `bg-[#0D0D0D] border-${node.category === 'core' ? 'blue' : node.category === 'science' ? 'emerald' : 'amber'}-500 text-white shadow-[0_0_40px_rgba(59,130,246,0.2)]` 
                                            : 'bg-[#0D0D0D] border-white/5 text-white/10'
                                        }`}
                                        style={{ borderColor: unlocked ? color : 'rgba(255,255,255,0.05)' }}
                                    >
                                        {unlocked ? <node.icon size={32} style={{ color }} /> : <Lock size={28} />}
                                    </motion.div>
                                    
                                    <div className={`text-center transition-all duration-500 ${unlocked ? 'opacity-100' : 'opacity-20'}`}>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">{node.label}</p>
                                        <div className="flex items-center gap-2 justify-center">
                                            <div className="h-1 w-8 rounded-full" style={{ backgroundColor: color }} />
                                            <span className="text-[8px] font-black opacity-40">{node.xp_required} XP</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-4 space-y-8">
                        <AnimatePresence mode="wait">
                            {selectedNode ? (
                                <motion.div
                                    key={selectedNode.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className={`p-12 rounded-[4rem] border h-full relative overflow-hidden ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-2xl'}`}
                                >
                                    <div className="relative z-10 space-y-8">
                                        <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center border-4" style={{ borderColor: getCategoryColor(selectedNode.category) }}>
                                            <selectedNode.icon size={48} style={{ color: getCategoryColor(selectedNode.category) }} />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{selectedNode.label}</h3>
                                                {isUnlocked(selectedNode) && <Sparkles className="text-amber-500 animate-pulse" size={24} />}
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">{selectedNode.category} Node Protocol</p>
                                        </div>

                                        <p className="text-sm font-bold opacity-60 leading-relaxed italic">"{selectedNode.description}"</p>

                                        <div className="space-y-6">
                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Neural Reward</p>
                                                <div className="flex items-center gap-4">
                                                    <Award className="text-amber-500" size={20} />
                                                    <span className="text-lg font-black uppercase tracking-tighter">{selectedNode.reward}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between px-4">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Requirement</p>
                                                    <p className="text-xl font-black italic">{selectedNode.xp_required} XP</p>
                                                </div>
                                                <div className="w-12 h-12 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                                                    <div 
                                                        className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" 
                                                        style={{ animationDuration: '3s' }}
                                                    />
                                                    <Zap size={16} className="text-blue-500" />
                                                </div>
                                            </div>
                                        </div>

                                        {!isUnlocked(selectedNode) && (
                                            <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Insufficient Neural Energy</p>
                                                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Acquire {selectedNode.xp_required - userXP} more XP to sync</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Decoration */}
                                    <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12">
                                        <selectedNode.icon size={300} />
                                    </div>
                                </motion.div>
                            ) : (
                                <div className={`p-12 rounded-[4.5rem] border h-full flex flex-col items-center justify-center text-center gap-8 ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
                                    <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center justify-center opacity-20">
                                        <Hexagon size={48} className="animate-pulse" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter opacity-40">Select Node</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20 leading-relaxed">Choose a cognitive fragment to view its synchronization parameters and rewards.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillTree;
