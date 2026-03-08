import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
    ArrowLeft, Send, Loader, Trash2, MessageSquare, 
    Bot, FileText, Download, Activity, Sparkles,
    Printer, ShieldCheck, Cpu, Accessibility, VolumeX, Volume2, Hand, X as CloseIcon, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { generateNeuralPDF } from '../lib/pdfGenerator';
import { Canvas } from '@react-three/fiber';
import BotScene from './3D/BotScene';
import * as THREE from 'three';
import { useNeuralVoice } from '../hooks/useNeuralVoice';
import { ASL_ALPHABET } from '../lib/aslMapping';
import SignLanguageInput from './SignLanguageInput';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const AI_MODELS = [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Primary)', provider: 'groq' },
    { id: 'llama3-8b-8192', name: 'Llama 3 8B (Fast)', provider: 'groq' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Complex)', provider: 'groq' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B', provider: 'groq' },
    { id: 'gpt-4o', name: 'GPT-4o (Advanced)', provider: 'openai' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
];

interface Document {
    id: string;
    title: string;
    content: string;
}

export default function Chat({ onNavigate, documentId }: { onNavigate: (p: string, id?: string) => void, documentId?: string }) {
    const { user } = useAuth();
    const { theme, useVoice, useSign, setUseVoice, setUseSign } = useTheme();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0].id);
    const [showCamera, setShowCamera] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Accessibility State
    const { speak, isSpeaking, stop } = useNeuralVoice();
    const [showAccessMenu, setShowAccessMenu] = useState(false);
    const [currentSignChar, setCurrentSignChar] = useState<string | null>(null);

    const loadDocuments = useCallback(async () => {
        if (!user || !supabase) return;
        const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (data) setDocuments(data as Document[]);
    }, [user]);

    const loadChatHistory = useCallback(async (docId: string) => {
        if (!user) return;
        try {
            const response = await fetch(`/api/chat-history/${user.id}?documentId=${docId}`);
            if (response.ok) {
                const history = await response.json();
                const formattedMessages: Message[] = history.flatMap((h: any) => [
                    { role: 'user', content: h.message },
                    { role: 'assistant', content: h.response }
                ]);
                setMessages(formattedMessages);
            }
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    }, [user]);

    useEffect(() => { void loadDocuments(); }, [loadDocuments]);

    useEffect(() => {
        if (selectedDoc) {
            loadChatHistory(selectedDoc.id);
        } else {
            setMessages([]);
        }
    }, [selectedDoc, loadChatHistory]);

    useEffect(() => {
        if (documentId && documents.length > 0) {
            const doc = documents.find(d => d.id === documentId);
            if (doc) setSelectedDoc(doc);
        }
    }, [documentId, documents]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedDoc || loading) return;

        const userMsg: Message = { role: 'user', content: input.trim() };
        setInput('');
        setLoading(true);
        
        const historyForAI = messages.slice(-6);
        const newMessages: Message[] = [...messages, userMsg, { role: 'assistant', content: '' }];
        setMessages(newMessages);

        try {
            const response = await fetch(`/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    documentContent: selectedDoc.content,
                    conversationHistory: historyForAI,
                    userId: user?.id,
                    documentId: selectedDoc.id,
                    modelId: selectedModel
                }),
            });

            if (!response.body) throw new Error('Neural stream failed.');
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data: ')) continue;
                    
                    const dataStr = trimmed.slice(6);
                    if (dataStr === '[DONE]') continue;
                    
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.content) {
                            accumulatedContent += data.content;
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = { role: 'assistant', content: accumulatedContent };
                                return updated;
                            });

                            // Real-time Sign Language feedback
                            if (useSign) {
                                const lastChar = data.content.slice(-1).toLowerCase();
                                if (ASL_ALPHABET[lastChar]) {
                                    setCurrentSignChar(lastChar);
                                    setTimeout(() => setCurrentSignChar(null), 500);
                                }
                            }
                        }
                    } catch (e) { }
                }
            }

            // Speak final response
            if (useVoice) {
                speak(accumulatedContent);
            }
        } catch (err) {
            console.error('Chat error:', err);
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = async () => {
        if (!printRef.current || exporting || messages.length === 0) return;
        
        setExporting(true);
        try {
            await generateNeuralPDF(printRef.current, {
                title: selectedDoc?.title || 'Neural Sync Session',
                subtitle: 'AI INTERACTIVE ANALYSIS LOG',
                userName: user?.email || 'GUEST_EXPLORER',
                theme: theme,
                fileName: `Chat_Analysis_${selectedDoc?.title?.replace(/\s+/g, '_') || 'Session'}`
            });
        } catch (err) {
            console.error("PDF Export Error:", err);
            alert("Neural export protocol failed. Contact system administrator.");
        } finally {
            setExporting(false);
        }
    };

    const clearChat = async () => {
        if (!user || !selectedDoc) return;
        if (!confirm('Erase neural history for this fragment?')) return;
        try {
            const { error } = await supabase.from('chat_history').delete().eq('user_id', user.id).eq('document_id', selectedDoc.id);
            if (error) throw error;
            setMessages([]);
        } catch (err) {
            console.error('Failed to clear chat:', err);
        }
    };

    if (!selectedDoc) {
        return (
            <div className={`p-8 pt-12 max-w-6xl mx-auto min-h-screen relative z-10 transition-all duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <motion.button 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => onNavigate('dashboard')} 
                    className={`mb-12 flex items-center gap-3 font-black uppercase text-xs tracking-[0.3em] opacity-50 hover:opacity-100 transition-all ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}
                >
                    <ArrowLeft size={18} /> BACK TO COMMAND
                </motion.button>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 mb-8">
                            <Activity size={16} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Uplink Initialized</span>
                        </div>
                        <h1 className={`text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-8 leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            AI <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">SYNC</span>
                        </h1>
                        <p className={`text-xl font-bold opacity-40 leading-relaxed max-w-md uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-600'}`}> Establish high-bandwidth dialogue with the core synthesis engine.</p>
                    </motion.div>
                    
                    <div className="h-[450px] relative">
                        <div className={`absolute inset-0 rounded-full blur-[120px] transition-colors ${
                            theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-400/20'
                        }`} />
                        <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
                            <ambientLight intensity={theme === 'dark' ? 0.5 : 1.5} />
                            <BotScene />
                        </Canvas>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {documents.map((doc, i) => (
                        <motion.button 
                            key={doc.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -12, scale: 1.02 }}
                            onClick={() => setSelectedDoc(doc)} 
                            className={`text-left p-12 border rounded-[4rem] transition-all group relative overflow-hidden h-full flex flex-col ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-blue-500/40 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-12 relative z-10">
                                <div className={`p-6 rounded-[2.5rem] transition-all duration-500 ${
                                    theme === 'dark' ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                                } group-hover:bg-blue-600 group-hover:text-white`}>
                                    <MessageSquare size={32} strokeWidth={2.5} />
                                </div>
                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-600/5 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all">Link Engine</span>
                            </div>
                            <h3 className="font-black italic uppercase tracking-tight text-3xl line-clamp-2 mb-4 relative z-10 transition-colors group-hover:text-blue-600 leading-tight">{doc.title}</h3>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] relative z-10 mt-auto">Object Reference // Unit 0{i+1}</p>
                            
                            <div className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:opacity-[0.08] transition-all duration-1000 rotate-12">
                                <MessageSquare size={280} />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-[calc(100vh-140px)] relative z-10 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            
            <div className="absolute inset-0 pointer-events-none opacity-10 z-0">
                <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <BotScene />
                </Canvas>
            </div>

            <header className={`p-8 border-b flex justify-between items-center relative z-10 ${theme === 'dark' ? 'border-white/5 bg-black/40 backdrop-blur-3xl text-white' : 'border-slate-200 bg-white/80 backdrop-blur-xl text-slate-900'}`}>
                <div className="flex items-center gap-8">
                    <motion.button 
                        whileHover={{ scale: 1.1, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedDoc(null)}
                        className={`p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900'}`}
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                    <div>
                        <h2 className={`font-black italic tracking-tighter uppercase text-3xl line-clamp-1 max-w-[200px] md:max-w-xl leading-none mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {selectedDoc.title}
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="relative w-2 h-2">
                                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                                    <div className="absolute inset-0.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
                                </div>
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.5em]">Neural Link Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowAccessMenu(true)}
                        className={`p-4 rounded-2xl border transition-all ${
                            useVoice || useSign 
                            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                        }`}
                        title="Neural Accessibility"
                    >
                        <Accessibility size={20} />
                    </motion.button>

                    <div className="relative">
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="appearance-none px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all outline-none border border-white/10 bg-black/60 text-white hover:border-blue-500/50 focus:border-blue-500 cursor-pointer pr-12 shadow-2xl"
                        >
                            {AI_MODELS.map(model => (
                                <option key={model.id} value={model.id} className="bg-[#0D0D0D] text-white">
                                    {model.name}
                                </option>
                            ))}
                        </select>
                        <Bot size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportToPDF} 
                        disabled={exporting || messages.length === 0}
                        className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 disabled:opacity-50 ${
                            theme === 'dark' ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)]' : 'bg-slate-900 text-white shadow-lg'
                        }`}
                    >
                        {exporting ? <Loader className="animate-spin" size={18} /> : <Printer size={18} />}
                        <span className="hidden md:inline">Export Intelligence</span>
                    </motion.button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-8 max-w-[85%] lg:max-w-[70%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl border border-white/10 transition-all ${
                                    m.role === 'user' ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-white/5 backdrop-blur-3xl text-blue-500'
                                }`}>
                                    {m.role === 'user' ? user?.user_metadata?.username?.[0].toUpperCase() || 'U' : <Cpu size={28} className="animate-pulse" />}
                                </div>
                                <div className={`p-10 rounded-[2.5rem] text-[16px] leading-relaxed shadow-2xl transition-all border ${
                                    m.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none border-blue-500' 
                                        : (theme === 'dark' ? 'bg-white/[0.03] backdrop-blur-3xl text-gray-200 border-white/5 rounded-tl-none' : 'bg-white text-slate-900 border-slate-100 rounded-tl-none')
                                }`}>
                                    <div className="flex items-center gap-3 mb-4 opacity-30">
                                        <span className="text-[9px] font-black uppercase tracking-[0.4em]">{m.role === 'user' ? 'Direct Transmission' : 'Neural Core Response'}</span>
                                    </div>
                                    <p className="font-medium whitespace-pre-wrap">{m.content}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-8">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-3xl flex items-center justify-center border border-white/10">
                            <Loader className="animate-spin text-blue-500" size={28} />
                        </div>
                        <div className="px-10 py-6 rounded-full bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">
                            Architecting Response...
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={`p-10 border-t relative z-10 transition-colors ${theme === 'dark' ? 'border-white/5 bg-black/60 backdrop-blur-2xl' : 'border-slate-200 bg-white'}`}>
                <form onSubmit={handleSubmit} className="max-w-6xl mx-auto flex gap-8">
                    <div className="relative flex-1 group">
                        <input 
                            className={`w-full p-8 pl-24 rounded-[3.5rem] text-sm transition-all focus:ring-8 focus:ring-blue-500/5 outline-none border font-bold ${
                                theme === 'dark' 
                                    ? 'bg-[#0D0D0D] border-white/10 text-white focus:border-blue-500 shadow-2xl' 
                                    : 'bg-slate-50 border-slate-200 text-slate-950 focus:border-blue-600 shadow-inner'
                            }`}
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            placeholder="Transmit query or Sign..." 
                        />
                        
                        <button 
                            type="button"
                            onClick={() => setShowCamera(!showCamera)}
                            className={`absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full transition-all ${
                                showCamera ? 'bg-blue-600 text-white animate-pulse' : 'bg-white/5 text-gray-400 hover:text-blue-500'
                            }`}
                            title="Sign Language Input"
                        >
                            <Hand size={20} />
                        </button>

                        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
                            <Sparkles className="text-blue-500 opacity-20 group-focus-within:opacity-100 group-focus-within:animate-pulse transition-all" size={24} />
                        </div>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit" 
                        disabled={!input.trim() || loading}
                        className="bg-blue-600 text-white px-12 rounded-[3.5rem] transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center group"
                    >
                        <Send size={32} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </motion.button>
                </form>
            </div>

            <AnimatePresence>
                {showCamera && (
                    <SignLanguageInput 
                        onInput={(text) => {
                            if (text === "\b") {
                                setInput(prev => prev.slice(0, -1));
                            } else if (text === "[GENERATE_QUIZ]") {
                                setInput("Generate a comprehensive quiz for this document.");
                                setTimeout(() => {
                                    const form = document.querySelector('form');
                                    if (form) form.requestSubmit();
                                }, 500);
                            } else if (text === "[GENERATE_SUMMARY]") {
                                setInput("Generate a detailed neural summary of this content.");
                                setTimeout(() => {
                                    const form = document.querySelector('form');
                                    if (form) form.requestSubmit();
                                }, 500);
                            } else if (text === "[GENERATE_FLASHCARDS]") {
                                setInput("Generate a set of study flashcards for this material.");
                                setTimeout(() => {
                                    const form = document.querySelector('form');
                                    if (form) form.requestSubmit();
                                }, 500);
                            } else {
                                setInput(prev => prev + text);
                            }
                        }}
                        onClose={() => setShowCamera(false)}
                        theme={theme}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAccessMenu && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-[200] flex items-center justify-center p-8"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="max-w-md w-full p-12 rounded-[4rem] bg-[#0D0D0D] border border-white/10 text-white shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setShowAccessMenu(false)}
                                className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all opacity-40 hover:opacity-100"
                            >
                                <CloseIcon size={24} />
                            </button>

                            <div className="mb-12">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Accessibility</h3>
                                <p className="text-[10px] font-black uppercase opacity-40 tracking-widest leading-relaxed">Neural Protocol for Inclusion and Support</p>
                            </div>

                            <div className="space-y-6">
                                <button 
                                    onClick={() => setUseVoice(!useVoice)}
                                    className={`w-full p-8 rounded-3xl border-2 transition-all flex items-center justify-between group ${
                                        useVoice ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 opacity-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl ${useVoice ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}>
                                            {useVoice ? <Volume2 size={24} /> : <VolumeX size={24} />}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black italic uppercase tracking-tight text-xl">Neural Voice</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Text-to-Speech synthesis</p>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${useVoice ? 'bg-blue-500 animate-pulse' : 'bg-white/10'}`} />
                                </button>

                                <button 
                                    onClick={() => setUseSign(!useSign)}
                                    className={`w-full p-8 rounded-3xl border-2 transition-all flex items-center justify-between group ${
                                        useSign ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-white/5 opacity-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl ${useSign ? 'bg-purple-600 text-white' : 'bg-white/10 text-white'}`}>
                                            <Hand size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black italic uppercase tracking-tight text-xl">Visual Sign Output</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Display ASL for AI Responses</p>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${useSign ? 'bg-purple-500 animate-pulse' : 'bg-white/10'}`} />
                                </button>

                                <button 
                                    onClick={() => setShowCamera(!showCamera)}
                                    className={`w-full p-8 rounded-3xl border-2 transition-all flex items-center justify-between group ${
                                        showCamera ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-white/5 opacity-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl ${showCamera ? 'bg-cyan-600 text-white' : 'bg-white/10 text-white'}`}>
                                            <Camera size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black italic uppercase tracking-tight text-xl">Sign Input</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Use camera for Sign Recognition</p>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${showCamera ? 'bg-cyan-500 animate-pulse' : 'bg-white/10'}`} />
                                </button>
                                
                                <p className="text-[9px] font-bold text-center opacity-30 mt-4 uppercase tracking-widest">
                                    Activate Sign Input to translate your gestures into text.
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => setShowAccessMenu(false)}
                                className="w-full mt-12 py-8 bg-white text-black rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] hover:bg-gray-200 transition-all shadow-xl"
                            >
                                Apply Configuration
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- SIGN ASSIST PANE (FLOAT) --- */}
            <AnimatePresence>
                {useSign && currentSignChar && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 50 }}
                        className="fixed bottom-36 left-12 z-[150] w-48 h-64 bg-black/60 backdrop-blur-3xl border-2 border-purple-500/30 rounded-[3rem] p-8 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.2)]"
                    >
                        <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-6">ASL Display</div>
                        <img 
                            src={ASL_ALPHABET[currentSignChar]} 
                            alt={`Sign for ${currentSignChar}`}
                            className="w-24 h-24 object-contain brightness-0 invert opacity-80"
                        />
                        <div className="mt-8 text-4xl font-black italic uppercase text-purple-500">{currentSignChar}</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- PREMIUM PRINT TEMPLATE --- */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <div ref={printRef} className="p-16 bg-white text-slate-900" style={{ width: '850px' }}>
                    <div className="mb-16 border-b-[8px] border-slate-950 pb-12">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-2 text-slate-900">NEURAL<br/>SYNC LOG</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600">Confidential Transmission Record</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 mb-1">FRAGMENT ID</p>
                                <p className="text-xl font-black italic uppercase tracking-tighter">{selectedDoc?.title || 'Active Session'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {messages.map((m, i) => (
                            <div key={i} className={`p-10 rounded-2xl border ${
                                m.role === 'user' ? 'bg-slate-50 border-slate-100' : 'bg-white border-blue-50 shadow-sm'
                            }`} style={{ breakInside: 'avoid' }}>
                                <div className="flex items-center gap-3 mb-4 opacity-30">
                                    <div className={`w-2 h-2 rounded-full ${m.role === 'user' ? 'bg-slate-950' : 'bg-blue-600'}`} />
                                    <span className="text-[8px] font-black uppercase tracking-[0.4em]">
                                        {m.role === 'user' ? 'Source Transmission' : 'Core Processing Response'}
                                    </span>
                                </div>
                                <div className={`text-base leading-relaxed font-medium ${m.role === 'user' ? 'text-slate-600' : 'text-slate-900'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    <footer className="mt-20 pt-8 border-t-2 border-slate-900 flex justify-between items-center opacity-40">
                        <p className="text-[8px] font-black uppercase tracking-[0.4em]">NEURAL STUDY AI // SYNC PROTOCOL V2.5</p>
                        <p className="text-[8px] font-black uppercase tracking-[0.4em]">END OF LOG</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
