import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Brain, Sparkles, Loader, Target, Zap, ChevronRight, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/generate-cards`, {
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
            alert("AI SYSTEM OFFLINE: check backend logs.");
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
        <div className="h-screen flex flex-col items-center justify-center bg-[#050505]">
            <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative w-24 h-24 mb-10"
            >
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={32} />
            </motion.div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">Neural Processing</h2>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Optimizing Learning Path</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 font-sans overflow-hidden">
            {/* Background FX */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-12 relative z-10">
                <motion.button 
                    whileHover={{ x: -5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    onClick={() => onNavigate('documents')} 
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> Exit Deck
                </motion.button>

                <div className="text-center">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] block mb-2">Target Data: {docTitle}</span>
                    <h2 className="font-black text-white text-2xl italic tracking-tighter uppercase flex items-center gap-3">
                        <Target size={24} className="text-blue-500" /> MISSION: {currentIndex + 1} / {cards.length}
                    </h2>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#3b82f6' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGenerate(false)}
                    className="flex items-center gap-3 bg-white text-black px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                >
                    <Sparkles size={16} /> Neural Sync
                </motion.button>
            </div>

            <div className="w-full max-w-2xl relative z-10">
                {/* HUD Stats */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                        <Clock size={16} className="text-blue-500" />
                        <div>
                            <p className="text-[9px] font-black text-gray-500 uppercase">Est. Time</p>
                            <p className="text-xs font-black">12 MIN</p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                        <Zap size={16} className="text-yellow-500" />
                        <div>
                            <p className="text-[9px] font-black text-gray-500 uppercase">Intensity</p>
                            <p className="text-xs font-black">HIGH</p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                        <BookOpen size={16} className="text-indigo-500" />
                        <div>
                            <p className="text-[9px] font-black text-gray-500 uppercase">Mode</p>
                            <p className="text-xs font-black">RECALL</p>
                        </div>
                    </div>
                </div>

                {/* Progress HUD */}
                <div className="w-full bg-white/5 h-1.5 rounded-full mb-12 relative overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    />
                </div>

                {/* Card Stage */}
                <div className="perspective-1000 h-[450px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                    <motion.div 
                        className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                    >
                        {/* FRONT: QUESTION */}
                        <div className="absolute inset-0 bg-[#0D0D0D] border border-white/10 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl group">
                            <div className="absolute inset-4 border border-blue-500/5 rounded-[2rem] pointer-events-none group-hover:border-blue-500/20 transition-colors" />
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-10">Input Stimulus</span>
                            <p className="text-3xl font-black text-white leading-tight italic tracking-tight">{cards[currentIndex]?.question}</p>
                            <div className="mt-12 flex items-center gap-2 opacity-30">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                                <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Recall</p>
                            </div>
                        </div>

                        {/* BACK: ANSWER */}
                        <div className="absolute inset-0 bg-blue-600 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-[0_0_50px_rgba(59,130,246,0.4)] overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{ 
                                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                            }} />
                            <Brain className="absolute top-10 text-white/10" size={100} />
                            <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-10 relative z-10">Neural Response</span>
                            <p className="text-2xl font-bold text-white leading-relaxed relative z-10">{cards[currentIndex]?.answer}</p>
                            <div className="mt-12 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full relative z-10 border border-white/10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white">Concept Verified</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Tactical Controls */}
                <div className="flex justify-between items-center mt-12 gap-6">
                    <motion.button 
                        whileHover={{ x: -5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length); }} 
                        className="flex-1 py-6 bg-white/5 rounded-2xl border border-white/10 font-black text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-all"
                    >
                        Previous Concept
                    </motion.button>
                    <motion.button 
                        whileHover={{ x: 5, backgroundColor: '#fff', color: '#000' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handleNext(); }} 
                        className="flex-1 py-6 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 group"
                    >
                        Next Engagement <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </div>
            </div>

            <style>{`
                .perspective-1000 { perspective: 2000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
}