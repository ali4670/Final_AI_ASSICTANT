import React from 'react';
import { motion } from 'framer-motion';

// Animation for Quizzes: Student writing/answering
export const StudentAnswering = () => (
    <div className="w-full h-64 flex items-center justify-center relative overflow-hidden">
        <svg width="280" height="200" viewBox="0 0 280 200" fill="none">
            {/* Table */}
            <rect x="20" y="160" width="240" height="10" rx="5" className="fill-blue-500/20" />
            
            {/* Student Silhouette */}
            <motion.path
                d="M100,160 Q100,100 140,100 Q180,100 180,160"
                className="stroke-blue-600/40" strokeWidth="12" strokeLinecap="round"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Head */}
            <motion.circle
                cx="140" cy="70" r="25"
                className="fill-blue-600/20 stroke-blue-600/40" strokeWidth="4"
                animate={{ y: [0, -3, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Arm & Hand writing */}
            <motion.path
                d="M170,130 L210,150"
                className="stroke-blue-600" strokeWidth="8" strokeLinecap="round"
                animate={{ 
                    rotate: [0, 5, 0],
                    x: [0, 5, 0],
                    y: [0, 2, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
            />
            
            {/* Paper with writing appearing */}
            <rect x="180" y="145" width="60" height="40" rx="4" className="stroke-blue-500/30 fill-white/5" strokeWidth="2" />
            {[0, 1, 2].map(i => (
                <motion.line
                    key={i}
                    x1="190" y1={155 + i * 8} x2="230" y2={155 + i * 8}
                    className="stroke-blue-500" strokeWidth="2" strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: i * 0.5, repeat: Infinity }}
                />
            ))}
            
            {/* Floating thought bubbles */}
            <motion.circle cx="100" cy="50" r="5" className="fill-blue-400" animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.circle cx="80" cy="35" r="8" className="fill-blue-500" animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} />
        </svg>
    </div>
);

// Animation for Flashcards: Student looking/flipping cards
export const StudentFlashcards = () => (
    <div className="w-full h-64 flex items-center justify-center relative">
        <svg width="280" height="200" viewBox="0 0 280 200">
            {/* Student Silhouette */}
            <motion.path
                d="M80,180 Q80,120 120,120 Q160,120 160,180"
                className="stroke-indigo-600/40" strokeWidth="12" strokeLinecap="round"
            />
            <circle cx="120" cy="90" r="22" className="fill-indigo-600/20 stroke-indigo-600/40" strokeWidth="4" />
            
            {/* Hands holding cards */}
            <motion.path
                d="M150,140 L180,130"
                className="stroke-indigo-600" strokeWidth="6" strokeLinecap="round"
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Floating/Flipping Cards */}
            {[0, 1, 2].map(i => (
                <motion.rect
                    key={i}
                    x="180" y="80" width="50" height="70" rx="8"
                    className="stroke-indigo-500 fill-indigo-500/10" strokeWidth="2"
                    initial={{ rotateY: 0, x: i * 10 }}
                    animate={{ 
                        rotateY: [0, 180, 360],
                        y: [0, -20, 0],
                        x: [i * 10, i * 10 + 20, i * 10]
                    }}
                    transition={{ 
                        duration: 3, 
                        delay: i * 0.8, 
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
            
            {/* Sparkles of "learning" */}
            <motion.path
                d="M130,40 L135,30 L140,40 L150,45 L140,50 L135,60 L130,50 L120,45 Z"
                className="fill-yellow-400"
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            />
        </svg>
    </div>
);

// Animation for Chat: Student typing/talking to AI
export const StudentChatting = () => (
    <div className="w-full h-64 flex items-center justify-center">
        <svg width="300" height="200" viewBox="0 0 300 200">
            {/* Student at laptop */}
            <rect x="160" y="140" width="80" height="5" rx="2" className="fill-gray-500" />
            <motion.path d="M160,140 L240,140 L220,90 L180,90 Z" className="fill-blue-500/10 stroke-blue-500/30" strokeWidth="2" />
            
            <motion.path
                d="M60,180 Q60,130 100,130 Q140,130 140,180"
                className="stroke-blue-600/40" strokeWidth="10" strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="20" className="fill-blue-600/20 stroke-blue-600/40" strokeWidth="4" />
            
            {/* Chat Bubbles */}
            <motion.path
                d="M150,60 Q150,30 190,30 L240,30 Q270,30 270,60 L270,70 Q270,90 240,90 L200,90 L180,110 L180,90 Q150,90 150,60"
                className="stroke-blue-500 fill-blue-500/5" strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
            />
            
            <motion.circle cx="190" cy="60" r="3" className="fill-blue-500" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} />
            <motion.circle cx="210" cy="60" r="3" className="fill-blue-500" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
            <motion.circle cx="230" cy="60" r="3" className="fill-blue-500" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
        </svg>
    </div>
);

// Animation for Library: Organizing books/data
export const StudentLibrarian = () => (
    <div className="w-full h-64 flex items-center justify-center">
        <svg width="280" height="200" viewBox="0 0 280 200">
            {/* Shelves */}
            <line x1="40" y1="160" x2="240" y2="160" className="stroke-gray-700" strokeWidth="4" />
            <line x1="40" y1="100" x2="240" y2="100" className="stroke-gray-700" strokeWidth="4" />
            
            {/* Books */}
            {[...Array(8)].map((_, i) => (
                <motion.rect
                    key={i}
                    x={50 + i * 25} y="110" width="20" height="50" rx="2"
                    className={`${i % 3 === 0 ? 'fill-blue-500' : i % 3 === 1 ? 'fill-indigo-500' : 'fill-purple-500'} opacity-40`}
                    whileHover={{ y: -10, opacity: 1 }}
                />
            ))}
            
            {/* Robotic Arm (AI Organizing) */}
            <motion.path
                d="M140,20 L140,60 L180,80"
                className="stroke-blue-600" strokeWidth="4" fill="none"
                animate={{ 
                    x: [0, 40, -40, 0],
                    y: [0, 10, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
                cx="180" cy="80" r="5"
                className="fill-blue-600"
                animate={{ x: [0, 40, -40, 0], y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
        </svg>
    </div>
);
