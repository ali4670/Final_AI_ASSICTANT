import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Paperclip, Smile, ArrowLeft, 
    MoreVertical, User, FileText, CheckCheck, 
    Image as ImageIcon, Loader, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    file_url?: string;
    message_type: 'text' | 'file' | 'image';
    created_at: string;
    is_seen: boolean;
}

const Messenger: React.FC<{ onNavigate: (p: string) => void, friendId: string }> = ({ onNavigate, friendId }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [friendProfile, setFriendProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && friendId) {
            fetchChatData();
            const subscription = subscribeToMessages();
            return () => { subscription.unsubscribe(); };
        }
    }, [user, friendId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchChatData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Friend Profile
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', friendId).single();
            setFriendProfile(profile);

            // 2. Fetch Message History
            const { data: chatHistory } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user?.id})`)
                .order('created_at', { ascending: true });

            setMessages(chatHistory || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const subscribeToMessages = () => {
        return supabase
            .channel('public:messages')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages',
                filter: `receiver_id=eq.${user?.id}`
            }, payload => {
                const msg = payload.new as Message;
                if (msg.sender_id === friendId) {
                    setMessages(prev => [...prev, msg]);
                }
            })
            .subscribe();
    };

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !user) return;

        const messageData = {
            sender_id: user.id,
            receiver_id: friendId,
            content: newMessage,
            message_type: 'text'
        };

        try {
            const { data, error } = await supabase.from('messages').insert(messageData).select().single();
            if (error) throw error;
            setMessages(prev => [...prev, data]);
            setNewMessage('');
        } catch (err) { console.error(err); }
    };

    return (
        <div className={`min-h-screen pt-12 pb-8 px-8 transition-all duration-700 ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'}`}>
            
            <div className={`max-w-5xl mx-auto w-full flex-1 flex flex-col border rounded-[3rem] backdrop-blur-3xl overflow-hidden shadow-2xl relative ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
                
                {/* --- CHAT HEADER --- */}
                <header className={`p-8 border-b flex justify-between items-center ${theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-center gap-6">
                        <button onClick={() => onNavigate('social')} className={`p-4 rounded-2xl transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}>
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-black text-xl border-2 ${theme === 'dark' ? 'border-white/10' : 'border-white shadow-md'}`}>
                                    {friendProfile?.avatar_url ? <img src={friendProfile.avatar_url} className="w-full h-full object-cover" /> : friendProfile?.username?.[0].toUpperCase()}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 rounded-full ${theme === 'dark' ? 'border-[#0D0D0D]' : 'border-white'}`} />
                            </div>
                            <div>
                                <h2 className={`font-black uppercase tracking-widest text-lg leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{friendProfile?.username || 'Linking...'}</h2>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest opacity-60">Connected Node</span>
                            </div>
                        </div>
                    </div>
                    <button className="p-4 opacity-20 hover:opacity-100 transition-opacity"><MoreVertical size={20} /></button>
                </header>

                {/* --- MESSAGE AREA --- */}
                <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                            <Loader className="animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Stream</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4">
                            <Sparkles size={48} />
                            <p className="text-sm font-black uppercase tracking-[0.3em]">Start a new neural thread</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.sender_id === user?.id;
                            return (
                                <motion.div 
                                    key={msg.id}
                                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] group ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                                        <div className={`p-5 rounded-[2rem] text-sm font-bold leading-relaxed shadow-xl ${
                                            isMe 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : (theme === 'dark' ? 'bg-white/10 text-white rounded-tl-none border border-white/5' : 'bg-slate-100 text-slate-900 border-slate-200 rounded-tl-none')
                                        }`}>
                                            {msg.content}
                                        </div>
                                        <div className="flex items-center gap-2 px-2">
                                            <span className="text-[8px] font-black opacity-20 uppercase">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {isMe && <CheckCheck size={12} className={msg.is_seen ? "text-cyan-400" : "opacity-20"} />}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* --- INPUT AREA --- */}
                <footer className={`p-8 border-t ${theme === 'dark' ? 'bg-black/40 backdrop-blur-2xl border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                    <form onSubmit={sendMessage} className="flex items-center gap-4">
                        <button type="button" className={`p-4 rounded-2xl transition-all ${theme === 'dark' ? 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10' : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-900'}`}>
                            <Paperclip size={20} />
                        </button>
                        <input 
                            type="text" 
                            placeholder="TRANSMIT MESSAGE..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className={`flex-1 border rounded-2xl py-4 px-6 text-xs font-black uppercase tracking-widest outline-none transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-blue-500/50' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'}`}
                        />
                        <button 
                            type="submit"
                            className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default Messenger;
