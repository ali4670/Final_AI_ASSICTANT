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
            <div className={`inline-flex items-center gap-3 px-6 py-3 border rounded-full transition-colors ${
                theme === 'dark' ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-500' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}>
                <Cpu size={16} className="animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Enrollment Protocol</span>
            </div>

            <h1 className="text-7xl xl:text-8xl font-black italic tracking-tighter uppercase leading-[0.85]">
                Begin <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500">
                    Evolution
                </span>
            </h1>

            <div className="relative h-[400px] w-full max-w-lg">
                <div className={`absolute inset-0 rounded-full blur-[100px] ${
                    theme === 'dark' ? 'bg-indigo-600/10' : 'bg-indigo-400/20'
                }`} />
                <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 1, 5], fov: 50 }}>
                    <ambientLight intensity={theme === 'dark' ? 0.5 : 1.2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={theme === 'dark' ? 1 : 0.5} castShadow />
                    <WalkingStudent />
                </Canvas>
            </div>
        </motion.div>

        {/* Right Side: Signup Form */}
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
                        whileHover={{ rotate: -360, scale: 1.1 }}
                        className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20"
                    >
                        <Sparkles className="text-white" size={40} />
                    </motion.div>
                    <h2 className={`text-4xl font-black italic uppercase tracking-tighter text-center ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>Unit Init</h2>
                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Request Enrollment Access</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <div className="relative group/input">
                            <User className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
                                theme === 'dark' ? 'text-gray-600 group-focus-within/input:text-indigo-500' : 'text-slate-300 group-focus-within/input:text-indigo-600'
                            }`} size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className={`w-full border pl-16 pr-8 py-5 rounded-2xl focus:ring-4 outline-none transition-all font-bold ${
                                    theme === 'dark' 
                                    ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-gray-700' 
                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/5 focus:border-indigo-600 placeholder:text-slate-300'
                                }`}
                                placeholder="IDENT_NAME"
                            />
                        </div>
                        <div className="relative group/input">
                            <Mail className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
                                theme === 'dark' ? 'text-gray-600 group-focus-within/input:text-indigo-500' : 'text-slate-300 group-focus-within/input:text-indigo-600'
                            }`} size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={`w-full border pl-16 pr-8 py-5 rounded-2xl focus:ring-4 outline-none transition-all font-bold ${
                                    theme === 'dark' 
                                    ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-gray-700' 
                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/5 focus:border-indigo-600 placeholder:text-slate-300'
                                }`}
                                placeholder="IDENT_MAIL"
                            />
                        </div>
                        <div className="relative group/input">
                            <Phone className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
                                theme === 'dark' ? 'text-gray-600 group-focus-within/input:text-indigo-500' : 'text-slate-300 group-focus-within/input:text-indigo-600'
                            }`} size={18} />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={`w-full border pl-16 pr-8 py-5 rounded-2xl focus:ring-4 outline-none transition-all font-bold ${
                                    theme === 'dark' 
                                    ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-gray-700' 
                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/5 focus:border-indigo-600 placeholder:text-slate-300'
                                }`}
                                placeholder="IDENT_PHONE (Optional)"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative group/input">
                                <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${
                                    theme === 'dark' ? 'text-gray-600 group-focus-within/input:text-indigo-500' : 'text-slate-300 group-focus-within/input:text-indigo-600'
                                }`} size={16} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className={`w-full border pl-12 pr-4 py-5 rounded-2xl focus:ring-4 outline-none transition-all font-bold text-xs ${
                                        theme === 'dark' 
                                        ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-gray-700' 
                                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/5 focus:border-indigo-600 placeholder:text-slate-300'
                                    }`}
                                    placeholder="SECURE_KEY"
                                />
                            </div>
                            <div className="relative group/input">
                                <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${
                                    theme === 'dark' ? 'text-gray-600 group-focus-within/input:text-indigo-500' : 'text-slate-300 group-focus-within/input:text-indigo-600'
                                }`} size={16} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className={`w-full border pl-12 pr-4 py-5 rounded-2xl focus:ring-4 outline-none transition-all font-bold text-xs ${
                                        theme === 'dark' 
                                        ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-gray-700' 
                                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500/5 focus:border-indigo-600 placeholder:text-slate-300'
                                    }`}
                                    placeholder="CONFIRM_KEY"
                                />
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-6 py-4 rounded-xl text-xs font-black flex items-center gap-3 italic"
                            >
                                <Terminal size={16} />
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
                        {loading ? 'PROCESSING_REQUEST...' : 'INIT_REGISTRATION'}
                    </motion.button>

                    <div className={`mt-12 text-center pt-8 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                        <button
                            type="button"
                            onClick={onToggleMode}
                            className="text-gray-500 hover:text-indigo-400 transition-colors font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowLeft size={12} /> Return to Command Access
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
