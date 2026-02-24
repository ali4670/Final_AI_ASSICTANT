import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, ChevronLeft, ChevronRight, Brain, Plus, Loader, Sparkles, AlertCircle } from 'lucide-react';

export default function Flashcards({ onNavigate, documentId }: { onNavigate: (p: string) => void, documentId?: string }) {
  const { user } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load Data & Auto-Generate if empty
  useEffect(() => {
    if (documentId) {
      loadDocumentData();
    }
  }, [documentId]);

  const loadDocumentData = async () => {
    setLoading(true);
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
        // AUTOMATIC TRIGGER: If no cards exist, start generating immediately
        handleGenerate(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (isInitial = false) => {
    setIsGenerating(true);
    try {
      const { data: doc } = await supabase.from('documents').select('content, title').eq('id', documentId).single();
      if (!doc) return;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/generate-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentContent: doc.content,
          title: doc.title,
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
      console.error("Auto-gen failed", err);
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  if (loading || isGenerating) return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <Loader className="animate-spin text-blue-600" size={60} />
          <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" size={24} />
        </div>
        <h2 className="mt-6 text-xl font-black text-slate-800 tracking-tight">AI is analyzing your data...</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Generating 30 high-speed cards</p>
      </div>
  );

  return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-6">
        {/* Dynamic Header */}
        <div className="w-full max-w-2xl flex justify-between items-center mb-8">
          <button onClick={() => onNavigate('documents')} className="p-3 bg-white border rounded-2xl text-slate-400 hover:text-blue-600 transition-all hover:shadow-md">
            <ArrowLeft size={20} />
          </button>

          <div className="text-center">
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
            Neural Deck
          </span>
            <h2 className="font-black text-slate-800 text-lg">{docTitle}</h2>
          </div>

          <button
              onClick={() => handleGenerate(false)}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-xs hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            <Sparkles size={14} /> +30 More
          </button>
        </div>

        {/* Card Display Logic */}
        <div className="w-full max-w-xl">
          <div className="flex justify-between items-end mb-4 px-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Progress</p>
            <p className="text-xs font-black text-blue-600">{currentIndex + 1} / {cards.length}</p>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mb-10 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-700 ease-out" style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} />
          </div>

          <div className="perspective-1000 h-[450px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 bg-white border-2 border-slate-50 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-xl">
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-100 rounded-full" />
                <p className="text-2xl font-black text-slate-800 leading-tight">{cards[currentIndex]?.question}</p>
                <p className="absolute bottom-12 text-[10px] font-black text-slate-300 uppercase tracking-widest">Tap to reveal answer</p>
              </div>
              {/* Back */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[3rem] p-12 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-2xl">
                <Brain className="absolute top-10 opacity-20" size={60} />
                <p className="text-xl font-bold leading-relaxed">{cards[currentIndex]?.answer}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-10 gap-4">
            <button onClick={() => { setIsFlipped(false); setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length); }} className="flex-1 py-5 bg-white rounded-3xl border border-slate-100 font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
              Previous
            </button>
            <button onClick={() => { setIsFlipped(false); setCurrentIndex((prev) => (prev + 1) % cards.length); }} className="flex-1 py-5 bg-blue-600 rounded-3xl font-bold text-white hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200">
              Next Concept
            </button>
          </div>
        </div>

        <style>{`
        .perspective-1000 { perspective: 1500px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
      </div>
  );
}