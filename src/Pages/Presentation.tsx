import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
    Cpu, Code2, Layout, Database, Sparkles, 
    ShieldCheck, Globe, Zap, Box, Layers,
    FileText, MessageSquare, Brain, GraduationCap,
    Clock, ListTodo, Shield, UserCircle, Bot,
    Camera, Radio, Share2, Target, Smartphone,
    Hand, ShoppingBag, Users, Calendar, Network,
    Lock, Eye, Activity, Terminal, Key,
    Star, TrendingUp, Trophy, BookOpen
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import TiltCard from '../components/TiltCard';

interface PresentationProps {
    onNavigate?: (page: string) => void;
}

const Presentation: React.FC<PresentationProps> = ({ onNavigate }) => {
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const systemLayers = [
        {
            layer: "Layer 1: The Neural Core (Infrastructure)",
            color: "text-blue-500",
            border: "border-blue-500/20",
            bg: "bg-blue-500/5",
            features: [
                { title: "Supabase Architecture", desc: "Real-time PostgreSQL database with Row Level Security (RLS) policies ensuring 100% data isolation between users.", icon: Database },
                { title: "Authentication Matrix", desc: "Multi-provider auth (Email, GitHub, Anonymous Guest) with persistent session management via Context API.", icon: Lock },
                { title: "React 18 + Vite", desc: "High-performance frontend powered by Concurrent Mode and instant HMR for sub-millisecond interaction latency.", icon: Zap },
                { title: "TypeScript Strictness", desc: "End-to-end type safety ensuring payload integrity from database to UI components.", icon: Code2 }
            ]
        },
        {
            layer: "Layer 2: Cognitive Synthesis (AI Engine)",
            color: "text-purple-500",
            border: "border-purple-500/20",
            bg: "bg-purple-500/5",
            features: [
                { title: "Llama 3.3 70B Core", desc: "The primary reasoning engine via Groq SDK, delivering blazing fast tokens for chat and content generation.", icon: Brain },
                { title: "RAG Protocol", desc: "Retrieval-Augmented Generation system that injects user document context into AI prompts for factually accurate answers.", icon: FileText },
                { title: "Neural Summarizer", desc: "Automated extraction pipeline that converts PDFs/Text into concise markdown summaries and study points.", icon: Sparkles },
                { title: "Vision Uplink", desc: "OCR integration allowing mobile users to scan textbooks directly into the knowledge base.", icon: Camera }
            ]
        },
        {
            layer: "Layer 3: Engagement Protocols (Gamification)",
            color: "text-amber-500",
            border: "border-amber-500/20",
            bg: "bg-amber-500/5",
            features: [
                { title: "Stellar Merit System", desc: "Global currency economy. Users earn 'Stars' for studying, which are cryptographically verified via RPC functions.", icon: Star },
                { title: "Marketplace Economy", desc: "Virtual item shop for purchasing themes and boosters. Inventory logic prevents duplicate purchases.", icon: ShoppingBag },
                { title: "XP & Leveling", desc: "Mathematical progression curve. XP is calculated based on quiz performance and session duration.", icon: TrendingUp },
                { title: "Leaderboard Logic", desc: "Real-time ranking engine sorting users by Stars or XP, fostering competitive academic growth.", icon: Trophy }
            ]
        },
        {
            layer: "Layer 4: Human Interface (UX/Accessibility)",
            color: "text-emerald-500",
            border: "border-emerald-500/20",
            bg: "bg-emerald-500/5",
            features: [
                { title: "Neural Vision (Sign)", desc: "TensorFlow.js & MediaPipe integration for hand-gesture recognition, enabling silent/sign-language control.", icon: Hand },
                { title: "Stealth Navigation", desc: "Auto-hiding, glass-morphic navigation bar that reacts to user presence for maximum screen real-estate.", icon: Layout },
                { title: "Focus Engine (Pomodoro)", desc: "Immersive, single-page deep work timer with ambient soundscapes (Rain, Coffee Shop, Mars).", icon: Clock },
                { title: "Adaptive Theming", desc: "System-wide Dark/Light mode with contrast-aware pallets for headers, cards, and text.", icon: Eye }
            ]
        }
    ];

    const specificModules = [
        { name: "Social Hub", desc: "Peer-to-peer networking. Add friends, view statuses, and chat in real-time.", icon: Users },
        { name: "AI Planner", desc: "7-Day schedule architect. Generates personalized study plans based on your library.", icon: Calendar },
        { name: "Admin Terminal", desc: "Super-user control panel. Manage users, reset keys, and resolve support tickets.", icon: Terminal },
        { name: "Document Reader", desc: "Distraction-free reading environment with integrated AI chat sidebar.", icon: BookOpen }
    ];

    return (
        <div ref={containerRef} className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-1000 relative overflow-hidden ${theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-slate-50 text-slate-900'}`}>
            
            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Hero Header */}
                <motion.header style={{ y, opacity }} className="text-center mb-40 pt-20">
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 mb-8 shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-pulse">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">System Status: Victory</span>
                    </div>
                    <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] mb-8">
                        Neural <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">Architect</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-bold opacity-40 uppercase tracking-[0.4em] max-w-3xl mx-auto">
                        The Final Technical Manifesto & Project Breakdown
                    </p>
                </motion.header>

                {/* System Layers Breakdown */}
                <div className="space-y-32">
                    {systemLayers.map((layer, i) => (
                        <section key={i} className="relative">
                            <div className={`absolute -left-4 top-0 bottom-0 w-1 ${layer.bg.replace('/5', '')} rounded-full`} />
                            <div className="pl-12">
                                <h2 className={`text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-12 ${layer.color}`}>{layer.layer}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {layer.features.map((feat, j) => (
                                        <TiltCard key={j} className={`p-8 rounded-[2.5rem] border transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${layer.bg} ${layer.border} border`}>
                                                <feat.icon className={layer.color} size={28} />
                                            </div>
                                            <h3 className="text-2xl font-black italic uppercase mb-3">{feat.title}</h3>
                                            <p className={`text-xs font-bold leading-relaxed opacity-50 uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>{feat.desc}</p>
                                        </TiltCard>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                {/* Specific Modules Grid */}
                <section className="mt-48">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">Specialized Nodes</h2>
                        <p className="text-sm font-bold opacity-40 uppercase tracking-[0.4em] mt-4">Advanced Functionality & Tooling</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {specificModules.map((m, i) => (
                            <TiltCard key={i} className={`p-8 rounded-[3rem] border flex flex-col items-center text-center ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-200 shadow-lg'}`}>
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                    <m.icon size={32} className="text-blue-500" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase mb-2">{m.name}</h3>
                                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed">{m.desc}</p>
                            </TiltCard>
                        ))}
                    </div>
                </section>

                {/* Final Credits */}
                <footer className="mt-64 pt-32 border-t border-white/10 text-center space-y-8">
                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)]">
                        <Bot size={48} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter">Mission Complete</h3>
                        <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.6em] mt-4">Ali Ahmed // Lead Architect // 2026</p>
                        <p className="text-[10px] font-bold opacity-20 uppercase tracking-[0.4em] mt-2">Neural Study Grid v3.4.2</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

// Export
export default Presentation;
