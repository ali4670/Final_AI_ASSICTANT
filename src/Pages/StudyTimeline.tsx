import React, { useState, useEffect } from "react";
import { 
    ArrowLeft, Plus, Trash2, Zap, Printer, ChevronRight, BookOpen, Target, Clock, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { translations } from "../utils/translations";

interface Lesson {
    name: string;
    grade: number;
}

interface Subject {
    name: string;
    grade: number;
    lectureTime: string;
    lessons: Lesson[];
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function StudyTimeline({ onNavigate }: Props) {
    const { user } = useAuth();
    const { theme, language } = useTheme();
    const t = translations[language].roadmap;
    const [age, setAge] = useState("");
    const [system, setSystem] = useState("thanaweya_amma");
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'editor' | 'timeline'>('editor');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/get-study/${user.id}`);
                const data = await res.json();
                if (data) {
                    setAge(data.age?.toString() || "");
                    setSystem(data.system || 'thanaweya_amma');
                    setSubjects(data.subjects || []);
                }
            } catch (err) {
                console.error("Fetch profile error:", err);
            }
        };
        fetchProfile();
    }, [user]);

    const addSubject = () => {
        setSubjects([...subjects, { name: "", grade: 0, lectureTime: "09:00", lessons: [] }]);
    };

    const removeSubject = (index: number) => {
        setSubjects(subjects.filter((_, i) => i !== index));
    };

    const addLesson = (index: number) => {
        const updated = [...subjects];
        updated[index].lessons.push({ name: "", grade: 0 });
        setSubjects(updated);
    };

    const handleSubmit = async () => {
        if (!age || subjects.length === 0) {
            alert("Provide age and at least one subject.");
            return;
        }
        setLoading(true);
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/save-study`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user?.id, age: Number(age), system, subjects }),
            });
            setSuccessMsg("Academic fragments synchronized.");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            alert("Uplink error.");
        } finally {
            setLoading(false);
        }
    };

    const renderEditor = () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className={`lg:col-span-4 p-8 rounded-[3rem] border h-fit sticky top-24 ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-blue-600/10 rounded-lg">
                        <Target size={16} className="text-blue-500" />
                    </div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">{t.core}</h2>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 ml-2">{t.age}</label>
                        <input 
                            type="number" 
                            value={age} 
                            onChange={(e) => setAge(e.target.value)} 
                            className={`w-full p-5 rounded-2xl bg-white/5 border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} outline-none focus:border-blue-500 text-xl font-black transition-all`} 
                            placeholder="00"
                        />
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit} 
                        disabled={loading} 
                        className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-3"
                    >
                        {loading ? "Syncing..." : t.sync} <Zap size={14} />
                    </motion.button>
                    <button 
                        onClick={() => setView('timeline')} 
                        className="w-full py-6 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        {t.view} <ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : ''} />
                    </button>
                </div>
            </motion.div>

            <div className="lg:col-span-8 space-y-6">
                <div className="flex justify-between items-center px-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">{t.structure}</span>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addSubject} 
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
                    >
                        <Plus size={14} /> {t.add}
                    </motion.button>
                </div>

                <AnimatePresence mode="popLayout">
                    {subjects.map((subject, i) => (
                        <motion.div 
                            key={i} 
                            layout
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`p-10 rounded-[3.5rem] border transition-all ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 hover:shadow-xl'}`}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                                <div className="md:col-span-5">
                                    <label className="text-[9px] font-black uppercase opacity-30 mb-2 ml-4 block">Module Identity</label>
                                    <input 
                                        placeholder="Subject Name" 
                                        className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500 font-bold" 
                                        value={subject.name} 
                                        onChange={(e) => { const u = [...subjects]; u[i].name = e.target.value; setSubjects(u); }} 
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="text-[9px] font-black uppercase opacity-30 mb-2 ml-4 block">Uplink Time</label>
                                    <input 
                                        type="time" 
                                        className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500 font-bold" 
                                        value={subject.lectureTime || "09:00"} 
                                        onChange={(e) => { const u = [...subjects]; u[i].lectureTime = e.target.value; setSubjects(u); }} 
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="text-[9px] font-black uppercase opacity-30 mb-2 ml-4 block">Retention %</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500 font-bold" 
                                        value={subject.grade || ""} 
                                        onChange={(e) => { const u = [...subjects]; u[i].grade = Number(e.target.value); setSubjects(u); }} 
                                    />
                                </div>
                                <div className="md:col-span-1 flex items-end justify-center">
                                    <button 
                                        onClick={() => removeSubject(i)} 
                                        className="p-5 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-white/5 pt-8">
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-30 ml-4 mb-2 block">Neural Sub-Nodes</span>
                                {subject.lessons.map((lesson, j) => (
                                    <motion.div key={j} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex gap-4">
                                        <input 
                                            placeholder="Chapter Name" 
                                            className="flex-1 p-4 rounded-xl bg-white/5 border border-white/5 text-xs outline-none focus:border-blue-500/50" 
                                            value={lesson.name} 
                                            onChange={(e) => { const u = [...subjects]; u[i].lessons[j].name = e.target.value; setSubjects(u); }} 
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Grd" 
                                            className="w-24 p-4 rounded-xl bg-white/5 border border-white/5 text-xs outline-none text-center" 
                                            value={lesson.grade || ""} 
                                            onChange={(e) => { const u = [...subjects]; u[i].lessons[j].grade = Number(e.target.value); setSubjects(u); }} 
                                        />
                                    </motion.div>
                                ))}
                                <button 
                                    onClick={() => addLesson(i)} 
                                    className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-500 hover:text-blue-400 transition-colors pt-2 ml-4"
                                >
                                    <Plus size={12} /> Append Milestone
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );

    const renderTimeline = () => (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="print:bg-white print:text-black">
            <div className="flex justify-between items-center mb-16 print:hidden">
                <button 
                    onClick={() => setView('editor')} 
                    className="flex items-center gap-2 text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-all"
                >
                    <ArrowLeft size={16} /> Edit Fragments
                </button>
                <div className="flex gap-4">
                    <button 
                        onClick={() => window.print()} 
                        className="flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-[10px] shadow-2xl hover:scale-105 transition-all"
                    >
                        <Printer size={18} /> Export Roadmap
                    </button>
                </div>
            </div>

            <div id="print-area" className="space-y-20">
                <div className="text-center mb-24">
                    <h2 className="text-7xl font-black italic uppercase tracking-tighter mb-6">{t.masterplan}</h2>
                    <div className="flex items-center justify-center gap-6">
                        <div className="h-px w-12 bg-blue-500/20" />
                        <p className="opacity-40 font-black uppercase tracking-[0.5em] text-[10px]">
                            {system.replace('_', ' ')} // Neural Sync Active
                        </p>
                        <div className="h-px w-12 bg-blue-500/20" />
                    </div>
                </div>

                <div className="relative border-l-2 border-blue-600/20 ml-12 pl-16 space-y-24">
                    {subjects.sort((a,b) => a.lectureTime.localeCompare(b.lectureTime)).map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative">
                            <div className="absolute -left-[81px] top-0 w-8 h-8 rounded-full bg-blue-600 border-4 border-[#050505] shadow-[0_0_20px_rgba(37,99,235,0.6)] print:border-white" />
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Clock size={14} className="text-blue-500" />
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">{s.lectureTime} LECTURE</span>
                                    </div>
                                    <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{s.name}</h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-6xl font-black text-blue-600/20 print:text-blue-600 tabular-nums">{s.grade}%</div>
                                    <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mt-1">Data Retention</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {s.lessons.map((l, j) => (
                                    <div key={j} className={`p-6 rounded-[2.5rem] border transition-all group ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-100 hover:shadow-xl'} print:border-black/10`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[9px] font-black uppercase opacity-20 tracking-[0.2em]">NODE {j+1}</span>
                                            <div className={`w-2 h-2 rounded-full shadow-[0_0_100px_rgba(34,197,94,0.5)] ${l.grade > 80 ? 'bg-green-500' : 'bg-amber-500'}`} />
                                        </div>
                                        <p className="text-xs font-black uppercase leading-relaxed line-clamp-2 group-hover:text-blue-500 transition-colors">{l.name}</p>
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div className="h-full bg-blue-600" initial={{ width: 0 }} whileInView={{ width: `${l.grade}%` }} />
                                            </div>
                                            <span className="text-[8px] font-black opacity-30">{l.grade}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className={`min-h-screen relative z-10 pt-24 p-8 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Toasts */}
                <AnimatePresence>
                    {successMsg && (
                        <motion.div 
                            initial={{ opacity: 0, y: -100, x: '-50%' }}
                            animate={{ opacity: 1, y: 20, x: '-50%' }}
                            exit={{ opacity: 0, y: -100, x: '-50%' }}
                            className="fixed top-20 left-1/2 z-[100] bg-green-500 text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3"
                        >
                            <CheckCircle2 size={16} /> {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <header className="mb-20 flex justify-between items-end print:hidden">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl border shadow-lg transition-colors ${theme === 'dark' ? 'bg-indigo-600/10 text-indigo-500 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                <Clock size={32} />
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">{language === 'ar' ? 'الجدول' : 'Timeline'}</h1>
                        </div>
                        <div className="flex items-center gap-6 ml-20">
                            <p className="opacity-40 font-black uppercase tracking-[0.4em] text-[10px]">Academic Roadmap v2.0</p>
                            {age && (
                                <>
                                    <div className="w-1 h-1 rounded-full bg-indigo-500/20" />
                                    <span className="text-indigo-500 font-black text-xs tracking-widest uppercase">{t.age}: {age}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onNavigate('dashboard')} 
                        className={`p-5 border rounded-3xl transition-all shadow-xl ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                </header>

                <AnimatePresence mode="wait">
                    {view === 'editor' ? renderEditor() : renderTimeline()}
                </AnimatePresence>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
        </div>
    );
}
