import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Sparkles, Brain, Loader, 
    CheckCircle2, AlertTriangle, ArrowRight,
    BookOpen, Layers, Trophy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface StudyProcessorProps {
    documentId: string;
    documentTitle: string;
    documentContent: string;
    onComplete?: () => void;
}

const StudyProcessor: React.FC<StudyProcessorProps> = ({ 
    documentId, 
    documentTitle, 
    documentContent,
    onComplete 
}) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleProcess = async () => {
        if (!user || !documentContent) return;
        
        setStatus('processing');
        setProgress(10);

        try {
            // Simulate progress phases
            const interval = setInterval(() => {
                setProgress(prev => (prev < 90 ? prev + 5 : prev));
            }, 1000);

            const response = await fetch('/api/generate-smart-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId,
                    userId: user.id,
                    title: documentTitle,
                    documentContent
                })
            });

            clearInterval(interval);

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = "Neural synthesis failed.";
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch (e) {
                    errorMessage = `Server Error: ${response.status}. The neural core might need a restart.`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setProgress(100);
            setStatus('success');
            if (onComplete) onComplete();
        } catch (err: any) {
            setError(err.message);
            setStatus('error');
        }
    };

    return (
        <div className={`p-8 rounded-[3rem] border transition-all duration-500 ${
            status === 'processing' 
            ? 'bg-blue-600/10 border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.1)]' 
            : status === 'success'
            ? 'bg-emerald-600/10 border-emerald-500/30'
            : theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-blue-100 shadow-xl'
        }`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${
                        status === 'processing' ? 'bg-blue-600 text-white animate-pulse' :
                        status === 'success' ? 'bg-emerald-600 text-white' :
                        'bg-blue-500/10 text-blue-500'
                    }`}>
                        {status === 'processing' ? <Brain size={32} /> : 
                         status === 'success' ? <CheckCircle2 size={32} /> : 
                         <Sparkles size={32} />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1">Neural Study Pack</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                            {status === 'processing' ? 'Synthesizing knowledge fragments...' : 
                             status === 'success' ? 'Cognitive assets deployed to archive.' :
                             'Generate Summary, Cards, and Quizzes instantly.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {status === 'idle' && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleProcess}
                            className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 flex items-center gap-3"
                        >
                            <Zap size={16} fill="white" /> Launch AI Process (+50 XP)
                        </motion.button>
                    )}

                    {status === 'processing' && (
                        <div className="flex flex-col items-end gap-2 min-w-[200px]">
                            <span className="text-xl font-black italic text-blue-500">{progress}%</span>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    className="h-full bg-blue-500"
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-[10px] tracking-widest">
                                <Trophy size={16} /> Asset Deployed
                            </div>
                            <button 
                                onClick={() => setStatus('idle')}
                                className="px-6 py-3 bg-white/5 rounded-xl font-black uppercase text-[8px] tracking-widest opacity-40 hover:opacity-100"
                            >
                                Re-Process
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {status === 'success' && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5"
                    >
                        {[
                            { label: 'Neural Summary', icon: BookOpen, color: 'text-blue-400' },
                            { label: 'Recall Nodes', icon: Layers, color: 'text-emerald-400' },
                            { label: 'Logic Evaluation', icon: Trophy, color: 'text-amber-400' }
                        ].map((asset, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                                <asset.icon size={14} className={asset.color} />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{asset.label}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="mt-6 p-4 bg-red-600/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-500">
                    <AlertTriangle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                </div>
            )}
        </div>
    );
};

export default StudyProcessor;
