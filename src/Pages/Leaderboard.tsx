import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, Star, ArrowLeft, Loader, User, 
    Crown, Medal, Sparkles, TrendingUp, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface LeaderboardEntry {
    username: string;
    stars_count: number;
    xp: number;
    level: number;
    daily_streak: number;
}

interface Props {
    onNavigate: (page: string) => void;
}

const Leaderboard: React.FC<Props> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'stars' | 'xp'>('stars');

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            // Use select('*') to avoid schema mismatches if columns are renamed/missing
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('stars_count', { ascending: false, nullsFirst: false })
                .limit(20);

            if (error) throw error;
            
            // Safe mapping with fallbacks for all fields
            const mapped = (data || []).map(d => ({
                id: d.id,
                username: d.username || d.email?.split('@')[0] || 'Anonymous Unit',
                stars_count: Number(d.stars_count) || 0,
                xp: Number(d.xp) || 0,
                level: Number(d.level) || 1,
                daily_streak: Number(d.daily_streak) || 0
            }));

            setEntries(mapped);
        } catch (err) {
            console.error("[Leaderboard] Fetch Critical Error:", err);
            // Fallback empty state instead of crash
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    const sortedEntries = [...entries].sort((a, b) => {
        if (sortBy === 'stars') return b.stars_count - a.stars_count;
        return b.xp - a.xp;
    });

    return (
        <div className={`min-h-screen relative z-10 pt-12 p-8 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <div className="max-w-4xl mx-auto">
                <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl border shadow-lg ${theme === 'dark' ? 'bg-amber-600/10 text-amber-500 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                <Trophy size={32} />
                            </div>
                            <h1 className={`text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Hall of Fame</h1>
                        </div>
                        <p className={`opacity-40 font-black uppercase tracking-[0.4em] text-[10px] ml-2 ${theme === 'dark' ? 'text-white' : 'text-slate-500'}`}>Neural Mastery Rankings</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex backdrop-blur-xl border p-1 rounded-2xl ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                            <button 
                                onClick={() => setSortBy('stars')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'stars' ? 'bg-amber-500 text-white' : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900')}`}
                            >
                                Stars
                            </button>
                            <button 
                                onClick={() => setSortBy('xp')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'xp' ? 'bg-blue-600 text-white' : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900')}`}
                            >
                                XP
                            </button>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.1, x: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onNavigate('dashboard')}
                            className={`p-5 border rounded-3xl transition-all shadow-xl ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}
                        >
                            <ArrowLeft size={24} />
                        </motion.button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-amber-500" size={48} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedEntries.map((entry, index) => {
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
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 ${
                                        index === 0 ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/40' :
                                        index === 1 ? 'bg-slate-300 text-slate-700' :
                                        index === 2 ? 'bg-orange-400 text-white' :
                                        'bg-white/5 border border-white/10'
                                    }`}>
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className={`text-2xl font-black italic uppercase tracking-tight truncate ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                                                {entry.username || 'Anonymous Unit'}
                                            </h3>
                                            {isUser && <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shrink-0">You</span>}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Level {entry.level || 1}</span>
                                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                                                <TrendingUp size={10} /> {entry.daily_streak || 0} Streak
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-3xl font-black italic tracking-tighter tabular-nums text-amber-500 flex items-center gap-2">
                                                {entry.stars_count} <Star className="fill-amber-500" size={20} />
                                            </div>
                                            <p className="text-[8px] font-black uppercase opacity-30 tracking-[0.2em]">Stars</p>
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                            <div className="text-3xl font-black italic tracking-tighter tabular-nums text-blue-500 flex items-center gap-2">
                                                {entry.xp} <Zap className="fill-blue-500" size={20} />
                                            </div>
                                            <p className="text-[8px] font-black uppercase opacity-30 tracking-[0.2em]">XP</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}


                <footer className="mt-20 text-center space-y-6">
                    <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-full border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                        <Sparkles size={16} className="text-amber-500" />
                        <span className={`text-[10px] font-black uppercase tracking-widest opacity-50 ${theme === 'dark' ? 'text-white' : 'text-slate-500'}`}>Complete study sessions to earn neural stars</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Leaderboard;
