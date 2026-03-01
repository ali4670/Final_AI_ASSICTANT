import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HelpCircle, 
    MessageSquare, 
    Mail, 
    Phone, 
    LifeBuoy, 
    FileText, 
    ChevronRight, 
    Search,
    Send,
    CheckCircle2,
    Shield,
    Globe,
    Zap,
    Cpu,
    ArrowLeft
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import WalkingStudent from '../components/3D/WalkingStudent';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SupportProps {
    onNavigate: (page: string, id?: string) => void;
}

const Support: React.FC<SupportProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const faqs = [
        { q: "How do I upload multiple documents?", a: "Go to your Library, click 'Upload Intelligence', and select multiple files from your device. Our engine will process them simultaneously." },
        { q: "Can I sync my flashcards across devices?", a: "Yes, all your data is automatically synced to the Supabase cloud. Simply log in with the same account on any device." },
        { q: "What file formats are supported?", a: "We currently support PDF, DOCX, XLSX, and TXT files for neural analysis." },
        { q: "Is there a limit to the number of flashcards?", a: "Currently, our standard engine generates up to 30 flashcards per document fragment, but there is no total limit for your library." }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !message) return;

        try {
            if (!supabase) throw new Error("Link Offline");
            
            const { error } = await supabase.from('support_messages').insert([{
                user_id: user?.id,
                email,
                subject: "Technical Inquiry",
                message,
                status: 'pending'
            }]);

            if (error) throw error;

            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 5000);
            setEmail('');
            setMessage('');
        } catch (err: any) {
            alert("Protocol failure: " + err.message);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-1000 ${
            theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-[#F8FAFC] text-slate-900'
        }`}>
            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
                <div className={`absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-20 ${
                    theme === 'dark' ? 'bg-blue-600' : 'bg-blue-400'
                }`} />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.button 
                        whileHover={{ x: -5 }}
                        onClick={() => onNavigate('home')}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all mb-12"
                    >
                        <ArrowLeft size={16} /> Return to Base
                    </motion.button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-8">
                                <LifeBuoy size={14} className="text-blue-500 animate-spin-slow" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Support Terminal Active</span>
                            </div>
                            
                            <h1 className="text-6xl md:text-8xl font-black mb-8 italic tracking-tighter uppercase leading-[0.9]">
                                Neural <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">
                                    Assistance
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl opacity-40 leading-relaxed mb-12 font-medium max-w-xl">
                                Encountering a technical glitch or need architectural guidance? Our support core is online 24/7.
                            </p>

                            <div className="relative max-w-lg">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                                <input 
                                    type="text"
                                    placeholder="Search the knowledge base..."
                                    className={`w-full py-6 pl-16 pr-8 rounded-[2rem] border outline-none transition-all font-bold ${
                                        theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-100 shadow-xl shadow-blue-500/5 focus:border-blue-500'
                                    }`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="flex justify-center relative h-[500px]"
                        >
                            <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-[100px]" />
                            <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 1, 5], fov: 50 }}>
                                <ambientLight intensity={0.5} />
                                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
                                <WalkingStudent />
                            </Canvas>
                            
                            {/* Floating stat chips */}
                            <motion.div 
                                animate={{ y: [0, -10, 0] }} 
                                transition={{ duration: 4, repeat: Infinity }}
                                className={`absolute top-20 right-0 p-4 rounded-2xl border backdrop-blur-xl ${
                                    theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <Zap size={16} className="text-green-500" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Latency: 24ms</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- CONTACT & FAQ SECTION --- */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* FAQ Column */}
                        <div className="lg:col-span-7">
                            <div className="mb-16">
                                <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">Knowledge Base</span>
                                <h2 className="text-5xl font-black italic tracking-tighter uppercase mt-4">Frequent Queries</h2>
                            </div>

                            <div className="space-y-6">
                                {faqs.map((faq, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true }}
                                        className={`p-8 rounded-[2.5rem] border group transition-all cursor-pointer ${
                                            theme === 'dark' ? 'bg-white/[0.02] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-blue-500/5'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-black italic uppercase tracking-tight">{faq.q}</h3>
                                            <ChevronRight className="text-blue-500 group-hover:translate-x-2 transition-transform" size={20} />
                                        </div>
                                        <p className="opacity-40 font-medium leading-relaxed">{faq.a}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ContactCard icon={<Mail size={24} />} label="Email Protocol" value="support@neuralstudy.ai" theme={theme} />
                                <ContactCard icon={<Phone size={24} />} label="Voice Uplink" value="+20 123 456 7890" theme={theme} />
                            </div>
                        </div>

                        {/* Support Form Column */}
                        <div className="lg:col-span-5">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className={`p-12 rounded-[4rem] border sticky top-32 ${
                                    theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 shadow-2xl shadow-blue-900/10' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/5'
                                }`}
                            >
                                <div className="text-center mb-10">
                                    <div className="w-20 h-20 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                                        <MessageSquare className="text-blue-500" size={32} />
                                    </div>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Direct Transmission</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-2">Open a priority ticket</p>
                                </div>

                                <AnimatePresence mode="wait">
                                    {submitted ? (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="text-center py-10"
                                        >
                                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <CheckCircle2 size={32} className="text-green-500" />
                                            </div>
                                            <h4 className="text-2xl font-black italic uppercase mb-2">Ticket Transmitted</h4>
                                            <p className="opacity-40 font-medium">Response expected within 4 neural cycles (24h).</p>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Identifier (Email)</label>
                                                <input 
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className={`w-full p-6 rounded-2xl border outline-none font-bold transition-all ${
                                                        theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-500'
                                                    }`}
                                                    placeholder="user@example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Data Packet (Message)</label>
                                                <textarea 
                                                    required
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    className={`w-full p-6 rounded-2xl border outline-none font-bold transition-all h-32 resize-none ${
                                                        theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-500'
                                                    }`}
                                                    placeholder="Describe the technical anomaly..."
                                                />
                                            </div>
                                            <motion.button 
                                                whileHover={{ scale: 1.02, backgroundColor: '#2563eb' }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all"
                                            >
                                                Transmit Ticket <Send size={14} />
                                            </motion.button>
                                        </form>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TRUST BADGES --- */}
            <section className={`py-20 border-t ${theme === 'dark' ? 'border-white/5 bg-[#080808]' : 'bg-slate-50/50 border-slate-100'}`}>
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex flex-col items-center gap-3">
                        <Shield size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <Globe size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Support Grid</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <Cpu size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Neural Core v2.0</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <Zap size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Uptime: 99.9%</span>
                    </div>
                </div>
            </section>

            <footer className={`py-20 px-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <LifeBuoy className="text-white" size={20} />
                        </div>
                        <span className="font-black italic tracking-tighter text-xl uppercase">Support Core</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-500 tracking-[0.4em] uppercase">© 2026 High Performance Learning Systems</p>
                </div>
            </footer>
        </div>
    );
};

const ContactCard = ({ icon, label, value, theme }: { icon: React.ReactNode, label: string, value: string, theme: 'light' | 'dark' }) => (
    <div className={`p-8 rounded-[2.5rem] border flex items-center gap-6 group transition-all ${
        theme === 'dark' ? 'bg-white/[0.02] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-100 hover:shadow-xl'
    }`}>
        <div className="p-4 bg-blue-600/10 text-blue-500 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-black italic tracking-tight uppercase">{value}</p>
        </div>
    </div>
);

export default Support;
