import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar as CalendarIcon, Edit3, Save, CheckCircle2, Zap, Bell, Trash2 } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import WalkingStudent from '../components/3D/WalkingStudent';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
    onNavigate: (page: string) => void;
}

const CalendarPage: React.FC<Props> = ({ onNavigate }) => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [date, setDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [events, setEvents] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        if (!user) return;
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
            const res = await fetch(`${baseUrl}/api/get-calendar/${user.id}`);
            const data = await res.json();
            setEvents(data || {});
        } catch (err) {
            console.error("Fetch calendar error:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Check for notifications
    useEffect(() => {
        if (Object.keys(events).length === 0) return;

        const checkNotifications = () => {
            const today = new Date().toISOString().split('T')[0];
            if (events[today]) {
                if (Notification.permission === 'granted') {
                    new Notification('Study Reminder', {
                        body: `Today's Task: ${events[today]}`,
                        icon: '/favicon.ico'
                    });
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification('Study Reminder', {
                                body: `Today's Task: ${events[today]}`,
                                icon: '/favicon.ico'
                            });
                        }
                    });
                }
            }
        };

        checkNotifications();
    }, [events]);

    const handleDateChange = (newDate: Date) => {
        setDate(newDate);
        const dateKey = newDate.toISOString().split('T')[0];
        setNote(events[dateKey] || '');
    };

    const handleSave = async () => {
        if (!user) return;
        const dateKey = date.toISOString().split('T')[0];
        
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
            const response = await fetch(`${baseUrl}/api/save-calendar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    date: dateKey,
                    note: note.trim()
                }),
            });

            if (response.ok) {
                setEvents(prev => ({ ...prev, [dateKey]: note.trim() }));
                setSuccessMsg(note.trim() ? "Temporal log committed to grid." : "Temporal node cleared.");
                setTimeout(() => setSuccessMsg(null), 3000);
            }
        } catch (err) {
            console.error("Save calendar error:", err);
        }
    };

    const tileContent = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month') {
            const dateKey = date.toISOString().split('T')[0];
            if (events[dateKey]) {
                return (
                    <div className="flex justify-center mt-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className={`min-h-screen relative z-10 pt-24 p-8 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Toasts */}
                <AnimatePresence>
                    {successMsg && (
                        <motion.div 
                            initial={{ opacity: 0, y: -100, x: '-50%' }}
                            animate={{ opacity: 1, y: 20, x: '-50%' }}
                            exit={{ opacity: 0, y: -100, x: '-50%' }}
                            className="fixed top-20 left-1/2 z-[100] bg-green-500 text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3"
                        >
                            <CheckCircle2 size={16} /> {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <header className="mb-16 flex justify-between items-end">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl border shadow-lg transition-colors ${theme === 'dark' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                <CalendarIcon size={32} />
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Timeline</h1>
                        </div>
                        <p className="opacity-40 font-black uppercase tracking-[0.4em] text-[10px] ml-20">Temporal Data & Retention Logs</p>
                    </div>
                    <div className="flex gap-4">
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => Notification.requestPermission()}
                            className={`p-5 border rounded-3xl transition-all shadow-xl ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}
                            title="Request Notification Permission"
                        >
                            <Bell size={24} />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.1, rotate: -180 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onNavigate('dashboard')}
                            className={`p-5 border rounded-3xl transition-all shadow-xl ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}
                        >
                            <ArrowLeft size={24} />
                        </motion.button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left: Premium Calendar */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`lg:col-span-7 border p-10 rounded-[4rem] shadow-2xl transition-all ${
                            theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100'
                        }`}
                    >
                        <div className="custom-calendar-wrapper">
                            <Calendar 
                                onChange={handleDateChange as any} 
                                value={date}
                                className="neural-calendar"
                                tileContent={tileContent}
                            />
                        </div>
                    </motion.div>

                    {/* Right: Notes & Animation */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-5 space-y-8"
                    >
                        <div className={`p-10 rounded-[4rem] border relative overflow-hidden group transition-all ${
                            theme === 'dark' ? 'bg-[#0D0D0D] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'
                        }`}>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <Edit3 className="text-blue-500" size={20} />
                                        <h3 className="font-black uppercase tracking-widest text-[10px] opacity-40">Entry: {date.toDateString()}</h3>
                                    </div>
                                    <Zap size={16} className={`animate-pulse ${events[date.toISOString().split('T')[0]] ? 'text-amber-500' : 'text-slate-300 opacity-20'}`} />
                                </div>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Log study findings, breakthroughs, or targets..."
                                    className={`w-full h-48 bg-transparent border-none outline-none text-lg font-medium placeholder:opacity-10 resize-none mb-6 ${
                                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                                    }`}
                                />
                                <div className="flex gap-4">
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSave}
                                        className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Save size={16} /> {events[date.toISOString().split('T')[0]] ? 'Update' : 'Commit'} to Log
                                    </motion.button>
                                    {events[date.toISOString().split('T')[0]] && (
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setNote(''); setTimeout(handleSave, 0); }}
                                            className="p-5 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={`p-8 rounded-[3rem] border transition-all h-[300px] flex flex-col items-center justify-center relative overflow-hidden ${
                            theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100'
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
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 italic">
                                    {loading ? 'Synchronizing temporal data...' : 'Temporal Link Active'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style>{`
                .neural-calendar {
                    width: 100% !important;
                    background: transparent !important;
                    border: none !important;
                    font-family: inherit !important;
                    color: ${theme === 'dark' ? 'white' : '#0f172a'} !important;
                }
                .react-calendar__tile {
                    padding: 2.5em 0.5em !important;
                    font-weight: 900 !important;
                    font-style: italic !important;
                    text-transform: uppercase !important;
                    border-radius: 1.5rem !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    font-size: 0.85rem !important;
                    border: 2px solid transparent !important;
                }
                .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus {
                    background: ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.05)'} !important;
                    border-color: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(37,99,235,0.1)'} !important;
                    transform: translateY(-2px);
                }
                .react-calendar__tile--active {
                    background: #2563eb !important;
                    color: white !important;
                    box-shadow: 0 15px 35px rgba(37,99,235,0.4) !important;
                    border-color: #3b82f6 !important;
                }
                .react-calendar__navigation button {
                    color: ${theme === 'dark' ? 'white' : '#0f172a'} !important;
                    font-weight: 900 !important;
                    font-size: 1.8rem !important;
                    text-transform: uppercase !important;
                    font-style: italic !important;
                    letter-spacing: -0.05em !important;
                    transition: all 0.2s !important;
                }
                .react-calendar__navigation button:enabled:hover {
                    background-color: ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'} !important;
                }
                .react-calendar__month-view__weekdays__weekday {
                    color: #3b82f6 !important;
                    text-decoration: none !important;
                    font-size: 0.75rem !important;
                    font-weight: 900 !important;
                    text-transform: uppercase !important;
                    opacity: 0.5 !important;
                    padding-bottom: 1.5em !important;
                }
                .react-calendar__tile--now {
                    background: ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'} !important;
                    border: 2px solid #3b82f6 !important;
                    color: #3b82f6 !important;
                }
                .react-calendar__month-view__days__tile--neighboringMonth {
                    opacity: 0.15 !important;
                }
            `}</style>
        </div>
    );
};

export default CalendarPage;
