import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, LogOut, Sun, Moon, Languages, 
    User, Settings as SettingsIcon, Brain, 
    Star, LayoutDashboard, MessageSquare, 
    Zap, Activity, Shield, ShoppingBag, Sparkles, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
    onNavigate: (page: string, id?: string) => void;
    currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
    const { user, profile, signOut, isAdmin } = useAuth();
    const { theme, toggleTheme, language, toggleLanguage } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = () => {
        setIsVisible(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 5000);
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            resetTimer();
        };
        const handleMouseMove = () => resetTimer();

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);
        
        resetTimer();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleLogout = async () => {
        await signOut();
        onNavigate('home');
    };

    const translations = {
        en: {
            dashboard: 'Command',
            documents: 'Library',
            chat: 'Neural',
            quizzes: 'Quiz',
            marketplace: 'Market',
            summaryHub: 'Hub',
            social: 'Social',
            admin: 'Admin',
            level: 'Level',
            core: 'CORE',
            neural: 'NEURAL'
        },
        ar: {
            dashboard: 'القيادة',
            documents: 'المكتبة',
            chat: 'الدردشة',
            quizzes: 'الاختبارات',
            marketplace: 'المتجر',
            summaryHub: 'المركز',
            social: 'اجتماعي',
            admin: 'الإدارة',
            level: 'المستوى',
            core: 'الأساسي',
            neural: 'عصبي'
        }
    };

    const t = translations[language];

    const navItems = [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'documents', label: t.documents, icon: BookOpen },
        { id: 'chat', label: t.chat, icon: MessageSquare },
        { id: 'quizzes', label: t.quizzes, icon: Brain },
        { id: 'marketplace', label: t.marketplace, icon: ShoppingBag },
        { id: 'summaryHub', label: t.summaryHub, icon: Sparkles },
        { id: 'social', label: t.social, icon: Users },
        ...(isAdmin ? [{ id: 'admin', label: t.admin, icon: Shield }] : []),
    ];

    return (
        <div className="fixed top-0 left-0 right-0 z-[1000] flex justify-center px-8 pointer-events-none">
            <motion.nav
                initial={{ y: -120, opacity: 0 }}
                animate={{ 
                    y: isVisible ? 24 : -120, 
                    opacity: isVisible ? 1 : 0,
                    scale: isVisible ? 1 : 0.95
                }}
                transition={{ 
                    type: 'spring', 
                    damping: 25, 
                    stiffness: 120,
                    opacity: { duration: 0.4 }
                }}
                className={`pointer-events-auto flex items-center gap-4 px-10 h-20 rounded-[2.5rem] border backdrop-blur-3xl transition-all duration-1000 ${
                    scrolled 
                        ? (theme === 'dark' ? 'bg-black/80 border-blue-500/40 shadow-[0_0_80px_rgba(37,99,235,0.3)]' : 'bg-white/90 border-blue-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)]') 
                        : (theme === 'dark' ? 'bg-black/50 border-white/10 shadow-3xl' : 'bg-white/50 border-slate-200 shadow-xl')
                } w-full ${scrolled ? 'max-w-[98%]' : 'max-w-[95%]'}`}
            >
                {/* Logo & Identity */}
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate('dashboard')}
                    className={`flex items-center gap-3 cursor-pointer group pr-6 border-r shrink-0 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} ${language === 'ar' ? 'border-r-0 border-l pl-6 pr-0' : ''}`}
                >
                    <div className="relative">
                        <div className={`absolute inset-0 rounded-xl blur-lg animate-pulse ${theme === 'dark' ? 'bg-blue-500/50' : 'bg-blue-400/30'}`} />
                        <div className="relative w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-2xl group-hover:rotate-[360deg] transition-all duration-1000 border border-white/20">
                            <Zap className="text-white" size={18} fill="white" />
                        </div>
                    </div>
                    <div className="hidden 2xl:block">
                        <span className={`text-base font-black italic tracking-tighter uppercase block leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {t.neural} <span className="text-blue-500">{t.core}</span>
                        </span>
                    </div>
                </motion.div>

                {/* Main Navigation - High Density */}
                <div className="flex-1 flex justify-center items-center gap-1.5 overflow-x-auto scrollbar-hide py-2">
                    {navItems.map((item) => {
                        const isActive = currentPage === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                whileHover={{ y: -2, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onNavigate(item.id)}
                                className={`px-4 py-2 rounded-xl flex items-center gap-2.5 transition-all group whitespace-nowrap ${
                                    isActive 
                                    ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/50' 
                                    : (theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50')
                                }`}
                            >
                                <item.icon size={14} className={isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                                <span className="text-[9px] font-black uppercase tracking-[0.15em]">{item.label}</span>
                            </motion.button>
                        );
                    })}
                </div>

                {/* User Telemetry & Status */}
                <div className={`flex items-center gap-4 pl-6 border-l shrink-0 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} ${language === 'ar' ? 'border-l-0 border-r pl-0 pr-6' : ''}`}>
                    {/* Level & XP Bar */}
                    <div className="hidden md:flex flex-col items-end gap-1.5 min-w-[100px]">
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{t.level} {profile?.level || 1}</span>
                            <div className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-slate-300'}`} />
                            <span className={`text-[8px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{profile?.xp || 0} XP</span>
                        </div>
                        <div className={`w-full h-1 rounded-full overflow-hidden border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(profile?.xp || 0) % 100}%` }}
                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            />
                        </div>
                    </div>

                    {/* Streak */}
                    <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 border rounded-lg ${theme === 'dark' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                        <Activity size={12} />
                        <span className="text-[10px] font-black italic tabular-nums">{profile?.daily_streak || 0}</span>
                    </div>

                    {/* Stars */}
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl cursor-default group ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}
                    >
                        <Star className="text-amber-500 fill-amber-500 animate-pulse" size={14} />
                        <span className={`text-sm font-black italic tracking-tighter tabular-nums leading-none ${theme === 'dark' ? 'text-amber-500' : 'text-amber-600'}`}>
                            {profile?.stars_count ?? 0}
                        </span>
                    </motion.div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={toggleLanguage} 
                            className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                            title={language === 'en' ? 'Arabic' : 'English'}
                        >
                            <Languages size={18} />
                        </button>

                        <button 
                            onClick={toggleTheme} 
                            className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        
                        {user && (
                            <div className="flex items-center gap-2 ml-1">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => onNavigate('profile')}
                                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all shadow-xl p-0.5 ${theme === 'dark' ? 'border-white/20 bg-black/60 hover:border-blue-500' : 'border-slate-200 bg-white hover:border-blue-400'}`}
                                >
                                    <div className="w-full h-full rounded-lg overflow-hidden">
                                        {user.user_metadata?.avatar_url || profile?.avatar_url ? (
                                            <img src={user.user_metadata?.avatar_url || profile?.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter">
                                                {user.email?.[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </motion.button>
                                
                                <button 
                                    onClick={handleLogout}
                                    className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'text-white/20 hover:text-red-500' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.nav>
        </div>
    );
};

export default Navbar;
