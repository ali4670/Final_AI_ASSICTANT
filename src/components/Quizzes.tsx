import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft, CheckCircle2, XCircle, RefreshCw,
  Trophy, Loader, ChevronRight
} from 'lucide-react';

export default function Quizzes({ onNavigate, documentId }: { onNavigate: (p: string, id?: string) => void, documentId?: string }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (documentId) loadQuizData();
    else onNavigate('documents');
  }, [documentId]);

  const loadQuizData = async () => {
    setLoading(true);
    const { data: doc } = await supabase.from('documents').select('title').eq('id', documentId).single();
    if (doc) setDocTitle(doc.title);

    const { data: flashcards } = await supabase.from('flashcards').select('*').eq('document_id', documentId);

    if (flashcards && flashcards.length > 0) {
      const mcqFormat = flashcards.map((card, i) => {
        // 1. Get ALL other unique answers except the current correct one
        const otherUniqueAnswers = Array.from(new Set(
            flashcards
                .filter((_, idx) => idx !== i)
                .map(c => c.answer.trim())
        ));

        // 2. Shuffle distractors and pick 3
        const distractors = otherUniqueAnswers
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        // 3. Combine correct answer with unique distractors and shuffle again
        const options = Array.from(new Set([card.answer.trim(), ...distractors]))
            .sort(() => 0.5 - Math.random());

        return { ...card, options };
      });
      setQuestions(mcqFormat);
    }
    setLoading(false);
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

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-blue-600" size={32} /></div>;

  return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-6">
        {/* Header */}
        <div className="w-full max-w-2xl flex justify-between items-center mb-10">
          <button onClick={() => onNavigate('documents')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition">
            <ArrowLeft size={18} /> Library
          </button>
          <div className="text-center">
            <h2 className="font-black text-slate-800 tracking-tight">{docTitle}</h2>
            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</div>
          </div>
          <div className="w-16"></div>
        </div>

        {!showResult ? (
            <div className="w-full max-w-xl">
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full mb-10 overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
              </div>

              {/* MCQ Question Card */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-blue-900/5 mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-10 leading-snug">
                  {questions[currentIndex]?.question}
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {questions[currentIndex]?.options.map((option: string) => {
                    const isCorrect = option === questions[currentIndex].answer;
                    const isSelected = selectedOption === option;

                    let btnStyle = "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 font-bold text-sm ";
                    if (!selectedOption) btnStyle += "border-slate-50 hover:border-blue-500 hover:bg-blue-50 text-slate-600";
                    else if (isCorrect) btnStyle += "border-green-500 bg-green-50 text-green-700 shadow-sm";
                    else if (isSelected && !isCorrect) btnStyle += "border-red-500 bg-red-50 text-red-700";
                    else btnStyle += "border-slate-50 opacity-30 text-slate-300";

                    return (
                        <button key={option} onClick={() => handleChoice(option)} disabled={!!selectedOption} className={btnStyle}>
                          <div className="flex justify-between items-center">
                            <span>{option}</span>
                            {selectedOption && isCorrect && <CheckCircle2 size={18} />}
                            {isSelected && !isCorrect && <XCircle size={18} />}
                          </div>
                        </button>
                    );
                  })}
                </div>
              </div>

              {selectedOption && (
                  <button onClick={handleNext} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2">
                    {currentIndex < questions.length - 1 ? "Next Question" : "View My Degree"} <ChevronRight size={18} />
                  </button>
              )}
            </div>
        ) : (
            /* Result Screen */
            <div className="max-w-md w-full animate-in zoom-in-95 duration-300 text-center">
              <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
                <Trophy className="text-yellow-400 mx-auto mb-6" size={60} />
                <h2 className="text-3xl font-black text-slate-800 mb-2">Quiz Degree</h2>
                <div className="text-7xl font-black text-blue-600 mb-4">
                  {Math.round((score / questions.length) * 100)}%
                </div>
                <p className="text-slate-500 font-bold mb-10">{score} Correct / {questions.length} Total</p>

                <div className="flex flex-col gap-3">
                  <button onClick={() => { setCurrentIndex(0); setScore(0); setShowResult(false); setSelectedOption(null); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition">
                    <RefreshCw size={18} className="inline mr-2"/> Retake Study
                  </button>
                  <button onClick={() => onNavigate('documents')} className="w-full bg-slate-50 text-slate-500 py-4 rounded-2xl font-bold hover:bg-slate-100 transition">
                    Back to Library
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}