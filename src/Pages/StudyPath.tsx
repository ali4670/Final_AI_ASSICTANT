import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Book, FlaskConical, Globe, Award, ChevronRight, Check, Sparkles, Map, ListChecks, Zap, User, Settings2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface StudyPathProps {
    onNavigate: (page: string, id?: string) => void;
}

const StudyPath: React.FC<StudyPathProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState({ age: '', grade: '', system: '', branch: '' });
    const [isGenerating, setIsGenerating] = useState(false);

    const systems = [
        { id: 'thanaweya_amma', title: 'Thanaweya Amma', description: 'Egyptian National High School system.', icon: <Book className="w-8 h-8 text-green-500" />, color: 'border-green-500/50 bg-green-500/10' },
        { id: 'bakalorya', title: 'Bakalorya', description: 'Egyptian Baccalaureate (National roadmap).', icon: <Map className="w-8 h-8 text-amber-500" />, color: 'border-amber-500/50 bg-amber-500/10' },
        { id: 'american', title: 'American Diploma', description: 'GPA & Standardized testing (SAT/EST).', icon: <Globe className="w-8 h-8 text-blue-500" />, color: 'border-blue-500/50 bg-blue-500/10' },
        { id: 'igcse', title: 'IGCSE (British)', description: 'Cambridge & Edexcel O/A Level subjects.', icon: <Award className="w-8 h-8 text-purple-500" />, color: 'border-purple-500/50 bg-purple-500/10' },
        { id: 'stem', title: 'STEM Egypt', description: 'Advanced Science, Technology & Capstone.', icon: <FlaskConical className="w-8 h-8 text-red-500" />, color: 'border-red-500/50 bg-red-500/10' }
    ];

    const getSystemSubjects = (sys: string, branch?: string) => {
        const roadmaps: Record<string, any> = {
            thanaweya_amma: {
                science: ['Arabic', 'English', 'French/German', 'Chemistry', 'Physics', 'Biology', 'Geology'],
                math: ['Arabic', 'English', 'French/German', 'Chemistry', 'Physics', 'Pure Mathematics', 'Applied Mathematics'],
                literature: ['Arabic', 'English', 'French/German', 'History', 'Geography', 'Psychology', 'Philosophy']
            },
            bakalorya: ['Arabic Language', 'Advanced Mathematics', 'Physics', 'Chemistry', 'Biology', 'History & Civics', 'Social Studies'],
            american: ['English Literature', 'SAT/EST Math', 'Biology', 'Chemistry', 'Physics', 'World History', 'Arabic', 'Religious Studies'],
            igcse: ['English as Second Language', 'Extended Mathematics', 'Physics', 'Chemistry', 'Biology', 'ICT', 'Business Studies'],
            stem: ['Capstone Research', 'Mechanics', 'Advanced Chemistry', 'Biology & Earth Science', 'Calculus', 'Electronics', 'Academic English']
        };

        if (sys === 'thanaweya_amma') return roadmaps.thanaweya_amma[branch || 'science'];
        return roadmaps[sys] || [];
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        const subjectsList = getSystemSubjects(profile.system, profile.branch);
        
        const payload = {
            userId: user?.id,
            age: Number(profile.age),
            system: profile.system,
            subjects: subjectsList.map(s => ({
                name: s,
                grade: 0,
                lectureTime: "09:00",
                lessons: [
                    { name: 'Chapter 1: Initial Link', grade: 0 },
                    { name: 'Chapter 2: Core Protocols', grade: 0 },
                    { name: 'Chapter 3: Advanced Theory', grade: 0 },
                    { name: 'Chapter 4: Final Assessment', grade: 0 }
                ]
            }))
        };

        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
            const response = await fetch(`${baseUrl}/api/save-study`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Save failed');
            }
            
            setTimeout(() => {
                setIsGenerating(false);
                setStep(4);
            }, 2500);
        } catch (err: any) {
            setIsGenerating(false);
            console.error("Save error:", err);
            alert(`Uplink failed: ${err.message}`);
        }
    };

    const ProgressBar = () => (
        <div className="flex justify-center gap-2 mb-12">
            {[1, 2, 3, 4].map((i) => (
                <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-12 bg-blue-600' : 'w-4 bg-white/10'}`} 
                />
            ))}
        </div>
    );

    const renderStep1 = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div className="text-center">
                <div className="inline-flex p-4 bg-blue-600/10 rounded-3xl mb-6">
                    <User className="text-blue-500" size={32} />
                </div>
                <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Identification</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Initialize Student Profile</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[3rem] space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Temporal Age</label>
                    <input 
                        type="number" 
                        value={profile.age} 
                        onChange={(e) => setProfile({ ...profile, age: e.target.value })} 
                        className="w-full bg-transparent border-none outline-none text-4xl font-black tracking-tighter placeholder:opacity-10" 
                        placeholder="00" 
                    />
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[3rem] space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Academic Rank</label>
                    <select 
                        value={profile.grade} 
                        onChange={(e) => setProfile({ ...profile, grade: e.target.value })} 
                        className="w-full bg-transparent border-none outline-none text-xl font-bold appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-black">Select Grade</option>
                        <option value="10" className="bg-black">1st Secondary</option>
                        <option value="11" className="bg-black">2nd Secondary</option>
                        <option value="12" className="bg-black">3rd Secondary</option>
                    </select>
                </div>
            </div>

            <button 
                onClick={() => setStep(2)} 
                disabled={!profile.age || !profile.grade} 
                className="w-full py-8 bg-blue-600 rounded-[3rem] font-black uppercase tracking-[0.3em] text-xs text-white shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition-all disabled:opacity-50"
            >
                Proceed to Roadmaps <ChevronRight className="inline ml-2" size={16} />
            </button>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
            <div className="text-center">
                <div className="inline-flex p-4 bg-amber-600/10 rounded-3xl mb-6">
                    <GraduationCap className="text-amber-500" size={32} />
                </div>
                <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Protocol Selection</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Choose your academic ecosystem</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systems.map((sys) => (
                    <motion.div 
                        key={sys.id} 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => { 
                            setProfile({ ...profile, system: sys.id }); 
                            if (sys.id === 'thanaweya_amma') setStep(3);
                            else handleGenerate();
                        }} 
                        className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all flex items-center gap-6 ${profile.system === sys.id ? sys.color : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}
                    >
                        <div className="p-4 bg-white/5 rounded-2xl">{sys.icon}</div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tighter italic">{sys.title}</h3>
                            <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">{sys.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="text-center">
                <div className="inline-flex p-4 bg-purple-600/10 rounded-3xl mb-6">
                    <Settings2 className="text-purple-500" size={32} />
                </div>
                <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Branch Alignment</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Specify your specialization path</p>
            </div>

            <div className="space-y-4">
                {[
                    { id: 'science', label: 'Ilmy Oloum (Science)', desc: 'Biology, Geology, Chemistry, and Physics.', color: 'hover:border-green-500/50 hover:bg-green-500/5' },
                    { id: 'math', label: 'Ilmy Riyada (Mathematics)', desc: 'Pure Mathematics, Applied Math, and Physics.', color: 'hover:border-blue-500/50 hover:bg-blue-500/5' },
                    { id: 'literature', label: 'Adaby (Literature)', desc: 'History, Geography, Psychology, and Philosophy.', color: 'hover:border-purple-500/50 hover:bg-purple-500/5' }
                ].map((branch) => (
                    <motion.div 
                        key={branch.id} 
                        whileHover={{ x: 10 }}
                        onClick={() => { setProfile({ ...profile, branch: branch.id }); handleGenerate(); }}
                        className={`p-8 rounded-[3rem] border-2 border-white/5 bg-white/[0.02] cursor-pointer transition-all ${branch.color}`}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-1">{branch.label}</h3>
                                <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">{branch.desc}</p>
                            </div>
                            <ChevronRight size={24} className="opacity-20" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );

    const renderGenerating = () => (
        <div className="text-center py-20 flex flex-col items-center">
            <div className="relative w-40 h-40 mb-12">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-t-4 border-blue-600 rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-4 border-t-4 border-indigo-600/30 rounded-full" />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={48} />
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 animate-pulse">Neural Synthesis</h2>
            <p className="opacity-40 font-black uppercase text-[10px] tracking-[0.6em]">Populating {profile.system} Academic Journal...</p>
        </div>
    );

    const renderStep4 = () => (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 text-center">
            <div className="relative inline-block">
                <div className="w-40 h-40 bg-blue-600 rounded-[3rem] rotate-12 flex items-center justify-center shadow-[0_0_80px_rgba(37,99,235,0.4)]">
                    <Check className="w-20 h-20 text-white -rotate-12" strokeWidth={4} />
                </div>
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-blue-600 rounded-[3rem] -z-10" />
            </div>

            <div>
                <h2 className="text-7xl font-black italic tracking-tighter uppercase mb-4 leading-none">Uplink Active</h2>
                <p className="text-lg opacity-40 font-black uppercase tracking-[0.4em]">Academic roadmap successfully synchronized</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles size={120} />
                </div>
                <div className="flex items-center gap-4 mb-10 text-blue-500">
                    <ListChecks size={28} />
                    <span className="font-black uppercase tracking-[0.4em] text-[10px]">Neural Nodes Initialized</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {getSystemSubjects(profile.system, profile.branch).slice(0, 6).map((s: string) => (
                        <div key={s} className="flex items-center gap-4 group">
                            <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-150 transition-all shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                            <span className="text-[11px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">{s}</span>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                onClick={() => onNavigate('studyTimeline')} 
                className="w-full py-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] font-black uppercase tracking-[0.4em] text-sm hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-all active:scale-95 group"
            >
                Launch Neural Journal <ChevronRight className="inline ml-2 group-hover:translate-x-2 transition-transform" />
            </button>
        </motion.div>
    );

    return (
        <div className={`min-h-screen flex items-center justify-center px-6 transition-colors duration-700 ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-[#F8FAFC] text-slate-900'} pt-20 pb-20`}>
            <div className="max-w-3xl w-full">
                {!isGenerating && step < 4 && <ProgressBar />}
                {isGenerating ? renderGenerating() : (
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                <div className="text-center">
                                    <div className="inline-flex p-4 bg-blue-600/10 rounded-3xl mb-6">
                                        <User className="text-blue-500" size={32} />
                                    </div>
                                    <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Identification</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Initialize Student Profile</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={`p-8 rounded-[3rem] space-y-4 border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-blue-500/5'}`}>
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Temporal Age</label>
                                        <input 
                                            type="number" 
                                            value={profile.age} 
                                            onChange={(e) => setProfile({ ...profile, age: e.target.value })} 
                                            className="w-full bg-transparent border-none outline-none text-4xl font-black tracking-tighter placeholder:opacity-10" 
                                            placeholder="00" 
                                        />
                                    </div>
                                    <div className={`p-8 rounded-[3rem] space-y-4 border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-blue-500/5'}`}>
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Academic Rank</label>
                                        <select 
                                            value={profile.grade} 
                                            onChange={(e) => setProfile({ ...profile, grade: e.target.value })} 
                                            className="w-full bg-transparent border-none outline-none text-xl font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="" className={theme === 'dark' ? 'bg-black' : 'bg-white'}>Select Rank</option>
                                            <option value="10" className={theme === 'dark' ? 'bg-black' : 'bg-white'}>1st Bakalorua / Secondary</option>
                                            <option value="11" className={theme === 'dark' ? 'bg-black' : 'bg-white'}>2nd Bakalorua / Secondary</option>
                                            <option value="12" className={theme === 'dark' ? 'bg-black' : 'bg-white'}>3rd Bakalorua / Secondary</option>
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setStep(2)} 
                                    disabled={!profile.age || !profile.grade} 
                                    className="w-full py-8 bg-blue-600 rounded-[3rem] font-black uppercase tracking-[0.3em] text-xs text-white shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition-all disabled:opacity-50"
                                >
                                    Proceed to Roadmaps <ChevronRight className="inline ml-2" size={16} />
                                </button>
                            </motion.div>
                        )}
                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                                <div className="text-center">
                                    <div className="inline-flex p-4 bg-amber-600/10 rounded-3xl mb-6">
                                        <GraduationCap className="text-amber-500" size={32} />
                                    </div>
                                    <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Protocol Selection</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Choose your academic ecosystem</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {systems.map((sys) => (
                                        <motion.div 
                                            key={sys.id} 
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => { 
                                                setProfile({ ...profile, system: sys.id }); 
                                                if (sys.id === 'thanaweya_amma') setStep(3);
                                                else handleGenerate();
                                            }} 
                                            className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all flex items-center gap-6 ${profile.system === sys.id ? sys.color : theme === 'dark' ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]' : 'border-slate-200 bg-white hover:border-blue-500/50'}`}
                                        >
                                            <div className="p-4 bg-white/5 rounded-2xl">{sys.icon}</div>
                                            <div>
                                                <h3 className="text-lg font-black uppercase tracking-tighter italic">{sys.title}</h3>
                                                <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">{sys.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                                <div className="text-center">
                                    <div className="inline-flex p-4 bg-purple-600/10 rounded-3xl mb-6">
                                        <Settings2 className="text-purple-500" size={32} />
                                    </div>
                                    <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Branch Alignment</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Specify your specialization path</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { id: 'science', label: 'Ilmy Oloum (Science)', desc: 'Biology, Geology, Chemistry, and Physics.', color: 'hover:border-green-500/50 hover:bg-green-500/5' },
                                        { id: 'math', label: 'Ilmy Riyada (Mathematics)', desc: 'Pure Mathematics, Applied Math, and Physics.', color: 'hover:border-blue-500/50 hover:bg-blue-500/5' },
                                        { id: 'literature', label: 'Adaby (Literature)', desc: 'History, Geography, Psychology, and Philosophy.', color: 'hover:border-purple-500/50 hover:bg-purple-500/5' }
                                    ].map((branch) => (
                                        <motion.div 
                                            key={branch.id} 
                                            whileHover={{ x: 10 }}
                                            onClick={() => { setProfile({ ...profile, branch: branch.id }); handleGenerate(); }}
                                            className={`p-8 rounded-[3rem] border-2 cursor-pointer transition-all ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-white shadow-xl shadow-blue-500/5'} ${branch.color}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-1">{branch.label}</h3>
                                                    <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">{branch.desc}</p>
                                                </div>
                                                <ChevronRight size={24} className="opacity-20" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        {step === 4 && renderStep4()}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default StudyPath;
