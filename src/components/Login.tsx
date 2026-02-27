import { useState, FormEvent, useEffect, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Sparkles, PenTool, Zap, Lock, Mail, Activity, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginProps {
  onToggleMode: () => void;
}

const ShatterPen = ({ left, delay }: { left: number; delay: number }) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0, rotate: 0 }}
      animate={{ 
        y: ['0vh', '100vh'], 
        opacity: [0, 1, 1, 0],
        rotate: 360 
      }}
      transition={{ duration: 2.5, ease: "easeIn", delay }}
      style={{ left: `${left}%` }}
      className="absolute z-0 pointer-events-none"
    >
      <div className="relative">
        <PenTool className="text-blue-500/40" size={32} />
        <motion.div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 1, 0], scale: [0.5, 2] }}
          viewport={{ margin: "0px 0px -50px 0px" }}
        >
          <div className="w-1 h-4 bg-blue-400/30 rotate-45 blur-[1px]" />
          <div className="w-1 h-3 bg-blue-300/30 -rotate-45 blur-[1px]" />
          <div className="w-2 h-1 bg-blue-500/30 rotate-12 blur-[1px]" />
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
        delay: Math.random() * 0.2 
      }]);
    }, 400);
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

export default function Login({ onToggleMode }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    
    try {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message || 'AUTHENTICATION_FAILED');
          setLoading(false);
        }
        // If success, AuthProvider will trigger re-render in App.tsx
    } catch (err: any) {
        setError(err.message || 'CRITICAL_AUTH_FAILURE');
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-500/50 text-white">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      <FallingPens />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0A0A0A]/90 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute inset-0 border-2 border-blue-500/10 rounded-[3rem] group-hover:border-blue-500/30 transition-colors duration-700 pointer-events-none" />
          
          <div className="flex flex-col items-center mb-12">
            <motion.div 
              animate={{ 
                boxShadow: ["0 0 20px rgba(59,130,246,0.2)", "0 0 40px rgba(59,130,246,0.4)", "0 0 20px rgba(59,130,246,0.2)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 relative"
            >
              <Brain className="text-white" size={48} />
              <div className="absolute -bottom-2 -right-2 bg-white text-black p-2 rounded-xl shadow-lg">
                <Activity size={16} className="animate-pulse" />
              </div>
            </motion.div>

            <h1 className="text-5xl font-black text-white text-center mb-2 tracking-tighter italic">
              LOGIN <span className="text-blue-500">CORE</span>
            </h1>
            <p className="text-gray-500 text-center font-bold text-[10px] uppercase tracking-[0.4em]">Access Authorized Personal Only</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-6 py-4 rounded-xl text-xs font-black mb-8 flex items-center gap-3 italic"
              >
                <Terminal size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="relative group/input">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-6 py-5 rounded-[1.5rem] focus:ring-2 focus:ring-blue-500/40 focus:bg-blue-500/5 outline-none transition-all placeholder:text-gray-700 font-bold tracking-tight"
                  placeholder="IDENT_MAIL"
                />
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-500 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-6 py-5 rounded-[1.5rem] focus:ring-2 focus:ring-blue-500/40 focus:bg-blue-500/5 outline-none transition-all placeholder:text-gray-700 font-bold tracking-tight"
                  placeholder="SECURE_PHRASE"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#3b82f6', color: '#fff' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm transition-all duration-300 disabled:opacity-50 relative overflow-hidden cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  START_SESSION <Zap size={16} fill="currentColor" />
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-white/5 relative z-[20]">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Unregistered Unit?</p>
            <button
              type="button"
              onClick={onToggleMode}
              className="text-white hover:text-blue-500 transition-colors font-black text-xs uppercase tracking-widest border border-white/10 px-6 py-3 rounded-xl hover:border-blue-500/50 cursor-pointer relative z-[30]"
            >
              Request Access
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
