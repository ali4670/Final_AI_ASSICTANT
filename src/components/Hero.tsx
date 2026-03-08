import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, ChevronRight, Cpu } from 'lucide-react';
import HeroScene from './3D/HeroScene';

interface HeroProps {
  onNavigate: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 lg:p-12 overflow-hidden bg-[#020202] selection:bg-blue-500/30">
      {/* Cinematic 3D Scene */}
      <HeroScene />

      {/* Hero Content */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        <div className="space-y-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-600/10 border border-blue-500/20"
          >
            <Cpu size={14} className="text-blue-500 animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Neural Sync Status: Optimal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[80px] md:text-[100px] xl:text-[140px] font-black italic tracking-tighter uppercase leading-[0.8] text-white"
          >
            NEURAL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-400 to-blue-400">
              SYNTHESIS
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg md:text-xl font-bold max-w-lg leading-relaxed antialiased"
          >
            Architecting the future of academic performance. Transform raw data into structured knowledge with our neural-core precision engines.
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(37,99,235,0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('login')}
              className="px-10 py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 group shadow-2xl transition-all"
            >
              Initialize Node
              <Zap size={18} className="transition-transform group-hover:rotate-12" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('signup')}
              className="px-10 py-6 border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:border-white/20 transition-all backdrop-blur-xl"
            >
              Create Account
              <ChevronRight size={18} />
            </motion.button>
          </div>

          {/* Stats */}
          <div className="flex gap-16 pt-16 border-t border-white/5">
            {[
              { label: 'Neural Accuracy', value: '99.8%' },
              { label: 'Daily Units', value: '1.2k+' },
              { label: 'Uptime', value: '100%' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-3xl font-black italic tracking-tighter text-blue-500">{stat.value}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Isometric visual element placeholder or can leave empty for 3D depth */}
        <div className="hidden lg:block h-[600px] relative pointer-events-none">
            {/* The HeroScene will be visible behind this area */}
        </div>
      </div>

      {/* Interface Decoratives */}
      <div className="absolute bottom-10 left-10 hidden xl:flex items-center gap-4 opacity-20">
         <div className="w-10 h-px bg-white" />
         <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Neural Interface // Security Level 4</span>
      </div>

      {/* About Scroll Link */}
      <motion.button 
        onClick={() => {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        className="absolute bottom-10 right-10 flex flex-col items-center gap-4 group cursor-pointer"
      >
         <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Neural Blueprint</span>
         <div className="w-10 h-px bg-white group-hover:w-20 transition-all" />
      </motion.button>
    </div>
  );
};

export default memo(Hero);
