import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Leaf, ArrowLeft, ShieldCheck, Zap, 
    Wind, Sun, Loader, Award, Sprout,
    TreeDeciduous, Database, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTimer } from '../contexts/TimerContext';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import FocusBiome from '../components/3D/FocusBiome';

const Trees: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const { growthPoints } = useTimer();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const getStageName = (points: number) => {
        if (points <= 10) return "Neural Seed";
        if (points <= 30) return "Active Sprout";
        if (points <= 60) return "Developed Flora";
        return "Grand Neural Tree";
    };

    const getStageDesc = (points: number) => {
        if (points <= 10) return "The potential for massive knowledge resides within this dormant core.";
        if (points <= 30) return "Early cognitive patterns are beginning to take physical form.";
        if (points <= 60) return "Significant focus investment has resulted in a stable intellectual structure.";
        return "Absolute mastery. A towering monument to your sustained focus and discipline.";
    };

    return (
        <div className={`min-h-screen pt-24 pb-12 px-8 transition-colors duration-700 relative overflow-hidden ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-emerald-50 text-slate-900'}`}>
            
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b ${theme === 'dark' ? 'from-emerald-900/10 to-transparent' : 'from-emerald-200/20 to-transparent'}`} />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                    <div className="space-y-4">
                        <motion.button 
                            whileHover={{ x: -5 }}
                            onClick={() => onNavigate('dashboard')}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all"
                        >
                            <ArrowLeft size={14} /> Back to Command
                        </motion.button>
                        <div className="flex items-center gap-6">
                            <div className={`p-4 rounded-3xl border shadow-2xl ${theme === 'dark' ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                <TreeDeciduous size={32} />
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">Botanical <br /> <span className="text-emerald-500">Registry</span></h1>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="px-8 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30 mb-1">Global Growth Index</span>
                            <span className="text-4xl font-black italic tracking-tighter text-emerald-500">{growthPoints} PX</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
                    {/* 3D Biological Viewport */}
                    <div className={`lg:col-span-7 rounded-[4rem] border relative overflow-hidden min-h-[600px] shadow-2xl ${
                        theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 shadow-emerald-900/5' : 'bg-white border-emerald-100 shadow-emerald-500/5'
                    }`}>
                        <Canvas shadows>
                            <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={45} />
                            <OrbitControls enablePan={false} minDistance={4} maxDistance={12} />
                            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                            
                            <ambientLight intensity={0.4} />
                            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                            <pointLight position={[-10, -10, -10]} color="emerald" intensity={0.5} />

                            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                                <FocusBiome growth={growthPoints} />
                            </Float>

                            <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
                        </Canvas>

                        <div className="absolute top-8 left-8 p-6 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500">Live Bio-Feed</span>
                            </div>
                            <p className="text-xl font-black italic uppercase tracking-tight">{getStageName(growthPoints)}</p>
                        </div>

                        <div className="absolute bottom-8 right-8 flex gap-3">
                            <div className="p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl">
                                <Wind className="text-white/40" size={20} />
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl">
                                <Sun className="text-yellow-500/40" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Evolutionary Data */}
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-10 rounded-[3.5rem] border ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-emerald-50'}`}
                        >
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-6">Current Evolution</h3>
                            <p className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-tight">{getStageName(growthPoints)}</p>
                            <p className="text-sm font-medium opacity-50 leading-relaxed mb-8">{getStageDesc(growthPoints)}</p>
                            
                            <div className="space-y-6">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Next Phase Requirement</span>
                                    <span className="text-xs font-black italic">
                                        {growthPoints < 11 ? "11" : growthPoints < 31 ? "31" : growthPoints < 61 ? "61" : "∞"} PX
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((growthPoints / 100) * 100, 100)}%` }}
                                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-6">
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className={`p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-emerald-50 shadow-sm'}`}
                            >
                                <Award className="text-yellow-500 mb-4" size={24} />
                                <h4 className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1">Focus Yield</h4>
                                <p className="text-2xl font-black italic tracking-tighter">{Math.floor(growthPoints / 10)} Sessions</p>
                            </motion.div>
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className={`p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-emerald-50 shadow-sm'}`}
                            >
                                <Activity className="text-blue-500 mb-4" size={24} />
                                <h4 className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1">Neural Health</h4>
                                <p className="text-2xl font-black italic tracking-tighter">Optimum</p>
                            </motion.div>
                        </div>

                        <div className={`p-8 rounded-[3rem] border border-dashed flex items-center justify-center gap-4 ${theme === 'dark' ? 'border-white/10' : 'border-emerald-200'}`}>
                            <div className="text-center">
                                <Sprout className="mx-auto mb-3 opacity-20" size={32} />
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20">New Bio-Variants Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {loading && (
                    <motion.div 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[500] bg-[#050505] flex flex-col items-center justify-center gap-6"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <Leaf size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">Syncing Botanical Registry</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Trees;
