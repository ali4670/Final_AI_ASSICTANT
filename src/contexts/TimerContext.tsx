import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { useTheme } from './ThemeContext';

export type ConstructionType = 'tree' | 'house' | 'barn' | 'windmill' | 'sheep' | 'robot' | 'fountain' | 'monolith' | 'bush' | 'fence';

interface TimerContextType {
    timeLeft: number;
    isActive: boolean;
    mode: 'work' | 'short' | 'long';
    cycle: number;
    streak: number;
    settings: { work: number; short: number; long: number };
    currentTask: string;
    currentSubject: string;
    currentLesson: string;
    bellSound: string;
    growthPoints: number;
    constructionTarget: ConstructionType;
    setConstructionTarget: (target: ConstructionType) => void;
    toggleTimer: () => void;
    resetTimer: () => void;
    setMode: (mode: 'work' | 'short' | 'long') => void;
    setSettings: (settings: { work: number; short: number; long: number }) => void;
    setCurrentTask: (task: string) => void;
    setCurrentSubject: (subject: string) => void;
    setCurrentLesson: (lesson: string) => void;
    setBellSound: (sound: string) => void;
    incrementGrowth: (points: number) => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { soundVolume } = useTheme();
    const [settings, setSettings] = useState({ work: 25, short: 5, long: 15 });
    const [timeLeft, setTimeLeft] = useState(settings.work * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
    const [cycle, setCycle] = useState(1);
    const [streak, setStreak] = useState(0);
    const [currentTask, setCurrentTask] = useState('General Focus');
    const [currentSubject, setCurrentSubject] = useState('Uncategorized');
    const [currentLesson, setCurrentLesson] = useState('General');
    const [bellSound, setBellSound] = useState('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    const [growthPoints, setGrowthPoints] = useState(0);
    const [constructionTarget, setConstructionTarget] = useState<ConstructionType>('tree');

    useEffect(() => {
        if (user) fetchGrowthPoints();
    }, [user]);

    const fetchGrowthPoints = async () => {
        if (!user) return;
        const { data } = await supabase.from('profiles').select('focus_growth_points').eq('id', user.id).single();
        if (data) setGrowthPoints(data.focus_growth_points || 0);
    };

    const incrementGrowth = async (points: number) => {
        if (!user) return;
        const newTotal = growthPoints + points;
        setGrowthPoints(newTotal);
        try {
            await supabase.from('profiles').update({ focus_growth_points: newTotal }).eq('id', user.id);
        } catch (e) { console.error(e); }
    };

    const logSession = async () => {
        if (!user) return;
        try {
            // 1. Log session to database
            await supabase.from('study_sessions').insert({
                user_id: user.id,
                subject: currentSubject,
                lesson: currentLesson,
                duration_minutes: settings.work
            });

            // 2. Add XP (e.g., 20 XP per session)
            await supabase.rpc('add_xp', { user_id: user.id, xp_to_add: 20 });

            // 3. Update Streak
            await supabase.rpc('update_streak', { user_id: user.id });
        } catch (e) {
            console.error("Failed to log session:", e);
        }
    };

    const awardStar = async () => {
        if (!user) return;
        try {
            await incrementGrowth(10);
            
            // --- ORGANIZED GRID PLACEMENT ---
            const snap = 5;
            const x = Math.round(((Math.random() - 0.5) * 80) / snap) * snap;
            const z = Math.round(((Math.random() - 0.5) * 80) / snap) * snap;

            const newItem = {
                user_id: user.id,
                item_type: constructionTarget,
                position: { x, y: 0, z },
                scale: 1,
                rotation: Math.random() * Math.PI * 2
            };
            
            await supabase.from('garden_items').insert(newItem);
            
            // Log the completed work session
            await logSession();
        } catch (e) { console.error(e); }
    };

    const switchMode = useCallback((newMode: 'work' | 'short' | 'long') => {
        setMode(newMode);
        setTimeLeft(settings[newMode] * 60);
        setIsActive(false);
    }, [settings]);

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            const bell = new Audio(bellSound);
            bell.volume = soundVolume;
            bell.play().catch(() => {});
            if (mode === 'work') {
                awardStar();
                setStreak(prev => prev + 1);
                switchMode((cycle % 4 === 0) ? 'long' : 'short');
            } else {
                setCycle(prev => prev + 1);
                switchMode('work');
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, cycle, switchMode, bellSound, soundVolume]);

    return (
        <TimerContext.Provider value={{
            timeLeft, isActive, mode, cycle, streak, settings, currentTask, currentSubject, currentLesson, bellSound, growthPoints,
            constructionTarget, setConstructionTarget,
            toggleTimer: () => setIsActive(!isActive), resetTimer: () => { setIsActive(false); setTimeLeft(settings[mode] * 60); },
            setMode: switchMode, setSettings, setCurrentTask, setCurrentSubject, setCurrentLesson, setBellSound, incrementGrowth
        }}>
            {children}
        </TimerContext.Provider>
    );
};


export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) throw new Error('useTimer error');
    return context;
};
