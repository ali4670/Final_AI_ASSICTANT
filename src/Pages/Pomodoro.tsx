import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RefreshCw, Settings, 
  BookOpen, X,  
  Palette, Clock, Zap, 
  Home as HomeIcon,
  Wind, Leaf, Dog, Droplets, Bot, ArrowLeft, 
  ChevronRight, Trophy, Box, Fence as FenceIcon,
  LayoutGrid, Maximize2, Minimize2, Volume2
} from 'lucide-react';
import { useTimer, ConstructionType } from '../contexts/TimerContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNeuralVoice } from '../hooks/useNeuralVoice';
import WeatherEffects from '../components/WeatherEffects';

interface Props {
    onNavigate: (page: string) => void;
}

const constructionOptions: { id: ConstructionType, icon: any, label: string }[] = [
    { id: 'tree', icon: Leaf, label: 'Tree' },
    { id: 'house', icon: HomeIcon, label: 'House' },
    { id: 'barn', icon: HomeIcon, label: 'Barn' },
    { id: 'windmill', icon: Wind, label: 'Mill' },
    { id: 'sheep', icon: Dog, label: 'Sheep' },
    { id: 'robot', icon: Bot, label: 'Robot' },
    { id: 'fountain', icon: Droplets, label: 'Zen' },
    { id: 'monolith', icon: Trophy, label: 'Core' },
    { id: 'bush', icon: Box, label: 'Bush' },
    { id: 'fence', icon: FenceIcon, label: 'Gate' }
];

const scenes = [
    { name: 'Neural Void', type: 'none', class: 'bg-[#020202]', live: 'from-blue-900/10 to-black' },
    { name: 'Coffee Shop', type: 'coffee', class: 'bg-[#1a1410]', live: 'from-orange-950/20 to-black' },
    { name: 'Library Hall', type: 'library', class: 'bg-[#0f111a]', live: 'from-indigo-900/20 to-black' },
    { name: 'Deep Night', type: 'night', class: 'bg-[#050505]', live: 'from-purple-950/20 to-black' },
    { name: 'Sunset Ridge', type: 'sunset', class: 'bg-[#1a0f05]', live: 'from-orange-900/20 to-black' },
    { name: 'Bio Forest', type: 'forest', class: 'bg-[#051a05]', live: 'from-emerald-950/20 to-black' },
    { name: 'Mars Colony', type: 'mars', class: 'bg-[#1a0505]', live: 'from-red-950/20 to-black' },
    { name: 'Deep Ocean', type: 'ocean', class: 'bg-[#050f1a]', live: 'from-blue-950/30 to-black' }
];

