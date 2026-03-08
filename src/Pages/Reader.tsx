import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, FileText, Type, Maximize2, Minimize2, Share2, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface ReaderProps {
    onNavigate: (p: string) => void;
    documentId?: string;
}

const Reader: React.FC<ReaderProps> = ({ onNavigate, documentId }) => {
    const { theme } = useTheme();
    const [content, setContent] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fontSize, setFontSize] = useState(18);
    const [isFullWidth, setIsFullWidth] = useState(false);

    useEffect(() => {
        if (documentId) fetchSource();
    }, [documentId]);

    const fetchSource = async () => {
        try {
            setLoading(true);
            // 1. Try fetching from documents table
            const { data: docData } = await supabase.from('documents').select('*').eq('id', documentId).maybeSingle();
            
            if (docData) {
                setTitle(docData.title);
                setContent(docData.content);
                setMetadata({ type: 'Document', date: docData.created_at, ext: docData.file_type });
            } else {
                // 2. If not found, try user_summaries table
                const { data: summData } = await supabase.from('user_summaries').select('*').eq('id', documentId).maybeSingle();
                if (summData) {
                    setTitle(summData.title);
                    setContent(summData.content);
                    setMetadata({ type: 'Peer Summary', date: summData.created_at, ext: 'Text' });
                }
            }
        } catch (err) {
            console.error("Reader Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#050505] text-white">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">Establishing Reading Link</p>
        </div>
    );

    if (!content) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#050505] text-white p-10 text-center">
            <ShieldAlert size={48} className="text-red-500" />
            <h2 className="text-2xl font-black uppercase">Fragment Missing</h2>
            <p className="opacity-40 text-xs">This data node could not be retrieved from the neural registry.</p>
            <button onClick={() => onNavigate('documents')} className="px-8 py-4 bg-blue-600 rounded-2xl font-black uppercase text-[10px]">Back to Library</button>
        </div>
    );

    return (
        <div className={`min-h-screen pt-12 pb-20 px-6 md:px-12 transition-all duration-1000 relative overflow-hidden ${theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-slate-50 text-slate-950'}`}>
            
            <div className="max-w-7xl mx-auto mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-8">
                <div className="flex items-center gap-6">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onNavigate('documents')} className={`p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <ArrowLeft size={20} />
                    </motion.button>
                    <div>
                        <div className="flex items-center gap-3 mb-1 text-blue-500 font-black uppercase text-[10px] tracking-widest">
                            <BookOpen size={14} />
                            <span>Neural Reader Protocol v2.4</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">{title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-2xl backdrop-blur-xl">
                    <button onClick={() => setFontSize(prev => Math.max(12, prev - 2))} className="p-3 hover:bg-white/10 rounded-xl transition-all" title="Smaller"><Type size={16} className="scale-75" /></button>
                    <span className="text-[10px] font-black w-8 text-center">{fontSize}</span>
                    <button onClick={() => setFontSize(prev => Math.min(36, prev + 2))} className="p-3 hover:bg-white/10 rounded-xl transition-all" title="Larger"><Type size={16} /></button>
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <button onClick={() => setIsFullWidth(!isFullWidth)} className="p-3 hover:bg-white/10 rounded-xl transition-all" title="Toggle Width">{isFullWidth ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
                </div>
            </div>

            <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`mx-auto transition-all duration-500 ${isFullWidth ? 'max-w-full' : 'max-w-4xl'}`}>
                <div className={`p-12 md:p-20 rounded-[4rem] border leading-relaxed transition-all shadow-2xl relative overflow-hidden ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100'}`} style={{ fontSize: `${fontSize}px` }}>
                    <div className="relative z-10 whitespace-pre-wrap font-serif opacity-90 selection:bg-blue-500/30">
                        {content}
                    </div>
                    <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none text-blue-500"><FileText size={400} /></div>
                </div>

                <footer className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 px-10">
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2"><Clock size={12} /><span>Indexed: {new Date(metadata.date).toLocaleDateString()}</span></div>
                        <div className="w-px h-3 bg-white/20" />
                        <span>Source: {metadata.type}</span>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em]">Archival Interface // Secured Node</p>
                </footer>
            </motion.main>
        </div>
    );
};

export default Reader;
