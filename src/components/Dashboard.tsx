import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, ChevronLeft, ChevronRight, Brain, Plus, Loader, Sparkles } from 'lucide-react';

export default function Flashcards({ onNavigate, documentId }: { onNavigate: (p: string) => void, documentId?: string }) {
    const { user } = useAuth();
    const [cards, setCards] = useState<any[]>([]);
    const [docTitle, setDocTitle] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (documentId) loadDocumentData();
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
                handleGenerate(true); // Auto-start if empty
            }
        } catch (error) {
            console.error("Load error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (isInitial = false) => {
        if (isGenerating) return;
        setIsGenerating(true);

        try {
            // 1. Fetch text content from Supabase
            const { data: doc } = await supabase.from('documents').select('content, title').eq('id', documentId).single();
            if (!doc) throw new Error("Doc not found");

            // 2. Call your backend
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/generate-cards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentContent: doc.content,
                    title: doc.title,
                    existingQuestions: cards.map(c => c.question)
                })
            });

            if (!response.ok) throw new Error("Backend failed");
            const newBatch = await response.json();

            // 3. Save to Supabase
            const { error: insertError } = await supabase.from('flashcards').insert(
                newBatch.map((c: any) => ({
                    ...c,
                    document_id: documentId,
                    user_id: user?.id
                }))
            );

            if (insertError) throw insertError;

            // 4. Update UI
            const { data: refreshedCards } = await supabase
                .from('flashcards')
                .select('*')
                .eq('document_id', documentId)
                .order('created_at', { ascending: true });

            if (refreshedCards) {
                setCards(refreshedCards);
                if (!isInitial) setCurrentIndex(cards.length); // Move to start of new cards
            }

        } catch (err) {
            console.error("Generation failed:", err);
            alert("AI failed to generate more cards. check backend logs.");
        } finally {
            setIsGenerating(false);
            setLoading(false);
        }
    };

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 150);
    };

    if (loading || isGenerating) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <Loader className="animate-spin text-blue-600 mb-4" size={48} />
            <h2 className="text-xl font-black text-slate-800">Processing with AI...</h2>
            <p className="text-slate-400 text-sm font-bold mt-2">Generating 30 unique concepts</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-6">
            {/* Header */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-8">
                <button onClick={() => onNavigate('documents')} className="p-3 bg-white border rounded-2xl text-slate-400 hover:text-blue-600 transition-all">
                    <ArrowLeft size={20} />
                </button>

                <div className="text-center">
                    <h2 className="font-black text-slate-800 text-lg">{docTitle}</h2>
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{cards.length} Total Cards</p>
                </div>

                <button
                    onClick={() => handleGenerate(false)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs hover:bg-blue-700 shadow-lg active:scale-95 transition-all"
                >
                    <Sparkles size={14} /> +30 Cards
                </button>
            </div>

            <div className="w-full max-w-xl">
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full mb-10 overflow-hidden shadow-inner">
                    <div className="bg-blue-500 h-full transition-all duration-700 ease-out" style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} />
                </div>

                {/* Card */}
                <div className="perspective-1000 h-[400px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        <div className="absolute inset-0 bg-white border border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-xl">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Question</span>
                            <p className="text-2xl font-bold text-slate-800 leading-tight">{cards[currentIndex]?.question}</p>
                        </div>
                        <div className="absolute inset-0 bg-blue-600 text-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-2xl">
                            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-6">Answer</span>
                            <p className="text-xl font-medium leading-relaxed">{cards[currentIndex]?.answer}</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mt-10 gap-4">
                    <button onClick={() => { setIsFlipped(false); setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length); }} className="flex-1 py-4 bg-white rounded-2xl border font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        Back
                    </button>
                    <button onClick={handleNext} className="flex-1 py-4 bg-slate-900 rounded-2xl font-bold text-white hover:bg-black transition-all shadow-xl">
                        Next
                    </button>
                </div>
            </div>

            <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
        </div>
    );
}