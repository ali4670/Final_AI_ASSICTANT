import React, { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Database, Activity,
    Trash2, Search, Filter, Layers, 
    Zap, Leaf, Home, Users, Sparkles as SparklesIcon,
    ChevronRight, Info, Plus, Hexagon
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
    OrbitControls, PerspectiveCamera, Environment, Float, 
    ContactShadows, Stage, Sparkles, Cloud, MeshDistortMaterial, 
    Sphere, PointMaterial, Points, PresentationControls
} from '@react-three/drei';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { 
    Tree, Grass, House, Farmer, Bush, Monolith, 
    Windmill, Fountain, RobotFarmer, Barn, Fence, Sheep 
} from '../components/3D/GardenItems';
import * as THREE from 'three';

const BackgroundNodes = () => {
    const points = useMemo(() => {
        const p = new Float32Array(500 * 3);
        for (let i = 0; i < 500; i++) {
            p[i*3] = (Math.random() - 0.5) * 30;
            p[i*3+1] = (Math.random() - 0.5) * 30;
            p[i*3+2] = (Math.random() - 0.5) * 30;
        }
        return p;
    }, []);

    const ref = useRef<any>();
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
            ref.current.rotation.z = state.clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <Points ref={ref} positions={points} stride={3}>
            <PointMaterial
                transparent
                color="#10b981"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.2}
            />
        </Points>
    );
};

