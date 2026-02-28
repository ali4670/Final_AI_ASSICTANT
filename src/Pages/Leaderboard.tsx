import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, Star, ArrowLeft, Loader, User, 
    Crown, Medal, Sparkles, TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface LeaderboardEntry {
    username: string;
    stars_count: number;
}

interface Props {
    onNavigate: (page: string) => void;
}

const Leaderboard: React.FC<Props> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch('/api/leaderboard');
            const data = await res.json();
            if (Array.isArray(data)) setEntries(data);
        } catch (err) {
            console.error("Leaderboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen relative z-10 pt-24 p-8 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <div className="max-w-4xl mx-auto">
                <header className="mb-16 flex justify-between items-end">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl border shadow-lg ${theme === 'dark' ? 'bg-amber-600/10 text-amber-500 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                <Trophy size={32} />
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Hall of Fame</h1>
                        </div>
                        <p className="opacity-40 font-black uppercase tracking-[0.4em] text-[10px] ml-20">Neural Mastery Rankings</p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.1, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onNavigate('dashboard')}
                        className={`p-5 border rounded-3xl transition-all shadow-xl ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-amber-500" size={48} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {entries.map((entry, index) => {
                            const isUser = entry.username === (user?.user_metadata?.username || user?.email?.split('@')[0]);
                            const isTopThree = index < 3;
                            
                            return (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-8 rounded-[3rem] border flex items-center gap-8 transition-all relative overflow-hidden ${
                                        isUser 
                                        ? 'bg-amber-500/10 border-amber-500/30 scale-[1.02] shadow-2xl' 
                                        : theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-sm'
                                    }`}
                                >
                                    {isTopThree && (
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Crown size={80} className="text-amber-500" />
                                        </div>
                                    )}

                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl ${
                                        index === 0 ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/40' :
                                        index === 1 ? 'bg-slate-300 text-slate-700' :
                                        index === 2 ? 'bg-orange-400 text-white' :
                                        'bg-white/5 border border-white/10'
                                    }`}>
                                        {index + 1}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-black italic uppercase tracking-tight truncate max-w-[200px] md:max-w-none">
                                                {entry.username || 'Anonymous Unit'}
                                            </h3>
                                            {isUser && <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest">You</span>}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Neural Explorer Level {Math.floor(entry.stars_count / 10) + 1}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-4xl font-black italic tracking-tighter tabular-nums text-amber-500 flex items-center gap-2">
                                                {entry.stars_count} <Star className="fill-amber-500" size={24} />
                                            </div>
                                            <p className="text-[8px] font-black uppercase opacity-30 tracking-[0.2em]">Stars Earned</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                <footer className="mt-20 text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10">
                        <Sparkles size={16} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Complete study sessions to earn neural stars</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Leaderboard;
