import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { parseFile } from '../lib/fileParser';
import { ArrowLeft, FileText, Trash2, MessageSquare, CreditCard, Brain, Loader, FileUp, Search, Plus, FileCode, AlertCircle, Sparkles, CheckCircle2, ChevronRight, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { StudentLibrarian } from './AnimatedVisual';
import { translations } from '../utils/translations';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => { fetchDocs(); }, [user]);

  const fetchDocs = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setDocs(data);
    } catch (err: any) {
      setErrorMsg("Failed to load documents. Please check your connection.");
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
    const { data, error } = await supabase.from('documents').insert([{
      user_id: user?.id, title, content, file_type: title.split('.').pop()
    }]).select().single();
    
    if (!error && data) { 
      setDocs([data, ...docs]); 
      setTitle(''); 
      setContent(''); 
      setSuccessMsg("Document committed successfully.");
      setTimeout(() => setSuccessMsg(null), 3000);
      
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/index-document`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: data.id, content: data.content, userId: user?.id }),
        });
      } catch (err) {
        console.error("Indexing failed", err);
      }
    }
    else alert(error.message);
    setUploading(false);
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

      if (!response.ok) throw new Error('Failed to generate cards');
      
      const aiCards = await response.json();

      await supabase.from('flashcards').insert(aiCards.map((c: any) => ({
        ...c, user_id: user?.id, document_id: doc.id, difficulty: 'easy'
      })));

      setSuccessMsg(`Generated ${aiCards.length} neural cards.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      onNavigate('flashcards', doc.id);
    } catch (err) { 
      console.error('Generation error:', err);
      alert("Server Error during flashcard generation"); 
    }
    setGenerating(null);
  };

  const generateNeuralSummary = async (doc: any) => {
    if (!supabase) return;
    setGenerating(doc.id);
    try {
      // Use relative path to utilize Vite Proxy
      const response = await fetch(`/api/generate-neural-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentContent: doc.content, title: doc.title, documentId: doc.id, userId: user?.id }),
      });

      if (!response.ok) {
        let errMsg = 'Neural Engine failure';
        try {
          const errorData = await response.json();
          errMsg = errorData.error || errMsg;
        } catch (e) {
          if (response.status === 404) {
            errMsg = "Neural Engine route not found (404). Please restart your server with 'npm run dev'.";
          } else if (response.status === 504 || response.status === 502) {
            errMsg = "Neural Engine is offline or timed out. Ensure 'node server/index.js' is running.";
          } else {
            errMsg = `Communication error (Status: ${response.status}).`;
          }
        }
        throw new Error(errMsg);
      }
      
      const data = await response.json();
      
      // Save to Supabase from the client side (where the user is authenticated)
      const { error: dbError } = await supabase.from('neural_summaries').insert([{
          user_id: user?.id,
          document_id: doc.id,
          title: `Neural Summary: ${doc.title}`,
          summary_text: data.summary,
          quiz_data: data.quiz,
          exam_data: data.exam
      }]);

      if (dbError) {
          console.error("Database Save Error:", dbError);
          throw new Error("Analysis complete, but failed to save to your library. Check connection.");
      }

      setSuccessMsg(`Neural analysis complete.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      onNavigate('neuralSummary', doc.id);
    } catch (err: any) { 
      console.error('Neural Analysis Error:', err);
      alert(`Neural Engine error: ${err.message}`); 
    }
    setGenerating(null);
  };

  const filtered = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  return (
      <div className={`min-h-[calc(100vh-64px)] transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        <nav className={`sticky top-0 z-[40] border-b p-4 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-700 ${
            theme === 'dark' ? 'bg-black/20 border-white/5 backdrop-blur-xl' : 'bg-white/80 border-blue-100 backdrop-blur-xl'
        }`}>
          <div className="flex items-center gap-3">
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigate('dashboard')} 
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-white' : 'hover:bg-blue-50 text-slate-600'}`}
            >
                <ArrowLeft className={language === 'ar' ? 'rotate-180' : ''} />
            </motion.button>
            <h1 className={`font-black italic tracking-tighter uppercase text-xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t.title}</h1>
          </div>
          <div className="relative w-full md:w-64">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} size={16} />
            <input 
                placeholder={t.placeholder}
                className={`${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-full text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    theme === 'dark' ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
                value={search} 
                onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </nav>

        <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          {/* Toasts */}
          <AnimatePresence>
            {successMsg && (
                <motion.div 
                    initial={{ opacity: 0, y: -100, x: '-50%' }}
                    animate={{ opacity: 1, y: 20, x: '-50%' }}
                    exit={{ opacity: 0, y: -100, x: '-50%' }}
                    className="fixed top-20 left-1/2 z-[100] bg-green-600 text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3"
                >
                    <CheckCircle2 size={16} /> {successMsg}
                </motion.div>
            )}
          </AnimatePresence>

          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:col-span-4 p-8 rounded-[2.5rem] border h-fit sticky top-24 transition-all ${
                theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-blue-100 shadow-xl shadow-blue-500/5'
            }`}
          >
            <h2 className={`font-black italic uppercase tracking-tight mb-6 flex items-center gap-2 text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <FileUp size={20} className="text-blue-600"/> {t.upload}
            </h2>
            <label className={`border-2 border-dashed rounded-[2rem] h-56 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden ${
                theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-400'
            }`}>
              {uploading ? (
                <div className="flex flex-col items-center gap-4 w-full px-8">
                    <Loader className="animate-spin text-blue-600" />
                    <div className="w-full bg-blue-200/20 h-1.5 rounded-full overflow-hidden">
                        <motion.div className="bg-blue-600 h-full" animate={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'opacity-40' : 'text-blue-600'}`}>Parsing Stream {uploadProgress}%</p>
                </div>
              ) : (
                <>
                    <div className="p-5 bg-blue-600/10 rounded-2xl mb-4">
                        <Plus className="text-blue-600" size={28}/>
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>PDF, Word, Excel, TXT</p>
                </>
              )}
              <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt" />
            </label>
            <AnimatePresence>
                {content && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-8 space-y-5 overflow-hidden"
                    >
                        <div className="space-y-2">
                            <label className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'opacity-50' : 'text-slate-500'}`}>Document Title</label>
                            <input 
                                className={`w-full p-5 rounded-2xl text-sm outline-none border transition-all font-bold ${
                                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5'
                                }`}
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                            />
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={saveToDB} 
                            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
                        >
                            {t.commit}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6 px-2 text-center">Architect Tools</h3>
                
                <motion.button 
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => onNavigate('vision')}
                    className={`w-full p-6 rounded-3xl border flex items-center justify-between transition-all ${
                        theme === 'dark' ? 'bg-blue-600/10 border-blue-500/30 hover:bg-blue-600/20' : 'bg-blue-50 border-blue-100 hover:bg-blue-100'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
                            <Camera size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black uppercase tracking-widest">Camera Uplink</p>
                            <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest text-blue-500">Scan physical notes</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="opacity-20" />
                </motion.button>

                <motion.button 
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => onNavigate('resume')}
                    className={`w-full p-6 rounded-3xl border flex items-center justify-between transition-all ${
                        theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-blue-500/50' : 'bg-slate-50 border-slate-200 hover:border-blue-600'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/10 text-blue-600 rounded-xl">
                            <FileText size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black uppercase tracking-widest">Resume Builder</p>
                            <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Architect Neural CV</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="opacity-20" />
                </motion.button>
            </div>
          </motion.aside>

          <section className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
                {errorMsg && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="col-span-full bg-red-500/10 border border-red-500/20 text-red-600 p-5 rounded-3xl flex items-center gap-4 shadow-lg shadow-red-500/5"
                    >
                    <AlertCircle size={24} />
                    <p className="font-bold text-sm uppercase tracking-tight">{errorMsg}</p>
                    <button onClick={() => { setErrorMsg(null); fetchDocs(); }} className="ml-auto text-[10px] font-black uppercase underline tracking-widest hover:text-red-700">Retry Link</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="col-span-full py-20 flex flex-col items-center">
                    <StudentLibrarian />
                    <div className="flex flex-col items-center gap-3 mt-6">
                        <Loader className="animate-spin text-blue-600" size={32} />
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'opacity-40' : 'text-slate-500'}`}>Indexing local data fragments...</p>
                    </div>
                </div>
            ) : filtered.length > 0 ? (
                <AnimatePresence>
                    {filtered.map((doc, i) => (
                    <motion.div 
                        key={doc.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className={`p-8 rounded-[3.5rem] border transition-all group relative overflow-hidden ${
                            theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-blue-500/30 shadow-2xl' : 'bg-white border-slate-100 hover:shadow-2xl shadow-blue-500/5 hover:border-blue-200'
                        }`}
                    >
                    <div className="flex justify-between mb-8 relative z-10">
                        <div className={`p-4 rounded-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-white/5 text-blue-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white shadow-inner'}`}>
                        {doc.title.endsWith('.pdf') ? <FileText size={24} /> : <FileCode size={24} />}
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.2, color: '#ef4444' }}
                            onClick={async () => { if(supabase && confirm('Erase this data from library?')) { await supabase.from('documents').delete().eq('id', doc.id); fetchDocs(); }}} 
                            className="text-slate-400 p-2 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <Trash2 size={20} />
                        </motion.button>
                    </div>
                    <h3 className={`font-black italic tracking-tighter uppercase text-xl line-clamp-1 mb-2 relative z-10 transition-colors ${theme === 'dark' ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>{doc.title}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-10 relative z-10 ${theme === 'dark' ? 'opacity-30' : 'text-slate-400'}`}>Data Object v1.0</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                        <button onClick={() => onNavigate('chat', doc.id)} className={`p-4 rounded-[1.5rem] flex flex-col items-center gap-2 transition-all ${
                            theme === 'dark' ? 'bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white' : 'bg-slate-50 hover:bg-blue-600 text-slate-500 hover:text-white shadow-sm'
                        }`}>
                            <MessageSquare size={18} /><span className="text-[9px] font-black uppercase tracking-widest">{language === 'ar' ? 'دردشة' : 'Chat'}</span>
                        </button>
                        <button 
                            onClick={() => generateCards(doc)} 
                            disabled={!!generating} 
                            className={`p-4 rounded-[1.5rem] flex flex-col items-center gap-2 transition-all ${
                                generating === doc.id ? 'bg-blue-600 text-white animate-pulse' : theme === 'dark' ? 'bg-white/5 hover:bg-indigo-600 text-gray-400 hover:text-white' : 'bg-slate-50 hover:bg-indigo-600 text-slate-500 hover:text-white shadow-sm'
                            }`}
                        >
                            {generating === doc.id ? <Loader size={18} className="animate-spin" /> : <CreditCard size={18} />}
                            <span className="text-[9px] font-black uppercase tracking-widest">{language === 'ar' ? 'بطاقات' : 'Cards'}</span>
                        </button>
                        <button
                            onClick={() => onNavigate('quizzes', doc.id)}
                            className={`p-4 rounded-[1.5rem] flex flex-col items-center gap-2 transition-all ${
                                theme === 'dark' ? 'bg-white/5 hover:bg-purple-600 text-gray-400 hover:text-white' : 'bg-slate-50 hover:bg-purple-600 text-slate-500 hover:text-white shadow-sm'
                            }`}
                        >
                            <Brain size={18} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{language === 'ar' ? 'اختبار' : 'Quiz'}</span>
                        </button>
                        <button
                            onClick={() => generateNeuralSummary(doc)}
                            className={`p-4 rounded-[1.5rem] flex flex-col items-center gap-2 transition-all group/sum ${
                                theme === 'dark' ? 'bg-white/5 hover:bg-amber-500 text-gray-400 hover:text-white' : 'bg-slate-50 hover:bg-amber-500 text-slate-500 hover:text-white shadow-sm'
                            }`}
                        >
                            <Sparkles size={18} className="group-hover/sum:animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{language === 'ar' ? 'ملخص' : 'Summary'}</span>
                        </button>
                    </div>

                    {/* Subtle background decoration */}
                    <div className={`absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity duration-700 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`}>
                        {doc.title.endsWith('.pdf') ? <FileText size={140} /> : <FileCode size={140} />}
                    </div>
                    </motion.div>
                    ))}
                </AnimatePresence>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full py-24 text-center flex flex-col items-center"
                >
                  <StudentLibrarian />
                  <h3 className={`text-3xl font-black italic tracking-tighter uppercase mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t.empty}</h3>
                  <p className={`font-bold max-w-xs mx-auto text-sm leading-relaxed ${theme === 'dark' ? 'opacity-50' : 'text-slate-500'}`}>{t.emptyDesc}</p>
                </motion.div>
            )}
          </section>
        </main>
      </div>
  );
}