const RegistryItem3D = ({ type, id }: { type: string, id: string }) => {
    const renderModel = () => {
        const props = { position: [0, 0, 0] as [number, number, number], seed: id };
        switch (type) {
            case 'tree': return <Tree {...props} />;
            case 'house': return <House {...props} />;
            case 'robot': return <RobotFarmer {...props} />;
            case 'barn': return <Barn position={[0,0,0]} />;
            case 'windmill': return <Windmill position={[0,0,0]} />;
            case 'sheep': return <Sheep position={[0,0,0]} />;
            case 'fountain': return <Fountain position={[0,0,0]} />;
            case 'monolith': return <Monolith position={[0,0,0]} />;
            case 'bush': return <Bush position={[0,0,0]} />;
            case 'fence': return <Fence position={[0,0,0]} />;
            default: return <Tree {...props} />;
        }
    };

    return (
        <Canvas shadows camera={{ position: [5, 5, 5], fov: 40 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#10b981" />
            
            <Suspense fallback={null}>
                <PresentationControls
                    global
                    config={{ mass: 2, tension: 500 }}
                    snap={{ mass: 4, tension: 1500 }}
                    rotation={[0, 0.3, 0]}
                    polar={[-Math.PI / 3, Math.PI / 3]}
                    azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
                >
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <group scale={1.2}>
                            {renderModel()}
                        </group>
                    </Float>
                </PresentationControls>
                
                <ContactShadows 
                    position={[0, -1.5, 0]} 
                    opacity={0.4} 
                    scale={10} 
                    blur={2.5} 
                    far={4} 
                />
                
                <Environment preset="forest" />
                <Sparkles count={40} scale={5} size={2} speed={0.4} color="#10b981" opacity={0.2} />
            </Suspense>
            
            <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
    );
};

const Trees: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'nature' | 'structures' | 'units'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { fetchRegistry(); }, [user]);

    const fetchRegistry = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data } = await supabase.from('garden_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            setItems(data || []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const deleteItem = async (id: string) => {
        await supabase.from('garden_items').delete().eq('id', id);
        setItems(items.filter(i => i.id !== id));
    };

    const categories = {
        nature: ['tree', 'grass', 'bush'],
        structures: ['house', 'barn', 'windmill', 'fountain', 'monolith', 'fence'],
        units: ['farmer', 'robot', 'sheep']
    };

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.item_type.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filter === 'all' || 
                (filter === 'nature' && categories.nature.includes(item.item_type)) ||
                (filter === 'structures' && categories.structures.includes(item.item_type)) ||
                (filter === 'units' && categories.units.includes(item.item_type));
            return matchesSearch && matchesFilter;
        });
    }, [items, filter, searchQuery]);

    const stats = useMemo(() => ({
        total: items.length,
        nature: items.filter(i => categories.nature.includes(i.item_type)).length,
        structures: items.filter(i => categories.structures.includes(i.item_type)).length,
        units: items.filter(i => categories.units.includes(i.item_type)).length,
    }), [items]);

    return (
        <div className={`min-h-screen pt-24 pb-20 px-6 md:px-12 transition-colors duration-1000 relative overflow-hidden ${theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-[#f0f9f4] text-slate-900'}`}>
            
            {/* Ambient Neural Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                    <BackgroundNodes />
                    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
                        <Sphere args={[8, 64, 64]} position={[10, -5, -10]}>
                            <MeshDistortMaterial 
                                color="#10b981" 
                                speed={1} 
                                distort={0.3} 
                                wireframe 
                                opacity={0.05} 
                                transparent 
                            />
                        </Sphere>
                    </Float>
                </Canvas>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                
                <header className="mb-24 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
                    <div className="space-y-6">
                        <motion.button 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => onNavigate('dashboard')} 
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 hover:text-emerald-500 transition-all"
                        >
                            <ArrowLeft size={14} /> Back to Command
                        </motion.button>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] rotate-6">
                                    <Database className="text-white -rotate-6" size={36} />
                                </div>
                                <div>
                                    <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-2">Registry</h1>
                                    <p className="opacity-40 font-black uppercase tracking-[0.6em] text-[10px]">Biological & Structural Archives</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-[2rem] backdrop-blur-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                            {(['all', 'nature', 'structures', 'units'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                        filter === f 
                                        ? 'bg-emerald-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]' 
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="relative group w-full md:w-[300px]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500/40 group-focus-within:text-emerald-500 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Neural Search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-5 pl-16 pr-8 text-[10px] font-black uppercase tracking-widest outline-none focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all placeholder:text-gray-700"
                            />
                        </div>
                    </div>
                </header>

                {/* Biological HUD Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                    {[
                        { label: 'Neural Flora', val: stats.nature, icon: Leaf, color: 'emerald' },
                        { label: 'Core Structs', val: stats.structures, icon: Home, color: 'amber' },
                        { label: 'Living Units', val: stats.units, icon: Users, color: 'blue' },
                        { label: 'Total Nodes', val: stats.total, icon: Database, color: 'purple' }
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-10 rounded-[3.5rem] border transition-all ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-${s.color}-600/10 text-${s.color}-500 border border-${s.color}-500/20`}>
                                <s.icon size={24} />
                            </div>
                            <p className="text-4xl font-black italic uppercase tracking-tighter mb-1 leading-none">{s.val}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-8">
                        <div className="relative w-24 h-24">
                            <motion.div 
                                animate={{ rotate: 360 }} 
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-4 border-emerald-600 rounded-full"
                            />
                            <motion.div 
                                animate={{ rotate: -360 }} 
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border-t-4 border-emerald-400/20 rounded-full"
                            />
                            <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.8em] animate-pulse">Syncing Botanical Grid</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item, i) => (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`relative h-[500px] rounded-[4.5rem] border transition-all duration-700 group overflow-hidden ${
                                        theme === 'dark' 
                                        ? 'bg-[#0D0D0D] border-white/5 hover:border-emerald-500/40 shadow-2xl' 
                                        : 'bg-white border-slate-100 hover:shadow-2xl hover:border-emerald-200'
                                    }`}
                                >
                                    {/* 3D Model Layer */}
                                    <div className="absolute inset-0 z-0">
                                        <RegistryItem3D type={item.item_type} id={item.id} />
                                    </div>

                                    {/* UI Layer */}
                                    <div className="absolute inset-0 p-10 flex flex-col justify-between z-10 pointer-events-none">
                                        <div className="flex justify-between items-start pointer-events-auto">
                                            <div className="flex flex-col gap-2">
                                                <div className="px-5 py-2 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md flex items-center gap-3">
                                                    <Hexagon size={12} className="text-emerald-500" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">{item.item_type}</span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-40 px-2">
                                                    <Clock size={10} />
                                                    <span className="text-[8px] font-bold tabular-nums uppercase">{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <motion.button 
                                                whileHover={{ scale: 1.1, backgroundColor: '#ef4444', color: '#fff' }}
                                                onClick={() => deleteItem(item.id)}
                                                className="p-4 bg-white/5 border border-white/5 text-red-500/60 rounded-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </motion.button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center">
                                                    <SparklesIcon size={16} className="text-emerald-500" />
                                                </div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white drop-shadow-lg">Neural Growth Sync Active</p>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-all delay-100">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="h-full bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overlay Shadow */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-[5]" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredItems.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-40 text-center space-y-8"
                    >
                        <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-[3rem] flex items-center justify-center mx-auto opacity-20">
                            <Leaf size={48} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter opacity-40">No Archives Found</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Your botanical grid is awaiting synchronization</p>
                        </div>
                        <button 
                            onClick={() => onNavigate('pomodoro')}
                            className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-600/20 flex items-center gap-3 mx-auto"
                        >
                            Start Focus Protocol <ChevronRight size={16} />
                        </button>
                    </motion.div>
                )}
            </div>
            
            {/* Footer Latency */}
            <div className="max-w-7xl mx-auto mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-30">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Botanical Engine Online</span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Flora Latency: 4ms</span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.5em]">Registry Archive // v2.4.9</p>
            </div>
        </div>
    );
};

import { Clock } from 'lucide-react';

export default Trees;
