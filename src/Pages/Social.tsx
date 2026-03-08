import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, UserPlus, UserCheck, UserX, 
    MessageSquare, ArrowLeft, Loader, 
    ShieldCheck, Star, Users, Bell, 
    Check, X, User, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

interface Student {
    id: string;
    username: string;
    avatar_url: string;
    stars_count: number;
    grade: string;
    bio: string;
}

interface FriendRequest {
    id: string;
    sender: Student;
    status: 'pending' | 'accepted' | 'blocked';
}

const SocialHub: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (user) {
            fetchSocialData();
        }
    }, [user]);

    const fetchSocialData = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch Incoming Friend Requests
            const { data: requests } = await supabase
                .from('friends')
                .select(`
                    id,
                    status,
                    sender:sender_id (id, username, avatar_url, stars_count, grade, bio)
                `)
                .eq('receiver_id', user?.id)
                .eq('status', 'pending');

            setFriendRequests(requests as any || []);

            // 2. Fetch Friends
            const { data: friendshipData } = await supabase
                .from('friends')
                .select(`
                    status,
                    sender:sender_id (id, username, avatar_url, stars_count, grade, bio),
                    receiver:receiver_id (id, username, avatar_url, stars_count, grade, bio)
                `)
                .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
                .eq('status', 'accepted');

            const friendList = (friendshipData || []).map(f => 
                f.sender.id === user?.id ? f.receiver : f.sender
            );
            setFriends(friendList as any);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const { data } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, stars_count, grade, bio')
                .ilike('username', `%${searchQuery}%`)
                .neq('id', user?.id)
                .limit(10);
            
            setSearchResults(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const sendFriendRequest = async (targetId: string) => {
        try {
            const { error } = await supabase
                .from('friends')
                .insert({
                    sender_id: user?.id,
                    receiver_id: targetId,
                    status: 'pending'
                });
            
            if (error) throw error;
            alert("Request Sent!");
        } catch (err: any) {
            alert(err.message || "Already sent or error occurred.");
        }
    };

    const respondToRequest = async (requestId: string, status: 'accepted' | 'blocked') => {
        try {
            const { error } = await supabase
                .from('friends')
                .update({ status })
                .eq('id', requestId);
            
            if (error) throw error;
            fetchSocialData(); // Refresh
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={`min-h-screen pt-12 pb-12 px-8 transition-all duration-700 ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className="max-w-7xl mx-auto">
                
                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                    <div className="space-y-6">
                        <button onClick={() => onNavigate('dashboard')} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-all ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            <ArrowLeft size={14} /> Back to Hub
                        </button>
                        <div className="flex items-center gap-8">
                            <div className={`w-20 h-20 rounded-[2.5rem] border shadow-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600/10 border-blue-500/20 text-blue-500' : 'bg-white border-blue-100 text-blue-600'}`}>
                                <Users size={32} />
                            </div>
                            <h1 className={`text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Social <br /> <span className="text-blue-500">Hub</span></h1>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <div className="px-10 py-8 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-2xl flex flex-col items-end shadow-2xl">
                            <span className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30 mb-2">Network Connections</span>
                            <div className="flex items-center gap-4 text-blue-500">
                                <UserCheck size={28} />
                                <span className="text-5xl font-black italic tracking-tighter">{friends.length}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* --- LEFT: DISCOVERY & REQUESTS --- */}
                    <div className="lg:col-span-7 space-y-12">
                        
                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-blue-500 transition-colors" size={24} />
                            <input 
                                type="text" 
                                placeholder="SEARCH STUDENTS BY USERNAME..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-8 pl-20 pr-8 text-lg font-black uppercase tracking-widest outline-none focus:border-blue-500/50 transition-all"
                            />
                            <button 
                                onClick={handleSearch}
                                className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all"
                            >
                                {isSearching ? 'LINKING...' : 'SEARCH'}
                            </button>
                        </div>

                        {/* Search Results */}
                        <AnimatePresence>
                            {searchResults.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.6em] opacity-30 px-4">Neural Discovery</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {searchResults.map(student => (
                                            <div key={student.id} className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center overflow-hidden border border-blue-500/20">
                                                        {student.avatar_url ? <img src={student.avatar_url} alt="" className="w-full h-full object-cover" /> : <User size={24} className="text-blue-500" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black uppercase tracking-widest text-sm">{student.username}</p>
                                                        <div className="flex items-center gap-2 text-[9px] font-bold opacity-40">
                                                            <Star size={10} className="text-amber-500 fill-amber-500" />
                                                            {student.stars_count} STARS // GRADE {student.grade || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => sendFriendRequest(student.id)} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
                                                    <UserPlus size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Friend Requests */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Bell className="text-blue-500" size={20} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.6em] opacity-30">Incoming Uplinks</h3>
                            </div>
                            {friendRequests.length === 0 ? (
                                <p className="text-[10px] font-black uppercase opacity-20 px-4">No pending requests detected.</p>
                            ) : (
                                <div className="space-y-3">
                                    {friendRequests.map(req => (
                                        <div key={req.id} className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-[2.5rem] flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center font-black">
                                                    {req.sender.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black uppercase tracking-widest">{req.sender.username}</p>
                                                    <p className="text-[9px] font-bold opacity-40">Wants to join your neural network</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => respondToRequest(req.id, 'accepted')} className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-400 transition-all"><Check size={20} /></button>
                                                <button onClick={() => respondToRequest(req.id, 'blocked')} className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-400 transition-all"><X size={20} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT: FRIEND LIST & CHAT ENTRY --- */}
                    <div className="lg:col-span-5">
                        <div className={`border rounded-[4rem] p-10 backdrop-blur-3xl shadow-2xl h-[700px] flex flex-col ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
                            <div className="flex items-center justify-between mb-10 px-2">
                                <div className="flex items-center gap-4">
                                    <UserCheck className="text-blue-500" size={24} />
                                    <h3 className={`text-[10px] font-black uppercase tracking-[0.6em] opacity-40 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Neural Network</h3>
                                </div>
                                <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-500 uppercase tracking-widest">{friends.length} Active</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-4">
                                {friends.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4">
                                        <Users size={64} strokeWidth={1} />
                                        <p className="text-sm font-black uppercase tracking-[0.3em]">Network empty. <br /> Start discovery.</p>
                                    </div>
                                ) : (
                                    friends.map(friend => (
                                        <div key={friend.id} className={`p-6 border rounded-[2.5rem] flex items-center justify-between group transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md'}`}>
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-black text-xl border-2 ${theme === 'dark' ? 'border-white/10' : 'border-white shadow-md'}`}>
                                                        {friend.avatar_url ? <img src={friend.avatar_url} className="w-full h-full object-cover" /> : friend.username[0].toUpperCase()}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 rounded-full ${theme === 'dark' ? 'border-[#0D0D0D]' : 'border-white'}`} />
                                                </div>
                                                <div>
                                                    <p className={`font-black uppercase tracking-tighter text-lg leading-none mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>{friend.username}</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 text-[9px] font-black text-amber-500">
                                                            <Star size={10} fill="currentColor" /> {friend.stars_count}
                                                        </div>
                                                        <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Lv. {friend.grade || '1'} Node</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => onNavigate('messenger', friend.id)}
                                                className="p-5 bg-blue-600 text-white rounded-[1.5rem] shadow-lg shadow-blue-600/20 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0"
                                            >
                                                <MessageSquare size={20} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className={`mt-8 pt-8 border-t text-center ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                                <p className={`text-[8px] font-black uppercase tracking-[0.5em] opacity-20 leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    Collaborative study increases star rewards by 1.5x. <br /> Invite friends to live sessions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SYNC LOADER */}
            <AnimatePresence>
                {loading && (
                    <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-[#050505] flex flex-col items-center justify-center gap-12">
                        <div className="relative">
                            <div className="w-40 h-40 border-8 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                            <Sparkles size={56} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" />
                        </div>
                        <p className="text-xl font-black uppercase tracking-[1em] text-white">Neural Hub Sync</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SocialHub;
