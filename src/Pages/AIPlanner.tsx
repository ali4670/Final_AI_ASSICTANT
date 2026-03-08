import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Calendar, Clock, BookOpen, 
  ChevronRight, Brain, Zap, Loader, ArrowLeft,
  Save, Download, Bot, Target, Activity as ActivityIcon,
  LayoutGrid, RefreshCw, FileText, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { generateNeuralPDF } from '../lib/pdfGenerator';

interface PlannerProps {
    onNavigate: (page: string) => void;
}

const BrainScene = () => {
    const points = useMemo(() => {
        const p = new Float32Array(1000 * 3);
        for (let i = 0; i < 1000; i++) {
            const r = 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            p[i*3] = r * Math.sin(phi) * Math.cos(theta) * (0.8 + Math.random() * 0.4);
            p[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * (1.1 + Math.random() * 0.2);
            p[i*3+2] = r * Math.cos(phi) * (0.7 + Math.random() * 0.3);
        }
        return p;
    }, []);

    const ref = useRef<any>();
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.2;
            ref.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
        }
    });

    return (
        <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Sphere args={[2, 32, 32]}>
                    <MeshDistortMaterial 
                        color="#f97316"
                        speed={2}
                        distort={0.3}
                        wireframe
                        opacity={0.1}
                        transparent
                    />
                </Sphere>
            </Float>
            <Points ref={ref} positions={points} stride={3}>
                <PointMaterial
                    transparent
                    color="#f97316"
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.4}
                />
            </Points>
        </group>
    );
};

