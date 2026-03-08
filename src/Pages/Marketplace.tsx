import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, Star, Lock, Check, Zap, 
    Crown, Clock, Leaf, ArrowLeft, Loader,
    Sparkles, ShoppingCart, Tag, Hexagon,
    Palette, Music, Shield, Award, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Box, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface StoreItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: 'theme' | 'ambience' | 'frame' | 'booster';
    asset_id: string;
    icon: any;
    color: string;
}

const MOCK_ITEMS: StoreItem[] = [
    { id: '1', name: 'Obsidian Theme', description: 'Deep space aesthetic for your neural hub.', cost: 50, type: 'theme', asset_id: 'theme_obsidian', icon: Palette, color: '#6366f1' },
    { id: '2', name: 'Zen Ambience', description: 'High-performance audio loop for deep focus.', cost: 30, type: 'ambience', asset_id: 'ambience_zen', icon: Music, color: '#10b981' },
    { id: '3', name: 'Gold Frame', description: 'Elite neural identifier border.', cost: 100, type: 'frame', asset_id: 'frame_gold', icon: Crown, color: '#f59e0b' },
    { id: '4', name: 'XP Overclock', description: '2x XP gain for the next 24 hours.', cost: 150, type: 'booster', asset_id: 'booster_xp_2x', icon: Zap, color: '#ef4444' },
    { id: '5', name: 'Forest Theme', description: 'Biological growth environment skin.', cost: 50, type: 'theme', asset_id: 'theme_forest', icon: Leaf, color: '#10b981' },
    { id: '6', name: 'Elite Badge', description: 'Display your veteran status in the hall.', cost: 200, type: 'frame', asset_id: 'badge_elite', icon: Shield, color: '#3b82f6' },
];

const MarketScene = () => {
    const ref = useRef<any>();
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.1;
            ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
        }
    });

    return (
        <group ref={ref}>
            {[...Array(20)].map((_, i) => (
                <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2} position={[(Math.random()-0.5)*15, (Math.random()-0.5)*15, (Math.random()-0.5)*15]}>
                    <Box args={[0.5, 0.5, 0.5]}>
                        <MeshDistortMaterial color="#ec4899" speed={2} distort={0.3} wireframe opacity={0.1} transparent />
                    </Box>
                </Float>
            ))}
            <Points positions={new Float32Array(500 * 3).map(() => (Math.random() - 0.5) * 30)} stride={3}>
                <PointMaterial transparent color="#ec4899" size={0.05} sizeAttenuation opacity={0.2} />
            </Points>
        </group>
    );
};

