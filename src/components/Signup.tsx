import { useState, FormEvent, useEffect, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Sparkles, PenTool, Zap, Lock, Mail, User, Terminal, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SignupProps {
  onToggleMode: () => void;
}

const ShatterPen = ({ left, delay }: { left: number; delay: number }) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0, rotate: 0 }}
      animate={{ 
        y: ['0vh', '100vh'], 
        opacity: [0, 1, 1, 0],
        rotate: -360 
      }}
      transition={{ duration: 2.8, ease: "easeIn", delay }}
      style={{ left: `${left}%` }}
      className="absolute z-0 pointer-events-none"
    >
      <div className="relative">
        <PenTool className="text-indigo-500/30" size={32} />
        <motion.div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 1, 0], scale: [0.5, 2] }}
          viewport={{ margin: "0px 0px -50px 0px" }}
        >
          <div className="w-1.5 h-1 bg-indigo-500/40 rotate-12 blur-[1px]" />
          <div className="w-1 h-3 bg-purple-500/40 -rotate-45 blur-[1px]" />
          <div className="w-2 h-0.5 bg-indigo-300/40 rotate-90 blur-[1px]" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const FallingPens = memo(() => {
  const [pens, setPens] = useState<{ id: number; left: number; delay: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPens(prev => [...prev.slice(-20), { 
        id: Date.now(), 
        left: Math.random() * 100,
        delay: Math.random() * 0.3 
      }]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pens.map(pen => (
        <ShatterPen key={pen.id} left={pen.left} delay={pen.delay} />
      ))}
    </div>
  );
});

export default function Signup({ onToggleMode }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords mismatch detected.');
      return;
    }

    setLoading(true);
    
    try {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) {
          setError(signUpError.message || 'REGISTRATION_CORE_FAILED');
          setLoading(false);
        } else {
          setSuccess(true);
          setLoading(false);
        }
    } catch (err: any) {
        setError(err.message || 'CRITICAL_REG_FAILURE');
        setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 text-white">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0A0A0A] border border-green-500/20 rounded-[3rem] w-full max-w-md p-12 text-center shadow-2xl shadow-green-500/10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
          <div className="flex items-center justify-center mb-10">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter italic uppercase text-center">Unit Registered</h1>
          <p className="text-gray-400 mb-12 font-bold uppercase text-[10px] tracking-widest">MISSION ACCESS GRANTED. PROCEED TO COMMAND CENTER.</p>
          <button
            type="button"
            onClick={onToggleMode}
            className="w-full bg-green-500 text-black py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-green-400 transition-all shadow-xl shadow-green-500/20 cursor-pointer"
          >
            Launch System
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30 text-white">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[150px]" />
      </div>

      <FallingPens />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 py-10"
      >
        <div className="bg-[#0A0A0A]/90 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-10 shadow-2xl relative group overflow-hidden">
          <div className="absolute inset-0 border-2 border-indigo-500/10 rounded-[3rem] group-hover:border-indigo-500/30 transition-colors duration-700 pointer-events-none" />
          
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ rotate: -360 }}
              transition={{ duration: 0.8 }}
              className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20 relative"
            >
              <Sparkles className="text-white" size={40} />
              <div className="absolute -top-2 -right-2 bg-indigo-500 p-1.5 rounded-lg border border-white/20">
                <Zap size={12} className="text-white" fill="currentColor" />
              </div>
            </motion.div>

            <h1 className="text-5xl font-black text-white text-center mb-2 tracking-tighter italic">
              UNIT <span className="text-indigo-500">INIT</span>
            </h1>
            <p className="text-gray-500 text-center font-bold text-[10px] uppercase tracking-[0.4em]">Request New Enrollment Access</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-6 py-4 rounded-xl text-xs font-black mb-6 flex items-center gap-3 italic"
              >
                <Terminal size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="relative group/input">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-indigo-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-6 py-4 rounded-[1.2rem] focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all placeholder:text-gray-700 font-bold"
                  placeholder="IDENT_NAME"
                />
              </div>
              <div className="relative group/input">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-indigo-500 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-6 py-4 rounded-[1.2rem] focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all placeholder:text-gray-700 font-bold"
                  placeholder="IDENT_MAIL"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative group/input">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-indigo-500 transition-colors" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 rounded-[1.2rem] focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all placeholder:text-gray-700 font-bold text-xs"
                    placeholder="SECURE_KEY"
                  />
                </div>
                <div className="relative group/input">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-indigo-500 transition-colors" size={16} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 rounded-[1.2rem] focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all placeholder:text-gray-700 font-bold text-xs"
                    placeholder="CONFIRM_KEY"
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#6366f1' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-sm mt-4 transition-all duration-300 cursor-pointer"
            >
              {loading ? 'PROCESSING_REQUEST...' : 'INIT_REGISTRATION'}
            </motion.button>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-white/5 relative z-[20]">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Unit Detected Before?</p>
            <button
              type="button"
              onClick={onToggleMode}
              className="text-white hover:text-indigo-400 transition-colors font-black text-xs uppercase tracking-widest border border-white/10 px-6 py-3 rounded-xl hover:border-indigo-500/50 cursor-pointer relative z-[30]"
            >
              Access Command
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