const AIPlanner: React.FC<PlannerProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<any>(null);
    const [studyProfile, setStudyProfile] = useState<any>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const res = await fetch(`/api/get-study/${user.id}`);
                const data = await res.json();
                if (data && data.system) setStudyProfile(data);
            } catch (err) { console.error("[AI Planner] Fetch profile error:", err); }
        };
        fetchProfile();
        
        // Load saved plan from local storage if exists
        const savedPlan = localStorage.getItem(`study_plan_${user?.id}`);
        if (savedPlan) {
            try {
                setPlan(JSON.parse(savedPlan));
            } catch (e) {
                console.error("Failed to load saved plan", e);
            }
        }
    }, [user]);

    const generatePlan = async () => {
        if (!studyProfile) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/generate-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user?.id,
                    subjects: studyProfile.subjects,
                    system: studyProfile.system,
                    extensive: true // Hint for backend
                })
            });
            
            if (!res.ok) throw new Error("Synthesis Failed");

            const data = await res.json();
            if (data.plan) {
                setPlan(data.plan);
                localStorage.setItem(`study_plan_${user?.id}`, JSON.stringify(data.plan));
            }
        } catch (err: any) {
            console.error(err);
            alert("Uplink Error: Failed to synthesize neural plan.");
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (!gridRef.current) return;
        setLoading(true);
        try {
            await generateNeuralPDF(gridRef.current, {
                title: 'INTELLIGENT STUDY GRID',
                subtitle: 'NEURAL ACADEMIC SYNCHRONIZATION GRID',
                userName: user?.email || 'GUEST_EXPLORER',
                theme: theme,
                fileName: `Neural_Grid_${new Date().toISOString().split('T')[0]}`,
                orientation: 'l'
            });
        } catch (err) {
            console.error("PDF Export Critical Error:", err);
            alert("Uplink Error: High-performance PDF synthesis failed.");
        } finally {
            setLoading(false);
        }
    };

    const clearPlan = () => {
        if (confirm("Permanently erase current study grid?")) {
            setPlan(null);
            localStorage.removeItem(`study_plan_${user?.id}`);
        }
    };

    return (
        <div className={`min-h-screen relative z-10 pt-12 px-6 md:px-12 pb-20 transition-colors duration-1000 relative overflow-hidden ${theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
            
            {/* Background 3D */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <BrainScene />
                </Canvas>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <motion.button 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => onNavigate('dashboard')}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] opacity-50 hover:opacity-100 transition-all mb-4`}
                        >
                            <ArrowLeft size={14} /> Back to Command
                        </motion.button>
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-orange-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.3)] rotate-3">
                                <Sparkles className="text-white -rotate-3" size={36} />
                            </div>
                            <div>
                                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-2">AI Planner</h1>
                                <p className="opacity-40 font-black uppercase tracking-[0.5em] text-[10px]">Weekly Neural Protocol Synthesis</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {plan && (
                            <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-3xl backdrop-blur-xl">
                                <button 
                                    onClick={downloadPDF}
                                    className="p-4 bg-orange-600 text-white rounded-2xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all"
                                >
                                    <FileText size={16} /> Export PDF
                                </button>
                                <button 
                                    onClick={clearPlan}
                                    className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                        {studyProfile && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={generatePlan}
                                disabled={loading}
                                className="px-10 py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl flex items-center gap-4 group"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} className="group-hover:scale-125 transition-transform" />}
                                {plan ? 'Re-Synthesize' : 'Initialize Grid'}
                            </motion.button>
                        )}
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {!plan ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            {!studyProfile ? (
                                <div className="max-w-md space-y-8">
                                    <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto opacity-20">
                                        <Bot size={48} />
                                    </div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">No Academic Roadmap</h2>
                                    <p className="opacity-40 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
                                        Your neural study fragments are not yet synchronized. Please initialize your study profile to begin planning.
                                    </p>
                                    <button 
                                        onClick={() => onNavigate('studyPath')}
                                        className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px]"
                                    >
                                        Setup Roadmap
                                    </button>
                                </div>
                            ) : (
                                <div className="max-w-2xl space-y-12">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {[
                                            { label: 'System', val: studyProfile.system.split('_')[0] },
                                            { label: 'Modules', val: studyProfile.subjects?.length || 0 },
                                            { label: 'Horizon', val: '7 Days' },
                                            { label: 'Mode', val: 'Extensive' }
                                        ].map((stat, i) => (
                                            <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                                <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-2">{stat.label}</p>
                                                <p className="text-xl font-black italic uppercase tracking-tighter">{stat.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-12 rounded-[4rem] bg-white/5 border border-white/5 backdrop-blur-md">
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Ready for Synthesis</h3>
                                        <p className="opacity-40 font-bold uppercase tracking-widest text-[10px] leading-relaxed mb-8">
                                            The AI engine will construct an extensive high-performance 7-day grid with 5 sessions per day tailored to your {studyProfile.system} curriculum.
                                        </p>
                                        <button 
                                            onClick={generatePlan}
                                            className="px-12 py-6 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-orange-600/20"
                                        >
                                            Begin Neural Synthesis
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="plan"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-12"
                        >
                            {/* --- PLAN GRID WRAPPER --- */}
                            <div ref={gridRef} className={`${theme === 'dark' ? 'bg-[#050505]' : 'bg-white'} p-8 rounded-[4rem]`}>
                                {/* Print Header (Visible only in PDF) */}
                                <div className="hidden pdf-only mb-12 border-b-4 border-orange-600 pb-8">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-2">Study<br/>Synchronization</h1>
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-600">7-Day Optimized Neural Grid</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 mb-1">UNIT PROFILE</p>
                                            <p className="text-xl font-black italic uppercase tracking-tighter">{user?.email || 'GUEST_EXPLORER'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div id="study-plan-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                                    {plan.map((day: any, i: number) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`group p-6 rounded-[2.5rem] border transition-all duration-500 ${
                                                theme === 'dark' 
                                                ? 'bg-[#0D0D0D] border-white/5 hover:border-orange-500/30' 
                                                : 'bg-slate-50 border-slate-100 shadow-sm'
                                            }`}
                                        >
                                            <div className="text-center mb-6">
                                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] mb-2 block">{day.day}</span>
                                                <div className="h-px w-8 bg-orange-600/20 mx-auto" />
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {day.tasks.map((task: any, j: number) => (
                                                    <div key={j} className="relative pl-4 border-l-2 border-orange-500/10 group-hover:border-orange-500/30 transition-colors">
                                                        <div className="flex items-center gap-2 text-[7px] font-black text-orange-400 uppercase tracking-widest mb-1">
                                                            <Clock size={8} /> {task.time}
                                                        </div>
                                                        <p className="text-[9px] font-black uppercase italic tracking-tighter leading-tight mb-1 group-hover:text-orange-500 transition-colors">
                                                            {task.subject}
                                                        </p>
                                                        <p className="text-[7px] font-bold opacity-30 uppercase tracking-widest leading-tight">
                                                            {task.activity}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Print Footer (Visible only in PDF) */}
                                <div className="hidden pdf-only mt-12 pt-8 border-t-2 border-orange-600/20 flex justify-between items-center opacity-40">
                                    <p className="text-[8px] font-black uppercase tracking-[0.4em]">NEURAL STUDY AI // SYNC PROTOCOL V2.5</p>
                                    <p className="text-[8px] font-black uppercase tracking-[0.4em]">CONFIDENTIAL GRID</p>
                                </div>
                            </div>

                            {/* --- AI INSIGHT CARD --- */}
                            <div className={`p-16 rounded-[5rem] border relative overflow-hidden group ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-2xl'
                            }`}>
                                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 group-hover:scale-110">
                                    <Brain size={300} />
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                                    <div className="lg:col-span-4 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
                                        <div className="w-20 h-20 bg-orange-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-orange-600/20">
                                            <Bot size={36} className="text-white" />
                                        </div>
                                        <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">Insight<br/><span className="text-orange-600">Protocol</span></h3>
                                        <div className="flex gap-4">
                                            <button onClick={downloadPDF} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-orange-600 transition-all text-white"><Download size={20} /></button>
                                            <button className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-orange-600 transition-all text-white"><Save size={20} /></button>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-8 flex flex-col justify-center">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <Target className="text-orange-500" size={18} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Neural Recommendation</span>
                                            </div>
                                            <p className="text-xl md:text-2xl font-bold opacity-70 leading-relaxed italic">
                                                "This extensive plan features 5 sessions per cycle. I've prioritized your weakest modules during the pre-noon synchronization peak. 
                                                <span className="text-white"> Deep Work</span> blocks are focused on new concepts, while evening blocks are for <span className="text-orange-500">Active Recall</span>. Use the PDF export to keep your grid visible."
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {loading && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[1000] flex items-center justify-center">
                    <div className="text-center space-y-8">
                        <div className="relative w-32 h-32 mx-auto">
                            <motion.div 
                                animate={{ rotate: 360 }} 
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-4 border-orange-600 rounded-full"
                            />
                            <motion.div 
                                animate={{ rotate: -360 }} 
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border-t-4 border-orange-400/20 rounded-full"
                            />
                            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" size={32} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Synthesizing Protocol</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 animate-pulse">Consulting Neural Study Core...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIPlanner;
