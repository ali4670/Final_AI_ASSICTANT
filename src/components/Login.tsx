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
            <div className={`inline-flex items-center gap-3 px-6 py-3 border rounded-full transition-colors ${
                theme === 'dark' ? 'bg-blue-600/10 border-blue-500/20 text-blue-500' : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
                <Cpu size={16} className="animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-center">Neural Authentication Interface</span>
            </div>

            <h1 className="text-7xl xl:text-8xl font-black italic tracking-tighter uppercase leading-[0.85]">
                Empower <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-400 to-purple-500 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
                    Your Mind
                </span>
            </h1>

            <div className="relative h-[400px] w-full max-w-lg">
                <div className={`absolute inset-0 rounded-full blur-[100px] ${
                    theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-400/20'
                }`} />
                <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 1, 5], fov: 50 }}>
                    <ambientLight intensity={theme === 'dark' ? 0.5 : 1.2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={theme === 'dark' ? 1 : 0.5} castShadow />
                    <WalkingStudent />
                </Canvas>
                
                {/* Floating Chips */}
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className={`absolute top-10 right-0 p-4 backdrop-blur-xl border rounded-2xl flex items-center gap-3 ${
                        theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200 shadow-xl'
                    }`}
                >
                    <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'
                    }`}><Sparkles size={16} className="text-blue-500" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Engine v2.0.4</span>
                </motion.div>
            </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center lg:justify-end"
        >
            <div className={`w-full max-w-md backdrop-blur-3xl border rounded-[3.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group transition-colors ${
                theme === 'dark' ? 'bg-[#0D0D0D]/80 border-white/10' : 'bg-white/90 border-slate-200'
            }`}>
                
                <div className="flex flex-col items-center mb-12">
                    <motion.div 
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20"
                    >
                        <Brain className="text-white" size={40} />
                    </motion.div>
                    <h2 className={`text-4xl font-black italic uppercase tracking-tighter ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>Initialize</h2>
                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Connection Sequence</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={`w-full border px-8 py-5 rounded-2xl focus:ring-4 outline-none transition-all font-bold ${
                                    theme === 'dark' 
                                    ? 'bg-white/5 border-white/10 text-white focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-gray-700' 
                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/5 focus:border-blue-600 placeholder:text-slate-300'
                                }`}
                                placeholder="IDENT_MAIL"
                            />
                        </div>
                        <div className="relative group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={`w-full border px-8 py-5 rounded-2xl focus:ring-4 outline-none transition-all font-bold ${
                                    theme === 'dark' 
                                    ? 'bg-white/5 border-white/10 text-white focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-gray-700' 
                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/5 focus:border-blue-600 placeholder:text-slate-300'
                                }`}
                                placeholder="SECURE_PHRASE"
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
                        whileHover={{ scale: 1.02, backgroundColor: '#2563eb' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Establish Connection'}
                    </motion.button>

                    <div className="flex items-center gap-4 py-2">
                        <div className={`h-px flex-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`} />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Or Secure Bypass</span>
                        <div className={`h-px flex-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`} />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleGuestAccess}
                        className={`w-full border py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${
                            theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                    >
                        <ShieldAlert size={16} /> Enter Explorer Mode (Guest)
                    </motion.button>

                    <div className={`mt-12 text-center pt-8 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                        <button
                            type="button"
                            onClick={onToggleMode}
                            className="text-gray-500 hover:text-blue-500 transition-colors font-black text-[10px] uppercase tracking-[0.4em]"
                        >
                            No Identity? Create New Unit
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
