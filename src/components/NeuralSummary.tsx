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
    Zap,
    ChevronRight,
    Layers,
    Search,
    X,
    Printer,
    Plus
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface NeuralSummaryProps {
    onNavigate: (page: string, id?: string) => void;
    documentId?: string;
}

const NeuralSummary: React.FC<NeuralSummaryProps> = ({ onNavigate, documentId }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'exam'>('summary');
    const [documents, setDocuments] = useState<any[]>([]);
    const [summariesStatus, setSummariesStatus] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');
    
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (documentId) {
            fetchSummary();
        } else {
            fetchDocuments();
        }
    }, [documentId]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const { data: docs, error: docError } = await supabase
                .from('documents')
                .select('id, title, created_at')
                .order('created_at', { ascending: false });
            
            if (docError) throw docError;

            // Check which ones have summaries
            const { data: existingSummaries } = await supabase
                .from('neural_summaries')
                .select('document_id');
            
            const statusMap: Record<string, boolean> = {};
            existingSummaries?.forEach(s => statusMap[s.document_id] = true);
            
            setSummariesStatus(statusMap);
            setDocuments(docs || []);
        } catch (err) {
            console.error("Error fetching documents:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);
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
                    id: item.id,
                    title: item.title,
                    summary: item.summary_text,
                    quiz: item.quiz_data || [],
                    exam: item.exam_data || []
                });
                setLoading(false);
            } else {
                handleGenerate();
            }
        } catch (err: any) {
            console.error("Fetch summary error:", err);
            setError(`Retrieval Error: ${err.message}`);
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setLoading(true);
        try {
            const { data: doc } = await supabase.from('documents').select('content, title').eq('id', documentId).single();
            if (!doc) throw new Error("Document not found");

            const response = await fetch(`/api/generate-neural-summary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentContent: doc.content,
                    title: doc.title,
                    documentId: documentId,
                    userId: user?.id
                })
            });

            if (!response.ok) throw new Error("Neural Engine failed to respond.");

            const data = await response.json();
            setSummary({
                title: `Neural Summary: ${doc.title}`,
                summary: data.summary,
                quiz: data.quiz || [],
                exam: data.exam || []
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
            setLoading(false);
        }
    };

    const handleGenerateMore = async (type: 'quiz' | 'exam') => {
        setIsGenerating(true);
        try {
            const { data: doc } = await supabase.from('documents').select('content, title').eq('id', documentId).single();
            if (!doc) return;

            const endpoint = type === 'quiz' ? '/api/generate-more-quiz' : '/api/generate-more-exam';
            const existingQuestions = type === 'quiz' 
                ? summary.quiz.map((q: any) => q.question)
                : summary.exam.map((q: any) => q.question);

            const response = await fetch(`${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentContent: doc.content,
                    title: doc.title,
                    existingQuestions,
                    count: 5
                })
            });

            const newQuestions = await response.json();
            const updatedSummary = { ...summary };
            
            if (type === 'quiz') {
                updatedSummary.quiz = [...summary.quiz, ...newQuestions];
            } else {
                updatedSummary.exam = [...summary.exam, ...newQuestions];
            }

            // Save back to Supabase
            await supabase.from('neural_summaries').update({
                quiz_data: updatedSummary.quiz,
                exam_data: updatedSummary.exam,
                updated_at: new Date().toISOString()
            }).eq('document_id', documentId);

            setSummary(updatedSummary);
            alert(`Architected 5 more ${type} nodes.`);
        } catch (err) {
            console.error("Generation failed", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadPDF = async () => {
        if (!printRef.current || isExporting) return;
        
        setIsExporting(true);
        try {
            const element = printRef.current;
            element.style.display = 'block';
            
            // Wait for images/fonts if any
            await new Promise(r => setTimeout(r, 500));

            const canvas = await html2canvas(element, { 
                scale: 1.5, // Reduced scale to prevent memory errors
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 800
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.85); // Use JPEG for smaller size
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${summary?.title.replace(/\s+/g, '_')}_Report.pdf`);
            element.style.display = 'none';
        } catch (err) {
            console.error("PDF Export Error:", err);
            alert("Export protocol failed. Please try a smaller batch or different browser.");
        } finally {
            setIsExporting(false);
        }
    };

    if (loading || (isGenerating && !summary)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 relative z-10">
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className={`p-16 rounded-[4rem] border-2 shadow-2xl flex flex-col items-center ${
                        theme === 'dark' ? 'bg-[#0D0D0D] border-amber-500/20' : 'bg-white border-amber-200'
                    }`}
                >
                    <div className="relative mb-8">
                        <div className="w-24 h-24 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
                        <Sparkles size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-black italic uppercase mb-2 tracking-tighter">Neural Engine</h2>
                    <p className="opacity-40 font-black uppercase text-[10px] tracking-[0.5em]">Synchronizing Intelligence Fragments...</p>
                </motion.div>
            </div>
        );
    }

    if (!documentId) {
        return (
            <div className={`min-h-screen p-8 relative z-10 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <div className="max-w-6xl mx-auto pt-12">
                    <motion.button onClick={() => onNavigate('dashboard')} className="mb-12 flex items-center gap-3 font-black uppercase text-xs tracking-[0.3em] opacity-50 hover:opacity-100 transition-all">
                        <ArrowLeft size={18} /> RETURN TO CORE
                    </motion.button>
                    
                    <header className="mb-20">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20"><Sparkles className="text-amber-500" size={24}/></div>
                           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Analysis Protocol Active</span>
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase mb-6 leading-none">Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Synthesis</span></h1>
                        <p className="text-xl font-bold opacity-40 uppercase tracking-widest max-w-2xl leading-relaxed">Select a neural fragment from your library to initiate deep cognitive analysis and synthesis.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {documents.map((doc, i) => (
                            <motion.button 
                                key={doc.id} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                onClick={() => onNavigate('neuralSummary', doc.id)}
                                className={`text-left p-12 border rounded-[4rem] transition-all group relative overflow-hidden h-full flex flex-col ${
                                    theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-amber-500/40' : 'bg-white border-slate-100 shadow-xl'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className={`p-5 rounded-[2.5rem] transition-all duration-500 ${
                                        summariesStatus[doc.id] 
                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                                        : 'bg-white/5 border border-white/10 text-gray-500 group-hover:bg-amber-500/10 group-hover:text-amber-500'
                                    }`}>
                                        <BookOpen size={28} />
                                    </div>
                                    {summariesStatus[doc.id] && <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[8px] font-black uppercase tracking-widest">Processed</div>}
                                </div>
                                <h3 className="font-black italic uppercase text-2xl mb-3 leading-tight group-hover:text-amber-500 transition-colors">{doc.title}</h3>
                                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mt-auto">Modified: {new Date(doc.created_at).toLocaleDateString()}</p>
                                
                                <div className="absolute -bottom-8 -right-8 opacity-[0.02] group-hover:opacity-[0.08] transition-all duration-700 rotate-12">
                                    <BookOpen size={240} />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-24 pb-20 px-4 md:px-8 transition-colors duration-700 relative z-10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <div className="max-w-6xl mx-auto">
                {/* Dashboard UI */}
                <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <motion.button 
                                whileHover={{ scale: 1.1, x: -5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onNavigate('neuralSummary')}
                                className={`p-5 rounded-3xl border transition-all shadow-xl ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-200'}`}
                            >
                                <ArrowLeft size={24} />
                            </motion.button>
                            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">Synthesis</h1>
                        </div>
                        <div className="flex items-center gap-4 px-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 truncate max-w-lg">UNIT_ID: {summary?.title}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                        <motion.button 
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={downloadPDF}
                            disabled={isExporting}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-4 px-10 py-7 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all disabled:opacity-50 ${
                                theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20' : 'bg-slate-950 text-white hover:bg-black'
                            }`}
                        >
                            {isExporting ? <Loader className="animate-spin" size={20} /> : <Printer size={20} />} 
                            {isExporting ? 'Exporting...' : 'Export Full Intelligence'}
                        </motion.button>
                    </div>
                </header>

                <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                        { id: 'summary', label: 'Synthesis', icon: BookOpen, color: 'amber' },
                        { id: 'quiz', label: 'Neural Quiz', icon: Zap, color: 'blue' },
                        { id: 'exam', label: 'Final Exam', icon: GraduationCap, color: 'purple' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-4 px-10 py-6 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all border shrink-0 ${
                                activeTab === tab.id 
                                ? `bg-${tab.color}-500 border-${tab.color}-500 text-white shadow-2xl shadow-${tab.color}-500/30` 
                                : theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 text-gray-500 hover:bg-white/5' : 'bg-white border-slate-200 text-slate-500'
                            }`}
                        >
                            <tab.icon size={20} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-12 md:p-20 rounded-[5rem] border relative overflow-hidden transition-all ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/5'
                            }`}
                        >
                            {/* Actions overlay for Tabs */}
                            {activeTab !== 'summary' && (
                                <button 
                                    onClick={() => handleGenerateMore(activeTab === 'quiz' ? 'quiz' : 'exam')}
                                    disabled={isGenerating}
                                    className="absolute top-12 right-12 p-5 bg-blue-600/10 text-blue-600 rounded-3xl border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all group flex items-center gap-3"
                                >
                                    {isGenerating ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />}
                                    <span className="text-[9px] font-black uppercase tracking-widest hidden md:block">Architect +5 Nodes</span>
                                </button>
                            )}

                            {activeTab === 'summary' && (
                                <div className="space-y-12">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                            <Sparkles size={24}/>
                                        </div>
                                        <h3 className="text-4xl font-black italic uppercase tracking-tighter">Deep Synthesis Output</h3>
                                    </div>
                                    <div className={`text-xl md:text-2xl leading-relaxed whitespace-pre-wrap font-serif tracking-tight opacity-80 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-800'}`}>
                                        {summary?.summary}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'quiz' && (
                                <div className="space-y-12">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                            <Zap size={24}/>
                                        </div>
                                        <h3 className="text-4xl font-black italic uppercase tracking-tighter">Cognitive Recall Batch</h3>
                                    </div>
                                    <div className="grid gap-8">
                                        {summary?.quiz?.map((q: any, i: number) => (
                                            <div key={i} className={`p-10 rounded-[3.5rem] border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                                                <div className="flex items-start gap-6 mb-8">
                                                    <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shrink-0">{i+1}</span>
                                                    <h4 className="text-2xl font-black italic tracking-tight leading-tight pt-1">{q.question}</h4>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-16">
                                                    {q.options?.map((opt: string, oi: number) => (
                                                        <div key={oi} className={`p-5 rounded-2xl border text-sm font-bold transition-all ${opt === q.answer ? 'bg-green-500 text-white border-green-500 shadow-lg' : 'bg-white/5 border-white/10 opacity-50'}`}>{opt}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'exam' && (
                                <div className="space-y-12">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                                            <GraduationCap size={24}/>
                                        </div>
                                        <h3 className="text-4xl font-black italic uppercase tracking-tighter">Mastery Assessment</h3>
                                    </div>
                                    <div className="grid gap-10">
                                        {summary?.exam?.map((q: any, i: number) => (
                                            <div key={i} className={`p-10 rounded-[3.5rem] border relative overflow-hidden ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                                                <div className="flex items-start gap-6 mb-8">
                                                    <span className="text-purple-500 font-black text-xs uppercase tracking-[0.4em] pt-2">PROTOCOL {i+1}</span>
                                                    <h4 className="text-2xl font-black italic tracking-tight leading-tight flex-1">{q.question}</h4>
                                                </div>
                                                {q.options && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-16">
                                                        {q.options.map((opt: string, oi: number) => (
                                                            <div key={oi} className={`p-5 rounded-2xl border text-sm font-bold transition-all ${opt === q.answer ? 'bg-purple-600 text-white border-purple-500' : 'bg-white/5 border-white/10 opacity-50'}`}>{opt}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                )}
                                </motion.div>
                                </AnimatePresence>
                                </div>

                                {/* --- PRINT TEMPLATE --- */}
                                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                                <div ref={printRef} className="p-20 bg-white text-slate-900" style={{ width: '1000px', fontFamily: 'serif' }}>
                                <div className="border-b-[12px] border-slate-950 pb-12 mb-20">
                                <div className="flex justify-between items-end mb-8">
                                <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">Neural <br/> Intelligence <br/> Report</h1>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Protocol Reference</p>
                                    <p className="text-2xl font-black italic uppercase tracking-tighter">{summary?.title}</p>
                                </div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.5em] opacity-30">
                                <span>Core Analysis v2.4</span>
                                <span>Captured: {new Date().toLocaleString()}</span>
                                </div>
                                </div>

                                <section className="mb-24">
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-10 border-b-2 border-slate-100 pb-4 flex items-center gap-4">
                                <span className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white text-lg font-black italic">I</span> 
                                Academic Synthesis
                                </h2>
                                <div className="text-2xl leading-relaxed whitespace-pre-wrap pl-10 border-l-8 border-amber-50 text-slate-700">{summary?.summary}</div>
                                </section>

                                <div style={{ pageBreakAfter: 'always' }} />

                                <section className="mb-24">
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-10 border-b-2 border-slate-100 pb-4 flex items-center gap-4">
                                <span className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-black italic">II</span> 
                                Recall Validation
                                </h2>
                                <div className="space-y-12 pl-10">
                                {summary?.quiz?.map((q: any, i: number) => (
                                    <div key={i}>
                                        <p className="text-2xl font-black mb-6">{i+1}. {q.question}</p>
                                        <div className="grid grid-cols-2 gap-6">
                                            {q.options?.map((opt: string, oi: number) => (
                                                <div key={oi} className={`p-6 border-2 rounded-[2rem] text-sm font-bold ${opt === q.answer ? 'bg-green-50 border-green-200 text-green-800' : 'opacity-30 border-slate-100'}`}>{opt}</div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                </div>
                                </section>

                                <div style={{ pageBreakAfter: 'always' }} />

                                <section>
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-10 border-b-2 border-slate-100 pb-4 flex items-center gap-4">
                                <span className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-black italic">III</span> 
                                Mastery Assessment
                                </h2>
                                <div className="space-y-12 pl-10">
                                {summary?.exam?.map((q: any, i: number) => (
                                    <div key={i}>
                                        <p className="text-2xl font-black mb-6">{i+1}. {q.question}</p>
                                        {q.options && (
                                            <div className="grid grid-cols-2 gap-6">
                                                {q.options.map((opt: string, oi: number) => (
                                                    <div key={oi} className={`p-6 border-2 rounded-[2rem] text-sm font-bold ${opt === q.answer ? 'bg-purple-50 border-purple-200 text-purple-800' : 'opacity-30 border-slate-100'}`}>{opt}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                </div>
                                </section>

                                <footer className="mt-40 pt-12 border-t text-center text-[10px] font-black uppercase tracking-[0.8em] opacity-20">
                                Neural Intelligence Grid // Proctored Generation v2.4
                                </footer>
                                </div>
                                </div>
            </div>
        </div>
    );
};

export default NeuralSummary;
