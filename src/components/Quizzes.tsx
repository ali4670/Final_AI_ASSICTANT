import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft, CheckCircle2, XCircle, RefreshCw,
  Trophy, Loader, ChevronRight, Brain, Sparkles, ChevronDown, Layout, Search, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { StudentAnswering } from './AnimatedVisual';

export default function Quizzes({ onNavigate, documentId }: { onNavigate: (p: string, id?: string) => void, documentId?: string }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [questions, setQuestions] = useState<any[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showNav, setShowNav] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (documentId) loadQuizData();
    else loadAllDocuments();
  }, [documentId]);

  const loadAllDocuments = async () => {
    setLoading(true);
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (data) setDocuments(data);
    setLoading(false);
  };

  const loadQuizData = async () => {
    setLoading(true);
    try {
        const { data: doc } = await supabase.from('documents').select('title').eq('id', documentId).single();
        if (doc) setDocTitle(doc.title);

        const { data: flashcards } = await supabase.from('flashcards').select('*').eq('document_id', documentId);

        if (flashcards && flashcards.length > 0) {
            const mcqFormat = flashcards.map((card, i) => {
                const otherUniqueAnswers = Array.from(new Set(
                    flashcards
                        .filter((_, idx) => idx !== i)
                        .map(c => c.answer.trim())
                ));
                const distractors = otherUniqueAnswers.sort(() => 0.5 - Math.random()).slice(0, 3);
                const options = Array.from(new Set([card.answer.trim(), ...distractors])).sort(() => 0.5 - Math.random());
                return { ...card, options };
            });
            setQuestions(mcqFormat);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleChoice = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === questions[currentIndex].answer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setSelectedOption(null);
    setShowNav(false);
    setShowSearch(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: doc } = await supabase.from('documents').select('content, title').eq('id', documentId).single();
      if (!doc) return;

      const response = await fetch(`/api/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            documentContent: doc.content, 
            title: doc.title,
            count: 10,
            existingQuestions: questions.map(q => q.question)
        }),
      });

      const newQuiz = await response.json();
      const { error } = await supabase.from('flashcards').insert(
          newQuiz.map((q: any) => ({ 
              question: q.question, 
              answer: q.answer, 
              document_id: documentId, 
              user_id: user?.id 
          }))
      );

      if (!error) {
        await loadQuizData();
        setCurrentIndex(questions.length);
      }
    } catch (err) {
      console.error("Quiz gen failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    return questions.map((q, i) => ({ ...q, originalIndex: i }))
                    .filter(q => q.question.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [questions, searchQuery]);

  if (loading || isGenerating) return (
      <div className="h-screen flex items-center justify-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-16 rounded-[4rem] border shadow-2xl flex flex-col items-center gap-8 ${
                theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100'
            }`}
          >
            <StudentAnswering />
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1">Synthesizing Protocol</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-center">Architecting 10 neural evaluation units</p>
                </div>
            </div>
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
                        Neural <br />
                        <span className="text-indigo-500">Validation</span>
                    </motion.h1>
                    <p className="opacity-40 font-bold text-lg uppercase tracking-widest leading-relaxed">Select a data unit to initialize mastery assessment.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {documents.map((doc, i) => (
                        <motion.button 
                            key={doc.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            onClick={() => onNavigate('quizzes', doc.id)} 
                            className={`text-left p-10 border-2 rounded-[3.5rem] transition-all group relative overflow-hidden ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-blue-500/30 shadow-2xl' : 'bg-white border-slate-100 hover:shadow-2xl shadow-blue-500/5 hover:border-indigo-200'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className={`p-5 rounded-[2rem] transition-colors ${
                                    theme === 'dark' ? 'bg-indigo-600/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                                } group-hover:bg-indigo-600 group-hover:text-white`}>
                                    <Layout size={28} strokeWidth={2.5} />
                                </div>
                                <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <h3 className="font-black italic uppercase tracking-tight text-2xl line-clamp-1 mb-2 relative z-10 transition-colors group-hover:text-indigo-600">{doc.title}</h3>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] relative z-10">Assessment Module // Unit 0{i+1}</p>
                            
                            <div className={`absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 ${theme === 'dark' ? 'text-white' : 'text-indigo-600'}`}>
                                <Trophy size={180} />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
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
            <ArrowLeft size={16} /> Terminate Session
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
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] block mb-1">Active Evaluation</span>
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
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-200'
                            }`}
                        >
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 block mb-6 px-2 text-center">Unit Map // {questions.length} Samples</span>
                            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {questions.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => jumpToQuestion(idx)}
                                        className={`aspect-square rounded-xl text-[10px] font-black transition-all ${
                                            currentIndex === idx 
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
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
                    showSearch ? 'bg-indigo-600 text-white border-indigo-500' : theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                }`}
            >
                <Search size={20} />
            </button>
          </div>

          <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30"
          >
            <Sparkles size={16} /> Synthesize +10
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
                        <Search className="text-indigo-600 ml-4" size={20} />
                        <input 
                            autoFocus
                            placeholder="Search examination node..."
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
                            {filteredQuestions.length > 0 ? filteredQuestions.map((q: any) => (
                                <button 
                                    key={q.id} 
                                    onClick={() => jumpToQuestion(q.originalIndex ?? 0)}
                                    className={`w-full text-left p-6 border-b border-white/5 transition-all flex flex-col gap-1 ${
                                        theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-indigo-50'
                                    }`}
                                >
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Question { (q.originalIndex ?? 0) + 1 }</span>
                                    <p className="font-bold text-sm line-clamp-1">{q.question}</p>
                                </button>
                            )) : (
                                <div className="p-10 text-center opacity-30 font-black uppercase text-xs">No Nodes Found</div>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
            {!showResult ? (
                <motion.div 
                    key="quiz"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl mt-4"
                >
                <div className="flex justify-between items-end mb-6 px-4">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'opacity-40' : 'text-slate-400'}`}>Unit Progress</p>
                    </div>
                    <p className="text-sm font-black text-indigo-600 italic tracking-tighter">{currentIndex + 1} // {questions.length}</p>
                </div>
                <div className={`w-full h-2 rounded-full mb-16 overflow-hidden shadow-inner ${theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-slate-100 border border-slate-200'}`}>
                    <motion.div className="bg-indigo-600 h-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>

                <div className={`rounded-[4rem] p-12 shadow-2xl mb-10 border transition-all ${
                    theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100'
                }`}>
                    <h3 className={`text-3xl font-black italic uppercase tracking-tighter mb-16 leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {questions[currentIndex]?.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                    {questions[currentIndex]?.options.map((option: string) => {
                        const isCorrect = option === questions[currentIndex].answer;
                        const isSelected = selectedOption === option;

                        let btnStyle = "w-full text-left p-7 rounded-[2rem] border-2 transition-all duration-300 font-bold text-base flex justify-between items-center ";
                        if (!selectedOption) {
                            btnStyle += theme === 'dark' 
                                ? "border-white/5 bg-white/5 hover:border-indigo-500 hover:bg-indigo-500/10" 
                                : "border-slate-50 hover:border-indigo-500 hover:bg-indigo-50";
                        }
                        else if (isCorrect) btnStyle += "border-green-500 bg-green-500/10 text-green-500";
                        else if (isSelected && !isCorrect) btnStyle += "border-red-500 bg-red-500/10 text-red-500";
                        else btnStyle += "opacity-20 border-transparent";

                        return (
                            <motion.button 
                                key={option} 
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleChoice(option)} 
                                disabled={!!selectedOption} 
                                className={btnStyle}
                            >
                                <span>{option}</span>
                                {selectedOption && isCorrect && <CheckCircle2 size={24} />}
                                {isSelected && !isCorrect && <XCircle size={24} />}
                            </motion.button>
                        );
                    })}
                    </div>
                </div>

                {selectedOption && (
                    <motion.button 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleNext} 
                        className="w-full bg-indigo-600 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-4 group"
                    >
                        {currentIndex < questions.length - 1 ? "Next Node" : "Process Score"} 
                        <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                )}
                </motion.div>
            ) : (
                <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center mt-12"
                >
                <div className={`p-16 rounded-[4rem] shadow-2xl border transition-colors ${
                    theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100'
                }`}>
                    <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-indigo-500/20 shadow-lg">
                        <Trophy size={48} className="text-indigo-500" />
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Unit Summary</h2>
                    <div className="text-9xl font-black text-indigo-600 mb-6 tracking-tighter">
                        {Math.round((score / questions.length) * 100)}%
                    </div>
                    <p className="opacity-40 font-black uppercase tracking-[0.4em] text-[10px] mb-16 px-4">{score} correct nodes // {questions.length} samples verified</p>

                    <div className="flex flex-col gap-4">
                    <button onClick={() => { setCurrentIndex(0); setScore(0); setShowResult(false); setSelectedOption(null); }} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition shadow-xl shadow-indigo-600/20">
                        <RefreshCw size={18} className="inline mr-3"/> Re-initialize Unit
                    </button>
                    <button onClick={() => onNavigate('documents')} className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}>
                        Return to Library
                    </button>
                    </div>
                </div>
                </motion.div>
            )}
        </AnimatePresence>
        
        <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
        `}</style>
      </div>
  );
}
