import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Award, 
    BookOpen, 
    Globe, 
    Users, 
    Heart, 
    Star, 
    Rocket, 
    HomeIcon, 
    GraduationCap, 
    Book, 
    Library, 
    Sparkles,
    Zap,
    Code,
    Cpu
} from 'lucide-react';

import LabScene from '../components/3D/LabScene';

import { useTheme } from '../contexts/ThemeContext';

interface AboutProps {
    onNavigate: (page: string, id?: string) => void;
}

const About: React.FC<AboutProps> = ({ onNavigate }) => {
    const { theme } = useTheme();

    const achievements = [
        { icon: Users, number: '50,000+', label: 'Students Joined', color: 'from-blue-500 to-blue-600' },
        { icon: BookOpen, number: '15+', label: 'Years Experience', color: 'from-green-500 to-green-600' },
        { icon: Globe, number: '10+', label: 'Ai assistants', color: 'from-purple-500 to-purple-600' },
        { icon: Award, number: '98%', label: 'Success Rate', color: 'from-yellow-500 to-yellow-600' },
    ];

    const testimonials = [
        {
            name: 'Sarah Johnson',
            country: 'USA',
            text: 'Smart learning made simple. I understand more, study faster, and feel confident every day!',
            rating: 5
        },
        {
            name: 'Ahmed Ali',
            country: 'UK',
            text: 'AI-powered guidance transformed how I learn — no more confusion, just progress.',
            rating: 5
        },
        {
            name: 'Maria Rodriguez',
            country: 'Spain',
            text: 'From struggling with lessons to mastering them — this app changed the way I study!',
            rating: 5
        }
    ];

    return (
        <div className={`min-h-screen transition-colors duration-1000 overflow-hidden ${
            theme === 'dark' ? 'bg-[#050505]' : 'bg-[#F8FAFC]'
        }`}>
            
            {/* Hero Section */}
            <section className={`relative py-32 overflow-hidden transition-colors ${
                theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-white text-slate-900 border-b border-blue-50'
            }`}>
                {/* Background animations */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ 
                                x: Math.random() * 100 + "%", 
                                y: Math.random() * 100 + "%",
                                opacity: Math.random()
                            }}
                            animate={{ 
                                y: [null, Math.random() * 100 + "%"],
                                opacity: [0, 1, 0]
                            }}
                            transition={{ 
                                duration: Math.random() * 10 + 10, 
                                repeat: Infinity, 
                                ease: "linear" 
                            }}
                            className={`absolute w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'}`}
                        />
                    ))}
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border ${
                                    theme === 'dark' ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
                                }`}
                            >
                                <Cpu size={14} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Architect Profile</span>
                            </motion.div>

                            <h1 className="text-6xl md:text-8xl font-black mb-8 italic tracking-tighter uppercase leading-[0.9]">
                                Meet <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                                    Ali Ahmed
                                </span>
                            </h1>

                            <p className={`text-xl md:text-2xl leading-relaxed mb-12 font-medium max-w-xl ${
                                theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
                            }`}>
                                Full-Stack Visionary & AI Enthusiast. Building the next generation of neural study engines since 2018.
                            </p>

                            <div className="flex flex-wrap gap-6">
                                <motion.button 
                                    whileHover={{ scale: 1.05, x: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onNavigate('home')} 
                                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
                                        theme === 'dark' ? 'bg-white text-black shadow-blue-500/10' : 'bg-slate-900 text-white shadow-blue-900/10'
                                    }`}
                                >
                                    <HomeIcon size={18} /> Return Home
                                </motion.button>
                                
                                <div className={`flex items-center gap-4 px-6 py-4 border rounded-2xl ${
                                    theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                }`}>
                                    <Heart className="w-5 h-5 text-red-500 animate-pulse" />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                                    }`}>Coding with Passion</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ 
                                type: "spring",
                                stiffness: 100,
                                damping: 20,
                                delay: 0.3 
                            }}
                            className="flex justify-center"
                        >
                            <div className="relative group w-full">
                                <div className={`absolute -inset-8 rounded-full blur-3xl transition-all duration-700 ${
                                    theme === 'dark' ? 'bg-blue-600/20 group-hover:bg-blue-600/40' : 'bg-blue-400/10 group-hover:bg-blue-400/20'
                                }`} />
                                <LabScene />
                                
                                <motion.div
                                    animate={{ 
                                        y: [0, -10, 0],
                                        rotate: [0, 5, 0]
                                    }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className={`absolute -top-10 -right-10 border p-4 rounded-2xl shadow-2xl transition-colors ${
                                        theme === 'dark' ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-100'
                                    }`}
                                >
                                    <Code size={24} className="text-blue-600" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section className={`py-32 relative transition-colors ${
                theme === 'dark' ? 'bg-[#080808]' : 'bg-[#F8FAFC]'
            }`}>
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        className="text-center mb-24"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-blue-600 font-black uppercase tracking-[0.4em] text-[10px]">Mission Stats</span>
                        <h2 className={`text-5xl md:text-7xl font-black mt-4 italic tracking-tighter uppercase ${
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>Excellence in Motion</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {achievements.map((achievement, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -10 }}
                                className={`p-10 rounded-[3rem] text-center group transition-all duration-500 border ${
                                    theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-100 hover:shadow-2xl'
                                }`}
                            >
                                <motion.div
                                    className={`w-20 h-20 bg-gradient-to-r ${achievement.color} rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/20`}
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <achievement.icon className="w-10 h-10 text-white" />
                                </motion.div>
                                <h3 className={`text-5xl font-black mb-2 italic tracking-tighter ${
                                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                                }`}>{achievement.number}</h3>
                                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                                }`}>{achievement.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className={`py-32 relative overflow-hidden transition-colors ${
                theme === 'dark' ? 'bg-[#050505]' : 'bg-white border-y border-slate-50'
            }`}>
                <div className={`absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full blur-[150px] ${
                    theme === 'dark' ? 'bg-blue-600/5' : 'bg-blue-400/5'
                }`} />
                
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className={`aspect-square border rounded-[4rem] p-12 flex flex-col items-center justify-center text-center group transition-colors ${
                                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'
                            }`}>
                                <Rocket size={120} className="text-blue-600 mb-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-700" />
                                <h3 className={`text-3xl font-black italic tracking-tighter uppercase mb-4 ${
                                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                                }`}>Launch Sequence</h3>
                                <div className="flex gap-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: i * 0.2 + "s" }} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className={`text-5xl mb-10 italic tracking-tighter uppercase leading-none ${
                                theme === 'dark' ? 'text-white' : 'text-slate-900'
                            }`}>
                                The <span className="text-blue-600">Origin</span> <br /> Story
                            </h2>
                            
                            <div className={`space-y-6 font-medium text-lg leading-relaxed ${
                                theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
                            }`}>
                                <p>
                                    My journey with coding began in 2018. It wasn't just about learning syntax; it was about discovering a new way to interact with reality.
                                </p>
                                <p>
                                    I focused on the intersection of human psychology and machine learning. How can we make study sessions not just efficient, but addictive?
                                </p>
                                <p>
                                    The result is what you see today — a neural study environment that adapts, learns, and grows with the student.
                                </p>
                            </div>

                            <div className={`mt-12 p-8 border rounded-[2rem] relative ${
                                theme === 'dark' ? 'bg-blue-600/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'
                            }`}>
                                <Sparkles className="absolute -top-4 -left-4 text-blue-600" size={32} />
                                <blockquote className={`text-xl font-bold italic leading-relaxed text-center ${
                                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                                }`}>
                                    "Your journey as a Sentiens begins here — smarter, stronger, unstoppable."
                                </blockquote>
                                <p className="text-center text-blue-600 font-black uppercase text-[10px] tracking-widest mt-6">
                                    — Ali Ahmed
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className={`py-32 transition-colors ${
                theme === 'dark' ? 'bg-[#080808]' : 'bg-[#F8FAFC]'
            }`}>
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="mb-24"
                    >
                        <span className="text-blue-600 font-black uppercase tracking-[0.4em] text-[10px]">User Verdicts</span>
                        <h2 className={`text-5xl md:text-7xl font-black mt-4 italic tracking-tighter uppercase ${
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>The Human Element</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -15 }}
                                className={`rounded-[3rem] p-12 text-left border group transition-all duration-500 ${
                                    theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-100 hover:shadow-2xl'
                                }`}
                            >
                                <div className="flex items-center gap-1 mb-8">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-blue-600 fill-current" />
                                    ))}
                                </div>
                                <p className={`mb-10 text-lg font-medium leading-relaxed italic ${
                                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                                }`}>"{testimonial.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${
                                        theme === 'dark' ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                        {testimonial.name[0]}
                                    </div>
                                    <div>
                                        <h4 className={`font-black uppercase text-xs tracking-widest ${
                                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                                        }`}>{testimonial.name}</h4>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{testimonial.country}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className={`py-12 border-t transition-colors ${
                theme === 'dark' ? 'bg-[#050505] border-white/5' : 'bg-slate-900 border-transparent'
            }`}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <Zap className="text-white" size={20} />
                        </div>
                        <span className="font-black italic tracking-tighter text-xl text-white uppercase">NeuroStudy</span>
                    </div>
                    <p className={`text-[10px] font-black tracking-[0.4em] uppercase ${
                        theme === 'dark' ? 'text-gray-700' : 'text-slate-500'
                    }`}>© 2026 Ali Ahmed // Engineered for Excellence</p>
                </div>
            </footer>
        </div>
    );
};

export default About;
