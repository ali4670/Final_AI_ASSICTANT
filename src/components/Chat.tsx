import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, Loader, Trash2, BookOpen } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface Document {
    id: string;
    title: string;
    content: string;
}

export default function Chat({ onNavigate, documentId }: { onNavigate: (p: string) => void, documentId?: string }) {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadDocuments = useCallback(async () => {
        if (!user || !supabase) return;
        const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (data) setDocuments(data as Document[]);
    }, [user]);

    useEffect(() => { void loadDocuments(); }, [loadDocuments]);

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
        setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
        const currentMsgIndex = messages.length + 1;
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    documentContent: selectedDoc.content,
                    conversationHistory: messages.slice(-6),
                    documentId: selectedDoc.id
                }),
            });

            if (!response.body) throw new Error('No response body');
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);
                        if (dataStr === '[DONE]') continue;
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.error) throw new Error(data.error);
                            if (data.content) {
                                accumulatedContent += data.content;
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    newMsgs[currentMsgIndex] = { role: 'assistant', content: accumulatedContent };
                                    return newMsgs;
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data', e);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[currentMsgIndex] = { role: 'assistant', content: "Error: AI took too long or server is down." };
                return newMsgs;
            });
        } finally {
            setLoading(false);
        }
    };

    if (!selectedDoc) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <button onClick={() => onNavigate('dashboard')} className="mb-4 flex items-center gap-2"><ArrowLeft /> Back</button>
                <h1 className="text-2xl font-bold mb-4">Select Document</h1>
                <div className="space-y-3">
                    {documents.map(doc => (
                        <button key={doc.id} onClick={() => setSelectedDoc(doc)} className="w-full text-left p-4 border rounded-xl hover:bg-blue-50">
                            {doc.title}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            <header className="p-4 border-b flex justify-between items-center">
                <button onClick={() => setSelectedDoc(null)}><ArrowLeft /></button>
                <h2 className="font-bold">{selectedDoc.title}</h2>
                <div />
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && <Loader className="animate-spin mx-auto text-blue-600" />}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
                <input className="flex-1 border p-2 rounded-lg" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask something..." />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg"><Send /></button>
            </form>
        </div>
    );
}