const Marketplace: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
    const { user, profile } = useAuth();
    const { theme } = useTheme();
    const [items, setItems] = useState<StoreItem[]>(MOCK_ITEMS);
    const userStars = profile?.stars_count ?? 0;
    const [inventory, setInventory] = useState<any>({ themes: [], ambience: [], frames: [], boosters: [] });
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [user]);

    // Sync local inventory with profile
    useEffect(() => {
        if (profile?.inventory) {
            setInventory(profile.inventory);
        }
    }, [profile]);

    const fetchData = async () => {
        if (!supabase || !user) return;
        setLoading(true);
        try {
            const { data: storeItems } = await supabase.from('store_items').select('*');
            if (storeItems && storeItems.length > 0) {
                const iconMap: Record<string, any> = { 
                    Palette, Music, Crown, Zap, Leaf, Shield, Clock, ShoppingBag 
                };
                
                const mappedItems: StoreItem[] = storeItems.map(item => {
                    let finalColor = item.color;
                    if (!finalColor) {
                        // Legacy fallback for visual consistency if DB migration hasn't run
                        if (item.name.includes('Zen') || item.name.includes('Forest')) finalColor = '#10b981';
                        else if (item.name.includes('Elite')) finalColor = '#3b82f6';
                        else finalColor = item.type === 'theme' ? '#6366f1' : item.type === 'booster' ? '#ef4444' : '#f59e0b';
                    }
                    
                    return {
                        ...item,
                        icon: iconMap[item.icon] || ShoppingBag,
                        color: finalColor
                    };
                });
                setItems(mappedItems);
            }
        } catch (error) {
            console.error("Marketplace Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (item: StoreItem) => {
        if (userStars < item.cost) {
            alert("Insufficient Stardust! Complete more sessions.");
            return;
        }
        setPurchasing(item.id);

        try {
            // Using RPC for atomic transaction
            const { data: newStars, error: rpcError } = await supabase.rpc('decrement_stars', { 
                user_id: user?.id, 
                amount: item.cost 
            });

            if (rpcError) throw rpcError;

            const category = item.type + 's';
            const newInventory = { ...inventory };
            if (!newInventory[category]) newInventory[category] = [];
            newInventory[category].push(item.asset_id);

            const { error: invError } = await supabase
                .from('profiles')
                .update({ inventory: newInventory })
                .eq('id', user?.id);

            if (invError) throw invError;

            // Global profile will auto-update via real-time subscription in AuthContext
            
            alert(`Uplink Complete: ${item.name} is now in your neural archives.`);
        } catch (err: any) {
            alert("Neural Transaction Failed: " + (err.message || "Insufficient Stars"));
        } finally {
            setPurchasing(null);
        }
    };

    const isOwned = (item: StoreItem) => {
        const category = item.type + 's';
        return inventory[category]?.includes(item.asset_id);
    };

    return (
        <div className={`min-h-screen relative z-10 pt-12 px-6 md:px-12 pb-20 transition-all duration-1000 ${theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-pink-50/30 text-slate-900'}`}>
            
            {/* Background 3D */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                    <MarketScene />
                </Canvas>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
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
                            <div className="w-20 h-20 bg-pink-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(236,72,153,0.3)] rotate-3">
                                <ShoppingBag className="text-white -rotate-3" size={36} />
                            </div>
                            <div>
                                <h1 className={`text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Marketplace</h1>
                                <p className={`opacity-40 font-black uppercase tracking-[0.5em] text-[10px] ${theme === 'dark' ? 'text-white' : 'text-slate-500'}`}>Exchange Merit for Virtual Augmentations</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="px-10 py-6 bg-amber-500 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-2xl flex items-center gap-4 shadow-2xl shadow-amber-500/30 border-b-8 border-amber-600 active:translate-y-1 active:border-b-4 transition-all">
                            <Star className="fill-white" size={32} />
                            {userStars}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {items.map((item, i) => {
                            const owned = isOwned(item);
                            const canAfford = userStars >= item.cost;
                            return (
                                <motion.div 
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`p-10 rounded-[4rem] border transition-all duration-700 group relative overflow-hidden ${
                                        theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-pink-500/40 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-10 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-500" style={{ color: item.color }}>
                                            <item.icon size={32} />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 px-3 py-1 bg-white/5 rounded-full border border-white/5">{item.type}</span>
                                            {owned && <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1"><Check size={10}/> Owned</span>}
                                        </div>
                                    </div>

                                    <h3 className={`text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none relative z-10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.name}</h3>
                                    <p className={`text-xs font-bold opacity-40 uppercase tracking-widest leading-relaxed mb-10 h-10 relative z-10 line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-slate-600'}`}>{item.description}</p>

                                    <button 
                                        onClick={() => !owned && handlePurchase(item)}
                                        disabled={owned || purchasing === item.id || !canAfford}
                                        className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 transition-all relative z-10 overflow-hidden ${
                                            owned 
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                                            : !canAfford 
                                                ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                                : 'bg-pink-600 text-white hover:bg-pink-500 shadow-2xl shadow-pink-600/30 active:scale-95'
                                        }`}
                                    >
                                        {purchasing === item.id ? (
                                            <Loader size={18} className="animate-spin" />
                                        ) : owned ? (
                                            <>Sync Complete</>
                                        ) : (
                                            <>
                                                <Star size={16} className={canAfford ? 'fill-white' : ''} />
                                                {item.cost} Merit Points
                                            </>
                                        )}
                                    </button>

                                    {/* Decoration */}
                                    <div className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-1000 group-hover:scale-125 pointer-events-none">
                                        <item.icon size={250} />
                                    </div>
                                    
                                    {!owned && canAfford && (
                                        <div className="absolute top-0 left-0 w-full h-1 bg-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <motion.div 
                                                animate={{ x: ['-100%', '100%'] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                                className="h-full w-20 bg-pink-500 shadow-[0_0_15px_pink]"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                <div className={`mt-20 p-12 rounded-[5rem] border flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-2xl'}`}>
                    <div className="space-y-4 text-center md:text-left relative z-10">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <Tag className="text-pink-500" size={20} />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-pink-500">Inventory Status</span>
                        </div>
                        <h3 className={`text-4xl font-black italic uppercase tracking-tighter leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Access Your<br/>Virtual Archives</h3>
                        <p className={`text-xs font-bold opacity-40 uppercase tracking-widest max-w-sm ${theme === 'dark' ? 'text-white' : 'text-slate-600'}`}>Manage your purchased neural augments, themes, and focus ambience packs.</p>
                    </div>
                    <button 
                        onClick={() => onNavigate('profile')}
                        className={`px-12 py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-105 transition-all flex items-center gap-4 relative z-10 ${
                            theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white shadow-slate-900/20'
                        }`}
                    >
                        Neural ID <ChevronRight size={18} />
                    </button>
                    <div className="absolute right-0 top-0 opacity-[0.03] rotate-12 pointer-events-none">
                        <ShoppingCart size={400} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
