import React from 'react';
import { motion } from 'framer-motion';
import { 
    Cpu, Globe, Zap, Users, Brain, Shield, 
    BookOpen, Sparkles, MessageSquare, Target,
    CheckCircle2, ArrowRight
} from 'lucide-react';
import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUs';
import TiltCard from '../components/TiltCard';

interface HomeProps {
    onNavigate: (page: string, id?: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    
    const features = [
        {
            title: "Neural Sync",
            desc: "High-bandwidth AI dialogue engine capable of contextual retrieval and instant synthesis.",
            icon: MessageSquare,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            title: "Deep Focus",
            desc: "Immersive Pomodoro environment with 3D biome visualization and atmospheric audio.",
            icon: Target,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            title: "Smart Library",
            desc: "Vector-indexed document storage supporting PDF/TXT analysis and auto-summarization.",
            icon: BookOpen,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            title: "Cognitive Maps",
            desc: "3D visualization of your knowledge graph, linking concepts across different modules.",
            icon: Globe,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        }
    ];

    const stats = [
        { label: "Active Nodes", value: "12.4k+" },
        { label: "Queries Processed", value: "850k" },
        { label: "Uptime", value: "99.99%" },
        { label: "Neural Retention", value: "+45%" }
    ];

    return (
        <div className="relative min-h-screen bg-[#020202] text-white overflow-hidden">
            {/* Main Stage */}
            <Hero onNavigate={onNavigate} />

            {/* Stats Banner */}
            <div className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((s, i) => (
                            <div key={i} className="space-y-2">
                                <h3 className="text-4xl font-black italic tracking-tighter">{s.value}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div id="about" className="py-32 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020202] to-[#020202] -z-10" />
                <WhyChooseUs onNavigate={onNavigate} />
            </div>

            {/* Features Grid */}
            <section className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-4 block">System Architecture</span>
                        <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Modules</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((f, i) => (
                            <TiltCard key={i} className={`p-12 rounded-[3rem] border bg-[#0A0A0A] ${f.border} group hover:border-opacity-100 transition-all relative overflow-hidden`}>
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-white to-transparent`} />
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${f.bg} ${f.color} border border-white/5`}>
                                    <f.icon size={32} />
                                </div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">{f.title}</h3>
                                <p className="text-sm font-bold opacity-40 leading-relaxed uppercase tracking-widest max-w-sm">{f.desc}</p>
                                
                                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                                    <ArrowRight className={f.color} />
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial / Impact */}
            <section className="py-32 px-6 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="mb-12 flex justify-center">
                        <div className="flex -space-x-4">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-12 h-12 rounded-full border-2 border-[#020202] bg-gray-800 flex items-center justify-center text-xs font-black">
                                    U{i}
                                </div>
                            ))}
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight mb-8">
                        "The Neural Grid has completely rewritten my cognitive protocols. Retention is up 200%."
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-emerald-500">
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Verified User // Neural Node 049</span>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-48 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] -z-10" />
                
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none mb-12">
                        Ready to <br /> <span className="text-blue-500">Sync?</span>
                    </h2>
                    <p className="text-xl opacity-50 font-bold uppercase tracking-[0.3em] mb-16 max-w-2xl mx-auto">
                        Initialize your neural profile today and join the elite network of cognitive architects.
                    </p>
                    <button 
                        onClick={() => onNavigate('signup')}
                        className="px-16 py-8 bg-white text-black rounded-full font-black uppercase tracking-[0.4em] text-xs hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all"
                    >
                        Establish Uplink
                    </button>
                </div>
            </section>
            
            {/* Footer Pad */}
            <div className="h-20 border-t border-white/5 flex flex-col items-center justify-center gap-4 text-center">
                <div className="flex items-center gap-2 opacity-20">
                    <Cpu size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Neural Systems Inc.</span>
                </div>
                <p className="text-[8px] font-bold opacity-10 uppercase tracking-widest">v3.4.2 // Secure Connection</p>
            </div>
        </div>
    );
};

export default Home;
