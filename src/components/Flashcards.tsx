import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, ChevronLeft, ChevronRight, Brain, Plus, Loader, Sparkles, AlertCircle, BookOpen, Zap, Layers, Target, ChevronDown, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { StudentFlashcards } from './AnimatedVisual';

export default function Flashcards({ onNavigate, documentId }: { onNavigate: (p: string, id?: string) => void, documentId?: string }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [cards, setCards] = useState<any[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [documents, setDocuments] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (documentId) loadDocumentData();
    else loadAllDocuments();
  }, [documentId]);

  const loadAllDocuments = async () => {
    setLoading(true);
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (data) setDocuments(data);
    setLoading(false);
  };

  const loadDocumentData = async () => {
    setLoading(true);
    setIsCompleted(false);
    try {
      const { data: doc } = await supabase.from('documents').select('title').eq('id', documentId).single();
      if (doc) setDocTitle(doc.title);

      const { data: flashcards } = await supabase
          .from('flashcards')
          .select('*')
          .eq('document_id', documentId)
          .order('created_at', { ascending: true });

      if (flashcards && flashcards.length > 0) {
        setCards(flashcards);
      } else {
        handleGenerate(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
    } else {
        setIsCompleted(true);
    }
  };

  const jumpToCard = (index: number) => {
    setCurrentIndex(index);
    setIsFlipped(false);
    setShowNav(false);
    setShowSearch(false);
  };

  const handleGenerate = async (isInitial = false) => {
    setIsGenerating(true);
    try {
      const { data: doc } = await supabase.from('documents').select('content, title').eq('id', documentId).single();
      if (!doc) return;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/generate-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentContent: doc.content,
          title: doc.title,
          count: 10, // Explicitly request 10
          existingQuestions: cards.map(c => c.question)
        })
      });

      const newBatch = await response.json();

      const { error } = await supabase.from('flashcards').insert(
          newBatch.map((c: any) => ({ ...c, document_id: documentId, user_id: user?.id }))
      );

      if (!error) {
        const { data: updated } = await supabase.from('flashcards').select('*').eq('document_id', documentId).order('created_at', { ascending: true });
        if (updated) setCards(updated);
        if (!isInitial) setCurrentIndex(cards.length);
      }
    } catch (err) {
      console.error("Batch generation failed", err);
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;
    return cards.map((c, i) => ({ ...c, originalIndex: i }))
                .filter(c => 
                    c.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    c.answer.toLowerCase().includes(searchQuery.toLowerCase())
                );
  }, [cards, searchQuery]);

  if (loading || isGenerating) return (
      <div className="h-screen flex flex-col items-center justify-center relative z-10">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-12 rounded-[3.5rem] shadow-2xl border flex flex-col items-center ${
                theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100'
            }`}
        >
          <StudentFlashcards />
          <div className="relative mb-8 mt-4">
            <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={32} />
          </div>
          <h2 className="text-3xl font-black italic uppercase mb-2 text-center tracking-tighter">Neural Sync</h2>
          <p className="opacity-40 font-black uppercase text-[10px] tracking-[0.4em] text-center">Architecting 10 new data fragments</p>
        </motion.div>
      </div>
  );

  if (!documentId) {
    return (
        <div className={`min-h-screen p-8 relative z-10 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <div className="max-w-4xl mx-auto">
                <motion.button 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => onNavigate('dashboard')} 
                    className={`mb-8 flex items-center gap-2 font-black uppercase text-xs tracking-widest transition-all ${
                        theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-blue-600'
                    }`}
                >
                    <ArrowLeft size={16} /> BACK TO GRID
                </motion.button>
                
                <div className="mb-12">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-4 leading-none"
                    >
                        Active <br />
                        <span className="text-blue-600">Recall</span>
                    </motion.h1>
                    <p className="opacity-40 font-bold text-lg uppercase tracking-widest">Select a neural data fragment to begin synchronization.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {documents.map((doc, i) => (
                        <motion.button 
                            key={doc.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            onClick={() => onNavigate('flashcards', doc.id)} 
                            className={`text-left p-10 border-2 rounded-[3.5rem] transition-all group relative overflow-hidden ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-blue-500/30 shadow-2xl' : 'bg-white border-slate-100 hover:shadow-2xl shadow-blue-500/5 hover:border-blue-200'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className={`p-5 rounded-[2rem] transition-colors ${
                                    theme === 'dark' ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                                } group-hover:bg-blue-600 group-hover:text-white`}>
                                    <Layers size={28} strokeWidth={2.5} />
                                </div>
                                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <h3 className="font-black italic uppercase tracking-tight text-2xl line-clamp-1 mb-2 relative z-10 transition-colors group-hover:text-blue-600">{doc.title}</h3>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] relative z-10">Sync Ready // Batch Mode</p>
                            
                            <div className={`absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`}>
                                <Layers size={180} />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  if (isCompleted) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`max-w-md w-full p-12 rounded-[4rem] border text-center shadow-2xl transition-colors ${
                    theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100'
                }`}
            >
                <div className="w-24 h-24 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                    <Target size={48} className="text-green-500" />
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">Batch Complete</h2>
                <p className="opacity-40 font-bold mb-12 leading-relaxed text-xs uppercase tracking-[0.3em]">You have processed the current batch of {cards.length} cognitive nodes.</p>
                
                <div className="space-y-4">
                    <button onClick={() => { setCurrentIndex(0); setIsCompleted(false); }} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">Restart Protocol</button>
                    <button onClick={() => handleGenerate(false)} className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                        <Sparkles size={16}/> Architect 10 More
                    </button>
                    <button onClick={() => onNavigate('documents')} className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-all ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}>Return to Core</button>
                </div>
            </motion.div>
        </div>
    );
  }

  return (
      <div className={`min-h-screen relative z-10 transition-colors duration-700 flex flex-col items-center p-6 ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
      }`}>
        <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-12 gap-6 mt-12">
          <motion.button 
            whileHover={{ x: -5 }}
            onClick={() => onNavigate('documents')} 
            className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition opacity-50 hover:opacity-100"
          >
            <ArrowLeft size={16} /> Exit Interface
          </motion.button>

          <div className="flex items-center gap-4">
            <div className="relative">
                <button 
                    onClick={() => { setShowNav(!showNav); setShowSearch(false); }}
                    className={`flex items-center gap-4 px-8 py-4 border rounded-full transition-all ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 shadow-xl shadow-blue-500/5 hover:border-blue-600/30'
                    }`}
                >
                    <div className="text-center">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] block mb-1">Active Batch</span>
                        <h2 className="font-black italic tracking-tighter uppercase text-sm flex items-center gap-2">
                            {docTitle} <ChevronDown size={14} className={`transition-transform duration-500 ${showNav ? 'rotate-180' : ''}`} />
                        </h2>
                    </div>
                </button>

                <AnimatePresence>
                    {showNav && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-80 p-6 rounded-[2.5rem] border z-[100] shadow-2xl transition-colors ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                        >
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 block mb-6 px-2 text-center">Neural Map // {cards.length} Nodes</span>
                            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {cards.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => jumpToCard(idx)}
                                        className={`aspect-square rounded-xl text-[10px] font-black transition-all ${
                                            currentIndex === idx 
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                                                : theme === 'dark' ? 'bg-white/5 text-gray-500 hover:bg-white/10' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button 
                onClick={() => { setShowSearch(!showSearch); setShowNav(false); }}
                className={`p-4 rounded-full border transition-all ${
                    showSearch ? 'bg-blue-600 text-white border-blue-500' : theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                }`}
            >
                <Search size={20} />
            </button>
          </div>

          <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGenerate(false)}
              className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30"
          >
            <Sparkles size={16} /> Batch +10
          </motion.button>
        </div>

        {/* --- SEARCH OVERLAY --- */}
        <AnimatePresence>
            {showSearch && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-2xl mb-12 relative z-[90]"
                >
                    <div className={`p-4 rounded-[2rem] border shadow-2xl flex items-center gap-4 ${
                        theme === 'dark' ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-200'
                    }`}>
                        <Search className="text-blue-600 ml-4" size={20} />
                        <input 
                            autoFocus
                            placeholder="Find neural node by keyword..."
                            className="flex-1 bg-transparent border-none outline-none font-bold py-2 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} className="p-2 hover:bg-white/5 rounded-full opacity-40">
                            <X size={20} />
                        </button>
                    </div>

                    {searchQuery && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`mt-4 rounded-[2rem] border overflow-hidden max-h-80 overflow-y-auto custom-scrollbar transition-colors ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-200'
                            }`}
                        >
                            {filteredCards.length > 0 ? filteredCards.map((c: any) => (
                                <button 
                                    key={c.id} 
                                    onClick={() => jumpToCard(c.originalIndex ?? 0)}
                                    className={`w-full text-left p-6 border-b border-white/5 transition-all flex flex-col gap-1 ${
                                        theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-blue-50'
                                    }`}
                                >
                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Node { (c.originalIndex ?? 0) + 1 }</span>
                                    <p className="font-bold text-sm line-clamp-1">{c.question}</p>
                                </button>
                            )) : (
                                <div className="p-10 text-center opacity-30 font-black uppercase text-xs">No Nodes Found</div>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        <div className="w-full max-w-2xl mt-4">
          <div className="flex justify-between items-end mb-6 px-4">
            <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'opacity-40' : 'text-slate-400'}`}>Protocol Progress</p>
            </div>
            <p className="text-sm font-black text-blue-600 italic tracking-tighter">{currentIndex + 1} // {cards.length}</p>
          </div>
          <div className={`w-full h-2 rounded-full mb-16 overflow-hidden shadow-inner ${theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-slate-100 border border-slate-200'}`}>
            <motion.div 
                className="bg-blue-600 h-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                transition={{ duration: 0.5 }}
            />
          </div>

          <div className="perspective-1000 h-[520px] cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div 
                className={`relative w-full h-full transform-style-3d`}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 150, damping: 20 }}
            >
              <div className={`absolute inset-0 border-2 rounded-[4rem] p-16 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl transition-all duration-500 ${
                  theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 group-hover:border-blue-500/30' : 'bg-white border-slate-50 group-hover:border-blue-600/30'
              }`}>
                <div className={`absolute top-12 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`} />
                <p className={`text-4xl font-black leading-[1.1] italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{cards[currentIndex]?.question}</p>
                <div className="absolute bottom-16 flex flex-col items-center gap-3">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.5em] animate-pulse">Syncing...</span>
                    <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'opacity-20' : 'text-slate-300'}`}>Tap interface to flip</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-[4rem] p-16 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-2xl relative overflow-hidden">
                <Brain className="absolute top-12 opacity-10" size={120} />
                <p className="text-3xl font-bold leading-relaxed tracking-tight relative z-10">{cards[currentIndex]?.answer}</p>
                
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl" />
              </div>
            </motion.div>
          </div>

          <div className="flex justify-between items-center mt-16 gap-6">
            <motion.button 
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setIsFlipped(false); setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length); }} 
                className={`flex-1 py-7 rounded-3xl border font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                    theme === 'dark' ? 'bg-[#0D0D0D] border-white/10 text-gray-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-blue-600/30'
                }`}
            >
              <ChevronLeft size={18} /> Prev
            </motion.button>
            <motion.button 
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext} 
                className="flex-[1.5] py-7 bg-blue-600 rounded-3xl font-black text-xs uppercase tracking-[0.3em] text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3"
            >
              Next Fragment <ChevronRight size={18} />
            </motion.button>
          </div>
        </div>

        <style>{`
        .perspective-1000 { perspective: 2000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
      `}</style>
      </div>
  );
}
