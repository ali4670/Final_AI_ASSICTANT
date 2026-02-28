import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Lock, 
    Camera, 
    Save, 
    ArrowLeft, 
    CheckCircle2, 
    Loader, 
    Shield, 
    Mail, 
    UserCircle,
    Zap,
    Trash2,
    Phone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import WalkingStudent from '../components/3D/WalkingStudent';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

interface SettingsProps {
    onNavigate: (page: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
    const { user, updateProfile, changePassword } = useAuth();
    const { theme } = useTheme();
    
    // Profile State
    const [username, setUsername] = useState(user?.user_metadata?.username || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
    const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    
    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    // UI State
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const showToast = (msg: string, isError = false) => {
        if (isError) setErrorMsg(msg);
        else setSuccessMsg(msg);
        setTimeout(() => {
            setSuccessMsg(null);
            setErrorMsg(null);
        }, 3000);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        const { error } = await updateProfile({ username, avatar_url: avatarUrl, phone });
        if (error) showToast(error.message, true);
        else showToast("Profile parameters synchronized.");
        setIsUpdatingProfile(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast("Password mismatch detected.", true);
            return;
        }
        setIsChangingPassword(true);
        const { error } = await changePassword(newPassword);
        if (error) showToast(error.message, true);
        else {
            showToast("Security credentials updated.");
            setNewPassword('');
            setConfirmPassword('');
        }
        setIsChangingPassword(false);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            // Auto update profile with new URL
            await updateProfile({ avatar_url: publicUrl });
            showToast("Avatar uplink complete.");
        } catch (error: any) {
            showToast(error.message, true);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`min-h-screen relative z-10 pt-24 p-8 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <div className="max-w-6xl mx-auto">
                {/* Toasts */}
                <AnimatePresence>
                    {(successMsg || errorMsg) && (
                        <motion.div 
                            initial={{ opacity: 0, y: -100, x: '-50%' }}
                            animate={{ opacity: 1, y: 20, x: '-50%' }}
                            exit={{ opacity: 0, y: -100, x: '-50%' }}
                            className={`fixed top-20 left-1/2 z-[1000] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3 ${
                                errorMsg ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                            }`}
                        >
                            {errorMsg ? <Shield size={16} /> : <CheckCircle2 size={16} />} 
                            {successMsg || errorMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <header className="mb-16 flex justify-between items-end">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl border shadow-lg transition-colors ${theme === 'dark' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                <User size={32} />
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Settings</h1>
                        </div>
                        <p className="opacity-40 font-black uppercase tracking-[0.4em] text-[10px] ml-20">Unit Configuration & Security</p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.1, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onNavigate('dashboard')}
                        className={`p-5 border rounded-3xl transition-all shadow-xl ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}
                    >
                        <ArrowLeft size={24} />
                    </motion.button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Profile */}
                    <div className="lg:col-span-7 space-y-8">
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-10 rounded-[4rem] border relative overflow-hidden transition-all ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-10">
                                <UserCircle className="text-blue-500" size={20} />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Identity Protocol</h2>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-8">
                                <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
                                    <div className="relative group">
                                        <div className={`w-32 h-32 rounded-[2.5rem] border-2 overflow-hidden relative transition-all ${
                                            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                        }`}>
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-20">
                                                    <User size={48} />
                                                </div>
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <Loader className="animate-spin text-white" size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl cursor-pointer shadow-lg hover:bg-blue-500 transition-all">
                                            <Camera size={16} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h3 className="text-xl font-black italic uppercase tracking-tight">{user?.email}</h3>
                                        <p className="text-[9px] font-black uppercase text-blue-500 tracking-widest">Primary Neural Identifier</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">Unit Alias (Username)</label>
                                        <input 
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className={`w-full p-5 rounded-2xl border outline-none transition-all font-bold ${
                                                theme === 'dark' 
                                                ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' 
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                                            }`}
                                            placeholder="Enter alias..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">Phone Number</label>
                                        <input 
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className={`w-full p-5 rounded-2xl border outline-none transition-all font-bold ${
                                                theme === 'dark' 
                                                ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' 
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                                            }`}
                                            placeholder="Enter phone number..."
                                        />
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isUpdatingProfile}
                                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-3"
                                    >
                                        {isUpdatingProfile ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                                        Update Identity
                                    </motion.button>
                                </div>
                            </form>
                        </motion.section>

                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`p-10 rounded-[4rem] border relative overflow-hidden transition-all ${
                                theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-10">
                                <Lock className="text-blue-500" size={20} />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Security Matrix</h2>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">New Secure Key</label>
                                        <input 
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={`w-full p-5 rounded-2xl border outline-none transition-all font-bold ${
                                                theme === 'dark' 
                                                ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' 
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                                            }`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">Confirm Key</label>
                                        <input 
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full p-5 rounded-2xl border outline-none transition-all font-bold ${
                                                theme === 'dark' 
                                                ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' 
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                                            }`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isChangingPassword || !newPassword}
                                    className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isChangingPassword ? <Loader className="animate-spin" size={16} /> : <Zap size={16} />}
                                    Re-authorize Credentials
                                </motion.button>
                            </form>
                        </motion.section>
                    </div>

                    {/* Right Column: Visualization */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className={`p-8 rounded-[3rem] border transition-all h-[500px] flex flex-col items-center justify-center relative overflow-hidden ${
                            theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-xl'
                        }`}>
                            <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-[80px]" />
                            <div className="relative z-10 w-full h-full">
                                <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 1, 5], fov: 50 }}>
                                    <ambientLight intensity={theme === 'dark' ? 0.5 : 1.2} />
                                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={theme === 'dark' ? 1 : 0.5} castShadow />
                                    <WalkingStudent />
                                </Canvas>
                            </div>
                            <div className="absolute bottom-8 left-0 right-0 text-center z-20">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 italic">Biometric Synchronization Active</span>
                            </div>
                        </div>

                        <section className={`p-8 rounded-[3rem] border transition-all ${
                            theme === 'dark' ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100'
                        }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <Trash2 className="text-red-500" size={18} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Danger Zone</h3>
                            </div>
                            <p className="text-xs opacity-60 mb-6 font-medium">Permanently erase your neural profile and all synchronized academic fragments. This action is irreversible.</p>
                            <button className="w-full py-4 border-2 border-red-500/20 text-red-500 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-red-500 hover:text-white transition-all">
                                Terminate Unit
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

