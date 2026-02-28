import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

type TimerMode = 'work' | 'short' | 'long';

interface TimerContextType {
    timeLeft: number;
    isActive: boolean;
    mode: TimerMode;
    cycle: number;
    streak: number;
    settings: { work: number; short: number; long: number };
    currentTask: string;
    bellSound: string;
    toggleTimer: () => void;
    resetTimer: () => void;
    setMode: (mode: TimerMode) => void;
    setSettings: (settings: { work: number; short: number; long: number }) => void;
    setCurrentTask: (task: string) => void;
    setBellSound: (sound: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({ work: 25, short: 5, long: 15 });
    const [timeLeft, setTimeLeft] = useState(settings.work * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<TimerMode>('work');
    const [cycle, setCycle] = useState(1);
    const [streak, setStreak] = useState(0);
    const [currentTask, setCurrentTask] = useState('General Focus');
    const [bellSound, setBellSound] = useState('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

    // Request notification permission
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const awardStar = async () => {
        if (!user) return;
        try {
            await fetch('/api/award-star', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
        } catch (e) { console.error("Failed to award star", e); }
    };

    const sendNotification = (title: string, body: string) => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
                body,
                icon: "/favicon.ico"
            });
        }
    };

    const switchMode = useCallback((newMode: TimerMode) => {
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
            
            // Play chosen bell sound
            new Audio(bellSound).play().catch(() => {});

            if (mode === 'work') {
                const nextMode = (cycle % 4 === 0) ? 'long' : 'short';
                sendNotification("Focus Session Complete!", `Time for a ${nextMode === 'long' ? 'Long Break' : 'Short Break'}.`);
                awardStar(); // AWARD THE STAR HERE
                setStreak(prev => prev + 1);
                switchMode(nextMode);
            } else {
                sendNotification("Break Over!", "Ready to dive back into focus?");
                setCycle(prev => prev + 1);
                switchMode('work');
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, cycle, switchMode, bellSound, user]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(settings[mode] * 60);
    };

    return (
        <TimerContext.Provider value={{
            timeLeft, isActive, mode, cycle, streak, settings, currentTask, bellSound,
            toggleTimer, resetTimer, setMode: switchMode, setSettings, setCurrentTask, setBellSound
        }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) throw new Error('useTimer must be used within TimerProvider');
    return context;
};
