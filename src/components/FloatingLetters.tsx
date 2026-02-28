import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFloatingLetters } from '../hooks/useFloatingLetters';
import { useTheme } from '../contexts/ThemeContext';

const FloatingLetters: React.FC = () => {
  const { language, theme } = useTheme();
  const letters = useFloatingLetters(30, language);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      <AnimatePresence mode="wait">
        {letters.map((letter) => (
          <motion.div
            key={`${language}-${letter.id}`}
            className={`absolute text-5xl md:text-7xl font-black select-none pointer-events-none transition-colors duration-1000 ${
              theme === 'dark' ? 'text-blue-500/10' : 'text-blue-900/10'
            }`}
            style={{
              left: `${letter.x}%`,
              top: `${letter.y}%`,
              transform: `rotate(${letter.rotation}deg) scale(${letter.scale})`,
              opacity: letter.opacity,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: letter.opacity,
              scale: letter.scale,
              y: [0, -40, 0],
              rotate: [letter.rotation, letter.rotation + 45, letter.rotation],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {letter.letter}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Background vignette */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-[#050505] via-transparent to-[#050505] opacity-100' 
          : 'bg-gradient-to-b from-blue-50/50 via-transparent to-blue-50/50 opacity-0'
      }`} />
    </div>
  );
};

export default FloatingLetters;
