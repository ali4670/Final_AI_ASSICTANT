import { useState, FormEvent, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Brain, Sparkles, ShieldAlert, Cpu, Github, Globe, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WalkingStudent from './3D/WalkingStudent';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

interface LoginProps {
  onToggleMode: () => void;
}

const Login = ({ onToggleMode }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { signIn, signInWithGithub, signInAsGuest } = useAuth();

  const handleGuestAccess = async () => {
    setError('');
    setLoading(true);
    const { error } = await signInAsGuest();
    if (error) {
        setError(error.message);
        setLoading(false);
    }
  };

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
    } catch (err: any) {
        setError(err.message || 'CRITICAL_AUTH_FAILURE');
        setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 flex items-center justify-center p-6 relative overflow-hidden font-sans ${
        theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 left-0 w-full h-full opacity-20 ${
            theme === 'dark' ? 'invert-0' : 'invert'
        }`} style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
                x: [0, 50, 0],
                y: [0, 100, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] ${
                theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-400/10'
            }`} 
        />
        <motion.div 
            animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.3, 0.1],
                x: [0, -100, 0],
                y: [0, -50, 0]
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] ${
                theme === 'dark' ? 'bg-indigo-600/20' : 'bg-indigo-400/10'
            }`} 
        />
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        
        {/* Left Side: 3D Visual & Info */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block space-y-12"
        >
            <div className="inline-flex items-center gap-3 px-6 py-3 border border-blue-500/20 bg-blue-500/10 rounded-full text-blue-500">
                <Cpu size={16} className="animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Sync Protocol v4.2</span>
            </div>

            <h1 className="text-8xl xl:text-100px font-black italic tracking-tighter uppercase leading-[0.8] text-white">
                LINK <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-400">
                    INTERFACE
                </span>
            </h1>

            <p className="text-gray-400 text-lg font-bold max-w-sm uppercase tracking-widest leading-loose">
                Authorize your neural uplink to access the knowledge factory.
            </p>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center lg:justify-end"
        >
            <div className="w-full max-w-md backdrop-blur-3xl border border-white/5 bg-white/[0.02] rounded-[3.5rem] p-12 md:p-16 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                
                <div className="flex flex-col items-center mb-16">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                        <Brain className="text-white" size={40} />
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Initialize</h2>
                    <p className="text-gray-600 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Access Grid Zero</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold placeholder:text-gray-700"
                            placeholder="IDENT_MAIL"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold placeholder:text-gray-700"
                            placeholder="SECURE_PHRASE"
                        />
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
                        whileHover={{ scale: 1.02, backgroundColor: '#2563eb' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Establish Connection'}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleGuestAccess}
                        className="w-full border border-white/10 bg-white/5 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-500 flex items-center justify-center gap-3 transition-all"
                    >
                        <ShieldAlert size={16} /> Guest Protocol
                    </motion.button>

                    <div className="mt-12 text-center pt-8 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onToggleMode}
                            className="text-gray-600 hover:text-blue-500 transition-colors font-black text-[10px] uppercase tracking-[0.4em]"
                        >
                            New Unit? Initialize Here
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
      </div>

      
      {/* Footer Info */}
      <div className="fixed bottom-10 left-10 hidden xl:flex items-center gap-4 opacity-30 group cursor-default">
         <div className={`w-10 h-px transition-all group-hover:w-20 ${theme === 'dark' ? 'bg-white' : 'bg-slate-900'}`} />
         <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Neural Study Neural Interface // Security Level 4</span>
      </div>
    </div>
  );
};

export default memo(Login);
