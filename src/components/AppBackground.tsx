import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import Rain from './3D/Rain';

const AppBackground = () => {
    const { theme } = useTheme();
    
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
            {/* Base Background Color */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${
                theme === 'dark' ? 'bg-[#050505]' : 'bg-[#F8FAFC]'
            }`} />

            {/* Ambient Glows */}
            <AnimatePresence>
                <motion.div 
                    key={`${theme}-blue-glow`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-all duration-1000 ${
                        theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-400/5'
                    }`} 
                />
                <motion.div 
                    key={`${theme}-indigo-glow`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-all duration-1000 ${
                        theme === 'dark' ? 'bg-indigo-600/10' : 'bg-indigo-400/5'
                    }`} 
                />
            </AnimatePresence>

            {/* Sparse Rain/Particles for 3D depth */}
            <div className="absolute inset-0 opacity-20">
                <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 0, 5], fov: 75 }}>
                    <ambientLight intensity={0.5} />
                    <Rain count={500} />
                </Canvas>
            </div>

            {/* Decorative Grid */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${
                theme === 'dark' ? 'opacity-[0.03] invert-0' : 'opacity-[0.015] invert'
            }`} style={{ 
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '100px 100px'
            }} />
        </div>
    );
};

export default AppBackground;
