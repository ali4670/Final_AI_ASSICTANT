import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CloudRain, Snowflake, Sun, 
  Moon, Coffee, Library, TreeDeciduous, LayoutGrid, ChevronLeft,
  Sparkles, Volume2, Zap, Waves, Rocket,
  Cpu, Stars, VolumeX, Hand, Activity, AlertCircle
} from 'lucide-react';
import { useTheme, ExperienceTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNeuralVoice } from '../hooks/useNeuralVoice';
import { ASL_ALPHABET } from '../lib/aslMapping';
import TiltCard from '../components/TiltCard';

interface ThemesProps {
    onNavigate: (page: string) => void;
}

const Themes: React.FC<ThemesProps> = ({ onNavigate }) => {
    const { 
        experienceTheme, setExperienceTheme, 
        isSmartTheme, setIsSmartTheme,
        theme, toggleTheme,
        soundVolume, setSoundVolume
    } = useTheme();

    const [activeTab, setActiveTab] = useState<'environments' | 'calibration'>('environments');
    
    // Calibration State
    const { speak } = useNeuralVoice();
    const [testSign, setTestSign] = useState<string | null>(null);

    const themes: { id: ExperienceTheme; label: string; icon: any; color: string; desc: string }[] = [
        { id: 'none', label: 'Default', icon: Zap, color: 'bg-slate-500', desc: 'Standard neural interface focus.' },
        { id: 'rain', label: 'Rainy Day', icon: CloudRain, color: 'bg-blue-500', desc: 'Focus with the gentle rhythm of rainfall.' },
        { id: 'snow', label: 'Silent Snow', icon: Snowflake, color: 'bg-indigo-300', desc: 'Peaceful winter atmosphere for deep study.' },
        { id: 'sunset', label: 'Golden Hour', icon: Sun, color: 'bg-orange-500', desc: 'Warm sunset hues to relax the mind.' },
        { id: 'night', label: 'Midnight', icon: Moon, color: 'bg-purple-900', desc: 'Dark, distraction-free night environment.' },
        { id: 'coffee', label: 'Coffee Shop', icon: Coffee, color: 'bg-amber-700', desc: 'Lo-fi productivity in a cozy cafe.' },
        { id: 'library', label: 'The Archive', icon: Library, color: 'bg-emerald-800', desc: 'Scholarly silence of an ancient library.' },
        { id: 'forest', label: 'Neural Forest', icon: TreeDeciduous, color: 'bg-emerald-600', desc: 'Natural soundscapes for organic growth.' },
        { id: 'mars', label: 'Mars Colony', icon: Rocket, color: 'bg-red-700', desc: 'Dusty winds and isolation of the red planet.' },
        { id: 'ocean', label: 'Deep Abyss', icon: Waves, color: 'bg-blue-700', desc: 'Underwater tranquility and bubble flows.' },
        { id: 'cyberpunk', label: 'Neon City', icon: Cpu, color: 'bg-pink-600', desc: 'High-tech focus with synthetic rhythms.' },
        { id: 'nebula', label: 'Stellar Rift', icon: Stars, color: 'bg-indigo-900', desc: 'Floating through cosmic dust and stars.' },
    ];

    return (
        <div className={`min-h-screen relative z-10 pt-12 p-8 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {/* Cyber Grid Background */}
            <div className={`absolute inset-0 pointer-events-none opacity-20 ${theme === 'dark' ? 'block' : 'hidden'}`}>
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" className="isometric-view scale-150 origin-center" />
                </svg>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto relative z-10"
            >
                <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-purple-600/10 rounded-3xl border border-purple-500/20 text-purple-500">
                                <Sparkles size={32} />
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Settings</h1>
                        </div>
                        <div className="flex items-center gap-6 mt-6">
                            <button 
                                onClick={() => setActiveTab('environments')}
                                className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all ${activeTab === 'environments' ? 'text-purple-500' : 'opacity-40 hover:opacity-100'}`}
                            >
                                Environments
                            </button>
                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                            <button 
                                onClick={() => setActiveTab('calibration')}
                                className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all ${activeTab === 'calibration' ? 'text-blue-500' : 'opacity-40 hover:opacity-100'}`}
                            >
                                Neural Calibration
                            </button>
                        </div>
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

                <AnimatePresence mode="wait">
                    {activeTab === 'environments' ? (
                        <motion.div 
                            key="environments"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                        >
                            {/* Environment Grid */}
                            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {themes.map((t) => (
                                    <TiltCard
                                        key={t.id}
                                        onClick={() => { setExperienceTheme(t.id); setIsSmartTheme(false); }}
                                        className={`relative p-8 rounded-[2.5rem] border text-left transition-all overflow-hidden group h-full ${
                                            experienceTheme === t.id && !isSmartTheme
                                            ? 'border-purple-500 bg-purple-500/5 shadow-2xl shadow-purple-500/20'
                                            : theme === 'dark' ? 'border-white/5 bg-[#0D0D0D] hover:border-white/20' : 'border-slate-100 bg-white hover:border-purple-200 shadow-sm'
                                        }`}
                                    >
                                        <div className={`w-16 h-16 rounded-2xl ${t.color} flex items-center justify-center mb-6 shadow-lg text-white pointer-events-none`}>
                                            <t.icon size={32} />
                                        </div>
                                        <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2 pointer-events-none">{t.label}</h3>
                                        <p className="text-xs font-bold opacity-40 leading-relaxed uppercase tracking-widest pointer-events-none">{t.desc}</p>
                                        
                                        {experienceTheme === t.id && !isSmartTheme && (
                                            <div className="absolute top-6 right-6">
                                                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_#a855f7]" />
                                            </div>
                                        )}
                                    </TiltCard>
                                ))}
                            </div>

                            {/* Controls & Smart Logic */}
                            <div className="lg:col-span-4 space-y-8">
                                {/* Smart Theme Toggle */}
                                <div className={`p-8 rounded-[3rem] border transition-all ${
                                    isSmartTheme 
                                    ? 'bg-blue-600/10 border-blue-500/30' 
                                    : theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-xl'
                                }`}>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${isSmartTheme ? 'bg-blue-600 text-white' : 'bg-slate-500/10 text-slate-500'}`}>
                                                <Zap size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black italic uppercase tracking-tight">Smart Suggest</h4>
                                                <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">AI Auto-Atmosphere</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setIsSmartTheme(!isSmartTheme)}
                                            className={`w-14 h-7 rounded-full relative transition-all duration-500 ${isSmartTheme ? 'bg-blue-600' : 'bg-slate-700'}`}
                                        >
                                            <motion.div 
                                                animate={{ x: isSmartTheme ? 30 : 4 }}
                                                className="absolute top-1 left-0 w-5 h-5 bg-white rounded-full shadow-lg"
                                            />
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold opacity-50 uppercase leading-relaxed tracking-widest">
                                        When enabled, the neural core will automatically synchronize your environment theme based on the current time of day and your study intensity.
                                    </p>
                                </div>

                                {/* System UI Theme */}
                                <div className={`p-8 rounded-[3rem] border transition-all ${
                                    theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-xl'
                                }`}>
                                    <h4 className="font-black italic uppercase tracking-tight mb-6">Interface Core</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => { if(theme !== 'light') toggleTheme(); setIsSmartTheme(false); }}
                                            className={`py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border ${
                                                theme === 'light' ? 'bg-white text-slate-900 border-slate-900 shadow-lg' : 'bg-white/5 text-white/40 border-white/10'
                                            }`}
                                        >
                                            Light
                                        </button>
                                        <button 
                                            onClick={() => { if(theme !== 'dark') toggleTheme(); setIsSmartTheme(false); }}
                                            className={`py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border ${
                                                theme === 'dark' ? 'bg-slate-900 text-white border-white/20 shadow-lg shadow-black/50' : 'bg-slate-900/5 text-slate-900/40 border-slate-200'
                                            }`}
                                        >
                                            Dark
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="calibration"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-5xl"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Audio Calibration */}
                                <div className="p-12 rounded-[3.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="p-4 rounded-2xl bg-blue-600/20 text-blue-400">
                                            <Volume2 size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Audio Protocol</h3>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Ambient & Neural Voice</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <div className="flex justify-between mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Neural Gain</span>
                                                <span className="font-black italic">{Math.round(soundVolume * 100)}%</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="0" max="1" step="0.01" 
                                                value={soundVolume} 
                                                onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                                                className="w-full h-1 bg-white/10 rounded-full appearance-none accent-blue-600 outline-none"
                                            />
                                        </div>

                                        <button 
                                            onClick={() => speak("Neural audio protocol established. Welcome to the grid.")}
                                            className="w-full p-6 rounded-2xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
                                        >
                                            <Sparkles size={16} />
                                            Test Neural Voice
                                        </button>

                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-start">
                                            <AlertCircle size={16} className="text-blue-500 shrink-0 mt-1" />
                                            <p className="text-[10px] font-bold opacity-40 leading-relaxed uppercase">Browsers may block auto-play. Engagement with these controls initializes the master audio node.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sign Language Calibration */}
                                <div className="p-12 rounded-[3.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="p-4 rounded-2xl bg-purple-600/20 text-purple-400">
                                            <Hand size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Sign Assist</h3>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Visual ASL Calibration</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="w-48 h-64 bg-black/40 rounded-[2.5rem] border border-white/10 mb-8 flex flex-col items-center justify-center relative overflow-hidden group">
                                            <AnimatePresence mode="wait">
                                                {testSign ? (
                                                    <motion.div 
                                                        key={testSign}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        className="flex flex-col items-center"
                                                    >
                                                        <img 
                                                            src={ASL_ALPHABET[testSign as keyof typeof ASL_ALPHABET]} 
                                                            alt={testSign} 
                                                            className="w-24 h-24 brightness-0 invert opacity-80 mb-6"
                                                        />
                                                        <span className="text-4xl font-black italic uppercase text-purple-500">{testSign}</span>
                                                    </motion.div>
                                                ) : (
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-20 text-center px-8">Select Letter to Calibrate Display</p>
                                                )}
                                            </AnimatePresence>
                                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        </div>

                                        <div className="grid grid-cols-6 gap-2">
                                            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'].slice(0, 12).map(char => (
                                                <button 
                                                    key={char}
                                                    onClick={() => setTestSign(char)}
                                                    className={`w-10 h-10 rounded-lg font-black uppercase text-[10px] transition-all ${
                                                        testSign === char ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/30 hover:bg-white/10'
                                                    }`}
                                                >
                                                    {char}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="mt-6 text-[8px] font-black uppercase tracking-widest opacity-25">ASL Hand Sign Dictionary v1.0</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Themes;
