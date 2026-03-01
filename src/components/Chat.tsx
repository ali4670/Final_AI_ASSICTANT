import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
    ArrowLeft, Send, Loader, Trash2, MessageSquare, 
    Bot, FileText, Download, Activity, Sparkles,
    Printer, ShieldCheck, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Canvas } from '@react-three/fiber';
import BotScene from './3D/BotScene';
import * as THREE from 'three';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface Document {
    id: string;
    title: string;
    content: string;
}

export default function Chat({ onNavigate, documentId }: { onNavigate: (p: string, id?: string) => void, documentId?: string }) {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const printRef = useRef<HTMLDivElement>(null);

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
                    documentId: selectedDoc.id
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
                        }
                    } catch (e) { }
                }
            }
        } catch (err) {
            console.error('Chat error:', err);
            // Fallback simplified logic...
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = async () => {
        if (!printRef.current || exporting || messages.length === 0) return;
        
        setExporting(true);
        try {
            const element = printRef.current;
            element.style.display = 'block';
            
            // Allow layout to settle
            await new Promise(r => setTimeout(r, 800));

            const canvas = await html2canvas(element, { 
                scale: 1.5,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 850
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Neural_Sync_Report_${selectedDoc?.title.replace(/\s+/g, '_')}.pdf`);
            element.style.display = 'none';
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
            <div className={`p-8 max-w-6xl mx-auto min-h-screen relative z-10 transition-all duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
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
                        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-8 leading-none">
                            AI <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">SYNC</span>
                        </h1>
                        <p className="text-xl font-bold opacity-40 leading-relaxed max-w-md uppercase tracking-widest"> Establish high-bandwidth dialogue with the core synthesis engine.</p>
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
        <div className={`flex flex-col h-[calc(100vh-64px)] relative z-10 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            
            <div className="absolute inset-0 pointer-events-none opacity-10 z-0">
                <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <BotScene />
                </Canvas>
            </div>

            <header className={`p-8 border-b flex justify-between items-center relative z-10 transition-all ${theme === 'dark' ? 'border-white/5 bg-black/60 backdrop-blur-2xl' : 'border-slate-200 bg-white/90 backdrop-blur-md shadow-sm'}`}>
                <div className="flex items-center gap-8">
                    <motion.button 
                        whileHover={{ scale: 1.1, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedDoc(null)}
                        className={`p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'}`}
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                    <div>
                        <h2 className="font-black italic tracking-tighter uppercase text-3xl line-clamp-1 max-w-[200px] md:max-w-xl transition-all leading-none mb-2">{selectedDoc.title}</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="relative w-2 h-2">
                                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                                    <div className="absolute inset-0.5 bg-green-500 rounded-full" />
                                </div>
                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.5em]">Neural Link Online</span>
                            </div>
                            <div className="h-3 w-px bg-white/10" />
                            <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.5em]">SECURE_TUNNEL_042</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <motion.button 
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportToPDF} 
                        disabled={exporting || messages.length === 0}
                        className={`px-8 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50 ${
                            theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20' : 'bg-slate-950 text-white hover:bg-black shadow-slate-900/20'
                        }`}
                    >
                        {exporting ? <Loader className="animate-spin" size={18} /> : <Printer size={18} />}
                        <span className="hidden md:inline">Export Intelligence</span>
                    </motion.button>
                    <button onClick={clearChat} className={`p-4 border rounded-2xl transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-red-400 hover:bg-red-500/10' : 'bg-slate-50 border-slate-200 text-red-500 hover:bg-red-50'}`} title="Purge History">
                        <Trash2 size={22} />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-8 max-w-[85%] lg:max-w-[70%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl border transition-all ${
                                    m.role === 'user' 
                                        ? 'bg-blue-600 text-white border-blue-500 shadow-blue-600/30' 
                                        : theme === 'dark' ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/30' : 'bg-indigo-600 text-white shadow-lg'
                                }`}>
                                    {m.role === 'user' ? user?.user_metadata?.username?.[0].toUpperCase() || 'U' : <Bot size={28} />}
                                </div>
                                <div className={`p-10 rounded-[3.5rem] text-[16px] leading-relaxed shadow-2xl transition-all ${
                                    m.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-600/10' 
                                        : theme === 'dark' ? 'bg-[#0D0D0D]/95 text-gray-200 border border-white/5 rounded-tl-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-slate-200/50'
                                }`}>
                                    <div className="flex items-center gap-3 mb-4 opacity-30">
                                        {m.role === 'user' ? <Activity size={12} /> : <Cpu size={12} />}
                                        <span className="text-[9px] font-black uppercase tracking-[0.4em]">{m.role === 'user' ? 'Student Transmission' : 'Neural Architect Synthesis'}</span>
                                    </div>
                                    <p className="font-medium whitespace-pre-wrap">{m.content}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-8 ml-2">
                        <div className="w-14 h-14 rounded-3xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                            <Loader className="animate-spin text-indigo-500" size={28} />
                        </div>
                        <div className={`px-10 py-6 rounded-full text-xs font-black uppercase tracking-[0.4em] opacity-40 transition-colors ${theme === 'dark' ? 'bg-[#0D0D0D]' : 'bg-white border shadow-sm'}`}>
                            Architecting cognitive response...
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={`p-10 border-t relative z-10 transition-colors ${theme === 'dark' ? 'border-white/5 bg-black/60 backdrop-blur-2xl' : 'border-slate-200 bg-white'}`}>
                <form onSubmit={handleSubmit} className="max-w-6xl mx-auto flex gap-8">
                    <div className="relative flex-1 group">
                        <input 
                            className={`w-full p-8 rounded-[3.5rem] text-sm transition-all focus:ring-8 focus:ring-blue-500/5 outline-none border font-bold ${
                                theme === 'dark' 
                                    ? 'bg-[#0D0D0D] border-white/10 text-white focus:border-blue-500 shadow-2xl' 
                                    : 'bg-slate-50 border-slate-200 text-slate-950 focus:border-blue-600 shadow-inner'
                            }`}
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            placeholder="Transmit query to Neural Architect..." 
                        />
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

            {/* --- HIDDEN PRINT TEMPLATE FOR PDF --- */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <div ref={printRef} className="p-20 bg-white text-slate-900" style={{ width: '850px', fontFamily: 'serif' }}>
                    <div className="border-b-[12px] border-blue-600 pb-12 mb-20">
                        <div className="flex justify-between items-end mb-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-blue-600 mb-2">
                                    <Bot size={40} strokeWidth={3} />
                                    <div className="h-1 w-20 bg-blue-600" />
                                </div>
                                <h1 className="text-6xl font-black uppercase tracking-tighter leading-none italic">Neural <br/> Sync <br/> Intelligence</h1>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 mb-4">Official Session Record</p>
                                <p className="text-3xl font-black italic uppercase tracking-tighter border-b-2 border-slate-100 pb-2">{selectedDoc?.title}</p>
                                <p className="text-[9px] font-bold opacity-40 mt-4 uppercase tracking-widest">Captured: {new Date().toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-10 items-center">
                            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                <ShieldCheck size={14} className="text-blue-600" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Verified Student: {user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                <Activity size={14} className="text-indigo-600" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Dialogue Nodes: {messages.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-16">
                        {messages.map((m, i) => (
                            <div key={i} className={`relative pl-12 border-l-4 ${m.role === 'user' ? 'border-slate-200' : 'border-blue-600'}`}>
                                <div className="absolute -left-[14px] top-0 w-6 h-6 bg-white border-4 rounded-full flex items-center justify-center" style={{ borderColor: m.role === 'user' ? '#e2e8f0' : '#2563eb' }}>
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.role === 'user' ? '#94a3b8' : '#2563eb' }} />
                                </div>
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                                        {m.role === 'user' ? 'Student Signal' : 'Architect Insight'}
                                    </span>
                                    <span className="text-[8px] font-bold opacity-20 uppercase tracking-widest italic">Node {i+1} // Secure Hash: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                                </div>
                                <div className={`text-xl leading-relaxed whitespace-pre-wrap ${m.role === 'assistant' ? 'font-serif text-slate-800' : 'font-sans font-bold text-slate-600'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    <footer className="mt-40 pt-16 border-t-[1px] border-slate-100 flex justify-between items-center opacity-30">
                        <p className="text-[9px] font-black uppercase tracking-[0.8em]">Neural Study Neural Grid // Dialogue Protocol v4.2</p>
                        <div className="flex items-center gap-2">
                            <Bot size={12} />
                            <div className="w-12 h-0.5 bg-slate-200" />
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
