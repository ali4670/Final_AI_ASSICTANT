import React, { useState, useEffect, useCallback } from "react";
import { 
    ArrowLeft, Plus, Trash2, Zap, Clock, CheckCircle2, Calendar as CalendarIcon, 
    Bell, BellOff, ListTodo, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { translations } from "../utils/translations";

interface Task {
    id: string;
    task_text: string;
    is_completed: boolean;
    scheduled_date: string;
    scheduled_time: string | null;
}

interface Props {
    onNavigate: (page: string) => void;
}

export default function Journal({ onNavigate }: Props) {
    const { user } = useAuth();
    const { theme, language } = useTheme();
    const t = translations[language].journal;
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [newTaskText, setNewTaskText] = useState("");
    const [newTaskTime, setNewTaskTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const formattedDate = selectedDate.toISOString().split('T')[0];

    const fetchTasks = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/tasks/${user.id}?date=${formattedDate}`);
            const data = await res.json();
            if (Array.isArray(data)) setTasks(data);
        } catch (err) {
            console.error("Fetch tasks error:", err);
        }
    }, [user, formattedDate]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        if ("Notification" in window && Notification.permission === "granted") {
            setNotificationsEnabled(true);
        }
    }, []);

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) return;
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            setNotificationsEnabled(true);
            new Notification("Neural Journal Active", { body: "Daily alerts enabled." });
        }
    };

    const addTask = async () => {
        if (!newTaskText || !user) return;
        setLoading(true);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    taskText: newTaskText,
                    date: formattedDate,
                    time: newTaskTime || null
                }),
            });
            const data = await res.json();
            if (data.id) {
                setTasks([...tasks, data]);
                setNewTaskText("");
                setNewTaskTime("");
                setSuccessMsg("Task added to journal.");
                setTimeout(() => setSuccessMsg(null), 3000);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const toggleTask = async (task: Task) => {
        try {
            const res = await fetch(`/api/tasks/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isCompleted: !task.is_completed }),
            });
            if (res.ok) {
                setTasks(tasks.map(t => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t));
            }
        } catch (err) { console.error(err); }
    };

    const deleteTask = async (taskId: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
            if (res.ok) setTasks(tasks.filter(t => t.id !== taskId));
        } catch (err) { console.error(err); }
    };

    return (
        <>
            <div className={`min-h-screen relative z-10 pt-24 p-8 transition-colors duration-700 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence>
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, y: -100, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -100, x: '-50%' }} className="fixed top-20 left-1/2 z-[100] bg-blue-600 text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3">
                                <CheckCircle2 size={16} /> {successMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <header className="mb-20 flex justify-between items-end">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl border shadow-lg ${theme === 'dark' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                    <ListTodo size={32} />
                                </div>
                                <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">{t.title}</h1>
                            </div>
                            <div className="flex items-center gap-6 ml-20">
                                <p className="opacity-40 font-black uppercase tracking-[0.4em] text-[10px]">{language === 'ar' ? 'المهام اليومية والتنبيهات' : 'Daily Tasks & Alerts'}</p>
                                <button onClick={requestNotificationPermission} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${notificationsEnabled ? 'text-green-500' : 'text-blue-500'}`}>
                                    {notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />} {notificationsEnabled ? (language === 'ar' ? 'نشط' : "Active") : (language === 'ar' ? 'تفعيل التنبيهات' : "Enable Alerts")}
                                </button>
                            </div>
                        </div>
                        <motion.button whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }} onClick={() => onNavigate('dashboard')} className={`p-5 border rounded-3xl transition-all shadow-xl ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}>
                            <ArrowLeft size={24} className={language === 'ar' ? 'rotate-180' : ''} />
                        </motion.button>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-5 space-y-8">
                            <section className={`p-8 rounded-[3rem] border ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                                <div className="flex items-center gap-3 mb-6 opacity-30">
                                    <CalendarIcon size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t.temporal}</span>
                                </div>
                                <Calendar onChange={setSelectedDate as any} value={selectedDate} className="border-none bg-transparent w-full text-inherit" />
                            </section>
                            <section className={`p-10 rounded-[3rem] border ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                                <div className="flex items-center gap-3 mb-8 opacity-30">
                                    <Plus size={16} className="text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t.append}</span>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">{t.command}</label>
                                        <input value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder={language === 'ar' ? 'ما الذي يجب فعله؟' : "New task..."} className={`w-full p-5 rounded-2xl border outline-none font-bold ${theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-blue-500' : 'bg-slate-50 border-slate-200'}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">{t.execution}</label>
                                        <input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} className={`w-full p-5 rounded-2xl border outline-none font-bold ${theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-blue-500' : 'bg-slate-50 border-slate-200'}`} />
                                    </div>
                                    <button onClick={addTask} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all">{t.commit}</button>
                                </div>
                            </section>
                        </div>
                        <div className="lg:col-span-7 space-y-6">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter px-6">
                                {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h2>
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <div key={task.id} className={`p-8 rounded-[3rem] border flex items-center gap-6 transition-all ${theme === 'dark' ? 'bg-[#0D0D0D] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                                        <button onClick={() => toggleTask(task)} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center ${task.is_completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-400/20 text-transparent'}`}><CheckCircle2 size={20} /></button>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {task.scheduled_time && <span className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">{task.scheduled_time}</span>}
                                            </div>
                                            <p className={`text-lg font-bold ${task.is_completed ? 'line-through opacity-30' : ''}`}>{task.task_text}</p>
                                        </div>
                                        <button onClick={() => deleteTask(task.id)} className="p-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                                {tasks.length === 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className="py-20 text-center space-y-4"
                                    >
                                        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto opacity-20">
                                            <AlertCircle size={32} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">{t.empty}</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <style>{`
                    .react-calendar { font-family: inherit; border: none !important; background: transparent !important; width: 100% !important; }
                    .react-calendar__navigation button { color: inherit; font-size: 16px; font-weight: 900; text-transform: uppercase; background: none; }
                    .react-calendar__tile { padding: 1.5em 0.5em !important; border-radius: 1.5rem !important; font-weight: 700 !important; color: inherit; }
                    .react-calendar__tile--now { background: #3b82f620 !important; color: #3b82f6 !important; }
                    .react-calendar__tile--active { background: #3b82f6 !important; color: white !important; }
                    ${language === 'ar' ? '.react-calendar { direction: ltr; }' : ''}
                `}</style>
            </div>
        </>
    );
}
