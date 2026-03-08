import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, FileText, MessageSquare, CreditCard, Brain, Loader, Search, FileCode, Users, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { StudentLibrarian } from './AnimatedVisual';

export default function PublicDocs({ onNavigate }: { onNavigate: (p: string, id?: string) => void }) {
  const { user } = useAuth();
  const { theme, language } = useTheme();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => { fetchPublicDocs(); }, []);

  const fetchPublicDocs = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setDocs(data);
    } catch (err) {
      console.error("Failed to load public documents");
    } finally {
      setLoading(false);
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

      if (!response.ok) throw new Error('Failed to generate cards');
      
      const aiCards = await response.json();

      await supabase.from('flashcards').insert(aiCards.map((c: any) => ({
        ...c, user_id: user?.id, document_id: doc.id, difficulty: 'easy'
      })));

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
      const response = await fetch(`/api/generate-neural-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentContent: doc.content, title: doc.title, documentId: doc.id, userId: user?.id }),
      });

      if (!response.ok) throw new Error('Neural Engine failure');
      
      const data = await response.json();
      
      await supabase.from('neural_summaries').insert([{
          user_id: user?.id,
          document_id: doc.id,
          title: `Neural Summary: ${doc.title}`,
          summary_text: data.summary,
          quiz_data: data.quiz,
          exam_data: data.exam
      }]);

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
          <h1 className={`font-black italic tracking-tighter uppercase text-xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {language === 'ar' ? 'المكتبة العامة' : 'Public Library'}
          </h1>
        </div>
        <div className="relative w-full md:w-96">
          <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} size={16} />
          <input 
            placeholder={language === 'ar' ? 'البحث في المستندات العامة...' : 'Search community documents...'} 
            className={`${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-full text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                theme === 'dark' ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center">
            <StudentLibrarian />
            <div className="flex flex-col items-center gap-3 mt-6">
                <Loader className="animate-spin text-blue-600" size={32} />
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'opacity-40' : 'text-slate-500'}`}>Synchronizing with Global Grid...</p>
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((doc, i) => {
                const isOwn = doc.user_id === user?.id;
                return (
                  <motion.div 
                    key={doc.id} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`p-8 rounded-[3.5rem] border transition-all group relative overflow-hidden ${
                      isOwn 
                      ? (theme === 'dark' ? 'bg-blue-600/10 border-blue-500/30 shadow-2xl shadow-blue-500/10' : 'bg-blue-50 border-blue-200 shadow-xl shadow-blue-500/10')
                      : (theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl')
                    }`}
                  >
                    <div className="flex justify-between mb-8 relative z-10">
                      <div className={`p-4 rounded-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-white/5 text-blue-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white shadow-inner'}`}>
                        {doc.title.endsWith('.pdf') ? <FileText size={24} /> : <FileCode size={24} />}
                      </div>
                      {isOwn && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-600/10 px-2 py-1 rounded-md border border-blue-600/20">{language === 'ar' ? 'مستندك' : 'Your Document'}</span>
                          <p className="text-[7px] font-bold opacity-30 uppercase tracking-[0.3em]">Synced to Library</p>
                        </div>
                      )}
                    </div>
                    
                    <h3 className={`font-black italic tracking-tighter uppercase text-xl line-clamp-1 mb-2 relative z-10 transition-colors ${theme === 'dark' ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>{doc.title}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-10 relative z-10 ${theme === 'dark' ? 'opacity-30' : 'text-slate-400'}`}>
                      {isOwn ? (language === 'ar' ? 'بواسطتك' : 'Shared by You') : (language === 'ar' ? 'بواسطة عضو في المجتمع' : 'Shared by Community member')}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10">
                        <button onClick={() => onNavigate('reader', doc.id)} className={`p-4 rounded-[1.5rem] flex flex-col items-center gap-2 transition-all ${
                            theme === 'dark' ? 'bg-white/5 hover:bg-emerald-600 text-gray-400 hover:text-white' : 'bg-slate-50 hover:bg-emerald-600 text-slate-500 hover:text-white shadow-sm'
                        }`}>
                            <BookOpen size={18} /><span className="text-[9px] font-black uppercase tracking-widest">{language === 'ar' ? 'قراءة' : 'Read'}</span>
                        </button>
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

                    <div className={`absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity duration-700 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`}>
                        <Users size={140} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full py-24 text-center flex flex-col items-center"
          >
            <StudentLibrarian />
            <h3 className={`text-3xl font-black italic tracking-tighter uppercase mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {language === 'ar' ? 'المكتبة العامة فارغة' : 'Global Grid Empty'}
            </h3>
            <p className={`font-bold max-w-xs mx-auto text-sm leading-relaxed ${theme === 'dark' ? 'opacity-50' : 'text-slate-500'}`}>
              {language === 'ar' ? 'كن أول من يشارك مستنداً مع المجتمع' : 'Initialize the grid by sharing your first neural object.'}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
