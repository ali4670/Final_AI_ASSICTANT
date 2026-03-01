import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RefreshCw, Settings, 
  BookOpen, X, Maximize2, 
  Palette, Clock, Zap, Minimize2, 
  Coffee, School, Bed, Monitor, 
  Wind, Sparkles, Waves, Leaf, ChevronLeft, CloudRain, Snowflake, Sun,
  Bell, Volume2
} from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import WeatherEffects from '../components/WeatherEffects';
import { Canvas } from '@react-three/fiber';
import FocusBiome from '../components/3D/FocusBiome';

interface Props {
    onNavigate: (page: string) => void;
}

const Pomodoro: React.FC<Props> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    
    const { 
        timeLeft, isActive, mode, toggleTimer, resetTimer, 
        setMode, settings, setSettings, streak, cycle, 
        currentTask, setCurrentTask, bellSound, setBellSound, growthPoints
    } = useTimer();
    
    // UI State
    const [showSettings, setShowSettings] = useState(false);
    const [showAmbient, setShowAmbient] = useState(false);
    const [weather, setWeather] = useState<'none' | 'rain' | 'snow'>('none');
    const [sceneIndex, setSceneIndex] = useState(0);
    const [isZenMode, setIsZenMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLiveMode, setIsLiveMode] = useState(true);

    const [journal, setJournal] = useState<any[]>([]);

    const scenes = [
        { name: 'Neural Void', icon: Zap, class: 'bg-[#050505]', live: 'bg-black', music: 'Deep focus' },
        { name: 'Coffee Shop', icon: Coffee, class: 'bg-[#1a1410]', live: 'from-orange-950/20 to-black', music: 'Lofi Beats' },
        { name: 'Library Hall', icon: School, class: 'bg-[#0f111a]', live: 'from-indigo-900/20 to-black', music: 'Classical' },
        { name: 'Sleepy Dorm', icon: Bed, class: 'bg-[#1a0f16]', live: 'from-rose-900/20 to-black', music: 'Ambient' },
        { name: 'Home Desk', icon: Monitor, class: 'bg-[#0f1a14]', live: 'from-emerald-900/20 to-black', music: 'White Noise' }
    ];

    const bellSounds = [
        { name: 'Classic Bell', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { name: 'Digital Alert', url: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3' },
        { name: 'Zen Bowl', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
        { name: 'Echo Ding', url: 'https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3' }
    ];

    const currentScene = scenes[sceneIndex];

    useEffect(() => {
        const fetchJournal = async () => {
            if (!user) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/get-study/${user.id}`);
                const data = await res.json();
                if (data) setJournal(data.subjects || []);
            } catch (err) { console.error(err); }
        };
        fetchJournal();
    }, [user]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const toggleSettings = () => {
        setShowAmbient(false);
        setShowSettings(!showSettings);
    };

    const toggleAmbient = () => {
        setShowSettings(false);
        setShowAmbient(!showAmbient);
    };

    return (
        <div className={`min-h-screen transition-all duration-1000 relative overflow-hidden ${currentScene.class} text-white flex flex-col items-center justify-center font-sans`}>
            
            <AnimatePresence>
                {isLiveMode && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`absolute inset-0 bg-gradient-to-br ${currentScene.live} pointer-events-none`}
                    >
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.2, 0.4, 0.2],
                                x: [0, 100, 0],
                                y: [0, 50, 0]
                            }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-blue-500/10 rounded-full blur-[150px]"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <WeatherEffects type={weather} intensity={weather === 'rain' ? 80 : 40} />

            {/* 3D FOCUS BIOME */}
            <div className="fixed bottom-10 left-10 w-64 h-64 z-40 pointer-events-none hidden lg:block">
                <Canvas camera={{ position: [0, 1, 4], fov: 40 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <FocusBiome growth={growthPoints} />
                </Canvas>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-500 opacity-40">Neural Biome Link</p>
                    <p className="text-[10px] font-black italic uppercase tracking-tighter text-white">Growth Index: {growthPoints}</p>
                </div>
            </div>

            {/* STREAK & CYCLE: UP AND DOWN ONLY */}
            <motion.div 
                animate={{ 
                    y: [0, -20, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-xl z-40 shadow-2xl"
            >
                <div className="flex items-center gap-2">
                    <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{streak} DAY STREAK</span>
                </div>
                <div className="w-px h-3 bg-white/20" />
                <div className="flex items-center gap-2 text-blue-400">
                    <Clock size={10} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">CYCLE {cycle}/4</span>
                </div>
            </motion.div>

            {/* FLOATING TASK SELECTOR */}
            {!isZenMode && (
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-40 w-full max-w-sm px-6 z-40"
                >
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-xl hover:border-blue-500/30 transition-all group">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Active Protocol</span>
                            <BookOpen size={10} className="opacity-30" />
                        </div>
                        <select 
                            value={currentTask}
                            onChange={(e) => setCurrentTask(e.target.value)}
                            className="w-full bg-transparent border-none outline-none font-black italic uppercase tracking-tighter text-sm appearance-none cursor-pointer"
                        >
                            <option value="General Focus" className="bg-[#0D0D0D]">General Focus</option>
                            {journal.map((sub, i) => (
                                <option key={i} value={sub.name} className="bg-[#0D0D0D]">{sub.name}</option>
                            ))}
                        </select>
                    </div>
                </motion.div>
            )}

            <main className="relative z-30 flex flex-col items-center">
                <motion.div 
                    key={timeLeft}
                    className="text-[16rem] md:text-[22rem] font-black tracking-tighter tabular-nums leading-none select-none drop-shadow-[0_0_100px_rgba(255,255,255,0.05)] cursor-pointer hover:scale-[1.01] transition-transform"
                    onClick={() => setIsZenMode(!isZenMode)}
                >
                    {formatTime(timeLeft)}
                </motion.div>
            </main>

            {/* UNIFIED AMBIENT CONTROL BAR */}
            <AnimatePresence>
                {!isZenMode && (
                    <motion.nav 
                        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                        className="fixed bottom-0 w-full p-8 flex justify-center z-50 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
                    >
                        <div className={`flex items-center gap-3 backdrop-blur-3xl border p-2 rounded-[2.5rem] shadow-2xl transition-colors pointer-events-auto ${
                            theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/80 border-slate-200'
                        }`}>
                            <button onClick={() => onNavigate('dashboard')} className={`p-4 rounded-2xl border transition-all ${
                                theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/5 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900'
                            }`} title="Return Home">
                                <Home size={20} />
                            </button>
                            
                            <div className={`flex gap-1 p-1 rounded-2xl border transition-colors ${
                                theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'
                            }`}>
                                {(['work', 'short', 'long'] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMode(m)}
                                        className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                            mode === m 
                                                ? theme === 'dark' ? 'bg-white text-black' : 'bg-blue-600 text-white'
                                                : theme === 'dark' ? 'text-white opacity-40 hover:opacity-100' : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        {m === 'work' ? 'Uplink' : m === 'short' ? 'Reboot' : 'Stasis'}
                                    </button>
                                ))}
                            </div>

                            <div className={`w-px h-8 mx-2 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-300'}`} />

                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleTimer}
                                    className={`p-4 px-8 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center gap-2 ${isActive ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}
                                >
                                    {isActive ? <Pause size={16} /> : <Play size={16} />}
                                    {isActive ? 'Suspend' : 'Engage'}
                                </motion.button>
                                <button onClick={resetTimer} className={`p-4 rounded-2xl border transition-all ${
                                    theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'
                                }`}>
                                    <RefreshCw size={18} />
                                </button>
                            </div>

                            <div className={`w-px h-8 mx-2 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-300'}`} />

                            <div className="flex gap-2">
                                <button onClick={() => setIsLiveMode(!isLiveMode)} className={`p-4 rounded-2xl border transition-all ${isLiveMode ? 'bg-indigo-600 border-indigo-400 text-white' : theme === 'dark' ? 'bg-white/5 border-white/5 text-gray-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                    <Zap size={18} />
                                </button>
                                <button onClick={toggleAmbient} className={`p-4 rounded-2xl border transition-all ${showAmbient ? theme === 'dark' ? 'bg-white text-black' : 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}>
                                    <Palette size={18} />
                                </button>
                                <button onClick={() => setWeather(weather === 'rain' ? 'snow' : weather === 'snow' ? 'none' : 'rain')} className={`p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}>
                                    {weather === 'rain' ? <CloudRain size={18} /> : weather === 'snow' ? <Snowflake size={18} /> : <Sun size={18} />}
                                </button>
                                <button onClick={toggleFullscreen} className={`p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}>
                                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>
                                <button onClick={toggleSettings} className={`p-4 rounded-2xl border transition-all ${showSettings ? theme === 'dark' ? 'bg-white text-black' : 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}>
                                    <Settings size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>

            {/* SCENE CHOOSER PANEL */}
            <AnimatePresence>
                {showAmbient && (
                    <motion.div 
                        initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                        className={`fixed right-0 top-0 h-full w-[400px] backdrop-blur-[100px] border-l z-[100] p-10 pt-32 transition-colors ${
                            theme === 'dark' ? 'bg-black/95 border-white/5 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-2xl'
                        }`}
                    >
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Scenes</h2>
                            <X className="cursor-pointer opacity-20 hover:opacity-100" onClick={() => setShowAmbient(false)} />
                        </div>
                        <div className="space-y-4">
                            {scenes.map((s, i) => (
                                <button key={i} onClick={() => { setSceneIndex(i); setShowAmbient(false); }} className={`w-full p-6 rounded-[2rem] border flex items-center gap-5 transition-all ${sceneIndex === i ? 'border-blue-500 bg-blue-500/10' : theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50 hover:bg-white'}`}>
                                    <div className={`p-3 rounded-xl ${sceneIndex === i ? 'text-blue-400' : theme === 'dark' ? 'text-gray-600 bg-white/5' : 'text-slate-400 bg-slate-200'}`}><s.icon size={24} /></div>
                                    <div className="text-left"><h3 className="font-black uppercase tracking-widest text-xs">{s.name}</h3></div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SETTINGS MODAL */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className={`p-12 rounded-[4rem] w-full max-w-lg shadow-2xl transition-colors ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-900'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-12">
                                <h3 className="text-2xl font-black italic uppercase">Config</h3>
                                <X className="cursor-pointer opacity-20 hover:opacity-100" onClick={() => setShowSettings(false)} />
                            </div>
                            
                            <div className="space-y-10">
                                {(['work', 'short', 'long'] as const).map((key) => (
                                    <div key={key}>
                                        <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">{key} duration</label>
                                        <div className="flex items-center gap-6">
                                            <input 
                                                type="range" min="1" max="90" 
                                                value={settings[key]} 
                                                onChange={(e) => setSettings({ ...settings, [key]: Number(e.target.value) })}
                                                className={`flex-1 ${theme === 'dark' ? 'accent-blue-600' : 'accent-blue-600'}`} 
                                            />
                                            <span className="w-12 font-black text-xl">{settings[key]}m</span>
                                        </div>
                                    </div>
                                ))}

                                <div className={`pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                                    <label className="text-[10px] font-black uppercase opacity-40 mb-4 block">End-of-Session Bell</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {bellSounds.map((s) => (
                                            <button 
                                                key={s.url}
                                                onClick={() => {
                                                    setBellSound(s.url);
                                                    new Audio(s.url).play().catch(() => {});
                                                }}
                                                className={`p-4 rounded-xl text-[10px] font-black uppercase border transition-all ${bellSound === s.url ? 'bg-blue-600 border-blue-400 text-white' : theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'}`}
                                            >
                                                {s.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <button onClick={() => { resetTimer(); setShowSettings(false); }} className={`w-full py-6 rounded-[2rem] font-black uppercase mt-12 transition-all shadow-xl ${
                                theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20'
                            }`}>Save & Reset Timer</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Pomodoro;
