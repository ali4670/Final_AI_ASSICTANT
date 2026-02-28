import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RefreshCw, X, MessageSquare } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';
import { useTheme } from '../contexts/ThemeContext';

interface PomodoroTimerProps {
  onNavigate?: (page: string) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const { timeLeft, isActive, mode, toggleTimer, resetTimer, currentTask } = useTimer();

  const modes = {
    work: { label: 'Focus', color: 'text-blue-500' },
    short: { label: 'Break', color: 'text-green-500' },
    long: { label: 'Long Break', color: 'text-purple-500' },
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-4">
       {/* Global Chat Button */}
       <motion.button
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate?.('chat')}
        className={`w-14 h-14 backdrop-blur-xl border rounded-2xl flex items-center justify-center shadow-2xl transition-all group ${
            theme === 'dark' ? 'bg-white/10 border-white/20 text-white hover:bg-blue-600/20' : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
        }`}
        title="Quick Chat"
      >
        <MessageSquare size={24} className="group-hover:text-blue-400 transition-colors" />
      </motion.button>

       <div className="relative">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className={`absolute bottom-16 right-0 backdrop-blur-2xl border p-6 rounded-[2rem] shadow-2xl w-80 mb-2 transition-colors ${
                    theme === 'dark' ? 'bg-[#0D0D0D]/95 border-white/10 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Global Link</span>
                        <span className="font-black italic uppercase tracking-tighter text-sm">Focus Engine</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                        <X size={16} />
                    </button>
                </div>

                <div className={`p-3 rounded-xl mb-6 border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30 block mb-1">Target Module</span>
                    <span className="text-xs font-bold truncate block">{currentTask}</span>
                </div>

                <div className="text-center mb-6">
                    <div className={`text-6xl font-black tabular-nums tracking-tighter ${modes[mode].color} drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]`}>
                        {formatTime(timeLeft)}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mt-2 block">{modes[mode].label} session</span>
                </div>

                <div className="flex justify-center gap-4">
                    <button 
                        onClick={toggleTimer}
                        className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        {isActive ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                        {isActive ? 'Pause' : 'Resume'}
                    </button>
                    <button 
                        onClick={resetTimer}
                        className={`p-4 rounded-2xl border transition-all group ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
                    >
                        <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 backdrop-blur-xl border rounded-2xl flex items-center justify-center shadow-2xl transition-all ${
                isActive 
                    ? 'bg-blue-600 text-white border-blue-400 animate-pulse' 
                    : theme === 'dark' ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-slate-900 text-white border-slate-800 hover:bg-black'
            }`}
          >
            <Timer size={24} />
          </motion.button>
       </div>
    </div>
  );
};

export default PomodoroTimer;
