import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, Loader, Trash2, MessageSquare, Bot, FileText, Download, Activity, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import jsPDF from 'jspdf';
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

    const loadDocuments = useCallback(async () => {
        if (!user || !supabase) return;
        const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (data) setDocuments(data as Document[]);
    }, [user]);

    const loadChatHistory = useCallback(async (docId: string) => {
        if (!user) return;
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
            const response = await fetch(`${baseUrl}/api/chat-history/${user.id}?documentId=${docId}`);
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
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
            const response = await fetch(`${baseUrl}/api/chat`, {
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
            try {
                const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
                const res = await fetch(`${baseUrl}/api/chat-simple`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: userMsg.content,
                        documentContent: selectedDoc.content,
                        conversationHistory: historyForAI,
                        documentId: selectedDoc.id
                    }),
                });
                const data = await res.json();
                if (data.content) {
                    setMessages(prev => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { role: 'assistant', content: data.content };
                        return updated;
                    });
                }
            } catch (innerErr) {
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: "Uplink Failure: System Offline." };
                    return updated;
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = async () => {
        if (messages.length === 0) return;
        setExporting(true);
        try {
            const doc = new jsPDF('p', 'pt', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 50;
            const contentWidth = pageWidth - (margin * 2);
            let cursorY = margin;

            // --- PROFESSIONAL HEADER ---
            doc.setFillColor(37, 99, 235); // Blue 600
            doc.rect(0, 0, pageWidth, 120, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('ACADEMIC SYNC REPORT', margin, 60);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`SYSTEM: NEUROSTUDY CORE v2.0 // ARCHITECT INTERFACE`, margin, 80);
            doc.text(`DATE: ${new Date().toLocaleDateString()} // ${new Date().toLocaleTimeString()}`, margin, 95);

            cursorY = 160;

            // --- METADATA SECTION ---
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, cursorY, contentWidth, 60, 10, 10, 'F');
            
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('DOCUMENT CONTEXT:', margin + 20, cursorY + 25);
            doc.setFont('helvetica', 'normal');
            doc.text(selectedDoc?.title.toUpperCase() || 'GENERAL QUERY', margin + 20, cursorY + 42);
            
            doc.setFont('helvetica', 'bold');
            doc.text('STUDENT IDENTIFIER:', margin + 300, cursorY + 25);
            doc.setFont('helvetica', 'normal');
            doc.text(user?.email || 'ANONYMOUS UNIT', margin + 300, cursorY + 42);

            cursorY += 100;

            // --- DIALOGUE STREAM ---
            messages.forEach((m) => {
                const isUser = m.role === 'user';
                const lines = doc.splitTextToSize(m.content, contentWidth - 40);
                const blockHeight = (lines.length * 16) + 50;

                if (cursorY + blockHeight > pageHeight - margin) {
                    doc.addPage();
                    cursorY = margin + 20;
                }

                if (isUser) {
                    doc.setDrawColor(226, 232, 240);
                    doc.setLineWidth(1);
                    doc.line(margin, cursorY, pageWidth - margin, cursorY);
                    
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.setFont('helvetica', 'bold');
                    doc.text('STUDENT SIGNAL TRANSMISSION', margin, cursorY + 20);
                    
                    doc.setFontSize(11);
                    doc.setTextColor(51, 65, 85);
                    doc.setFont('helvetica', 'normal');
                    doc.text(lines, margin + 10, cursorY + 40);
                    
                    cursorY += (lines.length * 16) + 60;
                } else {
                    doc.setFillColor(241, 245, 249);
                    doc.roundedRect(margin - 10, cursorY, contentWidth + 20, (lines.length * 16) + 40, 8, 8, 'F');
                    
                    doc.setFontSize(8);
                    doc.setTextColor(37, 99, 235);
                    doc.setFont('helvetica', 'bold');
                    doc.text('NEURAL ARCHITECT RESPONSE', margin + 10, cursorY + 20);
                    
                    doc.setFontSize(11);
                    doc.setTextColor(30, 41, 59);
                    doc.setFont('helvetica', 'normal');
                    doc.text(lines, margin + 10, cursorY + 40);
                    
                    cursorY += (lines.length * 16) + 70;
                }
            });

            const pageCount = (doc as any).internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setDrawColor(37, 99, 235);
                doc.setLineWidth(0.5);
                doc.line(margin, pageHeight - 50, pageWidth - margin, pageHeight - 50);
                
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184);
                doc.text(`OFFICIAL ACADEMIC RECORD // PAGE ${i} OF ${pageCount}`, pageWidth / 2, pageHeight - 35, { align: 'center' });
                doc.text('NEUROSTUDY SECURE DATA EXPORT', margin, pageHeight - 35);
            }

            doc.save(`SyncReport-${selectedDoc?.title.replace(/\.[^/.]+$/, "")}.pdf`);
        } catch (err) {
            console.error("PDF Export failed", err);
        }
        setExporting(false);
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
            <div className={`p-8 max-w-5xl mx-auto min-h-screen relative z-10 transition-all duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <motion.button 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => onNavigate('dashboard')} 
                    className={`mb-12 flex items-center gap-2 font-black uppercase text-xs tracking-widest transition-all ${
                        theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-blue-600'
                    }`}
                >
                    <ArrowLeft size={18} /> BACK TO COMMAND
                </motion.button>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 mb-6">
                            <Activity size={14} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cognitive Link Ready</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-6 leading-none">
                            AI <br /> <span className="text-blue-600">SYNC</span>
                        </h1>
                        <p className="text-lg font-medium opacity-60 leading-relaxed max-w-md"> Establish a high-bandwidth communication channel with the Neural Architect using your library data.</p>
                    </motion.div>
                    
                    <div className="h-[400px] relative">
                        <div className={`absolute inset-0 rounded-full blur-[100px] transition-colors ${
                            theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-400/20'
                        }`} />
                        <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 0, 5], fov: 45 }}>
                            <ambientLight intensity={theme === 'dark' ? 0.5 : 1.5} />
                            <BotScene />
                        </Canvas>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc, i) => (
                        <motion.button 
                            key={doc.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            onClick={() => setSelectedDoc(doc)} 
                            className={`text-left p-10 border-2 rounded-[3.5rem] transition-all group relative overflow-hidden ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-blue-500/30 shadow-2xl' : 'bg-white border-slate-100 hover:shadow-2xl shadow-blue-500/5 hover:border-blue-200'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div className={`p-5 rounded-[2rem] transition-colors ${
                                    theme === 'dark' ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                                } group-hover:bg-blue-600 group-hover:text-white`}>
                                    <MessageSquare size={28} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Connect</span>
                            </div>
                            <h3 className="font-black italic uppercase tracking-tight text-2xl line-clamp-1 mb-2 relative z-10 transition-colors group-hover:text-blue-600">{doc.title}</h3>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] relative z-10">Object Link // Unit 0{i+1}</p>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-[calc(100vh-64px)] relative z-10 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
                <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <BotScene />
                </Canvas>
            </div>

            <header className={`p-6 border-b flex justify-between items-center relative z-10 ${theme === 'dark' ? 'border-white/5 bg-black/40' : 'border-slate-200 bg-white shadow-sm'}`}>
                <div className="flex items-center gap-6">
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedDoc(null)}
                        className={`p-3 rounded-2xl transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                    <div>
                        <h2 className="font-black italic tracking-tighter uppercase text-xl line-clamp-1 max-w-[200px] md:max-w-md">{selectedDoc.title}</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative w-2 h-2">
                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                                <div className="absolute inset-0.5 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Neural Link Established</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportToPDF} 
                        disabled={exporting || messages.length === 0}
                        className="px-6 py-3 bg-blue-600 text-white rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 disabled:opacity-50"
                    >
                        {exporting ? <Loader className="animate-spin" size={18} /> : <FileText size={18} />}
                        <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Generate Report</span>
                    </motion.button>
                    <button onClick={clearChat} className={`p-3 border rounded-2xl transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-red-400 hover:bg-red-500/10' : 'bg-slate-50 border-slate-200 text-red-500 hover:bg-red-50'}`} title="Purge History">
                        <Trash2 size={20} />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 relative z-10 scrollbar-hide">
                <AnimatePresence>
                    {messages.map((m, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-6 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-all ${
                                    m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white animate-pulse'
                                }`}>
                                    {m.role === 'user' ? user?.user_metadata?.username?.[0].toUpperCase() || 'U' : <Bot size={24} />}
                                </div>
                                <div className={`p-7 rounded-[2.5rem] text-[15px] leading-relaxed shadow-2xl transition-colors ${
                                    m.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : theme === 'dark' ? 'bg-[#0D0D0D]/90 text-gray-200 border border-white/5 rounded-tl-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                }`}>
                                    {m.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
                            <Loader className="animate-spin text-indigo-500" size={24} />
                        </div>
                        <div className={`px-8 py-5 rounded-full text-xs font-black uppercase tracking-widest opacity-40 transition-colors ${theme === 'dark' ? 'bg-[#0D0D0D]' : 'bg-white border'}`}>
                            Synthesizing intelligence...
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={`p-8 border-t relative z-10 transition-colors ${theme === 'dark' ? 'border-white/5 bg-black/40' : 'border-slate-200 bg-white'}`}>
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-6">
                    <div className="relative flex-1">
                        <input 
                            className={`w-full p-6 rounded-[2.5rem] text-sm transition-all focus:ring-4 focus:ring-blue-500/10 outline-none border font-bold ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                            }`}
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            placeholder="Transmit query to Neural Architect..." 
                        />
                        <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500 opacity-20" size={20} />
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05, backgroundColor: '#2563eb' }}
                        whileTap={{ scale: 0.95 }}
                        type="submit" 
                        disabled={!input.trim() || loading}
                        className="bg-blue-600 text-white px-10 rounded-[2.5rem] transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center"
                    >
                        <Send size={28} />
                    </motion.button>
                </form>
            </div>
        </div>
    );
}
