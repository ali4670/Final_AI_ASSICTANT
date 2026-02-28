import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  BookOpen, 
  Zap, 
  Brain, 
  MessageSquare, 
  Send, 
  GraduationCap, 
  Book, 
  Library,
  Cpu,
  Sparkles,
  Shield,
  ChevronRight,
  LifeBuoy
} from 'lucide-react';
import HeroScene from './3D/HeroScene';
import { useTheme } from '../contexts/ThemeContext';

interface HeroProps {
  onNavigate: (page: string, id?: string) => void;
}

const StudentHead = () => {
    const books = [
        { icon: Book, x: -60, y: -60, delay: 0 },
        { icon: Library, x: 60, y: -60, delay: 0.1 },
        { icon: BookOpen, x: 0, y: -80, delay: 0.2 },
    ];

    return (
        <div className="relative">
            <motion.div
                animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 2, -2, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[3.5rem] flex items-center justify-center shadow-[0_0_100px_rgba(37,99,235,0.3)] relative z-10 border-2 border-white/20"
            >
                <GraduationCap size={80} className="text-white md:w-32 md:h-32" />
                
                {/* Book fragments floating around */}
                {books.map((BookItem, i) => (
                    <motion.div
                        key={i}
                        animate={{ 
                            y: [BookItem.y, BookItem.y - 15, BookItem.y],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            delay: BookItem.delay,
                            ease: "easeInOut" 
                        }}
                        className="absolute top-1/2 left-1/2 z-0"
                        style={{ marginLeft: BookItem.x, marginTop: BookItem.y }}
                    >
                        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl">
                            <BookItem.icon size={24} className="text-blue-400" />
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { theme, language } = useTheme();

  const handleFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setFeedback('');
    }
  };

  const t = {
    en: {
      system: "Neural Core Online",
      engineered: "EVOLVE",
      toLearn: "YOUR STUDY",
      desc: "Architecting the future of academic performance. Transform raw data into structured knowledge with our Llama-3.3 powered neural engine.",
      launch: "Enter Interface",
      specs: "Core Architecture",
      quote: "System efficiency exceeds all expectations.",
      opinion: "Sync Feedback",
      feedbackDesc: "Transmit your technical findings to the development core.",
      placeholder: "Technical verdict...",
      transmit: "Transmit",
      sent: "Transmitted",
      copyright: "© 2026 NeuroStudy // Global Grid"
    },
    ar: {
      system: "النظام العصبي متصل",
      engineered: "طور",
      toLearn: "دراستك",
      desc: "هندسة مستقبل الأداء الأكاديمي. حول البيانات الخام إلى معرفة منظمة باستخدام محركنا العصبي المدعوم بـ Llama-3.3.",
      launch: "دخول الواجهة",
      specs: "بنية النظام",
      quote: "كفاءة النظام تتجاوز كل التوقعات.",
      opinion: "ملاحظات المزامنة",
      feedbackDesc: "أرسل نتائجك التقنية إلى مركز التطوير.",
      placeholder: "الحكم التقني...",
      transmit: "إرسال",
      sent: "تم الإرسال",
      copyright: "© 2026 NeuroStudy // الشبكة العالمية"
    }
  }[language];

  return (
    <div className={`relative min-h-screen overflow-hidden z-10 transition-colors duration-1000 ${
        theme === 'dark' ? 'text-white' : 'text-slate-900'
    }`}>
      {/* 3D Background Scene */}
      <HeroScene />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full mb-10 border transition-colors ${
                    theme === 'dark' ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
                }`}>
                    <Cpu size={14} className="animate-spin-slow" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t.system}</span>
                </div>

                <h1 className="text-7xl md:text-9xl font-black mb-10 tracking-tighter leading-[0.8] italic uppercase">
                {t.engineered} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
                    {t.toLearn}
                </span>
                </h1>

                <p className={`text-xl md:text-2xl mb-14 max-w-xl font-medium leading-relaxed transition-colors ${
                    theme === 'dark' ? 'opacity-60 text-white' : 'text-slate-600'
                }`}>
                {t.desc}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <motion.button
                        onClick={() => onNavigate('dashboard')}
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 group shadow-[0_0_50px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-700"
                    >
                        {t.launch} <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                    
                    <motion.button
                        onClick={() => onNavigate('about')}
                        whileHover={{ scale: 1.05 }}
                        className={`w-full sm:w-auto px-12 py-6 backdrop-blur-xl border rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all ${
                            theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200'
                        }`}
                    >
                        {t.specs}
                    </motion.button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex justify-center relative"
            >
                <div className="relative group">
                    <div className={`absolute -inset-20 rounded-full blur-[120px] transition-all duration-1000 ${
                        theme === 'dark' ? 'bg-blue-600/20 group-hover:bg-blue-600/30' : 'bg-blue-400/10 group-hover:bg-blue-400/20'
                    }`} />
                    <StudentHead />
                    
                    {/* Floating HUD elements */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={`absolute -top-10 -right-10 backdrop-blur-2xl border p-6 rounded-[2rem] shadow-2xl hidden md:block transition-colors ${
                            theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/80 border-slate-200'
                        }`}
                    >
                        <Brain size={32} className="text-blue-600" />
                        <div className={`h-1 w-12 rounded-full overflow-hidden mt-2 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                            <motion.div animate={{ x: [-48, 48] }} transition={{ duration: 2, repeat: Infinity }} className="h-full w-full bg-blue-600" />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section className="py-40 relative px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div>
                <span className="text-blue-600 font-black uppercase tracking-[0.4em] text-[10px]">Technical Specifications</span>
                <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter mt-4 uppercase">Core Assets</h2>
            </div>
            <div className="text-right">
                <p className={`text-4xl font-black italic ${theme === 'dark' ? 'opacity-10' : 'opacity-5 text-slate-900'}`}>01 // 04</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="text-blue-600" size={32} />}
              title="Neural RAG"
              desc="Advanced Retrieval Augmented Generation for precision document interaction."
              theme={theme}
            />
            <FeatureCard 
              icon={<Shield className="text-indigo-600" size={32} />}
              title="Encrypted Sync"
              desc="End-to-end encryption for all your study fragments and neural data."
              theme={theme}
            />
            <FeatureCard 
              icon={<Sparkles className="text-purple-600" size={32} />}
              title="AI Generation"
              desc="Instant flashcard and quiz generation from any data object."
              theme={theme}
            />
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className={`py-32 transition-colors border-y ${
          theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          <StatBox label="Neural Nodes" value="12.4M" theme={theme} />
          <StatBox label="Sync Rate" value="99.8%" theme={theme} />
          <StatBox label="Active Links" value="45K" theme={theme} />
          <StatBox label="Uptime" value="100%" theme={theme} />
        </div>
      </section>

      {/* --- FEEDBACK --- */}
      <section className="py-40 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`border p-12 md:p-24 rounded-[4rem] text-center shadow-2xl relative overflow-hidden transition-colors ${
                theme === 'dark' ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-100'
            }`}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-50" />
            
            <MessageSquare className="text-blue-600 mx-auto mb-10" size={48} />
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-8 uppercase">{t.opinion}</h2>
            <p className={`mb-14 font-medium text-lg max-w-xl mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>{t.feedbackDesc}</p>
            
            <form onSubmit={handleFeedback} className="max-w-lg mx-auto flex flex-col gap-6">
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t.placeholder}
                className={`w-full border rounded-[2rem] p-8 transition-all h-40 font-bold outline-none focus:border-blue-600 ${
                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-700"
              >
                {submitted ? t.sent : t.transmit} <Send size={14} />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className={`py-20 border-t px-6 transition-colors ${
          theme === 'dark' ? 'border-white/5' : 'border-slate-100 bg-white'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-6 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-all">
              <Brain className="text-white" size={28} />
            </div>
            <div className="flex flex-col text-left">
                <span className={`font-black italic tracking-tighter text-2xl uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>NeuroStudy</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Grid Interface v2.0</span>
            </div>
          </div>
          
          <div className="flex gap-12">
            <FooterLink label="Base" onClick={() => onNavigate('home')} />
            <FooterLink label="Support" onClick={() => onNavigate('support')} />
            <FooterLink label="Docs" onClick={() => onNavigate('about')} />
          </div>

          <p className={`text-[10px] font-black tracking-[0.4em] uppercase ${theme === 'dark' ? 'text-gray-600' : 'text-slate-400'}`}>{t.copyright}</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, theme }: { icon: React.ReactNode, title: string, desc: string, theme: 'light' | 'dark' }) => (
  <div className={`p-12 rounded-[3.5rem] border transition-all group relative overflow-hidden ${
      theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-100 hover:shadow-2xl shadow-blue-500/5'
  }`}>
    <div className={`mb-10 p-5 rounded-2xl w-fit transition-all ${
        theme === 'dark' ? 'bg-white/5 group-hover:bg-blue-600' : 'bg-slate-50 group-hover:bg-blue-600 group-hover:text-white'
    }`}>
      {icon}
    </div>
    <h3 className={`text-2xl font-black italic tracking-tighter mb-4 uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
    <p className={`font-medium leading-relaxed ${theme === 'dark' ? 'opacity-40' : 'text-slate-500'}`}>{desc}</p>
  </div>
);

const StatBox = ({ label, value, theme }: { label: string, value: string, theme: 'light' | 'dark' }) => (
  <div className="text-center group">
    <p className={`text-5xl md:text-7xl font-black italic tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-b ${
        theme === 'dark' ? 'from-white to-white/20' : 'from-slate-900 to-slate-400'
    }`}>{value}</p>
    <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">{label}</p>
  </div>
);

const FooterLink = ({ label, onClick }: { label: string, onClick: () => void }) => (
    <button onClick={onClick} className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[0.3em]">
        {label}
    </button>
);

export default memo(Hero);
