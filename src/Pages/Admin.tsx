import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, Users, Trash2, Star, ArrowLeft, 
    Loader, Search, ShieldAlert, FileText, Activity,
    Key, Phone, CheckCircle2, X, Eye, EyeOff, Mail, MessageSquare, Monitor, UserCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Presentation from './Presentation';

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
    const { isAdmin, user: currentUser } = useAuth();
    const { theme } = useTheme();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [settings, setSettings] = useState<any[]>([]);
    const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'briefing' | 'support'>('users');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ totalUsers: 0, totalDocs: 0 });
    
    // Password reset state
    const [resettingUserId, setResettingUserId] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (isAdmin) {
            fetchAdminData();
            fetchSettings();
            fetchSupportMessages();
        }
    }, [isAdmin]);

    const fetchSettings = async () => {
        try {
            if (!supabase) return;
            const { data, error } = await supabase.from('system_settings').select('*');
            if (error) throw error;
            setSettings(data || []);
        } catch (err) {
            console.error("Error fetching settings:", err);
        }
    };

    const fetchSupportMessages = async () => {
        try {
            if (!supabase) return;
            const { data, error } = await supabase
                .from('support_messages')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setSupportMessages(data || []);
        } catch (err) {
            console.error("Support fetch error:", err);
        }
    };

    const handleUpdateSupportStatus = async (id: string, status: string) => {
        try {
            if (!supabase) return;
            const { error } = await supabase
                .from('support_messages')
                .update({ status })
                .eq('id', id);
            
            if (error) throw error;
            showToast(`Ticket ${status} successfully.`);
            fetchSupportMessages();
        } catch (err: any) {
            showToast(`Update failed: ${err.message}`, 'error');
        }
    };

    const handleUpdateSetting = async (key: string, value: string) => {
        try {
            if (!supabase) return;
            const { error } = await supabase
                .from('system_settings')
                .update({ value, updated_at: new Date().toISOString() })
                .eq('key', key);
            
            if (error) throw error;
            showToast(`${key} updated successfully.`);
            
            // Reload backend config
            await fetch('/api/admin/reload-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: currentUser?.id })
            });

            fetchSettings();
        } catch (err: any) {
            showToast(`Update failed: ${err.message}`, 'error');
        }
    };

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            if (!supabase) return;

            // Fetch Users
            const { data: profiles, error: pError } = await supabase
                .from('profiles')
                .select('*')
                .order('stars_count', { ascending: false });
            
            if (pError) throw pError;
            setUsers(profiles || []);

            // Fetch Stats
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: docCount } = await supabase.from('documents').select('*', { count: 'exact', head: true });
            
            setStats({
                totalUsers: userCount || 0,
                totalDocs: docCount || 0
            });
        } catch (err) {
            console.error("Admin fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (targetId: string) => {
        if (!supabase) return;
        if (!window.confirm("Are you sure you want to terminate this unit? All data will be erased.")) return;
        
        try {
            const { error } = await supabase.rpc('admin_delete_user', { target_user_id: targetId });
            if (error) throw error;
            
            setUsers(users.filter(u => u.id !== targetId));
            showToast("Unit terminated from grid.");
        } catch (err: any) {
            showToast("Termination failed: " + err.message, 'error');
        }
    };

    const handleAwardStar = async (targetId: string) => {
        if (!supabase) return;
        try {
            const { error } = await supabase.rpc('increment_stars', { user_id: targetId });
            if (error) throw error;
            
            setUsers(users.map(u => 
                u.id === targetId ? { ...u, stars_count: u.stars_count + 1 } : u
            ));
        } catch (err: any) {
            console.error("Star award failed:", err);
        }
    };

    const handleToggleAdmin = async (targetId: string, currentStatus: boolean) => {
        if (!supabase || !currentUser) return;
        if (targetId === currentUser.id) {
            showToast("You cannot demote yourself.", 'error');
            return;
        }

        const action = currentStatus ? "demote" : "promote";
        if (!window.confirm(`Are you sure you want to ${action} this unit?`)) return;

        try {
            const { error } = await supabase.rpc('toggle_admin_status', { 
                target_user_id: targetId, 
                new_status: !currentStatus 
            });
            
            if (error) throw error;
            
            setUsers(users.map(u => 
                u.id === targetId ? { ...u, is_admin: !currentStatus } : u
            ));
            showToast(`Unit ${currentStatus ? 'demoted' : 'promoted'} successfully.`);
        } catch (err: any) {
            showToast(`Operation failed: ${err.message}`, 'error');
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
                body: JSON.stringify({
                    targetUserId: resettingUserId,
                    newPassword,
                    adminId: currentUser.id
                })
            });

            // Check if response is JSON
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error("Backend server is not responding (Verify it is running on port 4000).");
            }

            const data = await res.json();
            if (res.ok && data.success) {
                showToast("Password override successful.");
                setResettingUserId(null);
                setNewPassword('');
            } else {
                throw new Error(data.error || "Reset failed");
            }
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setIsResetting(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 text-center">
                <div className="max-w-md space-y-6">
                    <ShieldAlert size={80} className="mx-auto text-red-500 animate-pulse" />
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">Access Denied</h1>
                    <p className="opacity-50 text-sm font-bold uppercase tracking-widest">Administrative clearance required to access this node.</p>
                    <button 
                        onClick={() => onNavigate('dashboard')}
                        className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest"
                    >
                        Return to Safety
                    </button>
                </div>
            </div>
        );
    }

    const filteredUsers = users.filter(u => 
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchQuery))
    );

    return (
        <div className={`min-h-screen relative z-10 pt-24 p-8 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <div className="max-w-6xl mx-auto">
                {/* Toasts */}
                <AnimatePresence>
                    {toast && (
                        <motion.div 
                            initial={{ opacity: 0, y: -100, x: '-50%' }}
                            animate={{ opacity: 1, y: 20, x: '-50%' }}
                            exit={{ opacity: 0, y: -100, x: '-50%' }}
                            className={`fixed top-20 left-1/2 z-[2000] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3 ${
                                toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                            }`}
                        >
                            {toast.type === 'error' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />} 
                            {toast.msg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Password Reset Modal */}
                <AnimatePresence>
                    {resettingUserId && (
                        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`w-full max-w-md p-10 rounded-[3rem] border shadow-2xl ${
                                    theme === 'dark' ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-200'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Override Key</h2>
                                    <button onClick={() => setResettingUserId(null)} className="opacity-40 hover:opacity-100 transition-opacity"><X /></button>
                                </div>
                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">New Secure Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                className={`w-full p-5 pr-14 rounded-2xl border outline-none font-bold ${
                                                    theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-red-500' : 'bg-slate-50 border-slate-200'
                                                }`}
                                                placeholder="••••••••"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                                            >
                                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isResetting}
                                        className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 transition-all flex items-center justify-center gap-3"
                                    >
                                        {isResetting ? <Loader className="animate-spin" size={16} /> : <Key size={16} />}
                                        Execute Reset
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl border shadow-lg ${theme === 'dark' ? 'bg-red-600/10 text-red-500 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                <Shield size={32} />
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Command Center</h1>
                        </div>
                        <p className="opacity-40 font-black uppercase tracking-[0.4em] text-[10px] ml-20">System Administration & Oversight</p>
                    </div>
                    <div className="flex gap-4">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={fetchAdminData}
                            className={`p-5 border rounded-3xl transition-all shadow-xl ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
                        >
                            <Activity size={24} />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onNavigate('dashboard')}
                            className={`p-5 border rounded-3xl transition-all shadow-xl ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}
                        >
                            <ArrowLeft size={24} />
                        </motion.button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className={`p-8 rounded-[3rem] border ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <Users className="text-blue-500" size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Active Units</span>
                        </div>
                        <div className="text-5xl font-black italic tracking-tighter">{stats.totalUsers}</div>
                    </div>
                    <div className={`p-8 rounded-[3rem] border ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <FileText className="text-purple-500" size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Intelligence Fragments</span>
                        </div>
                        <div className="text-5xl font-black italic tracking-tighter">{stats.totalDocs}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                            activeTab === 'users' 
                            ? 'bg-red-600 text-white' 
                            : theme === 'dark' ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                        User Management
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                            activeTab === 'settings' 
                            ? 'bg-blue-600 text-white' 
                            : theme === 'dark' ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                        System Settings
                    </button>
                    <button 
                        onClick={() => setActiveTab('briefing')}
                        className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                            activeTab === 'briefing' 
                            ? 'bg-indigo-600 text-white' 
                            : theme === 'dark' ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                        System Briefing
                    </button>
                    <button 
                        onClick={() => setActiveTab('support')}
                        className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                            activeTab === 'support' 
                            ? 'bg-amber-600 text-white' 
                            : theme === 'dark' ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                        Support Inbox
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'users' ? (
                        <motion.div 
                            key="users"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="relative mb-8">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                                <input 
                                    type="text"
                                    placeholder="Search system units (Alias, Email, or Phone)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full py-6 pl-16 pr-8 rounded-[2rem] border outline-none font-bold transition-all ${
                                        theme === 'dark' 
                                        ? 'bg-[#0D0D0D] border-white/10 focus:border-red-500' 
                                        : 'bg-white border-slate-200 focus:border-red-600'
                                    }`}
                                />
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <Loader className="animate-spin text-red-500" size={48} />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {filteredUsers.map((u) => (
                                            <motion.div 
                                                key={u.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`p-8 rounded-[3rem] border flex flex-col md:flex-row items-center gap-8 transition-all relative overflow-hidden ${
                                                    u.is_admin ? 'border-red-500/30 bg-red-500/5' : theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-sm'
                                                }`}
                                            >
                                                {/* Profile Photo */}
                                                <div className="relative shrink-0">
                                                    {u.avatar_url ? (
                                                        <div className="w-20 h-20 rounded-[2rem] border-2 border-blue-500/20 overflow-hidden shadow-xl">
                                                            <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className={`w-20 h-20 rounded-[2rem] border-2 border-dashed flex items-center justify-center ${
                                                            theme === 'dark' ? 'bg-white/5 border-white/10 text-white/20' : 'bg-slate-50 border-slate-200 text-slate-300'
                                                        }`}>
                                                            <UserCircle size={40} />
                                                        </div>
                                                    )}
                                                    {u.is_admin && (
                                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-xl shadow-lg border-4 border-[#050505]">
                                                            <Shield size={12} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 space-y-2 text-center md:text-left">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-2xl font-black italic uppercase tracking-tight">{u.username || 'Anonymous'}</h3>
                                                        {u.is_admin && <span className="px-3 py-1 bg-red-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Admin</span>}
                                                        {u.id === currentUser?.id && <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest">You</span>}
                                                        {u.has_downloaded_desktop && (
                                                            <span className="px-3 py-1 bg-blue-600/20 text-blue-500 border border-blue-500/30 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                <Monitor size={10} /> Desktop Uplink
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-4">
                                                        <p className="text-xs font-bold opacity-40 flex items-center gap-2"><Shield className="w-3 h-3" /> {u.email}</p>
                                                        {u.phone && <p className="text-xs font-bold opacity-40 flex items-center gap-2 text-indigo-500"><Phone className="w-3 h-3" /> {u.phone}</p>}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-10">
                                                    <div className="text-right">
                                                        <div className="text-3xl font-black italic tracking-tighter text-amber-500 flex items-center gap-2">
                                                            {u.stars_count} <Star className="fill-amber-500" size={20} />
                                                        </div>
                                                        <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">Neural Stars</p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                                                            className={`p-4 rounded-2xl transition-all ${
                                                                u.is_admin 
                                                                ? 'bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white' 
                                                                : 'bg-green-600/10 text-green-600 hover:bg-green-600 hover:text-white'
                                                            }`}
                                                            title={u.is_admin ? "Demote from Admin" : "Promote to Admin"}
                                                        >
                                                            <Shield size={20} className={u.is_admin ? "fill-red-600" : ""} />
                                                        </button>
                                                        <button 
                                                            onClick={() => setResettingUserId(u.id)}
                                                            className="p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all"
                                                            title="Override Password"
                                                        >
                                                            <Key size={20} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAwardStar(u.id)}
                                                            className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl hover:bg-amber-500 hover:text-white transition-all"
                                                            title="Award Star"
                                                        >
                                                            <Star size={20} />
                                                        </button>
                                                        <button 
                                                            disabled={u.is_admin}
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            className={`p-4 rounded-2xl transition-all ${
                                                                u.is_admin 
                                                                ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed opacity-20' 
                                                                : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                                                            }`}
                                                            title="Terminate Unit"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    ) : activeTab === 'settings' ? (
                        <motion.div 
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className={`p-8 rounded-[3rem] border ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                                    <Key className="text-blue-500" /> API & Database Configuration
                                </h2>
                                <div className="space-y-8">
                                    {settings.map((setting) => (
                                        <div key={setting.key} className="space-y-3">
                                            <div className="flex justify-between items-end px-4">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{setting.key}</span>
                                                    <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">{setting.description}</p>
                                                </div>
                                                <span className="text-[8px] opacity-20 font-bold uppercase">Last Updated: {new Date(setting.updated_at).toLocaleString()}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <input 
                                                    type="password"
                                                    defaultValue={setting.value}
                                                    onBlur={(e) => {
                                                        if (e.target.value !== setting.value) {
                                                            handleUpdateSetting(setting.key, e.target.value);
                                                        }
                                                    }}
                                                    className={`flex-1 p-5 rounded-2xl border outline-none font-bold transition-all ${
                                                        theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-600'
                                                    }`}
                                                    placeholder={`Enter ${setting.key}...`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-12 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                                        <ShieldAlert size={14} /> Critical Warning
                                    </p>
                                    <p className="text-[11px] font-bold mt-2 opacity-60">Changes to API keys or database strings will take effect immediately. Ensure values are correct to prevent system failure.</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'briefing' ? (
                        <motion.div
                            key="briefing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Presentation />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="support"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {supportMessages.length === 0 ? (
                                <div className={`p-20 text-center rounded-[3rem] border border-dashed ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200'}`}>
                                    <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-black uppercase tracking-[0.4em] opacity-30">No pending transmissions</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {supportMessages.map((msg) => (
                                        <motion.div 
                                            key={msg.id}
                                            className={`p-8 rounded-[3rem] border transition-all ${
                                                msg.status === 'pending' 
                                                ? 'border-amber-500/30 bg-amber-500/5' 
                                                : theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-sm'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-4 rounded-2xl ${msg.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-blue-600/10 text-blue-500'}`}>
                                                        <Mail size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black italic uppercase tracking-tight">{msg.subject}</h4>
                                                        <p className="text-xs font-bold opacity-40 uppercase tracking-widest">{msg.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleUpdateSupportStatus(msg.id, msg.status === 'resolved' ? 'pending' : 'resolved')}
                                                        className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                                                            msg.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                                        }`}
                                                    >
                                                        {msg.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                                                    </button>
                                                </div>
                                            </div>
                                            <p className={`p-6 rounded-2xl text-sm leading-relaxed font-medium ${theme === 'dark' ? 'bg-black/40' : 'bg-slate-50'}`}>
                                                {msg.message}
                                            </p>
                                            <div className="mt-6 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.3em] opacity-20">
                                                <span>Protocol ID: {msg.id.slice(0,8)}</span>
                                                <span>Timestamp: {new Date(msg.created_at).toLocaleString()}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Admin;
