import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, FileText, Sparkles, Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface WriteSummaryProps {
    onNavigate: (p: string) => void;
    documentId?: string;
}

const WriteSummary: React.FC<WriteSummaryProps> = ({ onNavigate, documentId }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [docTitle, setDocTitle] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (documentId) fetchDocTitle();
    }, [documentId]);

    const fetchDocTitle = async () => {
        const { data } = await supabase.from('documents').select('title').eq('id', documentId).single();
        if (data) setDocTitle(data.title);
    };

    const handleSubmit = async () => {
        if (!title || !content || !user) return;
        setLoading(true);
        setStatus('idle');
        try {
            const { error } = await supabase.from('user_summaries').insert({
                user_id: user.id,
                document_id: documentId,
                title,
                content,
                status: 'pending'
            });

            if (error) throw error;
            setStatus('success');
            setTimeout(() => onNavigate('documents'), 2000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen pt-24 pb-20 px-6 md:px-12 transition-all duration-1000 ${theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className="max-w-4xl mx-auto">
                <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <motion.button 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => onNavigate('documents')} 
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-all"
                        >
                            <ArrowLeft size={14} /> Back to Library
                        </motion.button>
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)] rotate-3">
                                <FileText className="text-white -rotate-3" size={36} />
                            </div>
                            <div>
                                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-2">Write Summary</h1>
                                <p className="opacity-40 font-black uppercase tracking-[0.5em] text-[10px]">
                                    {docTitle ? `Referencing: ${docTitle}` : 'Neural Content Synthesis'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="space-y-8">
                    <div className="p-12 rounded-[4rem] bg-white/5 border border-white/5 backdrop-blur-3xl shadow-2xl space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 ml-6">Summary Title</label>
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-8 bg-black/20 border border-white/5 rounded-[2.5rem] outline-none focus:border-blue-500/50 transition-all font-black uppercase italic text-lg tracking-tight"
                                placeholder="Enter a compelling title..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 ml-6">Neural Synthesis (Content)</label>
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-[400px] p-8 bg-black/20 border border-white/5 rounded-[3rem] outline-none focus:border-blue-500/50 transition-all font-bold text-sm leading-relaxed no-scrollbar resize-none italic"
                                placeholder="Begin your cognitive summary here..."
                            />
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                disabled={loading || !title || !content}
                                className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                                {loading ? 'Submitting to Admin...' : 'Commit to Neural Registry'}
                            </motion.button>
                        </div>

                        {status === 'success' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 justify-center text-emerald-500 font-black uppercase text-[10px] tracking-widest">
                                <CheckCircle2 size={16} /> Summary Submitted. Awaiting Admin Approval.
                            </motion.div>
                        )}
                        {status === 'error' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 justify-center text-red-500 font-black uppercase text-[10px] tracking-widest">
                                <AlertCircle size={16} /> Connection Interrupted. Retry Uplink.
                            </motion.div>
                        )}
                    </div>

                    <div className="p-10 rounded-[3.5rem] bg-orange-600/5 border border-orange-500/10 flex items-center gap-8">
                        <div className="w-16 h-16 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-500 shrink-0">
                            <Sparkles size={28} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black italic uppercase tracking-tighter">Protocol Note</h4>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed">
                                Your summary will be reviewed by the neural oversight committee (Admin). Upon verification, it will be published to the global Sammy Page archives.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WriteSummary;
