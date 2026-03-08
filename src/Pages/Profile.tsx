import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Star, Trophy, Zap, Clock, 
    BookOpen, Shield, Target, Award, 
    Edit3, Save, Camera, ArrowLeft, 
    Activity, Brain, Share2, Sparkles,
    Lock, Mail, Phone, Trash2, Loader,
    CheckCircle2, Hexagon, ShieldCheck,
    Settings as SettingsIcon, LogOut, ChevronRight, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { Canvas } from '@react-three/fiber';
import WalkingStudent from '../components/3D/WalkingStudent';
import * as THREE from 'three';

interface ProfileData {
    username: string;
    avatar_url: string;
    bio: string;
    grade: string;
    xp: number;
    level: number;
    stars_count: number;
    badges: string[];
    productivity_score: number;
    phone: string;
    study_stats?: {
        total_hours: number;
        sessions_completed: number;
        quiz_wins: number;
    };
}

const Profile: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
    // 1. ALL HOOKS - FIRST BLOCK - NO EARLY RETURNS
    const { user, profile, updateProfile, changePassword, signOut, loading: authLoading } = useAuth();
    const { theme } = useTheme();
    
    const [activeTab, setActiveTab] = React.useState<'id' | 'settings' | 'security'>('id');
    
    const [username, setUsername] = React.useState('');
    const [bio, setBio] = React.useState('');
    const [grade, setGrade] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [avatarUrl, setAvatarUrl] = React.useState('');
    
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    
    const [isSaving, setIsSaving] = React.useState(false);
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [uploading, setUploading] = React.useState(false);

    // Sync local state with global profile
    React.useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setBio(profile.bio || '');
            setGrade(profile.grade || '');
            setPhone(profile.phone || '');
            setAvatarUrl(profile.avatar_url || '');
        }
    }, [profile]);

    const xpToNextLevel = React.useMemo(() => {
        if (!profile) return 0;
        const lvl = Number(profile.level) || 1;
        const xp = Number(profile.xp) || 0;
        const currentLevelXp = Math.pow(lvl - 1, 2) * 100;
        const nextLevelXp = Math.pow(lvl, 2) * 100;
        const diff = nextLevelXp - currentLevelXp;
        return diff > 0 ? Math.min(100, Math.max(0, ((xp - currentLevelXp) / diff) * 100)) : 0;
    }, [profile]);

    const showToast = (msg: string, isError = false) => {
        if (isError) setErrorMsg(msg);
        else setSuccessMsg(msg);
        setTimeout(() => {
            setSuccessMsg(null);
            setErrorMsg(null);
        }, 3000);
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const { error } = await updateProfile({ username, avatar_url: avatarUrl, phone, bio, grade });
            if (error) throw error;
            showToast("Neural ID Synchronized.");
        } catch (err: any) {
            showToast(err.message, true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            showToast("Mismatch.", true);
            return;
        }
        setIsSaving(true);
        try {
            await changePassword(newPassword);
            showToast("Security updated.");
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            showToast(err.message, true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) return;
        try {
            setUploading(true);
            if (!e.target.files?.[0]) return;
            const file = e.target.files[0];
            const path = `${user.id}/${Math.random()}.${file.name.split('.').pop()}`;
            await supabase.storage.from('avatars').upload(path, file);
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
            setAvatarUrl(publicUrl);
            await updateProfile({ avatar_url: publicUrl });
            showToast("Avatar uplinked.");
        } catch (err: any) {
            showToast(err.message, true);
        } finally {
            setUploading(false);
        }
    };

    // 4. PROTECTED RENDERING
    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#050505] text-white">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-[9px] font-black uppercase tracking-[0.6em] animate-pulse">Establishing Identity Link</p>
            </div>
        );
    }

    if (!user || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#050505] text-white text-center p-10">
                <ShieldAlert size={48} className="text-red-500" />
                <h2 className="text-2xl font-black uppercase">Link Failure</h2>
                <button onClick={() => window.location.reload()} className="px-8 py-4 bg-blue-600 rounded-2xl font-black text-[10px] uppercase">Reconnect</button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-12 pb-20 px-6 md:px-12 transition-all duration-1000 relative overflow-hidden ${theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className="absolute top-0 right-0 w-full h-full bg-blue-600/[0.02] pointer-events-none" />
            <div className="max-w-7xl mx-auto relative z-10">
                <AnimatePresence>
                    {(successMsg || errorMsg) && (
                        <motion.div initial={{ opacity: 0, y: -100, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -100, x: '-50%' }} className={`fixed top-24 left-1/2 z-[1000] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3 ${errorMsg ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {errorMsg ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />} {successMsg || errorMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <header className="mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-2xl group cursor-pointer overflow-hidden">
                                <div className="w-full h-full bg-[#0D0D0D] rounded-[2.3rem] flex items-center justify-center overflow-hidden border-2 border-black">
                                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <User size={48} className="text-blue-500" />}
                                </div>
                                {uploading && <div className="absolute inset-0 bg-black/60 rounded-[2.5rem] flex items-center justify-center"><Loader className="animate-spin text-white" size={24} /></div>}
                            </div>
                            <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-xl shadow-xl hover:bg-blue-500 transition-all cursor-pointer">
                                <Camera size={16} /><input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                            </label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">{profile.username || user.email?.split('@')[0]}</h1>
                                <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Level {profile.level}</div>
                            </div>
                            <div className="flex items-center gap-6 opacity-40">
                                <div className="flex items-center gap-2"><Mail size={12} /><span className="text-[10px] font-black uppercase tracking-widest">{user.email}</span></div>
                                <div className="w-1 h-1 bg-white/20 rounded-full" />
                                <div className="flex items-center gap-2"><ShieldCheck size={12} /><span className="text-[10px] font-black uppercase tracking-widest">Secure</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-[2rem] backdrop-blur-xl">
                        {[{id:'id',l:'Neural ID',i:User},{id:'settings',l:'Identity',i:SettingsIcon},{id:'security',l:'Security',i:Lock}].map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-2xl' : 'text-gray-500 hover:text-white'}`}>
                                <t.i size={16} /><span className="hidden md:block">{t.l}</span>
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {activeTab === 'id' && (
                                <motion.div key="id" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    <div className="p-12 rounded-[4.5rem] bg-white/5 border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                                        <div className="flex justify-between items-end mb-8 relative z-10">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2"><Zap className="text-blue-500" size={24} /><span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Sync Engine</span></div>
                                                <h3 className="text-4xl font-black italic uppercase tracking-tighter">Level {profile.level} // <span className="opacity-30">{profile.xp} XP</span></h3>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Target: {profile.level + 1}</p>
                                        </div>
                                        <div className="h-6 w-full bg-black/40 border border-white/5 rounded-2xl p-1 relative z-10">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${xpToNextLevel}%` }} className="h-full bg-gradient-to-r from-blue-600 via-indigo-400 to-blue-500 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.4)]" />
                                        </div>
                                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-1000 group-hover:scale-110"><Brain size={250} /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Total Hours', val: profile.study_stats?.total_hours || 0, icon: Clock, color: 'text-emerald-500' },
                                            { label: 'Neural Links', val: profile.study_stats?.sessions_completed || 0, icon: Activity, color: 'text-blue-500' },
                                            { label: 'Stellar Merit', val: profile.stars_count || 0, icon: Star, color: 'text-amber-500' }
                                        ].map((s, i) => (
                                            <div key={i} className="p-10 rounded-[3.5rem] bg-white/5 border border-white/5 backdrop-blur-xl flex flex-col items-center text-center gap-4 hover:border-white/10 transition-all">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 ${s.color} border border-white/5`}><s.icon size={28} /></div>
                                                <div><p className="text-4xl font-black italic uppercase tracking-tighter leading-none">{s.val}</p><p className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-2">{s.label}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-12 rounded-[4.5rem] bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20"><ChevronRight size={20} /></div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Unit Overview</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest opacity-30">Academic Phase</label><p className="text-2xl font-black uppercase italic tracking-tighter text-blue-500">{profile.grade || 'Unassigned'}</p></div>
                                            <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest opacity-30">Neural Bio</label><p className="text-sm font-bold opacity-60 italic leading-relaxed">"{profile.bio || 'Neural biographics awaiting sync.'}"</p></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === 'settings' && (
                                <motion.div key="settings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    <div className="p-12 rounded-[4.5rem] bg-white/5 border border-white/5 backdrop-blur-3xl">
                                        <div className="flex items-center gap-4 mb-10"><div className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-500 border border-orange-500/20"><User size={20} /></div><h3 className="text-xl font-black italic uppercase tracking-tighter">Identity Configuration</h3></div>
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">Unit Alias</label><input value={username} onChange={e => setUsername(e.target.value)} className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-blue-500 font-black uppercase text-xs tracking-widest" /></div>
                                                <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">Phone Link</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-blue-500 font-black uppercase text-xs tracking-widest" /></div>
                                                <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">Phase</label><input value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-blue-500 font-black uppercase text-xs tracking-widest" /></div>
                                                <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full h-24 p-6 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm italic resize-none" /></div>
                                            </div>
                                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUpdateProfile} disabled={isSaving} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl flex items-center justify-center gap-4">{isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}Synchronize Identity</motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === 'security' && (
                                <motion.div key="security" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    <div className="p-12 rounded-[4.5rem] bg-white/5 border border-white/5 backdrop-blur-3xl">
                                        <div className="flex items-center gap-4 mb-10"><div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500 border border-red-500/20"><Lock size={20} /></div><h3 className="text-xl font-black italic uppercase tracking-tighter">Security Matrix</h3></div>
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">New Key</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-blue-500 font-black text-sm" /></div>
                                                <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">Confirm</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-blue-500 font-black text-sm" /></div>
                                            </div>
                                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleChangePassword} disabled={isSaving || !newPassword} className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl flex items-center justify-center gap-4">Update Key Protocols</motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-8 rounded-[4.5rem] bg-white/5 border border-white/5 h-[450px] relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-600/[0.05] rounded-full blur-[80px]" />
                            <div className="relative z-10 w-full h-full"><Canvas shadows camera={{ position: [0, 1, 5], fov: 50 }}><ambientLight intensity={0.8} /><spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow /><WalkingStudent /></Canvas></div>
                            <div className="absolute bottom-10 left-0 right-0 text-center"><span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 italic">Active Biometrics</span></div>
                        </div>
                        <div className="p-10 rounded-[4.5rem] bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20 text-center relative overflow-hidden group">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-4 block">Cognitive Score</span>
                            <div className="relative inline-block"><h4 className="text-8xl font-black italic tracking-tighter text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">{profile.productivity_score || 0}</h4><Sparkles className="absolute -top-4 -right-8 text-blue-400 animate-pulse" size={32} /></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mt-6">Protocol Accuracy: 98.4%</p>
                        </div>
                        <div className="space-y-4">
                            <button onClick={() => onNavigate('dashboard')} className="w-full py-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between px-8 hover:bg-white/10 transition-all"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20"><ChevronRight size={18} /></div><span className="text-[10px] font-black uppercase tracking-widest">Dashboard Hub</span></div><ArrowLeft className="rotate-180 opacity-20" size={16} /></button>
                            <button onClick={() => auth.signOut()} className="w-full py-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center justify-between px-8 hover:bg-red-500 hover:text-white transition-all"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500 border border-red-500/20"><LogOut size={18} /></div><span className="text-[10px] font-black uppercase tracking-widest">De-authorize Unit</span></div></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
