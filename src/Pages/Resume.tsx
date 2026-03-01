import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, User, Briefcase, GraduationCap, 
    Award, Save, Trash2, Download, Plus, 
    Layout, Eye, ChevronLeft, ChevronRight,
    Loader, CheckCircle2, XCircle, Grid
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface ResumeData {
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        summary: string;
    };
    experience: Array<{
        company: string;
        position: string;
        startDate: string;
        endDate: string;
        description: string;
    }>;
    education: Array<{
        school: string;
        degree: string;
        year: string;
    }>;
    skills: string[];
}

interface SavedResume {
    id: string;
    title: string;
    content: ResumeData;
    created_at: string;
}

const Resume: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    
    const [view, setView] = useState<'library' | 'editor'>('library');
    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
    const [resumeTitle, setResumeTitle] = useState('My New Resume');
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [data, setData] = useState<ResumeData>({
        personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
        experience: [],
        education: [],
        skills: []
    });

    useEffect(() => {
        if (user) fetchResumes();
    }, [user]);

    const fetchResumes = async () => {
        setLoading(true);
        try {
            const { data: savedResumes, error } = await supabase
                .from('resumes')
                .select('*')
                .order('updated_at', { ascending: false });
            
            if (error) throw error;
            setResumes(savedResumes || []);
        } catch (err) {
            console.error("Error fetching resumes:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const payload = {
                user_id: user.id,
                title: resumeTitle,
                content: data,
                updated_at: new Date().toISOString()
            };

            if (currentResumeId) {
                const { error } = await supabase
                    .from('resumes')
                    .update(payload)
                    .eq('id', currentResumeId);
                if (error) throw error;
            } else {
                const { data: newResume, error } = await supabase
                    .from('resumes')
                    .insert([payload])
                    .select()
                    .single();
                if (error) throw error;
                setCurrentResumeId(newResume.id);
            }
            
            await fetchResumes();
            showToast("Resume saved successfully!");
        } catch (err: any) {
            showToast("Save failed: " + err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this resume?")) return;
        try {
            const { error } = await supabase.from('resumes').delete().eq('id', id);
            if (error) throw error;
            setResumes(resumes.filter(r => r.id !== id));
            showToast("Resume deleted.");
            if (currentResumeId === id) {
                setView('library');
                setCurrentResumeId(null);
            }
        } catch (err) {
            showToast("Delete failed.", 'error');
        }
    };

    const startNew = () => {
        setData({
            personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
            experience: [],
            education: [],
            skills: []
        });
        setCurrentResumeId(null);
        setResumeTitle('My New Resume');
        setView('editor');
    };

    const editResume = (resume: SavedResume) => {
        setData(resume.content);
        setCurrentResumeId(resume.id);
        setResumeTitle(resume.title);
        setView('editor');
    };

    const addExperience = () => {
        setData({
            ...data,
            experience: [...data.experience, { company: '', position: '', startDate: '', endDate: '', description: '' }]
        });
    };

    const addEducation = () => {
        setData({
            ...data,
            education: [...data.education, { school: '', degree: '', year: '' }]
        });
    };

    const addSkill = (skill: string) => {
        if (!skill.trim()) return;
        setData({ ...data, skills: [...data.skills, skill.trim()] });
    };

    return (
        <div className={`min-h-screen pt-24 pb-12 px-6 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Toasts */}
                <AnimatePresence>
                    {toast && (
                        <motion.div 
                            initial={{ opacity: 0, y: -100, x: '-50%' }}
                            animate={{ opacity: 1, y: 20, x: '-50%' }}
                            exit={{ opacity: 0, y: -100, x: '-50%' }}
                            className={`fixed top-20 left-1/2 z-[2000] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3 ${
                                toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                            }`}
                        >
                            {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />} 
                            {toast.msg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl border shadow-lg ${theme === 'dark' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                <FileText size={32} />
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">Resume Builder</h1>
                        </div>
                        <p className="opacity-40 font-black uppercase tracking-[0.4em] text-[10px] ml-20">Architect your professional identity</p>
                    </div>
                    
                    <div className="flex gap-4">
                        {view === 'editor' ? (
                            <>
                                <button 
                                    onClick={() => setView('library')}
                                    className={`px-6 py-3 rounded-2xl border font-black uppercase text-[10px] tracking-widest transition-all ${
                                        theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2"
                                >
                                    {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                                    Save Resume
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={startNew}
                                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-xl shadow-blue-600/20"
                            >
                                <Plus size={18} />
                                Create New
                            </button>
                        )}
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {view === 'library' ? (
                        <motion.div 
                            key="library"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <Loader className="animate-spin text-blue-500" size={48} />
                                </div>
                            ) : resumes.length === 0 ? (
                                <div className={`p-20 text-center rounded-[3rem] border-2 border-dashed ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                                    <Grid size={48} className="mx-auto mb-6 opacity-20" />
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">No resumes found</h3>
                                    <p className="opacity-40 text-sm font-bold uppercase tracking-widest mb-8">Start architecting your first professional profile</p>
                                    <button onClick={startNew} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Create Resume</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {resumes.map((resume) => (
                                        <motion.div 
                                            key={resume.id}
                                            whileHover={{ y: -5 }}
                                            className={`p-8 rounded-[3rem] border group transition-all ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-blue-500/50' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-blue-50 text-blue-600'}`}>
                                                    <FileText size={24} />
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleDelete(resume.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2 truncate">{resume.title}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-8">Modified {new Date(resume.created_at).toLocaleDateString()}</p>
                                            <button 
                                                onClick={() => editResume(resume)}
                                                className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                                                    theme === 'dark' ? 'bg-white/5 hover:bg-blue-600' : 'bg-slate-100 hover:bg-blue-600 hover:text-white'
                                                }`}
                                            >
                                                Open Editor
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="editor"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {/* Editor Panel */}
                            <div className="space-y-6">
                                <div className={`p-8 rounded-[3rem] border ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4 mb-2 block">Resume Title</label>
                                            <input 
                                                type="text"
                                                value={resumeTitle}
                                                onChange={(e) => setResumeTitle(e.target.value)}
                                                className={`w-full p-5 rounded-2xl border outline-none font-bold ${
                                                    theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-blue-500' : 'bg-slate-50 border-slate-200'
                                                }`}
                                            />
                                        </div>

                                        <div className="pt-6 border-t border-white/5">
                                            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-6"><User size={16} className="text-blue-500" /> Personal Information</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <input 
                                                        placeholder="Full Name"
                                                        value={data.personalInfo.fullName}
                                                        onChange={(e) => setData({...data, personalInfo: {...data.personalInfo, fullName: e.target.value}})}
                                                        className={`w-full p-4 rounded-xl border outline-none text-sm ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50'}`}
                                                    />
                                                </div>
                                                <input 
                                                    placeholder="Email"
                                                    value={data.personalInfo.email}
                                                    onChange={(e) => setData({...data, personalInfo: {...data.personalInfo, email: e.target.value}})}
                                                    className={`w-full p-4 rounded-xl border outline-none text-sm ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50'}`}
                                                />
                                                <input 
                                                    placeholder="Phone"
                                                    value={data.personalInfo.phone}
                                                    onChange={(e) => setData({...data, personalInfo: {...data.personalInfo, phone: e.target.value}})}
                                                    className={`w-full p-4 rounded-xl border outline-none text-sm ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50'}`}
                                                />
                                                <div className="col-span-2">
                                                    <textarea 
                                                        placeholder="Professional Summary"
                                                        rows={3}
                                                        value={data.personalInfo.summary}
                                                        onChange={(e) => setData({...data, personalInfo: {...data.personalInfo, summary: e.target.value}})}
                                                        className={`w-full p-4 rounded-xl border outline-none text-sm resize-none ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50'}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest"><Briefcase size={16} className="text-amber-500" /> Experience</h3>
                                                <button onClick={addExperience} className="p-2 bg-blue-600/10 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Plus size={16} /></button>
                                            </div>
                                            <div className="space-y-4">
                                                {data.experience.map((exp, idx) => (
                                                    <div key={idx} className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input 
                                                                placeholder="Company"
                                                                value={exp.company}
                                                                onChange={(e) => {
                                                                    const newExp = [...data.experience];
                                                                    newExp[idx].company = e.target.value;
                                                                    setData({...data, experience: newExp});
                                                                }}
                                                                className={`w-full p-3 rounded-lg outline-none text-xs ${theme === 'dark' ? 'bg-black/20' : 'bg-white'}`}
                                                            />
                                                            <input 
                                                                placeholder="Position"
                                                                value={exp.position}
                                                                onChange={(e) => {
                                                                    const newExp = [...data.experience];
                                                                    newExp[idx].position = e.target.value;
                                                                    setData({...data, experience: newExp});
                                                                }}
                                                                className={`w-full p-3 rounded-lg outline-none text-xs ${theme === 'dark' ? 'bg-black/20' : 'bg-white'}`}
                                                            />
                                                            <textarea 
                                                                placeholder="Description"
                                                                value={exp.description}
                                                                onChange={(e) => {
                                                                    const newExp = [...data.experience];
                                                                    newExp[idx].description = e.target.value;
                                                                    setData({...data, experience: newExp});
                                                                }}
                                                                className={`col-span-2 w-full p-3 rounded-lg outline-none text-xs resize-none ${theme === 'dark' ? 'bg-black/20' : 'bg-white'}`}
                                                            />
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                const newExp = data.experience.filter((_, i) => i !== idx);
                                                                setData({...data, experience: newExp});
                                                            }}
                                                            className="mt-3 text-[9px] font-black uppercase text-red-500 hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest"><GraduationCap size={16} className="text-purple-500" /> Education</h3>
                                                <button onClick={addEducation} className="p-2 bg-blue-600/10 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Plus size={16} /></button>
                                            </div>
                                            <div className="space-y-4">
                                                {data.education.map((edu, idx) => (
                                                    <div key={idx} className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input 
                                                                placeholder="School/University"
                                                                value={edu.school}
                                                                onChange={(e) => {
                                                                    const newEdu = [...data.education];
                                                                    newEdu[idx].school = e.target.value;
                                                                    setData({...data, education: newEdu});
                                                                }}
                                                                className={`w-full p-3 rounded-lg outline-none text-xs ${theme === 'dark' ? 'bg-black/20' : 'bg-white'}`}
                                                            />
                                                            <input 
                                                                placeholder="Degree"
                                                                value={edu.degree}
                                                                onChange={(e) => {
                                                                    const newEdu = [...data.education];
                                                                    newEdu[idx].degree = e.target.value;
                                                                    setData({...data, education: newEdu});
                                                                }}
                                                                className={`w-full p-3 rounded-lg outline-none text-xs ${theme === 'dark' ? 'bg-black/20' : 'bg-white'}`}
                                                            />
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                const newEdu = data.education.filter((_, i) => i !== idx);
                                                                setData({...data, education: newEdu});
                                                            }}
                                                            className="mt-3 text-[9px] font-black uppercase text-red-500 hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5">
                                            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-6"><Award size={16} className="text-green-500" /> Skills</h3>
                                            <input 
                                                placeholder="Type a skill and press Enter"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        addSkill((e.target as HTMLInputElement).value);
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }}
                                                className={`w-full p-4 rounded-xl border outline-none text-sm mb-4 ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50'}`}
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {data.skills.map((skill, idx) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-blue-600/10 text-blue-500 rounded-lg text-xs font-bold flex items-center gap-2">
                                                        {skill}
                                                        <XCircle 
                                                            size={14} 
                                                            className="cursor-pointer hover:text-red-500" 
                                                            onClick={() => setData({...data, skills: data.skills.filter((_, i) => i !== idx)})}
                                                        />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Panel */}
                            <div className="lg:sticky lg:top-24 h-fit">
                                <div className={`p-12 rounded-[3rem] border shadow-2xl overflow-hidden relative ${theme === 'dark' ? 'bg-white text-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                                    {/* Design Accents */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-bl-[100px]" />
                                    
                                    <div className="relative">
                                        <div className="border-b-4 border-blue-600 pb-8 mb-8">
                                            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">{data.personalInfo.fullName || 'YOUR NAME'}</h2>
                                            <div className="flex flex-wrap gap-4 text-xs font-bold opacity-60">
                                                <span>{data.personalInfo.email || 'email@example.com'}</span>
                                                <span>•</span>
                                                <span>{data.personalInfo.phone || '+1 234 567 890'}</span>
                                                <span>•</span>
                                                <span>{data.personalInfo.location || 'Location, Country'}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            {data.personalInfo.summary && (
                                                <section>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Summary</h4>
                                                    <p className="text-sm leading-relaxed">{data.personalInfo.summary}</p>
                                                </section>
                                            )}

                                            {data.experience.length > 0 && (
                                                <section>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">Experience</h4>
                                                    <div className="space-y-6">
                                                        {data.experience.map((exp, idx) => (
                                                            <div key={idx}>
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <h5 className="font-black text-sm uppercase">{exp.position || 'Position'}</h5>
                                                                    <span className="text-[9px] font-bold opacity-40">{exp.startDate} — {exp.endDate}</span>
                                                                </div>
                                                                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">{exp.company || 'Company Name'}</p>
                                                                <p className="text-xs opacity-70 leading-relaxed whitespace-pre-line">{exp.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

                                            {data.education.length > 0 && (
                                                <section>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">Education</h4>
                                                    <div className="space-y-4">
                                                        {data.education.map((edu, idx) => (
                                                            <div key={idx}>
                                                                <div className="flex justify-between items-start">
                                                                    <h5 className="font-black text-sm uppercase">{edu.degree || 'Degree'}</h5>
                                                                    <span className="text-[9px] font-bold opacity-40">{edu.year}</span>
                                                                </div>
                                                                <p className="text-xs opacity-70">{edu.school || 'University Name'}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

                                            {data.skills.length > 0 && (
                                                <section>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3">Skills</h4>
                                                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                        {data.skills.map((skill, idx) => (
                                                            <span key={idx} className="text-xs font-bold uppercase tracking-wider">• {skill}</span>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center mt-6 text-[10px] font-black uppercase tracking-widest opacity-20 italic">Global Grid Professional Standard Template</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Resume;
