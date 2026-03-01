import React from 'react';
import { motion } from 'framer-motion';
import { 
    Cpu, Code2, Layout, Database, Sparkles, 
    ShieldCheck, Globe, Zap, Box, Layers,
    FileText, MessageSquare, Brain, GraduationCap,
    Clock, ListTodo, Shield, UserCircle, Bot,
    Camera, Radio, Share2, Target, Smartphone
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Presentation: React.FC = () => {
    const { theme } = useTheme();

    const techStack = [
        { name: 'React 18', icon: Box, desc: 'Component-based UI architecture with Concurrent Mode support.', color: 'text-blue-400' },
        { name: 'TypeScript', icon: Code2, desc: 'Strict type-safety for reliable academic data handling.', color: 'text-blue-600' },
        { name: 'Vite 5', icon: Zap, desc: 'Next-generation frontend tooling for instantaneous hot-reloads.', color: 'text-amber-400' },
        { name: 'Tailwind CSS', icon: Layout, desc: 'Utility-first CSS for futuristic, high-performance styling.', color: 'text-cyan-400' },
        { name: 'Supabase', icon: Database, desc: 'PostgreSQL infrastructure with real-time Row Level Security.', color: 'text-emerald-500' },
        { name: 'Framer Motion', icon: Sparkles, desc: 'Physics-based animation engine for immersive UX.', color: 'text-purple-500' },
        { name: 'Three.js / R3F', icon: Globe, desc: '3D WebGL rendering for neural visualizations.', color: 'text-white' },
        { name: 'Node.js/Express', icon: Cpu, desc: 'High-bandwidth neural synthesis backend engine.', color: 'text-green-500' }
    ];

    const modules = [
        {
            title: "Neural Dashboard",
            icon: Layout,
            desc: "The primary command interface for the grid. It utilizes a dynamic CSS grid layout with Framer Motion entry animations to organize all academic protocols. Real-time statistics are fetched from Supabase via specialized aggregate queries to track user progress.",
            tech: "React Hooks, Framer Motion, Supabase SDK",
            features: ["Activity Pulse Tracking", "Temporal Streak Logic", "Neural Object Metrics"]
        },
        {
            title: "Neural Sync (Dialogue)",
            icon: MessageSquare,
            desc: "Advanced high-bandwidth communication channel with the AI core. It supports streaming responses through Server-Sent Events (SSE) and contextual retrieval (RAG) to answer questions specifically about uploaded document fragments.",
            tech: "Groq SDK, Llama 3.3 70B, WebSocket Emulation",
            features: ["Context-Aware Synthesis", "Neural Dialogue Streaming", "History Persistence"]
        },
        {
            title: "Neural Synthesis (Reports)",
            icon: Sparkles,
            desc: "Deep cognitive processing engine that performs multi-stage analysis on documents. It extracts key concepts, generates markdown summaries, and builds full evaluation protocols (Quizzes and Exams) in a single pass.",
            tech: "JSON Repair Algorithms, GPT-4o, Prompt Engineering",
            features: ["Automatic Markdown Generation", "One-Click PDF Export", "Cross-Document Analytics"]
        },
        {
            title: "Botanical Registry (Trees)",
            icon: Radio,
            desc: "An experimental 3D biome that visualizes focus discipline. Using Three.js and React Three Fiber, it renders an evolving digital plant that grows based on Pomodoro completion points stored in the neural profile.",
            tech: "Three.js, React Three Fiber, Custom Shaders",
            features: ["Evolutionary Stage Logic", "3D Particle Systems", "Growth Index Metrics"]
        },
        {
            title: "Neural Web (Graph)",
            icon: Share2,
            desc: "A multidimensional knowledge visualization. It maps document fragments as nodes in a 3D space, calculating semantic links based on title intersections and shared keywords to show how your information is connected.",
            tech: "THREE.ForceGraph, OrbitControls, Float Physics",
            features: ["Interactive Node Exploration", "Heuristic Link Calculation", "Spatial Proximity Mapping"]
        },
        {
            title: "Recall Nodes (Flashcards)",
            icon: Brain,
            desc: "Spaced-repetition memory engine. It converts raw data into active-recall nodes. The AI prevents duplicate generation by analyzing existing questions in the database before architecting new ones.",
            tech: "Spaced Repetition Algorithm, PostgreSQL JSONB",
            features: ["Smart Avoidance Logic", "Difficulty Tiering", "Instant UI Re-sync"]
        },
        {
            title: "Cognitive Map (Mastery)",
            icon: Target,
            desc: "High-level mastery tracking. It visualizes your performance across all evaluation protocols as a glowing 3D brain heatmap. Each region corresponds to a different document fragment in your library.",
            tech: "Particle-Based Shaders, Score Aggregation Logic",
            features: ["Performance Heatmapping", "Node-Level Analytics", "Average Mastery Mean Calculation"]
        },
        {
            title: "Camera Uplink (Vision)",
            icon: Camera,
            desc: "The bridge between physical and digital. Using mobile device camera access and GPT-4o Vision, it performs OCR and deep semantic analysis on physical textbook pages to instantly create Recall Nodes.",
            tech: "MediaDevices API, GPT-4o Vision, Canvas Processing",
            features: ["Mobile-Optimized Scanner", "AI-OCR Extraction", "Direct Grid Sync"]
        },
        {
            title: "Command Center (Admin)",
            icon: Shield,
            desc: "The administrative node for global system management. Admins can manage API keys, override user credentials, promote units to admin status, and monitor support transmissions in real-time.",
            tech: "Supabase RPC, Admin Edge Functions",
            features: ["System Config Management", "Admin Toggle Logic", "Support Ticket Pipeline"]
        }
    ];

    return (
        <div className={`min-h-screen py-24 px-8 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-32 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 mb-8"
                    >
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Classified // Neural Study Manifesto</span>
                    </motion.div>
                    <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none mb-8">
                        The Neural <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-black">Grid</span>
                    </h1>
                    <p className="text-xl font-bold opacity-40 uppercase tracking-[0.4em]">Architecture Level 4 // Technical Blueprint</p>
                </header>

                {/* Tech Foundation Section */}
                <section className="mb-48">
                    <div className="flex items-center gap-4 mb-16">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/20" />
                        <h2 className="text-[10px] font-black uppercase tracking-[1em] opacity-30 text-blue-500">Core Infrastructure</h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/20" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {techStack.map((tech, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`p-8 rounded-[3rem] border transition-all hover:scale-105 duration-500 ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'}`}
                            >
                                <tech.icon className={`mb-6 ${tech.color}`} size={36} />
                                <h3 className="font-black italic uppercase text-xl mb-3 tracking-tighter">{tech.name}</h3>
                                <p className="text-xs font-medium opacity-50 leading-relaxed mb-4">{tech.desc}</p>
                                <div className={`h-1 w-12 rounded-full ${tech.color.replace('text-', 'bg-')}`} />
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Page Overviews */}
                <section className="space-y-48 pb-32">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/20" />
                        <h2 className="text-[10px] font-black uppercase tracking-[1em] opacity-30 text-blue-500">Module Blueprint</h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/20" />
                    </div>

                    {modules.map((m, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-20 items-center`}
                        >
                            <div className="flex-1 space-y-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-6">
                                        <div className="p-6 rounded-[2.5rem] bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-xl shadow-blue-600/5">
                                            <m.icon size={40} strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">{m.title}</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {m.features.map((f, idx) => (
                                            <span key={idx} className="px-4 py-1.5 bg-blue-600/5 text-blue-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-500/10">{f}</span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xl md:text-2xl font-medium opacity-60 leading-relaxed tracking-tight">{m.desc}</p>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Stack Integration:</p>
                                    <div className="flex flex-wrap gap-3">
                                        {m.tech.split(', ').map((t, idx) => (
                                            <span key={idx} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                theme === 'dark' ? 'bg-white/5 border-white/10 text-white/60' : 'bg-slate-50 border-slate-200 text-slate-600'
                                            }`}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Visual Representation */}
                            <div className="flex-1 w-full aspect-square md:aspect-video rounded-[4.5rem] border-8 border-white/5 overflow-hidden relative group shadow-2xl">
                                <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-900/30 group-hover:opacity-40 transition-opacity duration-1000`} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="relative">
                                        <m.icon size={120} className="opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                            className="absolute inset-0 border-4 border-dashed border-blue-500/10 rounded-full scale-150" 
                                        />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.8em] opacity-20 italic mt-16">Visual Protocol // Uplink Ready</p>
                                </div>
                                
                                {/* Mock Code Overlay */}
                                <div className="absolute bottom-10 left-10 opacity-20 font-mono text-[8px] space-y-1">
                                    <p className="text-blue-400">module {m.title.replace(' ', '')} {'{'}</p>
                                    <p className="pl-4">status: "active",</p>
                                    <p className="pl-4">integrity: 1.0,</p>
                                    <p className="text-blue-400">{'}'}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </section>

                <footer className="mt-48 pt-20 border-t border-white/5 flex flex-col items-center gap-8">
                    <Bot size={48} className="text-blue-600 opacity-20" />
                    <div className="text-center space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[1em] opacity-20">Neural Study Grid v2.4 // Proprietary Protocol</p>
                        <p className="text-[8px] font-bold opacity-10 uppercase tracking-widest">Engineered by Neural Architect Ali Ahmed // 2026</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Presentation;
