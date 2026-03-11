import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  MessageSquare, 
  Brain, 
  Trophy, 
  Clock, 
  LayoutDashboard, 
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  FileText,
  Search,
  ChevronRight,
  Plus,
  Activity,
  ListTodo,
  Star,
  Map,
  Share2,
  TreeDeciduous,
  Flower2,
  Users,
  Video,
  TrendingUp,
  Award,
  CloudRain,
  ShoppingBag,
  Network,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import FloatingAssets from './3D/FloatingAssets';
import { translations } from '../utils/translations';
import TiltCard from './TiltCard';

interface DashboardProps {
    onNavigate: (page: string, id?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const { user, profile } = useAuth();
    const themeCtx = useTheme();
    
    // Safety first
    const theme = themeCtx?.theme || 'dark';
    const language = themeCtx?.language || 'en';
    const [searchQuery, setSearchQuery] = useState('');
    
    const langData = (translations as any)?.[language] || translations?.['en'] || {};
    const t = langData?.dashboard || (translations as any)?.['en']?.dashboard || {};
    const [showTour, setShowTour] = useState(false);
    const [studyProfile, setStudyProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        docs: 0,
        cards: 0,
        sessions: 0,
        streak: 0,
        xp: 0,
        level: 1,
        focusScore: 0,
        stars: 0
    });
    const [heatmap, setHeatmap] = useState<number[]>([]);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('tour_completed');
        if (!hasSeenTour) setShowTour(true);
    }, []);

    const completeTour = () => {
        setShowTour(false);
        localStorage.setItem('tour_completed', 'true');
    };

    // Sync stats with global profile
    useEffect(() => {
        if (profile) {
            setStats(prev => ({
                ...prev,
                streak: profile.daily_streak || 0,
                xp: profile.xp || 0,
                level: profile.level || 1,
                stars: profile.stars_count || 0
            }));
        }
    }, [profile]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user || !supabase) return;
            try {
                // Fetch Counts
                const { count: docsCount } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
                const { count: cardsCount } = await supabase.from('flashcards').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
                
                // Fetch Sessions for Heatmap & Focus Score
                const { data: sessions } = await supabase.from('study_sessions').select('*').eq('user_id', user.id);
                
                const sessionCount = sessions?.length || 0;
                const totalMinutes = sessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0;
                const avgFocus = sessionCount > 0 ? Math.min(100, Math.round((totalMinutes / (sessionCount * 25)) * 100)) : 0;

                setStats(prev => ({
                    ...prev,
                    docs: docsCount || 0,
                    cards: cardsCount || 0,
                    sessions: sessionCount,
                    focusScore: avgFocus,
                }));

                // Real Heatmap logic (sessions in last 14 days)
                const now = new Date();
                const last14Days = Array.from({ length: 14 }, (_, i) => {
                    const d = new Date();
                    d.setDate(now.getDate() - (13 - i));
                    return d.toISOString().split('T')[0];
                });

                const sessionCounts = last14Days.map(dateStr => {
                    return sessions?.filter(s => s.created_at?.startsWith(dateStr)).length || 0;
                });
                
                setHeatmap(sessionCounts);

                // Fetch Study Profile (Roadmap)
                const res = await fetch(`/api/get-study/${user.id}`);
                const data = await res.json();
                if (data && data.system) {
                    setStudyProfile(data);
                }
            } catch (e) {
                console.error("Dashboard data fetch error", e);
            }
        };
        fetchDashboardData();
    }, [user]);

    const menuItems = [
        { id: 'public-docs', title: t?.menu?.public?.title || 'Public Grid', icon: Users, color: '#10b981', badge: 'Global', desc: t?.menu?.public?.desc || 'Access and study from community shared knowledge nodes.' },
        { id: 'themes', title: t?.menu?.themes?.title || 'Environments', icon: CloudRain, color: '#a855f7', badge: 'Immersive', desc: t?.menu?.themes?.desc || 'Customize your study atmosphere with smart themes.' },
        { id: 'documents', title: t?.menu?.library?.title || 'Library', icon: BookOpen, color: '#3b82f6', badge: 'Storage', desc: t?.menu?.library?.desc || 'Manage your documents' },
        { id: 'chat', title: t?.menu?.chat?.title || 'Chat', icon: MessageSquare, color: '#6366f1', badge: 'AI Link', desc: t?.menu?.chat?.desc || 'Neural Sync Dialogue' },
        { id: 'flashcards', title: t?.menu?.cards?.title || 'Cards', icon: Brain, color: '#a855f7', badge: 'Memory', desc: t?.menu?.cards?.desc || 'Recall Nodes' },
        { id: 'quizzes', title: t?.menu?.quiz?.title || 'Quiz', icon: Trophy, color: '#ec4899', badge: 'Test', desc: t?.menu?.quiz?.desc || 'Evaluation Protocols' },
        { id: 'leaderboard', title: t?.menu?.leaderboard?.title || 'Ranks', icon: Star, color: '#fbbf24', badge: 'Rank', desc: t?.menu?.leaderboard?.desc || 'Hall of Fame' },
        { id: 'marketplace', title: t?.menu?.market?.title || 'Neural Market', icon: ShoppingBag, color: '#ec4899', badge: 'Store', desc: t?.menu?.market?.desc || 'Redeem stars for virtual assets and upgrades.' },
        { id: 'skill-tree', title: t?.menu?.skills?.title || 'Skill Tree', icon: Network, color: '#3b82f6', badge: 'Growth', desc: t?.menu?.skills?.desc || 'Visualize your cognitive evolution and unlock perks.' },
        { id: 'studyTimeline', title: t?.menu?.roadmap?.title || 'Roadmap', icon: Clock, color: '#10b981', badge: 'Plan', desc: t?.menu?.roadmap?.desc || 'Temporal Map' },
        { id: 'resume', title: t?.menu?.resume?.title || 'CV', icon: FileText, color: '#3b82f6', badge: 'Career', desc: t?.menu?.resume?.desc || 'Resume Builder' },
        { id: 'knowledgeGraph', title: t?.menu?.graph?.title || 'Web', icon: Share2, color: '#6366f1', badge: '3D Web', desc: t?.menu?.graph?.desc || 'Knowledge Graph' },
        { id: 'masteryMap', title: t?.menu?.mastery?.title || 'Map', icon: Brain, color: '#8b5cf6', badge: 'Cognitive', desc: t?.menu?.mastery?.desc || 'Cognitive Mastery Map' },
        { id: 'ai-planner', title: t?.menu?.planner?.title || 'AI Planner', icon: Sparkles, color: '#f59e0b', badge: 'Smart', desc: t?.menu?.planner?.desc || 'Auto-generate your weekly neural study roadmap.' },
        { id: 'summaryHub', title: t?.menu?.hub?.title || 'Summary Hub', icon: BookOpen, color: '#a855f7', badge: 'Peer', desc: t?.menu?.hub?.desc || 'Explore peer-authored document summaries.' },
        { id: 'social', title: t?.menu?.social?.title || 'Social Hub', icon: Users, color: '#3b82f6', badge: 'Network', desc: t?.menu?.social?.desc || 'Connect with students and share study materials.' },
        { id: 'trees', title: t?.menu?.trees?.title || 'Trees', icon: TreeDeciduous, color: '#10b981', badge: 'Biological', desc: t?.menu?.trees?.desc || 'Botanical focus registry' },
        { id: 'neuralSummary', title: t?.menu?.summaries?.title || 'Neural Synthesis', icon: BookOpen, color: '#3b82f6', badge: 'Analysis', desc: t?.menu?.summaries?.desc || 'Deep synthesis and structured analysis of your document fragments.' },
        { id: 'pomodoro', title: t?.menu?.focus?.title || 'Focus', icon: Zap, color: '#ef4444', badge: 'Deep', desc: t?.menu?.focus?.desc || 'Focus Core' }
    ];

    const filteredMenu = menuItems.filter(item => 
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.desc || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`min-h-screen relative z-10 w-full overflow-hidden transition-colors duration-1000 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {/* The Huge 3D Parallax Background */}
            <FloatingAssets theme={theme} />

            <div className="relative z-20 px-6 py-12 max-w-7xl mx-auto flex flex-col pt-12">
            {/* --- TOUR OVERLAY --- */}
            {showTour && (
                <div 
                    className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 transition-opacity duration-500"
                >
                    <div 
                        className={`max-w-xl w-full border p-12 rounded-[4rem] text-center shadow-[0_0_100px_rgba(59,130,246,0.2)] animate-in fade-in zoom-in duration-500 ${
                            theme === 'dark' ? 'bg-[#0D0D0D] border-blue-500/30 text-white' : 'bg-white border-blue-200 text-slate-900'
                        }`}
                    >
                        <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
                            <Sparkles className="text-blue-500" size={48} />
                        </div>
                        <h2 className={`text-4xl font-black italic uppercase tracking-tighter mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Neural Onboarding</h2>
                        <div className="space-y-6 text-left mb-10">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs shrink-0 text-white">1</div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}><span className={`font-black ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Upload:</span> Populate your library with PDFs or TXT files in the Library module.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs shrink-0 text-white">2</div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}><span className={`font-black ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Sync:</span> Generate interactive flashcards and quizzes using the AI core.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs shrink-0 text-white">3</div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}><span className={`font-black ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Focus:</span> Enter the Focus Engine to study with deep-work ambient environments.</p>
                            </div>
                        </div>
                        <button 
                            onClick={completeTour}
                            className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
                        >
                            Acknowledge Protocol
                        </button>
                    </div>
                </div>
            )}

            {/* --- DASHBOARD HEADER --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 mt-8">
                <div className="lg:col-span-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 mb-8"
                    >
                        <div className={`p-4 rounded-2xl border shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-colors ${
                            theme === 'dark' ? 'bg-blue-600/20 border-blue-500/40' : 'bg-blue-100 border-blue-300'
                        }`}>
                            <LayoutDashboard size={24} className="text-blue-500" />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-[0.5em] ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`}>Neural Core Interface v3.0</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-6xl lg:text-[100px] font-black italic tracking-tighter uppercase leading-[0.85] mb-12 drop-shadow-2xl transition-colors ${
                            theme === 'dark' ? 'text-white' : 'text-slate-950'
                        }`}
                    >
                        {t?.hello || 'Hello,'} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
                            {user?.user_metadata?.username || user?.email?.split('@')[0] || 'Unit_01'}
                        </span>
                    </motion.h1>

                    <div className="relative max-w-2xl group">
                        <Search className={`absolute ${language === 'ar' ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 transition-transform group-focus-within:scale-110 ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`} size={22} />
                        <input 
                            type="text"
                            placeholder={t?.search || 'Search...'}
                            className={`w-full py-7 ${language === 'ar' ? 'pr-16 pl-8' : 'pl-16 pr-8'} rounded-[2.5rem] border outline-none transition-all font-black text-sm uppercase tracking-widest ${
                                theme === 'dark' 
                                ? 'bg-[#0D0D0D] border-white/10 text-white focus:border-blue-500 shadow-2xl' 
                                : 'bg-white border-slate-200 text-slate-950 shadow-xl shadow-blue-500/10 focus:border-blue-600'
                            }`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="lg:col-span-4 hidden lg:flex justify-end items-center relative">
                    {/* Glowing Accent Ring replacing standard 3D asset */}
                    <div className="relative w-full aspect-square flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-spin-slow" />
                        <div className="absolute inset-4 rounded-full border border-purple-500/20 animate-reverse-spin" />
                        <div className="absolute inset-12 rounded-full border border-rose-500/20 animate-spin-slow" />
                        <div className={`absolute inset-0 rounded-full blur-[80px] transition-colors mix-blend-screen ${
                            theme === 'dark' ? 'bg-gradient-to-tr from-blue-600/40 to-purple-600/40' : 'bg-blue-400/20'
                        }`} />
                        <div className="z-10 text-center">
                            <Brain size={64} className="text-blue-400 mx-auto mb-4 drop-shadow-[0_0_30px_rgba(59,130,246,0.8)]" />
                            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Core Sync: 100%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STATS HUD --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                {[
                    { label: t.stats?.objects || 'Data Nodes', value: stats.docs, icon: FileText, color: '#3b82f6' },
                    { label: t.stats?.cards || 'Neural Cards', value: stats.cards, icon: Brain, color: '#a855f7' },
                    { label: t.stats?.stars || 'Stellar Merit', value: stats.stars, icon: Star, color: '#fbbf24' },
                    { label: t.stats?.streak || 'Daily Streak', value: stats.streak, icon: Target, color: '#ef4444' }
                ].map((stat, i) => (
                    <TiltCard
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-8 rounded-[3rem] transition-all relative overflow-hidden group border ${
                            theme === 'dark' 
                            ? 'glass-card hover:border-white/20 shadow-2xl' 
                            : 'bg-white border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-blue-300'
                        }`}
                    >
                        <div className="absolute -inset-20 bg-gradient-to-tr from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rotate-12 blur-2xl z-0" pointer-events-none="true" />
                        
                        <div className={`flex justify-between items-start mb-8 relative z-10 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <div className="p-4 rounded-[1.5rem] transition-all shadow-inner group-hover:scale-110" style={{ backgroundColor: `${stat.color}20`, color: stat.color, border: `1px solid ${stat.color}30` }}>
                                <stat.icon size={24} />
                            </div>
                            <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: stat.color, boxShadow: `0 0 10px ${stat.color}` }} />
                        </div>
                        <p className={`text-4xl font-black italic tracking-tighter mb-1 relative z-10 transition-colors ${
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>{stat.value}</p>
                        <p className={`text-[9px] font-black uppercase tracking-[0.4em] relative z-10 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-slate-400'
                        }`}>{stat.label}</p>
                    </TiltCard>
                ))}
            </div>

            {/* --- PROGRESS & ANALYTICS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`lg:col-span-7 p-12 lg:p-16 rounded-[4.5rem] border transition-all relative overflow-hidden ${
                        theme === 'dark' ? 'glass-card border-white/10' : 'bg-white/80 backdrop-blur-3xl border-slate-100 shadow-2xl shadow-blue-500/10'
                    }`}
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10" />
                    
                    <div className="flex justify-between items-start mb-14 relative z-10">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-3 block neon-text-blue">Neural Growth</span>
                            <h3 className={`text-5xl lg:text-6xl font-black italic uppercase tracking-tighter drop-shadow-md ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Level {stats.level} <br className="hidden md:block" /> <span className="opacity-30 text-3xl md:text-5xl">// {stats.xp} XP</span></h3>
                        </div>
                        <div className="w-20 h-20 bg-blue-600/20 rounded-[2rem] flex items-center justify-center border border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                            <TrendingUp className="text-blue-400" size={32} />
                        </div>
                    </div>
                    
                    <div className="relative z-10">
                        <div className={`w-full h-8 rounded-full overflow-hidden mb-6 p-1 border shadow-inner ${theme === 'dark' ? 'bg-[#020202]/80 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.xp % 100)}%` }}
                                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-400 to-purple-500 shadow-[0_0_30px_rgba(59,130,246,0.8)] relative"
                            >
                                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-glow" />
                            </motion.div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-3">
                            <Sparkles size={12} className="text-blue-500" />
                            {100 - (stats.xp % 100)} XP until synchronization with Level {stats.level + 1}
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-7 gap-3">
                        {heatmap.map((val, i) => (
                            <div key={i} className="space-y-2">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="aspect-square rounded-lg transition-all hover:scale-110 cursor-help"
                                    style={{ 
                                        backgroundColor: val === 0 ? (theme === 'dark' ? '#1A1A1A' : '#F1F5F9') : 
                                                        val === 1 ? '#1E3A8A' : 
                                                        val === 2 ? '#1D4ED8' : 
                                                        val === 3 ? '#2563EB' : '#3B82F6',
                                        opacity: val === 0 ? 0.3 : 1
                                    }}
                                    title={`${val} sessions`}
                                />
                                <span className="text-[7px] font-black opacity-20 uppercase block text-center">D{i+1}</span>
                            </div>
                        ))}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-20 mt-4 block">Productivity Heatmap // Last 14 Cycles</span>
                </motion.div>

                <TiltCard 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`lg:col-span-5 p-12 rounded-[4.5rem] border transition-all flex flex-col justify-center items-center text-center relative overflow-hidden group ${
                        theme === 'dark' ? 'glass-card border-blue-500/20' : 'bg-white/80 backdrop-blur-3xl border-white shadow-2xl'
                    }`}
                >
                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" pointer-events-none="true" />
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] flex items-center justify-center mb-10 shadow-[0_20px_60px_-10px_rgba(37,99,235,0.8)] rotate-12 transition-transform duration-700 group-hover:rotate-0 relative border border-white/20 z-10">
                        <Award size={56} className="text-white -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-white/20 rounded-[3rem] animate-ping opacity-20" />
                    </div>
                    <h3 className={`text-4xl font-black italic uppercase tracking-tighter mb-4 drop-shadow-md relative z-10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Rank: Neural Explorer</h3>
                    <p className={`text-[11px] font-bold uppercase tracking-[0.3em] opacity-40 mb-10 max-w-[220px] relative z-10 leading-loose ${theme === 'dark' ? 'text-white' : 'text-slate-600'}`}>Top 15% of all synchronized study units this cycle.</p>
                    <button 
                        onClick={() => onNavigate('leaderboard')}
                        className={`px-12 py-5 rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:scale-105 transition-transform relative z-10 shadow-2xl ${
                            theme === 'dark' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white shadow-blue-600/20'
                        }`}
                    >
                        View Leaderboard
                    </button>
                </TiltCard>
            </div>

            {/* --- ACTIVE ROADMAP SECTION --- */}
            <div className="mb-32 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="flex justify-between items-end mb-12 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                            <Target size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className={`text-4xl font-black italic uppercase tracking-tighter drop-shadow-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Active Roadmap</h2>
                            <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 mt-2 ${theme === 'dark' ? 'text-white' : 'text-slate-500'}`}>1st Bakalorua // Core Modules</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                    {studyProfile ? (
                        <TiltCard
                            className={`p-12 lg:p-14 rounded-[4.5rem] border transition-all relative overflow-hidden group min-h-[400px] flex flex-col justify-center ${
                                theme === 'dark' ? 'glass-card border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.1)]' : 'bg-white border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:border-purple-400'
                            }`}
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            
                            <div className="flex items-start justify-between mb-10 relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                                        <span className="px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20">{studyProfile.system.replace('_', ' ')}</span>
                                    </div>
                                    <h3 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-none">{studyProfile.age} Years <br/> <span className="text-xl opacity-30 mt-1 block font-black uppercase tracking-widest">Active Roadmap</span></h3>
                                </div>
                                <div className="w-20 h-20 rounded-[2rem] bg-purple-600/20 flex flex-col items-center justify-center border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform duration-700">
                                    <span className="text-3xl font-black text-purple-400">{studyProfile.subjects?.length || 0}</span>
                                    <span className="text-[8px] font-black uppercase opacity-60">Nodes</span>
                                </div>
                            </div>
                            
                            <div className="space-y-6 relative z-10 mt-auto">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                                    <span>Sync Status: Optimal</span>
                                </div>
                                <div className="flex gap-4">
                                    {studyProfile.subjects?.slice(0, 4).map((s: any, i: number) => (
                                        <div key={i} className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black uppercase transition-all hover:bg-purple-600/20 hover:border-purple-500/40 cursor-default group/node relative overflow-hidden">
                                            <span className="relative z-10 opacity-40 group-hover/node:opacity-100">{s.name.substring(0, 2)}</span>
                                        </div>
                                    ))}
                                    {studyProfile.subjects?.length > 4 && (
                                        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-500 shadow-xl">
                                            +{studyProfile.subjects.length - 4}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-1000 group-hover:scale-110 rotate-12">
                                <Map size={350} />
                            </div>
                        </TiltCard>
                    ) : (
                        <TiltCard
                            className={`p-12 rounded-[4.5rem] border transition-all flex flex-col justify-center items-center text-center relative overflow-hidden group border-dashed min-h-[400px] ${
                                theme === 'dark' ? 'glass-card border-white/10' : 'bg-slate-50 border-slate-200 shadow-lg'
                            }`}
                            onClick={() => onNavigate('studyPath')}
                        >
                            <div className="w-24 h-24 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-500/20 mb-8 border-dashed group-hover:bg-blue-600/20 transition-all group-hover:scale-110 duration-700 shadow-xl">
                                <Map size={40} className="text-blue-500" />
                            </div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">No Active Roadmap</h3>
                            <p className="text-xs font-bold opacity-40 uppercase tracking-[0.2em] max-w-xs leading-loose">Initialize academic protocol to begin tracking.</p>
                        </TiltCard>
                    )}
                    <TiltCard
                        className={`p-12 rounded-[4.5rem] border transition-all flex flex-col justify-center items-center text-center relative overflow-hidden group min-h-[400px] ${
                            theme === 'dark' ? 'glass-card border-white/5 shadow-xl' : 'bg-white border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:border-blue-400'
                        }`}
                        onClick={() => onNavigate('studyPath')}
                    >
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-8 border-dashed group-hover:bg-white/10 transition-all group-hover:rotate-90 duration-1000 shadow-lg">
                            <Plus size={36} className="opacity-30 group-hover:opacity-100 transition-opacity text-blue-500" />
                        </div>
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Initialize New Module</h3>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-[0.2em] max-w-xs leading-loose">Select from roadmap database to expand grid.</p>
                    </TiltCard>
                </div>
            </div>

            {/* --- QUICK ACTION CARD --- */}
            <TiltCard 
                className={`p-14 mb-32 rounded-[5rem] border ${
                    theme === 'dark' ? 'glass-card border-blue-500/20 shadow-[0_0_60px_rgba(37,99,235,0.15)]' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)]'
                } flex flex-col lg:flex-row justify-between items-center gap-12 hover:border-blue-400/50 transition-all relative overflow-hidden group`}
            >
                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" pointer-events-none="true" />
                
                <div className="relative z-10 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                        <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.4em] border border-white/10">Ultra-Focus</div>
                    </div>
                    <h2 className="text-5xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none">{t?.neuralFocus || 'Neural Focus Mode'}</h2>
                    <p className={`text-sm mt-4 font-bold tracking-[0.2em] uppercase opacity-60 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-100'}`}>{t?.startSession || 'Initialize deep work session'}</p>
                </div>
                
                <button 
                    onClick={() => onNavigate('pomodoro')}
                    className={`shrink-0 px-12 py-6 rounded-full font-black uppercase tracking-[0.4em] text-[10px] flex items-center gap-4 transition-all hover:scale-105 shadow-2xl ${
                        theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30' : 'bg-white text-blue-600 hover:bg-blue-50'
                    } relative z-10`}
                >
                    Initialize <ChevronRight size={20} />
                </button>

                <div className="absolute -left-10 top-0 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-1000 rotate-45 pointer-events-none">
                    <Zap size={350} />
                </div>
            </TiltCard>

            {/* --- NEURAL MODULES GRID --- */}
            <div>
                <div className="flex justify-between items-end mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                            <LayoutGrid size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className={`text-4xl font-black italic uppercase tracking-tighter drop-shadow-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Neural Modules</h2>
                            <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 mt-2 ${theme === 'dark' ? 'text-white' : 'text-slate-500'}`}>Access all core functionalities</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 relative z-10">
                    {filteredMenu.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <TiltCard 
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => onNavigate(item.id)}
                                className={`p-10 rounded-[4rem] border transition-all group overflow-hidden relative cursor-pointer min-h-[350px] flex flex-col justify-center ${
                                    theme === 'dark' 
                                    ? 'glass-card border-white/5 hover:border-blue-500/30 shadow-[0_0_40px_rgba(0,0,0,0.3)]' 
                                    : 'bg-white border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-blue-300'
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                                
                                <div className={`flex justify-between items-start mb-10 relative z-10 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`p-6 rounded-[1.8rem] transition-all duration-700 shadow-xl group-hover:scale-110`} style={{ backgroundColor: `${item.color}15`, color: item.color, border: `1px solid ${item.color}25` }}>
                                        <Icon size={36} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="px-4 py-1.5 rounded-full border border-white/5 bg-white/5 text-[8px] font-black uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">
                                            {item.badge}
                                        </div>
                                        <div className="w-10 h-10 rounded-[1.2rem] border flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700" style={{ borderColor: `${item.color}30`, color: item.color, backgroundColor: `${item.color}10` }}>
                                            <ArrowRight size={18} className={language === 'ar' ? 'rotate-180' : ''} />
                                        </div>
                                    </div>
                                </div>
                                
                                <h3 className={`text-3xl lg:text-4xl font-black italic tracking-tighter mb-4 uppercase relative z-10 drop-shadow-xl transition-colors group-hover:text-blue-400 ${language === 'ar' ? 'text-right' : ''} ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    {item.title}
                                </h3>
                                <p className={`text-xs font-bold opacity-40 uppercase tracking-[0.15em] leading-relaxed max-w-xs relative z-10 ${language === 'ar' ? 'text-right ml-auto' : ''} ${theme === 'dark' ? 'text-white' : 'text-slate-600'}`}>
                                    {item.desc}
                                </p>

                                {/* Node ID and Meta */}
                                <div className={`mt-10 pt-6 border-t flex justify-between items-center relative z-10 opacity-10 group-hover:opacity-40 transition-opacity ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                                    <span className={`text-[7px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Node // 0x{i.toString(16).toUpperCase()}</span>
                                    <span className={`text-[7px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Establishing Link</span>
                                </div>

                                {/* High-tech background geometry */}
                                <div className="absolute -bottom-10 -right-10 opacity-[0.01] group-hover:opacity-[0.05] transition-all duration-1000 rotate-12 group-hover:scale-150 pointer-events-none" style={{ color: item.color }}>
                                    <Icon size={300} />
                                </div>
                                
                                <div className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-1000 group-hover:w-full" style={{ backgroundColor: item.color }} />
                            </TiltCard>
                        );
                    })}
                </div>
            </div>
            {/* Footer Status */}
            <div className={`mt-32 pt-16 border-t flex flex-col md:flex-row justify-between items-center gap-8 ${
                theme === 'dark' ? 'border-white/5' : 'border-slate-200'
            }`}>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className={`text-[9px] font-black uppercase tracking-widest opacity-50 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                            {language === 'ar' ? 'المحرك متصل' : 'Core Engine Online'}
                        </span>
                    </div>
                    <div className={`w-px h-3 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-300'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest opacity-50 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                        {language === 'ar' ? 'زمن الاستجابة: 12ملي ثانية' : 'Latency: 12ms'}
                    </span>
                </div>
                <p className={`text-[9px] font-black opacity-30 uppercase tracking-[0.5em] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Neural Study Neural Interface // v2.0.42</p>
            </div>
            </div>
        </div>
    );
};

export default Dashboard;
