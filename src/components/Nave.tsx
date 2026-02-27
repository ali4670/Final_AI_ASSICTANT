import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, LogOut, Sun, Moon, Languages, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
    onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
    const { user, signOut } = useAuth();
    const { theme, language, toggleTheme, toggleLanguage } = useTheme();

    return (
        <nav className="sticky top-0 z-[100] border-b border-white/5 bg-[#050505]/80 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 group cursor-pointer"
                    onClick={() => onNavigate('home')}
                >
                    <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-300">
                        <BookOpen className="w-6 h-6 text-white"/>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">
                            AI <span className="text-blue-500">STUDY</span>
                        </span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Assistant v2</span>
                    </div>
                </motion.div>

                <div className="flex items-center gap-3 md:gap-6">
                    {/* Theme Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className="p-3 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center relative group"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">
                            Mode: {theme}
                        </span>
                    </motion.button>

                    {/* Language Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleLanguage}
                        className="p-3 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-2 group relative"
                    >
                        <Languages size={20} />
                        <span className="text-xs font-black uppercase tracking-widest hidden md:block">
                            {language === 'en' ? 'Arabic' : 'English'}
                        </span>
                        <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">
                            Switch to {language === 'en' ? 'Arabic' : 'English'}
                        </span>
                    </motion.button>

                    <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />

                    {user && (
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Active Student</span>
                                <span className="text-xs font-bold text-gray-300">{user.email}</span>
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={signOut}
                                className="flex items-center gap-2 px-5 py-3 border border-red-500/20 text-red-500 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
                            >
                                <LogOut className="w-4 h-4"/>
                                <span className="hidden sm:inline text-red-400">Abort Session</span>
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
