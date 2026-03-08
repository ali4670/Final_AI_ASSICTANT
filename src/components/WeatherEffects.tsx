import React, { useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface WeatherProps {
    type: 'rain' | 'snow' | 'sunset' | 'night' | 'library' | 'coffee' | 'forest' | 'mars' | 'ocean' | 'cyberpunk' | 'nebula' | 'none';
    intensity?: number;
}

const sounds: Record<string, string> = {
    rain: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    snow: 'https://assets.mixkit.co/active_storage/sfx/2387/2387-preview.mp3',
    forest: 'https://assets.mixkit.co/active_storage/sfx/2402/2402-preview.mp3',
    coffee: 'https://assets.mixkit.co/active_storage/sfx/2422/2422-preview.mp3',
    library: 'https://assets.mixkit.co/active_storage/sfx/2421/2421-preview.mp3',
    night: 'https://assets.mixkit.co/active_storage/sfx/2403/2403-preview.mp3',
    mars: 'https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3', // Wind/Dust
    ocean: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7322d861d8.mp3?filename=underwater-ambience-6201.mp3', // Bubbles
    cyberpunk: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_6e4c776097.mp3?filename=cyber-city-1132.mp3', // Synth
    nebula: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c976f92d13.mp3?filename=deep-space-ambience-7243.mp3', // Hum
};

const WeatherEffects: React.FC<WeatherProps> = ({ type, intensity = 50 }) => {
    const { soundVolume } = useTheme();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isAudioBlocked, setIsAudioBlocked] = React.useState(false);

    useEffect(() => {
        if (type !== 'none' && type !== 'sunset' && sounds[type]) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(sounds[type]);
            audioRef.current.loop = true;
            audioRef.current.volume = soundVolume;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    setIsAudioBlocked(true);
                    console.warn("Audio play blocked by browser");
                });
            }
        } else {
            audioRef.current?.pause();
        }
        return () => audioRef.current?.pause();
    }, [type]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = soundVolume;
        }
    }, [soundVolume]);

    const handleUnblock = () => {
        if (audioRef.current) {
            audioRef.current.play().then(() => {
                setIsAudioBlocked(false);
            });
        }
    };

    const particles = useMemo(() => {
        if (type === 'none' || type === 'sunset') return [];
        const count = type === 'library' || type === 'coffee' || type === 'forest' || type === 'ocean' ? 15 : intensity;
        return [...Array(count)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            duration: type === 'rain' ? 0.5 + Math.random() * 0.5 : 3 + Math.random() * 5,
            delay: Math.random() * 5,
            opacity: Math.random() * 0.3 + 0.1,
            size: type === 'rain' ? Math.random() * 2 + 1 : Math.random() * 5 + 2,
        }));
    }, [type, intensity]);

    if (type === 'none') return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <AnimatePresence>
                {type === 'sunset' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-orange-500/20 via-rose-500/10 to-transparent"
                    />
                )}
                {type === 'night' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 to-black/60"
                    />
                )}
                {type === 'forest' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent"
                    />
                )}
                {type === 'mars' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent"
                    />
                )}
                {type === 'ocean' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-blue-900/20 backdrop-blur-[2px]"
                    />
                )}
                {type === 'cyberpunk' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-blue-900/10 to-transparent"
                    />
                )}
                {type === 'nebula' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-1 w-full h-full opacity-30 mix-blend-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
                    />
                )}
            </AnimatePresence>

            {particles.map((p) => (
                <motion.div
                    key={`${type}-${p.id}`}
                    className={`absolute ${
                        type === 'forest' ? 'bg-emerald-400' : 
                        type === 'mars' ? 'bg-orange-700' : 
                        type === 'ocean' ? 'bg-blue-200' :
                        type === 'cyberpunk' ? 'bg-pink-500' :
                        'bg-white'
                    }`}
                    style={{
                        left: `${p.left}%`,
                        width: type === 'rain' ? '1px' : `${p.size}px`,
                        height: type === 'rain' ? `${p.size * 10}px` : `${p.size}px`,
                        opacity: p.opacity,
                        borderRadius: (type === 'snow' || type === 'forest' || type === 'ocean' || type === 'nebula') ? '50%' : '0%',
                        filter: (type === 'snow' || type === 'forest' || type === 'ocean' || type === 'nebula') ? 'blur(1px)' : 'none',
                    }}
                    initial={{ y: -100 }}
                    animate={{ 
                        y: type === 'ocean' ? ['110vh', '-10vh'] : ['0vh', '110vh'],
                        x: (type === 'snow' || type === 'forest' || type === 'mars' || type === 'ocean') ? [`${p.left}%`, `${p.left + (Math.random() * 20 - 10)}%`] : `${p.left}%`
                    }}
                    transition={{
                        duration: type === 'ocean' ? p.duration * 2 : p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                />
            ))}

            {type === 'rain' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={`splash-${i}`}
                            className="absolute bg-white/40 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                width: '4px',
                                height: '4px',
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                                scale: [0, 2, 0],
                                opacity: [0, 0.5, 0],
                                y: [0, -10, 0]
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                delay: Math.random() * 5,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Audio Unblocking Hint */}
            <AnimatePresence>
                {isAudioBlocked && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={handleUnblock}
                        className="fixed bottom-12 right-12 z-[100] px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-blue-600/40 flex items-center gap-3 pointer-events-auto hover:bg-blue-500 transition-all"
                    >
                        <div className="relative w-2 h-2">
                            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-40" />
                            <div className="absolute inset-0 bg-white rounded-full" />
                        </div>
                        Enable {type} Audio
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}


export default WeatherEffects;
