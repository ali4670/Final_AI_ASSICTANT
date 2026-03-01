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
  TreeDeciduous
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import WalkingStudent from './3D/WalkingStudent';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { translations } from '../utils/translations';

interface DashboardProps {
    onNavigate: (page: string, id?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const themeContext = useTheme();
    const theme = themeContext?.theme || 'dark';
    const language = themeContext?.language || 'en';
    
    // Extremely safe translation access
    const langData = translations[language] || translations['en'];
    const t = langData?.dashboard || translations['en'].dashboard;
    const [searchQuery, setSearchQuery] = useState('');
    const [showTour, setShowTour] = useState(false);
    const [studyProfile, setStudyProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        docs: 0,
        cards: 0,
        sessions: 0,
        streak: 0
    });

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('tour_completed');
        if (!hasSeenTour) setShowTour(true);
    }, []);

    const completeTour = () => {
        setShowTour(false);
        localStorage.setItem('tour_completed', 'true');
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user || !supabase) return;
            try {
                // Fetch Stats
                const { count: docsCount } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
                const { count: cardsCount } = await supabase.from('flashcards').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
                
                setStats({
                    docs: docsCount || 0,
                    cards: cardsCount || 0,
                    sessions: 12, 
                    streak: 5
                });

                // Fetch Study Profile (Roadmap)
                const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
                const res = await fetch(`${baseUrl}/api/get-study/${user.id}`);
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
        { id: 'documents', title: t?.menu?.library?.title || 'Library', icon: BookOpen, color: '#3b82f6', badge: 'Storage', desc: t?.menu?.library?.desc || 'Manage your documents' },
        { id: 'chat', title: t?.menu?.chat?.title || 'Chat', icon: MessageSquare, color: '#6366f1', badge: 'AI Link', desc: t?.menu?.chat?.desc || 'Neural Sync Dialogue' },
        { id: 'journal', title: t?.menu?.journal?.title || 'Journal', icon: ListTodo, color: '#f59e0b', badge: 'Daily', desc: t?.menu?.journal?.desc || 'Neural Task Tracking' },
        { id: 'flashcards', title: t?.menu?.cards?.title || 'Cards', icon: Brain, color: '#a855f7', badge: 'Memory', desc: t?.menu?.cards?.desc || 'Recall Nodes' },
        { id: 'quizzes', title: t?.menu?.quiz?.title || 'Quiz', icon: Trophy, color: '#ec4899', badge: 'Test', desc: t?.menu?.quiz?.desc || 'Evaluation Protocols' },
        { id: 'leaderboard', title: t?.menu?.leaderboard?.title || 'Ranks', icon: Star, color: '#fbbf24', badge: 'Rank', desc: t?.menu?.leaderboard?.desc || 'Hall of Fame' },
        { id: 'studyTimeline', title: t?.menu?.roadmap?.title || 'Roadmap', icon: Clock, color: '#10b981', badge: 'Plan', desc: t?.menu?.roadmap?.desc || 'Temporal Map' },
        { id: 'resume', title: t?.menu?.resume?.title || 'CV', icon: FileText, color: '#3b82f6', badge: 'Career', desc: t?.menu?.resume?.desc || 'Resume Builder' },
        { id: 'knowledgeGraph', title: t?.menu?.graph?.title || 'Web', icon: Share2, color: '#6366f1', badge: '3D Web', desc: t?.menu?.graph?.desc || 'Knowledge Graph' },
        { id: 'masteryMap', title: t?.menu?.mastery?.title || 'Map', icon: Brain, color: '#8b5cf6', badge: 'Cognitive', desc: t?.menu?.mastery?.desc || 'Cognitive Mastery Map' },
        { id: 'trees', title: t?.menu?.trees?.title || 'Trees', icon: TreeDeciduous, color: '#10b981', badge: 'Biological', desc: t?.menu?.trees?.desc || 'Botanical focus registry' },
        { id: 'neuralSummary', title: 'Neural Synthesis', icon: BookOpen, color: '#3b82f6', badge: 'Analysis', desc: 'Deep synthesis and structured analysis of your document fragments.' },
        { id: 'pomodoro', title: t?.menu?.focus?.title || 'Focus', icon: Zap, color: '#ef4444', badge: 'Deep', desc: t?.menu?.focus?.desc || 'Focus Core' }
    ];

    const filteredMenu = menuItems.filter(item => 
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.desc || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`min-h-screen relative z-10 px-6 py-12 max-w-7xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
            {/* --- TOUR OVERLAY --- */}
            <AnimatePresence>
                {showTour && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="max-w-xl w-full bg-[#0D0D0D] border border-blue-500/30 p-12 rounded-[4rem] text-center shadow-[0_0_100px_rgba(59,130,246,0.2)]"
                        >
                            <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
                                <Sparkles className="text-blue-500" size={48} />
                            </div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">Neural Onboarding</h2>
                            <div className="space-y-6 text-left mb-10">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs shrink-0 text-white">1</div>
                                    <p className="text-sm text-gray-300"><span className="text-white font-black">Upload:</span> Populate your library with PDFs or TXT files in the Library module.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs shrink-0 text-white">2</div>
                                    <p className="text-sm text-gray-300"><span className="text-white font-black">Sync:</span> Generate interactive flashcards and quizzes using the AI core.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs shrink-0 text-white">3</div>
                                    <p className="text-sm text-gray-300"><span className="text-white font-black">Focus:</span> Enter the Focus Engine to study with deep-work ambient environments.</p>
                                </div>
                            </div>
                            <button 
                                onClick={completeTour}
                                className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
                            >
                                Acknowledge Protocol
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- DASHBOARD HEADER --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 mt-8">
                <div className="lg:col-span-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className={`p-2 rounded-lg border shadow-lg transition-colors ${
                            theme === 'dark' ? 'bg-blue-600/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'
                        }`}>
                            <LayoutDashboard size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`}>Neural Dashboard v2.0</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.8] mb-10 transition-colors ${
                            theme === 'dark' ? 'text-white' : 'text-slate-950'
                        }`}
                    >
                        {t.hello} <br />
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
                            placeholder={t.search}
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

                <div className="lg:col-span-4 hidden lg:flex justify-center items-center relative h-[400px]">
                    <div className={`absolute inset-0 rounded-full blur-[100px] transition-colors ${
                        theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-400/20'
                    }`} />
                    <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 1, 5], fov: 45 }} gl={{ alpha: true }}>
                        <ambientLight intensity={theme === 'dark' ? 0.5 : 1.5} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={theme === 'dark' ? 1 : 0.5} castShadow />
                        <WalkingStudent />
                    </Canvas>
                </div>
            </div>

            {/* --- STATS HUD --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                {[
                    { label: t.stats.objects, value: stats.docs, icon: FileText, color: '#3b82f6' },
                    { label: t.stats.cards, value: stats.cards, icon: Brain, color: '#a855f7' },
                    { label: t.stats.sync, value: stats.sessions, icon: Zap, color: '#f59e0b' },
                    { label: t.stats.streak, value: stats.streak, icon: Target, color: '#ef4444' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-10 rounded-[3.5rem] border transition-all relative overflow-hidden group ${
                            theme === 'dark' 
                            ? 'bg-[#0D0D0D] border-white/5 shadow-2xl hover:border-white/20' 
                            : 'bg-white border-slate-100 shadow-xl shadow-blue-500/5 hover:border-blue-200'
                        }`}
                    >
                        <div className={`flex justify-between items-start mb-6 relative z-10 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <div className="p-3 rounded-2xl transition-all" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                            <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: stat.color }} />
                        </div>
                        <p className={`text-5xl font-black italic tracking-tighter mb-1 relative z-10 transition-colors ${
                            theme === 'dark' ? 'text-white' : 'text-slate-950'
                        }`}>{stat.value}</p>
                        <p className={`text-[9px] font-black uppercase tracking-[0.4em] relative z-10 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-slate-400'
                        }`}>{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* --- ACTIVE ROADMAP SECTION --- */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-20"
            >
                <div className="flex items-center justify-between mb-8 px-6">
                    <div className="flex items-center gap-3">
                        <Map className="text-blue-500" size={20} />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Active Academic Roadmap</h2>
                    </div>
                    {studyProfile && (
                        <button 
                            onClick={() => onNavigate('studyTimeline')}
                            className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-2"
                        >
                            Configure Roadmap <ChevronRight size={14} />
                        </button>
                    )}
                </div>

                {studyProfile ? (
                    <div 
                        onClick={() => onNavigate('studyTimeline')}
                        className={`p-12 rounded-[4.5rem] border cursor-pointer transition-all relative overflow-hidden group ${
                            theme === 'dark' 
                            ? 'bg-[#0D0D0D] border-white/5 hover:border-blue-500/30' 
                            : 'bg-white border-slate-100 shadow-xl hover:shadow-2xl'
                        }`}
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full">
                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                                            {studyProfile.system.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">Active Profile</span>
                                </div>
                                <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                                    {studyProfile.age} Years // <span className="text-blue-600">Unit Roadmap</span>
                                </h3>
                                <p className="text-base font-bold opacity-50 max-w-xl">
                                    Your academic fragments are synchronized. You are currently tracking {studyProfile.subjects?.length || 0} modules in the neural grid.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                {studyProfile.subjects?.slice(0, 3).map((s: any, i: number) => (
                                    <div key={i} className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black uppercase opacity-40">
                                        {s.name.substring(0, 2)}
                                    </div>
                                ))}
                                {studyProfile.subjects?.length > 3 && (
                                    <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-500">
                                        +{studyProfile.subjects.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Background Effect */}
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-1000 group-hover:scale-110">
                            <Map size={300} />
                        </div>
                    </div>
                ) : (
                    <div 
                        onClick={() => onNavigate('studyPath')}
                        className={`p-12 rounded-[4.5rem] border border-dashed cursor-pointer transition-all relative overflow-hidden flex flex-col items-center justify-center text-center group ${
                            theme === 'dark' 
                            ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/50' 
                            : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-600/50'
                        }`}
                    >
                        <div className="w-20 h-20 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <Map className="text-blue-500" size={40} />
                        </div>
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">No Active Roadmap</h3>
                        <p className="text-sm font-bold opacity-40 uppercase tracking-widest max-w-sm">Initialize your academic protocol to start tracking your study modules and progress.</p>
                        <div className="mt-8 flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.4em] text-blue-500">
                            Begin Setup <ChevronRight size={16} />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* --- MODULE GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredMenu.map((item, i) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -15, scale: 1.02 }}
                            onClick={() => onNavigate(item.id)}
                            className={`group cursor-pointer p-12 rounded-[4.5rem] border transition-all duration-700 relative overflow-hidden flex flex-col h-full ${
                                theme === 'dark' 
                                ? 'bg-[#0D0D0D] border-white/5 hover:border-blue-500/40 shadow-2xl' 
                                : 'bg-white border-slate-100 hover:shadow-2xl shadow-blue-500/5 hover:border-blue-600/30'
                            }`}
                        >
                            <div className={`flex justify-between items-start mb-12 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                <div 
                                    className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 shadow-2xl"
                                    style={{ 
                                        backgroundColor: theme === 'dark' ? `${item.color}20` : `${item.color}10`,
                                        color: item.color,
                                        boxShadow: `0 10px 30px ${item.color}15`
                                    }}
                                >
                                    <item.icon size={44} strokeWidth={2.5} />
                                </div>
                                <div className={language === 'ar' ? 'text-left' : 'text-right'}>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: item.color }}>{item.badge}</span>
                                    <div className={`h-px w-10 mt-2 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`} style={{ backgroundColor: `${item.color}40` }} />
                                </div>
                            </div>

                            <h3 className={`text-4xl font-black italic tracking-tighter uppercase mb-4 transition-colors ${
                                theme === 'dark' ? 'text-white group-hover:text-white' : 'text-slate-950'
                            }`}>
                                {item.title}
                            </h3>
                            <p className={`text-base font-bold leading-relaxed mb-16 transition-colors flex-grow ${
                                theme === 'dark' ? 'text-gray-400 group-hover:text-gray-300' : 'text-slate-600'
                            }`}>
                                {item.desc}
                            </p>

                            <div className={`flex items-center gap-4 font-black uppercase text-xs tracking-[0.4em] transition-all group-hover:gap-6 ${language === 'ar' ? 'flex-row-reverse' : ''}`} style={{ color: item.color }}>
                                {language === 'ar' ? 'فتح الوحدة' : 'Open Unit'} <ChevronRight size={20} strokeWidth={4} className={language === 'ar' ? 'rotate-180' : ''} />
                            </div>

                            {/* Background decoration */}
                            <div 
                                className={`absolute -bottom-12 ${language === 'ar' ? '-left-12' : '-right-12'} opacity-[0.04] transition-all duration-1000 group-hover:opacity-[0.1] group-hover:rotate-12 group-hover:scale-110`}
                                style={{ color: item.color }}
                            >
                                <item.icon size={280} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Quick Action Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate('documents')}
                    className={`p-12 rounded-[4.5rem] border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer group transition-all h-full ${
                        theme === 'dark' 
                        ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/50 shadow-2xl' 
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-600/50 hover:shadow-2xl'
                    }`}
                >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white mb-10 group-hover:rotate-180 transition-all duration-700 ${
                        theme === 'dark' ? 'bg-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.3)]' : 'bg-blue-600 shadow-2xl shadow-blue-600/40'
                    }`}>
                        <Plus size={48} strokeWidth={3} />
                    </div>
                    <h3 className={`text-2xl font-black italic tracking-tighter uppercase mb-3 ${
                        theme === 'dark' ? 'text-white' : 'text-slate-950'
                    }`}>
                        {language === 'ar' ? 'وحدة جديدة' : 'New Unit'}
                    </h3>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.4em] opacity-50 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                    }`}>
                        {language === 'ar' ? 'توسيع شبكة البيانات' : 'Expand Data Grid'}
                    </p>
                </motion.div>
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
                <p className={`text-[9px] font-black opacity-30 uppercase tracking-[0.5em] ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Neural Study Neural Interface // v2.0.42</p>
            </div>
        </div>
    );
};

export default Dashboard;