const Pomodoro: React.FC<Props> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme, useVoice } = useTheme();
    const { speak } = useNeuralVoice();
    
    const { 
        timeLeft, isActive, mode, toggleTimer, resetTimer, 
        setMode, settings, setSettings, streak, cycle, 
        currentSubject, setCurrentSubject,
        currentLesson, setCurrentLesson,
        constructionTarget, setConstructionTarget
    } = useTimer();
    
    const [showConfig, setShowConfig] = useState(false);
    const [showAmbient, setShowAmbient] = useState(false);
    const [showBlueprint, setShowBlueprint] = useState(false);
    const [showSubjectSelector, setShowSubjectSelector] = useState(false);
    const [weather, setWeather] = useState<'none' | 'rain' | 'snow'>('none');
    const [sceneIndex, setSceneIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [aiInsight, setAiInsight] = useState<string | null>(null);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error enabling fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFSChange);
        return () => document.removeEventListener('fullscreenchange', handleFSChange);
    }, []);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!user) return;
            try {
                const res = await fetch(`/api/get-study/${user.id}`);
                const data = await res.json();
                if (data && data.subjects) setSubjects(data.subjects);
            } catch (err) { console.error(err); }
        };
        fetchSubjects();
    }, [user]);

    useEffect(() => {
        if (isActive && mode === 'work' && timeLeft < settings.work * 60 * 0.5 && !aiInsight) {
            const insights = ["Deep work protocol active.", "Focus levels optimal.", "Stay hydrated.", "Flow state detected."];
            const msg = insights[Math.floor(Math.random() * insights.length)];
            setAiInsight(msg);
            if (useVoice) speak(msg);
            setTimeout(() => setAiInsight(null), 5000);
        }
    }, [isActive, mode, timeLeft, useVoice, speak]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`h-screen w-screen transition-all duration-1000 relative overflow-hidden ${scenes[sceneIndex].class} text-white flex flex-col items-center justify-center font-sans`}>
            
            <AnimatePresence>
                <motion.div key={sceneIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`absolute inset-0 bg-gradient-to-br ${scenes[sceneIndex].live} pointer-events-none opacity-20`} />
            </AnimatePresence>

            <WeatherEffects type={weather !== 'none' ? weather : (scenes[sceneIndex].type as any)} />

            {/* TOP HUD */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50 pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button onClick={() => onNavigate('dashboard')} className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-0.5">Focus Node</span>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black italic tracking-tighter uppercase tabular-nums">{currentSubject || 'Protocol'} // {currentLesson || 'Fragment'}</h2>
                            <button onClick={() => setShowSubjectSelector(true)} className="p-1 bg-white/10 rounded-md hover:bg-white/20 transition-all border border-white/5"><LayoutGrid size={12} /></button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pointer-events-auto bg-black/40 backdrop-blur-2xl border border-white/10 px-5 py-2 rounded-full shadow-2xl">
                    <div className="flex items-center gap-2">
                        <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[8px] font-black uppercase tracking-widest">{streak} Streak</span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-2 mr-1">
                        <Clock size={12} className="text-blue-400" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Cycle {cycle}/4</span>
                    </div>
                    <button onClick={toggleFullscreen} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white">
                        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </div>

            {/* AI Insights */}
            <AnimatePresence>
                {aiInsight && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-5 py-2 bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-full flex items-center gap-2">
                        <Bot size={12} className="text-blue-400" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-100">{aiInsight}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN TIMER */}
            <main className="relative z-30 flex flex-col items-center justify-center py-4">
                <motion.div key={timeLeft} initial={{ scale: 0.98, opacity: 0.9 }} animate={{ scale: 1, opacity: 1 }} className="text-[10rem] md:text-[14rem] font-black tracking-tighter tabular-nums leading-none drop-shadow-[0_0_60px_rgba(255,255,255,0.08)] select-none cursor-default">
                    {formatTime(timeLeft)}
                </motion.div>
                <div className="px-6 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mt-2 flex items-center gap-4 shadow-2xl">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black uppercase tracking-[0.6em] text-blue-400">{mode} ACTIVE</span>
                        <div className="w-20 h-0.5 bg-blue-500/20 mt-1 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${(timeLeft / (settings[mode] * 60)) * 100}%` }} />
                        </div>
                    </div>
                    {isActive && <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]" />}
                </div>
            </main>

            {/* BLUEPRINT */}
            <div className="absolute right-8 bottom-24 z-50 flex flex-col items-end gap-3">
                <button onClick={() => setShowBlueprint(!showBlueprint)} className={`p-4 rounded-2xl border transition-all flex items-center gap-3 shadow-2xl ${showBlueprint ? 'bg-emerald-600 border-white text-white' : 'bg-black/40 backdrop-blur-xl border-white/10 hover:bg-white/10 text-white/60 pointer-events-auto'}`}>
                    <div className="flex flex-col items-end">
                        <span className="text-[7px] font-black uppercase tracking-widest opacity-60 leading-none mb-0.5">Architecture</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{constructionTarget}</span>
                    </div>
                    <Bot size={20} />
                </button>
                <AnimatePresence>
                    {showBlueprint && (
                        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="p-4 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-64 shadow-3xl grid grid-cols-2 gap-2 pointer-events-auto">
                            {constructionOptions.map(opt => (
                                <button key={opt.id} onClick={() => { setConstructionTarget(opt.id); setShowBlueprint(false); }} className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 ${constructionTarget === opt.id ? 'bg-emerald-600 border-white text-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}>
                                    <opt.icon size={16} />
                                    <span className="text-[7px] font-black uppercase tracking-widest">{opt.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* BOTTOM CONTROLS */}
            <div className="fixed bottom-8 w-full flex justify-center z-50 px-8 pointer-events-none">
                <div className={`flex items-center gap-4 backdrop-blur-3xl border p-3 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all pointer-events-auto ${theme === 'dark' ? 'bg-black/60 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                    <div className={`flex gap-1 p-1 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                        {(['work', 'short', 'long'] as const).map((m) => (
                            <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-blue-600 text-white' : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>{m}</button>
                        ))}
                    </div>
                    <div className="flex gap-2 mx-1">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleTimer} className={`px-10 py-3.5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 ${isActive ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}>
                            {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            {isActive ? 'Suspend' : 'Initialize'}
                        </motion.button>
                        <button onClick={resetTimer} className={`p-3.5 rounded-xl border transition-all group ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-900'}`}><RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" /></button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowAmbient(!showAmbient)} className={`p-3.5 rounded-xl border transition-all ${showAmbient ? 'bg-blue-600 text-white' : (theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-100 border-slate-200 text-slate-400')}`}><Palette size={18} /></button>
                        <button onClick={() => setShowConfig(!showConfig)} className={`p-3.5 rounded-xl border transition-all ${showConfig ? 'bg-blue-600 text-white' : (theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-100 border-slate-200 text-slate-400')}`}><Settings size={18} /></button>
                    </div>
                </div>
            </div>

            {/* MODALS (Simplified) */}
            <AnimatePresence>
                {showSubjectSelector && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-8">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-4xl w-full p-12 rounded-[4rem] bg-[#0D0D0D] border border-white/10 text-white shadow-2xl relative">
                            <X className="absolute top-8 right-8 cursor-pointer opacity-40 hover:opacity-100" size={32} onClick={() => setShowSubjectSelector(false)} />
                            <h3 className="text-3xl font-black uppercase italic mb-8 tracking-tighter">Protocol Target</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                                {subjects.map((subject: any, i: number) => (
                                    <div key={i} className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                            <BookOpen size={16} className="text-blue-500" />
                                            <span className="font-black uppercase tracking-tighter text-sm">{subject.name}</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1.5 pl-4 border-l border-white/5">
                                            {subject.lessons?.map((lesson: any, j: number) => {
                                                const name = typeof lesson === 'string' ? lesson : lesson.name;
                                                return <button key={j} onClick={() => { setCurrentSubject(subject.name); setCurrentLesson(name); setShowSubjectSelector(false); }} className={`p-3 rounded-lg text-left text-[10px] font-black uppercase tracking-widest transition-all ${currentLesson === name && currentSubject === subject.name ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>{name}</button>;
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {showAmbient && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-8">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-4xl w-full p-12 rounded-[4rem] bg-[#0D0D0D] border border-white/10 text-white shadow-2xl relative">
                            <X className="absolute top-8 right-8 cursor-pointer opacity-40 hover:opacity-100" size={32} onClick={() => setShowAmbient(false)} />
                            <h3 className="text-3xl font-black uppercase italic mb-8 tracking-tighter">Calibration</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {scenes.map((s, i) => (
                                    <button key={i} onClick={() => setSceneIndex(i)} className={`p-6 rounded-[2rem] border transition-all text-left relative overflow-hidden ${sceneIndex === i ? 'bg-blue-600 border-white scale-[1.02]' : 'bg-white/5 border-white/5'}`}>
                                        <h4 className="text-xs font-black uppercase italic tracking-tighter relative z-10">{s.name}</h4>
                                        <div className={`absolute inset-0 bg-gradient-to-br ${s.live} opacity-20`} />
                                    </button>
                                ))}
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[8px] font-black uppercase tracking-widest opacity-40">Weather</label>
                                    <div className="flex gap-2">
                                        {(['none', 'rain', 'snow'] as const).map(w => <button key={w} onClick={() => setWeather(w)} className={`flex-1 py-3 rounded-xl border text-[8px] font-black uppercase ${weather === w ? 'bg-blue-600 border-white' : 'bg-white/5 border-white/5 opacity-40'}`}>{w}</button>)}
                                    </div>
                                </div>
                                <div className="flex items-end"><button className="w-full py-4 bg-blue-600 rounded-xl font-black uppercase text-[10px] tracking-widest flex gap-2 items-center justify-center"><Volume2 size={16}/> Audio Uplink</button></div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {showConfig && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-8">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full p-12 rounded-[4rem] bg-[#0D0D0D] border border-white/10 text-white shadow-2xl relative">
                            <X className="absolute top-8 right-8 cursor-pointer opacity-40 hover:opacity-100" size={32} onClick={() => setShowConfig(false)} />
                            <h3 className="text-3xl font-black uppercase italic mb-10 tracking-tighter">Params</h3>
                            <div className="space-y-8">
                                {(['work', 'short', 'long'] as const).map((key) => (
                                    <div key={key} className="space-y-2">
                                        <div className="flex justify-between"><label className="text-[10px] font-black uppercase opacity-40">{key}</label><span className="font-black">{settings[key]}m</span></div>
                                        <input type="range" min="1" max="90" value={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: Number(e.target.value) })} className="w-full accent-blue-600" />
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => { resetTimer(); setShowConfig(false); }} className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase text-[10px] tracking-widest mt-10">Sync</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Pomodoro;
