import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, UserPlus, LogIn, X, Sparkles, Lock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface GuestRestrictionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: string) => void;
}

const GuestRestrictionModal: React.FC<GuestRestrictionModalProps> = ({ isOpen, onClose, onNavigate }) => {
    const { theme } = useTheme();
    const { signOut } = useAuth();

    const handleAuthRedirect = async () => {
        await signOut();
        onClose();
        window.location.reload(); // Force return to login screen
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className={`max-w-md w-full relative z-10 border p-10 rounded-[3.5rem] shadow-[0_0_100px_rgba(59,130,246,0.2)] text-center overflow-hidden ${
                            theme === 'dark' ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-200'
                        }`}
                    >
                        {/* Background decoration */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
                        
                        <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 relative">
                            <Lock className="text-blue-500" size={32} />
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-xl"
                            />
                        </div>

                        <h2 className={`text-3xl font-black italic uppercase tracking-tighter mb-4 ${
                            theme === 'dark' ? 'text-white' : 'text-slate-950'
                        }`}>Access Restricted</h2>
                        
                        <p className={`text-sm font-medium leading-relaxed mb-10 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
                        }`}>
                            You are currently in <span className="text-blue-500 font-black">Explorer Mode</span>. To save documents, earn neural stars, and use AI synthesis, you must establish a permanent identity.
                        </p>

                        <div className="space-y-4">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAuthRedirect}
                                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-3"
                            >
                                <UserPlus size={16} /> Create Neural Identity
                            </motion.button>
                            
                            <button 
                                onClick={onClose}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${
                                    theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                Continue Exploring
                            </button>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 opacity-30">
                            <Sparkles size={12} />
                            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Neural Study Security Protocol</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GuestRestrictionModal;
