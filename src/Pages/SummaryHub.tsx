import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, Calendar, ArrowLeft, Search, Sparkles, FileText, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface Summary {
    id: string;
    title: string;
    content: string;
    created_at: string;
    profiles: {
        username: string;
        avatar_url: string;
    };
}

const SummaryHub: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
    const { theme } = useTheme();
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSummaries();
    }, []);

    const fetchSummaries = async () => {
        try {
            setLoading(true);
            let textSumms: any[] = [];
            let docSumms: any[] = [];

            // 1. Fetch text-based summaries (resilient)
            try {
                const { data } = await supabase
                    .from('user_summaries')
                    .select('*, profiles(username, avatar_url)')
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false });
                if (data) textSumms = data.map(s => ({ ...s, type: 'text' }));
            } catch (e) { console.warn("Text summaries fetch failed", e); }

            // 2. Fetch document-based summaries (resilient to schema delays)
            try {
                const { data } = await supabase
                    .from('documents')
                    .select('*, profiles:user_id(username, avatar_url)')
                    .eq('is_summary', true)
                    .eq('summary_status', 'approved')
                    .order('created_at', { ascending: false });
                if (data) docSumms = data.map(s => ({ ...s, type: 'document' }));
            } catch (e) { console.warn("Document summaries fetch failed (check schema)", e); }

            const combined = [...textSumms, ...docSumms].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setSummaries(combined);
        } catch (err) {
            console.error("Global fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredSummaries = summaries.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`min-h-screen pt-12 pb-20 px-6 md:px-12 transition-all duration-1000 ${theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <motion.button 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => onNavigate('dashboard')} 
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-all"
                        >
                            <ArrowLeft size={14} /> Back to Command
                        </motion.button>
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-purple-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.3)] rotate-3">
                                <BookOpen className="text-white -rotate-3" size={36} />
                            </div>
                            <div>
                                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-2">Summary Hub</h1>
                                <p className="opacity-40 font-black uppercase tracking-[0.5em] text-[10px]">Student Authored Neural Summaries</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative group w-full md:w-[400px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-500/40 group-focus-within:text-purple-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Summaries..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full border rounded-[2rem] py-5 pl-16 pr-8 text-[10px] font-black uppercase tracking-widest outline-none transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-purple-500/40' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-600'}`}
                        />
                    </div>
                </header>

                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">Syncing Neural Archives</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filteredSummaries.map((summary, i) => (
                                <motion.div 
                                    key={summary.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`p-10 rounded-[4rem] border transition-all duration-500 group relative overflow-hidden ${
                                        theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-purple-500/30 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                                            {summary.type === 'document' ? <BookOpen size={24} /> : <FileText size={24} />}
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-black italic uppercase tracking-tight line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{summary.title}</h3>
                                            <div className="flex items-center gap-2 opacity-40">
                                                <User size={10} />
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-600'}`}>{summary.profiles?.username || 'Anonymous'}</span>
                                                <span className={`px-2 py-0.5 rounded text-[7px] font-black ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-600'}`}>{summary.type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className={`text-sm font-bold opacity-60 leading-relaxed italic line-clamp-4 mb-8 ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                                        {summary.type === 'text' ? `"${summary.content}"` : "This is a detailed document-based summary. Use the action button to explore its full cognitive depth."}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-2 opacity-30">
                                            <Calendar size={12} />
                                            <span className="text-[8px] font-black uppercase">{new Date(summary.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {summary.type === 'document' && (
                                                <button 
                                                    className="p-3 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase"
                                                    onClick={() => onNavigate('reader', summary.id)}
                                                >
                                                    <BookOpen size={16} /> Read
                                                </button>
                                            )}
                                            <button 
                                                className="p-3 bg-purple-600/10 text-purple-500 rounded-xl hover:bg-purple-600 hover:text-white transition-all"
                                                onClick={() => {/* Full view logic if needed */}}
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-1000 group-hover:scale-110 pointer-events-none">
                                        <Sparkles size={150} />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filteredSummaries.length === 0 && (
                    <div className="py-40 text-center space-y-8">
                        <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-[3rem] flex items-center justify-center mx-auto opacity-20">
                            <BookOpen size={48} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter opacity-40">Archive Empty</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20 max-w-sm mx-auto leading-relaxed">
                                No peer-authored summaries have been approved by the Admin yet. 
                                <br/><br/>
                                <span className="text-blue-500/60 font-bold uppercase tracking-widest text-[8px]">Note: Ensure your Admin has accepted pending fragments in the Command Center.</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SummaryHub;
