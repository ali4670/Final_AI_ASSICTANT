import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, LogOut, Sun, Moon, Languages, User, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
    onNavigate: (page: string, id?: string) => void;
    onVisibilityChange?: (visible: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, onVisibilityChange }) => {
    const { user, signOut, isAdmin } = useAuth();
    const { theme, language, toggleTheme, toggleLanguage } = useTheme();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        onVisibilityChange?.(isVisible);
    }, [isVisible, onVisibilityChange]);

    useEffect(() => {
        let timeout: any;
        const handleMouseMove = (e: MouseEvent) => {
            if (e.clientY < 80) {
                setIsVisible(true);
            }
            
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (e.clientY >= 80) {
                    setIsVisible(false);
                }
            }, 3000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleLogout = async () => {
        await signOut();
        onNavigate('home');
    };

    return (
        <motion.nav
            initial={{ y: 0 }}
            animate={{ y: isVisible ? 0 : -100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 right-0 z-[500] border-b backdrop-blur-xl transition-all duration-500 ${
                theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-white/80 border-blue-100 shadow-sm'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    onClick={() => onNavigate('home')}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
                        <BookOpen className="text-white" size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-lg font-black italic tracking-tighter uppercase leading-none ${
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>
                            AI <span className="text-blue-600">STUDY</span>
                        </span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Assistant v2</span>
                    </div>
                </motion.div>

                <div className="hidden lg:flex items-center gap-2 mx-8">
                    {[
                        { id: 'dashboard', label: 'Dashboard' },
                        { id: 'calendar', label: 'Timeline' },
                        { id: 'documents', label: 'Library' },
                        { id: 'chat', label: 'Chat' },
                        { id: 'flashcards', label: 'Cards' },
                        { id: 'quizzes', label: 'Quiz' },
                        { id: 'studyTimeline', label: 'Journal page' },
                        { id: 'pomodoro', label: 'Focus' },
                        ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
                    ].map((item) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onNavigate(item.id)}
                            className={`px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${
                                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-blue-600'
                            }`}
                        >
                            {item.label}
                        </motion.button>
                    ))}
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    {/* Theme Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-center relative group ${
                            theme === 'dark' ? 'border-white/10 text-gray-400 hover:text-white' : 'border-blue-100 text-slate-500 hover:text-blue-600'
                        }`}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </motion.button>

                    {/* Language Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleLanguage}
                        className={`p-3 rounded-xl border transition-all flex items-center gap-2 group relative ${
                            theme === 'dark' ? 'border-white/10 text-gray-400 hover:text-white' : 'border-blue-100 text-slate-500 hover:text-blue-600'
                        }`}
                    >
                        <Languages size={20} />
                        <span className="text-xs font-black uppercase tracking-widest hidden md:block">
                            {language === 'en' ? 'Arabic' : 'English'}
                        </span>
                    </motion.button>

                    {/* Profile & Settings */}
                    {user && (
                        <div className="flex items-center gap-4 border-l pl-6 transition-colors border-white/10 dark:border-white/10 border-blue-100">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => onNavigate('settings')}
                                className="flex items-center gap-3 group"
                            >
                                <div className="hidden lg:flex flex-col items-end">
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Unit Active</span>
                                    <span className={`text-xs font-bold transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
                                        {user.user_metadata?.username || user.email?.split('@')[0]}
                                    </span>
                                </div>
                                <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                                    theme === 'dark' ? 'border-white/10 group-hover:border-blue-500' : 'border-blue-100 group-hover:border-blue-600'
                                }`}>
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-600/10 text-blue-600">
                                            <User size={20} />
                                        </div>
                                    )}
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(239,68,68,0.1)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleLogout}
                                className="p-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                title="Terminate Session"
                            >
                                <LogOut size={20} />
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
