import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Award, Zap, Brain, Rocket, Shield, MessageSquare, Send, Star } from 'lucide-react';
import type { Page } from '../App';
import { useTheme } from '../contexts/ThemeContext';

interface HeroProps {
  onNavigate: (page: Page) => void;
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] },
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

  const content = {
    en: {
      system: "System v2.0 Online",
      engineered: "ENGINEERED",
      toLearn: "TO LEARN",
      desc: "High-performance AI study engine designed for elite students. Turn your documents into neural data in milliseconds.",
      launch: "Launch Dashboard",
      specs: "System Specs",
      quote: "This system changed my entire study flow.",
      opinion: "Student Opinion",
      feedbackDesc: "We build for you. Submit your technical feedback to help us evolve the engine.",
      placeholder: "What's your verdict on the system?",
      transmit: "Transmit Feedback",
      sent: "Transmission Sent",
      copyright: "© 2026 High Performance Learning Systems"
    },
    ar: {
      system: "النظام الإصدار 2.0 متصل",
      engineered: "مصمم خصيصاً",
      toLearn: "للتعلم",
      desc: "محرك دراسة مدعوم بالذكاء الاصطناعي عالي الأداء مصمم للطلاب المتميزين. حول مستنداتك إلى بيانات عصبية في أجزاء من الثانية.",
      launch: "ابدأ لوحة التحكم",
      specs: "مواصفات النظام",
      quote: "لقد غير هذا النظام مسار دراستي بالكامل.",
      opinion: "رأي الطلاب",
      feedbackDesc: "نحن نبني من أجلك. أرسل ملاحظاتك التقنية لمساعدتنا في تطوير المحرك.",
      placeholder: "ما هو حكمك على النظام؟",
      transmit: "إرسال الملاحظات",
      sent: "تم الإرسال",
      copyright: "© 2026 أنظمة التعلم عالية الأداء"
    }
  };

  const t = content[language];

  return (
    <div className={`transition-colors duration-1000 overflow-x-hidden font-sans ${
      theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-white text-slate-900'
    }`}>
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Lando-style background glows */}
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse transition-opacity duration-1000 ${
          theme === 'dark' ? 'bg-blue-600/20 opacity-100' : 'bg-blue-400/10 opacity-50'
        }`} />
        <div className={`absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] transition-opacity duration-1000 ${
          theme === 'dark' ? 'bg-indigo-600/20 opacity-100' : 'bg-indigo-400/10 opacity-50'
        }`} />
        
        {/* Animated Grid Background */}
        <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
          theme === 'dark' ? 'opacity-20' : 'opacity-10'
        }`} style={{ 
          backgroundImage: theme === 'dark' 
            ? 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)'
            : 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeUp} className="inline-block mb-6">
              <span className={`border px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 transition-colors ${
                theme === 'dark' ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
              }`}>
                <Zap size={14} fill="currentColor" /> {t.system}
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-none italic uppercase">
              {t.engineered} <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                theme === 'dark' ? 'from-blue-500 via-indigo-400 to-purple-500' : 'from-blue-600 via-indigo-600 to-purple-600'
              }`}>
                {t.toLearn}
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className={`text-lg md:text-2xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
            }`}>
              {t.desc}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.button
                onClick={() => onNavigate('dashboard')}
                whileHover={{ scale: 1.05, backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb' }}
                whileTap={{ scale: 0.95 }}
                className={`px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 group transition-all shadow-2xl ${
                  theme === 'dark' ? 'bg-white text-black shadow-blue-500/20' : 'bg-blue-600 text-white shadow-blue-600/20'
                }`}
              >
                {t.launch} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                onClick={() => onNavigate('about')}
                whileHover={{ scale: 1.05, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                whileTap={{ scale: 0.95 }}
                className={`border-2 backdrop-blur-md px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-blue-600/20 bg-blue-50/50 text-blue-600'
                }`}
              >
                {t.specs}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Review Card */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-10 hidden lg:block"
        >
          <div className={`backdrop-blur-xl border p-6 rounded-3xl shadow-2xl transition-all duration-1000 ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-blue-100 shadow-blue-100'
          }`}>
            <div className="flex gap-2 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-blue-500" fill="currentColor" />)}
            </div>
            <p className={`text-xs font-bold transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>"{t.quote}"</p>
          </div>
        </motion.div>
      </section>

      {/* --- TECH SPECS SECTION --- */}
      <section className={`py-32 relative transition-colors duration-1000 ${
        theme === 'dark' ? 'bg-[#080808]' : 'bg-slate-50'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 uppercase">Advanced Core</h2>
              <p className="text-blue-500 font-black uppercase tracking-[0.2em] text-sm">Powered by Neural Flashcards & RAG Logic</p>
            </div>
            <div className={`h-px flex-1 hidden md:block mx-10 mb-6 transition-colors duration-1000 ${
              theme === 'dark' ? 'bg-white/10' : 'bg-blue-200'
            }`} />
            <div className="text-right">
              <span className={`text-5xl font-black transition-colors ${theme === 'dark' ? 'text-white/20' : 'text-blue-200'}`}>01 / 04</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="text-blue-500" size={32} />}
              title="Neural Parsing"
              desc="AI analyzes your documents and extracts key concepts with 99.8% precision using Llama-3 architectures."
              theme={theme}
            />
            <FeatureCard 
              icon={<Zap className="text-indigo-500" size={32} />}
              title="Hyper-Speed"
              desc="Generate 30+ interactive flashcards in under 5 seconds. Don't waste time on manual entry."
              theme={theme}
            />
            <FeatureCard 
              icon={<Shield className="text-purple-500" size={32} />}
              title="Data Integrity"
              desc="Your knowledge is encrypted and synced across all your devices via Supabase cloud infrastructure."
              theme={theme}
            />
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className={`py-24 border-y transition-colors duration-1000 ${
        theme === 'dark' ? 'bg-[#050505] border-white/5' : 'bg-white border-blue-50'
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <StatBox label="Active Learners" value="12.4K" theme={theme} />
          <StatBox label="Flashcards Gen" value="2.8M" theme={theme} />
          <StatBox label="Success Rate" value="98%" theme={theme} />
          <StatBox label="Uptime" value="100%" theme={theme} />
        </div>
      </section>

      {/* --- FEEDBACK SECTION --- */}
      <section className="py-32 relative overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-[100px] rounded-full transition-colors duration-1000 ${
          theme === 'dark' ? 'bg-blue-600/5' : 'bg-blue-400/5'
        }`} />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className={`border p-12 md:p-20 rounded-[4rem] text-center shadow-2xl transition-all duration-1000 ${
            theme === 'dark' ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-blue-100 shadow-blue-100'
          }`}>
            <MessageSquare className="mx-auto mb-8 text-blue-500" size={48} />
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-6 uppercase">{t.opinion}</h2>
            <p className={`mb-12 font-medium transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>{t.feedbackDesc}</p>
            
            <form onSubmit={handleFeedback} className="relative max-w-lg mx-auto">
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t.placeholder}
                className={`w-full border rounded-3xl p-6 transition-all resize-none h-40 font-medium outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' 
                    : 'bg-slate-50 border-blue-100 text-slate-900 placeholder:text-slate-400'
                }`}
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`mt-6 w-full text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 group shadow-xl ${
                  theme === 'dark' ? 'bg-blue-600 shadow-blue-900/20' : 'bg-blue-600 shadow-blue-200'
                }`}
              >
                {submitted ? t.sent : t.transmit} 
                <Send size={14} className={submitted ? 'animate-bounce' : 'group-hover:translate-x-1 transition-transform'} />
              </motion.button>
            </form>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className={`py-12 border-t px-6 transition-colors duration-1000 ${
        theme === 'dark' ? 'border-white/5' : 'border-slate-100 bg-slate-50'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="text-white" size={20} />
            </div>
            <span className={`font-black italic tracking-tighter text-xl uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>NeuroStudy</span>
          </div>
          <p className="text-[10px] font-black text-gray-700 tracking-[0.4em] uppercase">{t.copyright}</p>
          <div className="flex gap-6">
            <button className="text-xs font-bold text-gray-500 hover:text-blue-500 transition-colors uppercase tracking-widest">Terminal</button>
            <button className="text-xs font-bold text-gray-500 hover:text-blue-500 transition-colors uppercase tracking-widest">Docs</button>
            <button className="text-xs font-bold text-gray-500 hover:text-blue-500 transition-colors uppercase tracking-widest">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, theme }: { icon: React.ReactNode, title: string, desc: string, theme: 'light' | 'dark' }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className={`border p-10 rounded-[3rem] transition-all duration-500 group ${
      theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-blue-100 hover:shadow-xl hover:shadow-blue-100'
    }`}
  >
    <div className={`mb-8 p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500 ${
      theme === 'dark' ? 'bg-black' : 'bg-blue-50'
    }`}>
      {icon}
    </div>
    <h3 className={`text-2xl font-black italic tracking-tighter mb-4 uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
    <p className={`font-medium leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>{desc}</p>
  </motion.div>
);

const StatBox = ({ label, value, theme }: { label: string, value: string, theme: 'light' | 'dark' }) => (
  <div className="text-center">
    <p className={`text-4xl md:text-6xl font-black italic tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-b ${
      theme === 'dark' ? 'from-white to-gray-600' : 'from-blue-600 to-indigo-900'
    }`}>{value}</p>
    <p className="text-xs font-black text-blue-500 uppercase tracking-widest">{label}</p>
  </div>
);

export default memo(Hero);
