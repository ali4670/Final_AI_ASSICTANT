import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { parseFile } from '../lib/fileParser';
import { ArrowLeft, FileText, Trash2, MessageSquare, CreditCard, Brain, Loader, FileUp, Search, Plus, FileCode, AlertCircle, Sparkles, CheckCircle2, ChevronRight, Camera, Users, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { StudentLibrarian } from './AnimatedVisual';
import { translations } from '../utils/translations';
import StudyProcessor from './StudyProcessor';

export default function Documents({ onNavigate }: { onNavigate: (p: string, id?: string) => void }) {
  const { user } = useAuth();
  const { theme, language } = useTheme();
  const t = translations[language].library;
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSummary, setIsSummary] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => { fetchDocs(); }, [user]);

  const fetchDocs = async () => {
    if (!supabase || !user) return;
    try {
      setLoading(true);
      // Logic: Show user's own docs OR public documents that are APPROVED summaries
      // Or just standard public docs.
      // Filter handled by RLS mostly, but we can refine here.
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setDocs(data);
    } catch (err: any) {
      setErrorMsg("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(20);
    try {
      const res = await parseFile(file);
      setUploadProgress(80);
      setTitle(file.name);
      setContent(res.content);
      setUploadProgress(100);
    } catch (err: any) { 
        alert(err.message); 
        setUploadProgress(0);
    }
    setUploading(false);
  };

  const saveToDB = async () => {
    if (!supabase) return;
    setUploading(true);
    try {
        const { data, error } = await supabase.from('documents').insert([{
            user_id: user?.id, 
            title, 
            content, 
            file_type: title.split('.').pop(), 
            is_public: isSummary ? true : isPublic,
            is_summary: isSummary,
            summary_status: isSummary ? 'pending' : 'approved'
        }]).select().single();
        
        if (error) throw error;

        if (data) { 
            setDocs([data, ...docs]); 
            setTitle(''); 
            setContent(''); 
            setIsPublic(false);
            setIsSummary(false);
            setSuccessMsg(isSummary ? "Summary submitted for review." : "Document committed.");
            setTimeout(() => setSuccessMsg(null), 3000);
            
            // Indexing
            try {
                await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/index-document`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documentId: data.id, content: data.content, userId: user?.id }),
                });
            } catch (err) { console.error("Indexing failed", err); }
        }
    } catch (err: any) {
        alert(err.message);
    } finally {
        setUploading(false);
    }
  };

  const generateCards = async (doc: any) => {
    if (!supabase) return;
    setGenerating(doc.id);
    try {
      const response = await fetch(`/api/generate-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentContent: doc.content, title: doc.title, documentId: doc.id }),
      });
      if (!response.ok) throw new Error('Failed');
      const aiCards = await response.json();
      await supabase.from('flashcards').insert(aiCards.map((c: any) => ({
        ...c, user_id: user?.id, document_id: doc.id, difficulty: 'easy'
      })));
      setSuccessMsg(`Generated ${aiCards.length} cards.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      onNavigate('flashcards', doc.id);
    } catch (err) { alert("Generation error"); }
    setGenerating(null);
  };

  const generateNeuralSummary = async (doc: any) => {
    if (!supabase) return;
    setGenerating(doc.id);
    try {
      const response = await fetch(`/api/generate-neural-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentContent: doc.content, title: doc.title, documentId: doc.id, userId: user?.id }),
      });
      if (!response.ok) throw new Error('AI Error');
      const data = await response.json();
      await supabase.from('neural_summaries').insert([{
          user_id: user?.id,
          document_id: doc.id,
          title: `Neural Summary: ${doc.title}`,
          summary_text: data.summary,
          quiz_data: data.quiz,
          exam_data: data.exam
      }]);
      setSuccessMsg(`Analysis complete.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      onNavigate('neuralSummary', doc.id);
    } catch (err: any) { alert(`Error: ${err.message}`); }
    setGenerating(null);
  };

  const filtered = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  return (
      <div className={`min-h-[calc(100vh-64px)] transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        <nav className={`sticky top-0 z-[40] border-b p-4 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-700 ${
            theme === 'dark' ? 'bg-black/20 border-white/5 backdrop-blur-xl' : 'bg-white/80 border-blue-100 backdrop-blur-xl'
        }`}>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onNavigate('dashboard')} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-white' : 'hover:bg-blue-50 text-slate-600'}`}>
                <ArrowLeft className={language === 'ar' ? 'rotate-180' : ''} />
            </motion.button>
            <h1 className="font-black italic tracking-tighter uppercase text-xl">{t.title}</h1>
          </div>
          <div className="relative w-full md:w-64">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 opacity-40`} size={16} />
            <input placeholder={t.placeholder} className={`${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-full text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'dark' ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border-slate-200 shadow-sm'}`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </nav>

        <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          <AnimatePresence>
            {successMsg && (
                <motion.div initial={{ opacity: 0, y: -100, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -100, x: '-50%' }} className="fixed top-20 left-1/2 z-[100] bg-green-600 text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3">
                    <CheckCircle2 size={16} /> {successMsg}
                </motion.div>
            )}
          </AnimatePresence>

          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`lg:col-span-4 p-8 rounded-[2.5rem] border h-fit sticky top-24 transition-all ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-blue-100 shadow-xl'}`}>
            <h2 className="font-black italic uppercase tracking-tight mb-6 flex items-center gap-2 text-lg"><FileUp size={20} className="text-blue-600"/> {t.upload}</h2>
            
            <label className={`border-2 border-dashed rounded-[2rem] h-56 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-400'}`}>
              {uploading ? (
                <div className="flex flex-col items-center gap-4 w-full px-8">
                    <Loader className="animate-spin text-blue-600" />
                    <div className="w-full bg-blue-200/20 h-1.5 rounded-full overflow-hidden">
                        <motion.div className="bg-blue-600 h-full" animate={{ width: `${uploadProgress}%` }} />
                    </div>
                </div>
              ) : (
                <>
                    <div className="p-5 bg-blue-600/10 rounded-2xl mb-4"><Plus className="text-blue-600" size={28}/></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">PDF, Word, TXT</p>
                </>
              )}
              <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt" />
            </label>

            <AnimatePresence>
                {content && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-8 space-y-5 overflow-hidden">
                        <div className="space-y-2">
                            <label className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Document Title</label>
                            <input className={`w-full p-5 rounded-2xl text-sm outline-none border transition-all font-bold ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'}`} value={title} onChange={e => setTitle(e.target.value)} />
                        </div>

                        {/* Summary Toggle */}
                        <div className={`p-4 rounded-2xl border transition-all ${isSummary ? 'border-purple-500/50 bg-purple-500/5' : theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                            <label className="flex items-center justify-between cursor-pointer group" onClick={() => setIsSummary(!isSummary)}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSummary ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        <BookOpen size={18} />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Identify as Summary</p>
                                        <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Submit for Peer Library</p>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isSummary ? 'bg-purple-600' : 'bg-slate-300'}`}>
                                    <motion.div animate={{ x: isSummary ? 26 : 2 }} className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md" />
                                </div>
                            </label>
                        </div>

                        {!isSummary && (
                            <div className={`p-4 rounded-2xl border transition-all ${isPublic ? 'border-green-500/50 bg-green-500/5' : theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                <label className="flex items-center justify-between cursor-pointer group" onClick={() => setIsPublic(!isPublic)}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPublic ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Make Public</p>
                                            <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Share with everyone</p>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isPublic ? 'bg-green-500' : 'bg-slate-300'}`}>
                                        <motion.div animate={{ x: isPublic ? 26 : 2 }} className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md" />
                                    </div>
                                </label>
                            </div>
                        )}

                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveToDB} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">
                            {isSummary ? 'Submit Summary' : t.commit}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.aside>

          <section className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center">
                        <StudentLibrarian />
                        <Loader className="animate-spin text-blue-600 mt-6" size={32} />
                    </div>
                ) : filtered.length > 0 ? (
                    <AnimatePresence>
                        {filtered.map((doc, i) => (
                        <motion.div key={doc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`p-8 rounded-[3.5rem] border transition-all group relative overflow-hidden ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-100 shadow-xl'}`}>
                        <div className="flex justify-between mb-8 relative z-10">
                            <div className={`p-4 rounded-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-white/5 text-blue-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                {doc.is_summary ? <BookOpen size={24} /> : <FileText size={24} />}
                            </div>
                            <div className="flex items-center gap-2">
                                {doc.is_summary && (
                                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${doc.summary_status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                        {doc.summary_status}
                                    </span>
                                )}
                                <motion.button whileHover={{ scale: 1.2, color: '#ef4444' }} onClick={async () => { if(confirm('Delete?')) { await supabase.from('documents').delete().eq('id', doc.id); fetchDocs(); }}} className="text-slate-400 p-2"><Trash2 size={20} /></motion.button>
                            </div>
                        </div>
                        <h3 className={`font-black italic uppercase text-xl line-clamp-1 mb-2 relative z-10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{doc.title}</h3>
                        <p className={`text-[10px] font-black uppercase opacity-30 mb-10 relative z-10 ${theme === 'dark' ? 'text-white' : 'text-slate-600'}`}>{doc.is_summary ? 'Summary Hub Fragment' : 'Document Fragment'}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10">
                            <button onClick={() => onNavigate('reader', doc.id)} className={`p-4 rounded-[1.5rem] transition-all flex flex-col items-center gap-2 ${theme === 'dark' ? 'bg-white/5 hover:bg-emerald-600' : 'bg-slate-100 hover:bg-emerald-600 hover:text-white'}`}><BookOpen size={18} /><span className="text-[9px] font-black uppercase">Read</span></button>
                            <button onClick={() => onNavigate('chat', doc.id)} className={`p-4 rounded-[1.5rem] transition-all flex flex-col items-center gap-2 ${theme === 'dark' ? 'bg-white/5 hover:bg-blue-600' : 'bg-slate-100 hover:bg-blue-600 hover:text-white'}`}><MessageSquare size={18} /><span className="text-[9px] font-black uppercase">Chat</span></button>
                            <button onClick={() => generateCards(doc)} className={`p-4 rounded-[1.5rem] transition-all flex flex-col items-center gap-2 ${theme === 'dark' ? 'bg-white/5 hover:bg-indigo-600' : 'bg-slate-100 hover:bg-indigo-600 hover:text-white'}`}><CreditCard size={18} /><span className="text-[9px] font-black uppercase">Cards</span></button>
                            <button onClick={() => onNavigate('quizzes', doc.id)} className={`p-4 rounded-[1.5rem] transition-all flex flex-col items-center gap-2 ${theme === 'dark' ? 'bg-white/5 hover:bg-purple-600' : 'bg-slate-100 hover:bg-purple-600 hover:text-white'}`}><Brain size={18} /><span className="text-[9px] font-black uppercase">Quiz</span></button>
                            <button onClick={() => generateNeuralSummary(doc)} className={`p-4 rounded-[1.5rem] transition-all flex flex-col items-center gap-2 ${theme === 'dark' ? 'bg-white/5 hover:bg-amber-600' : 'bg-slate-100 hover:bg-amber-600 hover:text-white'}`}><Sparkles size={18} /><span className="text-[9px] font-black uppercase">Auto</span></button>
                        </div>
                        </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="col-span-full py-24 text-center">
                      <StudentLibrarian />
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter opacity-40 mt-8">Library Empty</h3>
                    </div>
                )}
            </div>
          </section>
        </main>
      </div>
  );
}
