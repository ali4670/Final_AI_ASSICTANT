import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, Users, Trash2, Star, ArrowLeft, 
    Loader, Search, ShieldAlert, FileText, Activity,
    Key, Phone, CheckCircle2, X, Eye, EyeOff, Mail, MessageSquare, Monitor, UserCircle, BookOpen
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Presentation from './Presentation';
import TiltCard from '../components/TiltCard';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    phone: string;
    stars_count: number;
    is_admin: boolean;
    has_downloaded_desktop: boolean;
    avatar_url?: string;
    created_at: string;
}

interface SupportMessage {
    id: string;
    email: string;
    subject: string;
    message: string;
    status: 'pending' | 'resolved' | 'archived';
    created_at: string;
}

interface AdminProps {
    onNavigate: (page: string) => void;
}

const Admin: React.FC<AdminProps> = ({ onNavigate }) => {
    // 1. Core Hooks
    const { isAdmin, user: currentUser, loading: authLoading } = useAuth();
    const { theme, language } = useTheme();
    
    const [users, setUsers] = React.useState<UserProfile[]>([]);
    const [settings, setSettings] = React.useState<any[]>([]);
    const [supportMessages, setSupportMessages] = React.useState<SupportMessage[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<'users' | 'settings' | 'briefing' | 'support' | 'summaries'>('users');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [stats, setStats] = React.useState({ totalUsers: 0, totalDocs: 0 });
    const [pendingSummaries, setPendingSummaries] = React.useState<any[]>([]);
    
    const [resettingUserId, setResettingUserId] = React.useState<string | null>(null);
    const [newPassword, setNewPassword] = React.useState('');
    const [isResetting, setIsResetting] = React.useState(false);
    const [toast, setToast] = React.useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    const translations = {
        en: {
            title: 'Command Center',
            subtitle: 'Oversight Interface',
            units: 'Units',
            fragments: 'Fragments',
            alerts: 'Alerts',
            support: 'Support',
            search: 'Search units...',
            terminate: 'Terminate',
            promote: 'Promote',
            demote: 'Demote',
            stars: 'Stars',
            keyReset: 'Key Reset',
            params: 'Parameters',
            brief: 'Brief',
            summaries: 'Summaries',
            accessRestricted: 'Access Restricted',
            returnToGrid: 'Return to Grid',
            establishingLink: 'Establishing Command Link'
        },
        ar: {
            title: 'مركز القيادة',
            subtitle: 'واجهة الإشراف',
            units: 'الوحدات',
            fragments: 'الشظايا',
            alerts: 'التنبيهات',
            support: 'الدعم',
            search: 'بحث عن وحدات...',
            terminate: 'إنهاء',
            promote: 'ترقية',
            demote: 'خفض رتبة',
            stars: 'النجوم',
            keyReset: 'إعادة تعيين المفتاح',
            params: 'المعلمات',
            brief: 'موجز',
            summaries: 'الملخصات',
            accessRestricted: 'الدخول مقيد',
            returnToGrid: 'العودة إلى الشبكة',
            establishingLink: 'إنشاء رابط القيادة'
        }
    };

    const t = translations[language as keyof typeof translations] || translations.en;

    // 2. Effects
    React.useEffect(() => {
        if (isAdmin) {
            loadInitialData();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [isAdmin, authLoading]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchAdminData(),
                fetchSettings(),
                fetchSupportMessages(),
                fetchPendingSummaries()
            ]);
        } catch (e) {
            console.error("Initial load failed", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingSummaries = async () => {
        if (!supabase) return;
        try {
            const { data: textSumms } = await supabase.from('user_summaries').select('*, profiles(username, email)').eq('status', 'pending');
            const { data: docSumms } = await supabase.from('documents').select('id, title, created_at, user_id, is_summary, summary_status').eq('is_summary', true).eq('summary_status', 'pending');
            
            const docSummsWithMeta = await Promise.all((docSumms || []).map(async (d) => {
                const { data: p } = await supabase.from('profiles').select('username, email').eq('id', d.user_id).single();
                return { ...d, profiles: p, type: 'document' };
            }));

            const combined = [
                ...(textSumms || []).map(s => ({ ...s, type: 'text' })),
                ...docSummsWithMeta
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
            setPendingSummaries(combined);
        } catch (err) { console.error(err); }
    };

    const handleSummaryAction = async (id: string, action: 'approved' | 'rejected', type: 'text' | 'document' = 'text') => {
        if (!supabase) return;
        try {
            const table = type === 'document' ? 'documents' : 'user_summaries';
            const statusKey = type === 'document' ? 'summary_status' : 'status';
            if (action === 'rejected') {
                await supabase.from(table).delete().eq('id', id);
                showToast(`Terminated.`);
            } else {
                await supabase.from(table).update({ [statusKey]: 'approved' }).eq('id', id);
                showToast(`Approved.`);
            }
            fetchPendingSummaries();
        } catch (err: any) { showToast(err.message, 'error'); }
    };

    const fetchSettings = async () => {
        if (!supabase) return;
        const { data } = await supabase.from('system_settings').select('*');
        if (data) setSettings(data);
    };

    const fetchSupportMessages = async () => {
        if (!supabase) return;
        const { data } = await supabase.from('support_messages').select('*').order('created_at', { ascending: false });
        if (data) setSupportMessages(data);
    };

    const handleUpdateSupportStatus = async (id: string, status: string) => {
        if (!supabase) return;
        await supabase.from('support_messages').update({ status }).eq('id', id);
        fetchSupportMessages();
    };

    const handleUpdateSetting = async (key: string, value: string) => {
        if (!supabase || !currentUser) return;
        await supabase.from('system_settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key);
        showToast(`${key} updated.`);
        fetchSettings();
    };

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAdminData = async () => {
        if (!supabase) return;
        const { data: profiles } = await supabase.from('profiles').select('*').order('stars_count', { ascending: false });
        if (profiles) setUsers(profiles);
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: docCount } = await supabase.from('documents').select('*', { count: 'exact', head: true });
        setStats({ totalUsers: userCount || 0, totalDocs: docCount || 0 });
    };

    const handleDeleteUser = async (targetId: string) => {
        if (!supabase) return;
        if (!window.confirm("Terminate unit?")) return;
        await supabase.rpc('admin_delete_user', { target_user_id: targetId });
        setUsers(users.filter(u => u.id !== targetId));
        showToast("Terminated.");
    };

    const handleToggleAdmin = async (targetId: string, currentStatus: boolean) => {
        if (!supabase) return;
        const newStatus = !currentStatus;
        if (!window.confirm(`Change administrative status to ${newStatus ? 'ADMIN' : 'USER'}?`)) return;
        
        try {
            const { error } = await supabase.rpc('toggle_admin_status', { 
                target_user_id: targetId, 
                new_status: newStatus 
            });
            
            if (error) throw error;
            
            setUsers(users.map(u => u.id === targetId ? { ...u, is_admin: newStatus } : u));
            showToast(`Status updated: ${newStatus ? 'Promoted to Admin' : 'Demoted to User'}`);
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const handleAddStars = async (targetId: string, amount: number) => {
        if (!supabase) return;
        try {
            const { error } = await supabase.rpc('increment_stars', { user_id: targetId, amount });
            if (error) {
                showToast(error.message, 'error');
                return;
            }
            setUsers(users.map(u => u.id === targetId ? { ...u, stars_count: u.stars_count + amount } : u));
            showToast(`Uplink: +${amount} Stardust awarded.`);
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resettingUserId || !newPassword || !currentUser) return;
        setIsResetting(true);
        try {
            const res = await fetch('/api/admin/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: resettingUserId, newPassword, adminId: currentUser.id })
            });
            const data = await res.json();
            if (res.ok) {
                showToast("Override successful.");
                setResettingUserId(null);
                setNewPassword('');
            } else { throw new Error(data.error); }
        } catch (err: any) { showToast(err.message, 'error'); }
        finally { setIsResetting(false); }
    };

    // 3. Render Checks
    if (authLoading || (isAdmin && loading)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#050505] text-white">
                <Loader className="animate-spin text-red-500" size={48} />
                <p className="text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">{t.establishingLink}</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#050505] text-white p-10 text-center">
                <ShieldAlert size={64} className="text-red-500" />
                <h2 className="text-2xl font-black uppercase tracking-widest text-red-500">{t.accessRestricted}</h2>
                <button onClick={() => onNavigate('dashboard')} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px]">{t.returnToGrid}</button>
            </div>
        );
    }

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen pt-12 pb-20 px-6 md:px-12 transition-all duration-1000 relative overflow-hidden ${theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className={`absolute inset-0 pointer-events-none opacity-20 ${theme === 'dark' ? 'block' : 'hidden'}`}>
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" className="isometric-view scale-150 origin-center" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ opacity: 0, y: -100, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -100, x: '-50%' }} className={`fixed top-24 left-1/2 z-[1000] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {toast.type === 'error' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />} {toast.msg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-red-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl rotate-3"><Shield className="text-white -rotate-3" size={32} /></div>
                        <div><h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{t.title}</h1><p className="opacity-40 font-black uppercase tracking-[0.5em] text-[9px] mt-2">{t.subtitle}</p></div>
                    </div>
                    <button onClick={() => onNavigate('dashboard')} className={`p-5 border rounded-3xl transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900'}`}><ArrowLeft className={language === 'ar' ? 'rotate-180' : ''} size={24} /></button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: t.units, val: stats.totalUsers, icon: Users, color: 'blue' },
                        { label: t.fragments, val: stats.totalDocs, icon: FileText, color: 'purple' },
                        { label: t.alerts, val: pendingSummaries.length, icon: Activity, color: 'red' },
                        { label: t.support, val: supportMessages.filter(m => m.status === 'pending').length, icon: MessageSquare, color: 'amber' }
                    ].map((s, i) => (
                        <div key={i} className={`p-8 rounded-[3rem] border ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                            <div className="flex items-center gap-4 mb-4"><s.icon className={`text-${s.color}-500`} size={20} /><span className="text-[10px] font-black uppercase tracking-widest opacity-40">{s.label}</span></div>
                            <div className="text-4xl font-black italic tracking-tighter">{s.val}</div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3 mb-12 bg-white/5 border border-white/5 p-2 rounded-[2.5rem] backdrop-blur-xl">
                    {[{id:'users',l:t.units,i:Users},{id:'summaries',l:t.summaries,i:FileText,b:pendingSummaries.length},{id:'support',l:t.support,i:MessageSquare},{id:'settings',l:t.params,i:Key},{id:'briefing',l:t.brief,i:Monitor}].map(t_nav => (
                        <button key={t_nav.id} onClick={() => setActiveTab(t_nav.id as any)} className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 relative ${activeTab === t_nav.id ? 'bg-red-600 text-white shadow-2xl' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                            <t_nav.i size={16} />{t_nav.l}{t_nav.b ? <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-red-600 rounded-full flex items-center justify-center text-[8px] font-black">{t_nav.b}</span> : null}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                            <div className="relative"><Search className={`absolute ${language === 'ar' ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-gray-500`} size={20} /><input placeholder={t.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`w-full py-7 ${language === 'ar' ? 'pr-16 pl-8' : 'pl-16 pr-8'} rounded-[2.5rem] border outline-none font-black text-sm uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 focus:border-red-500 shadow-2xl' : 'bg-white border-slate-200'}`} /></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* FIX APPLIED BELOW ON LINE 224 */}
                                {users.filter(u => (u.email || "").toLowerCase().includes((searchQuery || "").toLowerCase())).map(u => (
                                    <TiltCard key={u.id} className="p-8 rounded-[3.5rem] bg-white/5 border border-white/5 hover:border-red-500/30 transition-all relative">
                                        {u.is_admin && (
                                            <div className={`absolute top-6 ${language === 'ar' ? 'left-6' : 'right-6'} p-2 bg-red-600/20 border border-red-500/30 rounded-xl text-red-500`} title="Admin Unit">
                                                <Shield size={14} />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 mb-8"><div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 overflow-hidden">{u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <UserCircle size={32} />}</div><div className="min-w-0"><h3 className="text-xl font-black italic truncate">{u.username || 'Unit'}</h3><p className="text-[10px] font-bold opacity-30 truncate">{u.email}</p></div></div>
                                        <div className="space-y-3 mb-8">
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest opacity-40">
                                                <span>{t.stars}</span>
                                                <span className="text-amber-500">{u.stars_count}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button onClick={() => handleAddStars(u.id, 10)} className="py-2 bg-amber-500/10 text-amber-500 rounded-lg text-[8px] font-black hover:bg-amber-500 hover:text-white transition-all">+10</button>
                                                <button onClick={() => handleAddStars(u.id, 50)} className="py-2 bg-amber-500/10 text-amber-500 rounded-lg text-[8px] font-black hover:bg-amber-500 hover:text-white transition-all">+50</button>
                                                <button onClick={() => {
                                                    const val = prompt("Enter amount:");
                                                    if(val) handleAddStars(u.id, parseInt(val));
                                                }} className="py-2 bg-amber-500/10 text-amber-500 rounded-lg text-[8px] font-black hover:bg-amber-500 hover:text-white transition-all">...</button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <button onClick={() => {setResettingUserId(u.id); setNewPassword('');}} className="py-4 bg-blue-500/10 text-blue-500 rounded-2xl font-black uppercase text-[9px] hover:bg-blue-500 hover:text-white transition-all">{t.keyReset}</button>
                                            
                                            {currentUser?.email === 'aliopooopp3@gmail.com' ? (
                                                <button onClick={() => handleToggleAdmin(u.id, u.is_admin)} className={`py-4 rounded-2xl font-black uppercase text-[9px] transition-all ${u.is_admin ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white'}`}>
                                                    {u.is_admin ? t.demote : t.promote}
                                                </button>
                                            ) : (
                                                <div className="py-4 bg-white/5 rounded-2xl flex items-center justify-center opacity-20" title="Restricted to Super-Admin">
                                                    <Shield size={14} />
                                                </div>
                                            )}
                                            
                                            <button onClick={() => handleDeleteUser(u.id)} className="py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-[9px] hover:bg-red-500 hover:text-white transition-all">{t.terminate}</button>
                                        </div>
                                    </TiltCard>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'summaries' && (
                        <motion.div key="summaries" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                            {pendingSummaries.length === 0 ? <div className="py-40 text-center opacity-20 uppercase font-black tracking-widest text-[10px]">No pending fragments</div> : (
                                <div className="grid grid-cols-1 gap-6">{pendingSummaries.map(s => (
                                    <div key={s.id} className="p-10 rounded-[4rem] bg-white/5 border border-white/5 flex flex-col lg:flex-row gap-10 items-center">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4"><span className="px-4 py-1 bg-purple-600/20 text-purple-500 border border-purple-500/20 rounded-full text-[8px] font-black uppercase">{s.type === 'document' ? 'File' : 'Text'}</span><span className="text-[9px] font-black opacity-30">Author: {s.profiles?.username || 'Unit'}</span></div>
                                            <h3 className="text-2xl font-black italic uppercase text-white">{s.title}</h3>
                                            {s.type === 'text' ? <p className="text-sm font-bold opacity-50 italic line-clamp-2">"{s.content}"</p> : <div className="text-blue-400 font-black text-[10px] uppercase">Attachment Indexed</div>}
                                        </div>
                                        <div className="flex gap-4 w-full lg:w-auto">
                                            <button 
                                                onClick={() => onNavigate('reader', s.id)}
                                                className="flex-1 lg:flex-none px-6 py-5 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all flex items-center gap-2"
                                            >
                                                <BookOpen size={14} /> Review
                                            </button>
                                            <button onClick={() => handleSummaryAction(s.id, 'approved', s.type)} className="flex-1 px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-[9px]">Accept</button>
                                            <button onClick={() => handleSummaryAction(s.id, 'rejected', s.type)} className="flex-1 px-10 py-5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-[2rem] font-black uppercase text-[9px]">Terminate</button>
                                        </div>
                                    </div>
                                ))}</div>
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div className="p-12 rounded-[4rem] border bg-white/5 border-white/5"><h2 className="text-3xl font-black italic uppercase mb-12 flex items-center gap-4"><Key className="text-blue-500" size={32} />Parameters</h2><div className="space-y-10">{settings.map(s => (
                                <div key={s.key} className="space-y-4">
                                    <div className="flex justify-between px-4"><span className="text-[11px] font-black text-blue-500 uppercase">{s.key}</span><span className="text-[8px] opacity-20 font-black uppercase">v1.4</span></div>
                                    <input type="password" defaultValue={s.value} onBlur={e => e.target.value !== s.value && handleUpdateSetting(s.key, e.target.value)} className="w-full p-6 rounded-3xl border bg-white/5 border-white/10 outline-none font-bold" />
                                </div>
                            ))}</div></div>
                        </motion.div>
                    )}
                    {activeTab === 'support' && (
                        <motion.div key="support" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            {supportMessages.length === 0 ? <div className="py-40 text-center opacity-20 font-black uppercase text-[10px]">Support Grid Clear</div> : (
                                <div className="grid grid-cols-1 gap-6">{supportMessages.map(m => (
                                    <div key={m.id} className={`p-10 rounded-[4rem] border ${m.status === 'pending' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/5'}`}>
                                        <div className="flex justify-between items-start mb-8"><div className="flex items-center gap-6"><div className={`p-5 rounded-2xl ${m.status === 'pending' ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-blue-600/10 text-blue-500'}`}><Mail size={24} /></div><div><h4 className="text-2xl font-black italic uppercase tracking-tight">{m.subject}</h4><p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">{m.email}</p></div></div><button onClick={() => handleUpdateSupportStatus(m.id, m.status === 'resolved' ? 'pending' : 'resolved')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${m.status === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10'}`}>{m.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}</button></div>
                                        <p className="p-8 rounded-[2.5rem] text-sm leading-relaxed font-bold italic bg-black/40">"{m.message}"</p>
                                    </div>
                                ))}</div>
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'briefing' && (
                        <motion.div key="briefing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><Presentation /></motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>{resettingUserId && (
                <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
                    <form onSubmit={handleResetPassword} className="max-w-md w-full bg-[#0D0D0D] border border-white/10 p-12 rounded-[4rem] text-center">
                        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8"><Key size={36} className="text-white" /></div>
                        <h2 className="text-3xl font-black italic uppercase mb-10">Key Override</h2>
                        <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Secure Key..." className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-blue-500 font-black text-center uppercase mb-10" />
                        <div className="flex gap-4"><button type="button" onClick={() => setResettingUserId(null)} className="flex-1 py-5 bg-white/5 rounded-2xl font-black uppercase text-[10px]">Cancel</button><button disabled={isResetting || !newPassword} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">{isResetting ? 'Processing...' : 'Override'}</button></div>
                    </form>
                </div>
            )}</AnimatePresence>
        </div>
    );
};

export default Admin;