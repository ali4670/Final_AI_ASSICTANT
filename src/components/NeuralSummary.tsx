import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
    Sparkles, 
    FileText, 
    Download, 
    ArrowLeft, 
    Loader, 
    BookOpen, 
    GraduationCap, 
    CheckCircle2,
    ShieldCheck,
    AlertCircle,
    Zap
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface NeuralSummaryProps {
    onNavigate: (page: string) => void;
    documentId?: string;
}

const NeuralSummary: React.FC<NeuralSummaryProps> = ({ onNavigate, documentId }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'exam'>('summary');
    const pdfRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (documentId) {
            fetchSummary();
        } else {
            setError("No document selected for analysis.");
            setLoading(false);
        }
    }, [documentId]);

    const fetchSummary = async (retryCount = 0) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('neural_summaries')
                .select('*')
                .eq('document_id', documentId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                const item = data[0];
                setSummary({
                    title: item.title,
                    summary: item.summary_text,
                    quiz: item.quiz_data,
                    exam: item.exam_data
                });
                setLoading(false);
            } else if (retryCount < 3) {
                // Wait and retry - Supabase might be slow
                console.log(`Summary not found, retrying... (${retryCount + 1})`);
                setTimeout(() => fetchSummary(retryCount + 1), 2000);
            } else {
                setError("No summary found for this document. Please generate it from the library.");
                setLoading(false);
            }
        } catch (err: any) {
            console.error("Fetch summary error details:", err);
            setError(`Retrieval Error: ${err.message || 'Check connection'}`);
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (!pdfRef.current) return;
        const element = pdfRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const data = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
        
        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${summary?.title || 'Neural_Summary'}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6">
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="p-8 bg-amber-500/10 rounded-[3rem] border-2 border-amber-500/20"
                >
                    <Sparkles size={48} className="text-amber-500" />
                </motion.div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Synthesizing Neural Data</h2>
                    <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.4em]">Optimizing academic fragments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <div className="p-10 rounded-[4rem] bg-red-500/5 border border-red-500/10 text-center space-y-6 max-w-md">
                    <AlertCircle size={48} className="text-red-500 mx-auto" />
                    <h2 className="text-2xl font-black italic uppercase tracking-tight">{error}</h2>
                    <button 
                        onClick={() => onNavigate('documents')}
                        className="w-full py-5 bg-red-500 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-500/20"
                    >
                        Return to Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-24 pb-20 px-4 md:px-8 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <motion.button 
                                whileHover={{ scale: 1.1, x: -5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onNavigate('documents')}
                                className={`p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}
                            >
                                <ArrowLeft size={20} />
                            </motion.button>
                            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">Neural Summary</h1>
                        </div>
                        <p className="opacity-40 font-black uppercase tracking-[0.4em] text-[10px] ml-16">Unit Identification: {summary?.title}</p>
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={downloadPDF}
                        className="flex items-center gap-3 px-8 py-5 bg-amber-500 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-amber-500/30 hover:bg-amber-600 transition-all"
                    >
                        <Download size={18} /> Export Neural PDF
                    </motion.button>
                </header>

                {/* Navigation Tabs */}
                <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                        { id: 'summary', label: 'Synthesis', icon: BookOpen, color: 'amber' },
                        { id: 'quiz', label: 'Neural Quiz', icon: Zap, color: 'blue' },
                        { id: 'exam', label: 'Final Exam', icon: GraduationCap, color: 'purple' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all border shrink-0 ${
                                activeTab === tab.id 
                                ? `bg-${tab.color}-500 border-${tab.color}-500 text-white shadow-xl` 
                                : theme === 'dark' ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-white border-slate-200 text-slate-500'
                            }`}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-10 rounded-[4rem] border transition-all ${
                        theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-xl shadow-blue-500/5'
                    }`}
                    ref={pdfRef}
                >
                    {activeTab === 'summary' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 opacity-30">
                                <Sparkles size={16} className="text-amber-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Synthesis Output</span>
                            </div>
                            <div className={`prose prose-invert max-w-none ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                                <div className="text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                    {summary?.summary}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'quiz' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 opacity-30">
                                    <Zap size={16} className="text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Retention Check (Quiz)</span>
                                </div>
                                <span className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest">{summary?.quiz?.length} Questions</span>
                            </div>
                            
                            <div className="grid gap-6">
                                {summary?.quiz?.map((q: any, i: number) => (
                                    <div key={i} className={`p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex items-start gap-4 mb-6">
                                            <span className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-sm shrink-0">{i + 1}</span>
                                            <h4 className="text-xl font-black italic tracking-tight leading-tight">{q.question}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
                                            {q.options?.map((opt: string, oi: number) => (
                                                <div key={oi} className={`p-4 rounded-2xl border text-sm font-bold transition-all ${
                                                    opt === q.answer 
                                                    ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                                                    : theme === 'dark' ? 'bg-white/5 border-white/10 opacity-60' : 'bg-white border-slate-200 opacity-60'
                                                }`}>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                        {q.explanation && (
                                            <div className="mt-6 ml-14 p-4 rounded-2xl bg-blue-500/5 text-blue-500 text-[11px] font-bold italic border border-blue-500/10">
                                                Neural Insight: {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'exam' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 opacity-30">
                                    <GraduationCap size={16} className="text-purple-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Mastery Assessment (Exam)</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    <ShieldCheck size={14} /> PROCTORED MODE
                                </div>
                            </div>

                            <div className="grid gap-8">
                                {summary?.exam?.map((q: any, i: number) => (
                                    <div key={i} className={`p-8 rounded-[3rem] border relative overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <GraduationCap size={80} />
                                        </div>
                                        <div className="flex items-start gap-4 mb-6">
                                            <span className="text-purple-500 font-black text-xs uppercase tracking-widest pt-1">Task {i + 1}</span>
                                            <h4 className="text-xl font-black italic tracking-tight leading-tight">{q.question}</h4>
                                        </div>
                                        
                                        {q.options ? (
                                            <div className="grid grid-cols-1 gap-3 ml-14">
                                                {q.options.map((opt: string, oi: number) => (
                                                    <div key={oi} className={`p-4 rounded-2xl border text-sm font-bold transition-all ${
                                                        opt === q.answer 
                                                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-500' 
                                                        : theme === 'dark' ? 'bg-white/5 border-white/10 opacity-60' : 'bg-white border-slate-200 opacity-60'
                                                    }`}>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="ml-14 p-4 rounded-2xl border-2 border-dashed border-purple-500/20 text-purple-500/50 font-black text-[10px] uppercase tracking-widest text-center">
                                                Free Response Input Buffer
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Footer Info */}
                <footer className="mt-12 text-center opacity-30">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em]">Neural Intelligence Engine v2.4 • PDF Rendering Enabled</p>
                </footer>
            </div>
        </div>
    );
};

export default NeuralSummary;
