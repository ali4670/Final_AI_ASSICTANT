import { useState, FormEvent, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Zap, Lock, Mail, User, Terminal, CheckCircle2, Cpu, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WalkingStudent from './3D/WalkingStudent';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { Phone } from 'lucide-react';

interface SignupProps {
  onToggleMode: () => void;
}

const Signup = ({ onToggleMode }: SignupProps) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { theme } = useTheme();
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
        const { error: signUpError } = await signUp(email, password, username, phone);
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
      <div className={`min-h-screen flex items-center justify-center p-6 overflow-hidden transition-colors duration-1000 ${
        theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-[#F8FAFC] text-slate-900'
      }`}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`border rounded-[3.5rem] w-full max-w-md p-14 text-center shadow-2xl relative overflow-hidden transition-colors ${
            theme === 'dark' ? 'bg-[#0D0D0D] border-green-500/20' : 'bg-white border-green-500/20'
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
          <div className="flex items-center justify-center mb-10">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <h1 className={`text-4xl font-black mb-4 tracking-tighter italic uppercase text-center ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>Unit Registered</h1>
          <p className="text-gray-500 mb-12 font-bold uppercase text-[10px] tracking-[0.4em]">MISSION ACCESS GRANTED. PROCEED TO COMMAND CENTER.</p>
          <button
            type="button"
            onClick={onToggleMode}
            className="w-full bg-green-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-green-500 transition-all shadow-xl shadow-green-500/20 cursor-pointer"
          >
            Launch System Interface
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-1000 flex items-center justify-center p-6 relative overflow-hidden font-sans ${
        theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className={`absolute top-0 left-0 w-full h-full ${
            theme === 'dark' ? 'invert-0' : 'invert'
        }`} style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] ${
            theme === 'dark' ? 'bg-indigo-600/20' : 'bg-indigo-400/10'
        }`} />
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        
        {/* Left Side: 3D Visual & Info */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block space-y-12"
        >
            <div className="inline-flex items-center gap-3 px-6 py-3 border border-indigo-500/20 bg-indigo-500/10 rounded-full text-indigo-500">
                <Cpu size={16} className="animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Enrollment Protocol v1.2</span>
            </div>

            <h1 className="text-8xl xl:text-100px font-black italic tracking-tighter uppercase leading-[0.8] text-white">
                BEGIN <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-400">
                    EVOLUTION
                </span>
            </h1>

            <p className="text-gray-400 text-lg font-bold max-w-sm uppercase tracking-widest leading-loose">
                Initialize your unit DNA and join the neural collective.
            </p>
        </motion.div>

        {/* Right Side: Signup Form */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center lg:justify-end"
        >
            <div className="w-full max-w-md backdrop-blur-3xl border border-white/5 bg-white/[0.02] rounded-[3.5rem] p-12 md:p-16 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                
                <div className="flex flex-col items-center mb-12">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(79,70,229,0.4)]">
                        <Sparkles className="text-white" size={40} />
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Unit Init</h2>
                    <p className="text-gray-600 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Neural Registration</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-gray-700"
                            placeholder="IDENT_NAME"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-gray-700"
                            placeholder="IDENT_MAIL"
                        />
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-gray-700"
                            placeholder="IDENT_PHONE (Optional)"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 px-6 py-5 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold text-xs placeholder:text-gray-700"
                                placeholder="SECURE_KEY"
                            />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 px-6 py-5 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold text-xs placeholder:text-gray-700"
                                placeholder="CONFIRM_KEY"
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded text-[10px] font-black uppercase tracking-widest italic"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#4f46e5' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? 'PROCESSING...' : 'INIT_REGISTRATION'}
                    </motion.button>

                    <div className="mt-12 text-center pt-8 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onToggleMode}
                            className="text-gray-600 hover:text-indigo-400 transition-colors font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowLeft size={12} /> Return to Login
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
      </div>

    </div>
  );
};

export default memo(Signup);
