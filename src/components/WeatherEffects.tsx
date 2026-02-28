import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface WeatherProps {
    type: 'rain' | 'snow' | 'none';
    intensity?: number;
}

const WeatherEffects: React.FC<WeatherProps> = ({ type, intensity = 50 }) => {
    const particles = useMemo(() => {
        return [...Array(intensity)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            duration: type === 'rain' ? 0.5 + Math.random() * 0.5 : 3 + Math.random() * 5,
            delay: Math.random() * 5,
            opacity: Math.random() * 0.5 + 0.2,
            size: type === 'rain' ? Math.random() * 2 + 1 : Math.random() * 5 + 2,
        }));
    }, [type, intensity]);

    if (type === 'none') return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute bg-white"
                    style={{
                        left: `${p.left}%`,
                        width: type === 'rain' ? '1px' : `${p.size}px`,
                        height: type === 'rain' ? `${p.size * 10}px` : `${p.size}px`,
                        opacity: p.opacity,
                        borderRadius: type === 'snow' ? '50%' : '0%',
                        filter: type === 'snow' ? 'blur(1px)' : 'none',
                    }}
                    initial={{ y: -100 }}
                    animate={{ 
                        y: ['0vh', '110vh'],
                        x: type === 'snow' ? [`${p.left}%`, `${p.left + (Math.random() * 10 - 5)}%`] : p.left
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Interaction Layer: Splash/Drops on Timer Area */}
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
        </div>
    );
};

export default WeatherEffects;
