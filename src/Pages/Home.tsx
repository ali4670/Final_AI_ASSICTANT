import React from 'react';
import type { Page } from '../App';

import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUs';
import FloatingLetters from '../components/FloatingLetters';
import { StudentAnswering, StudentFlashcards, StudentChatting } from '../components/AnimatedVisual';
import ScrollScene from '../components/3D/ScrollScene';

interface HomeProps {
    onNavigate: (page: string, id?: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    return (
        <div className="relative">
            <ScrollScene />
            <FloatingLetters />

            <Hero onNavigate={onNavigate} />

            <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-12 opacity-30 pointer-events-none grayscale hover:grayscale-0 transition-all duration-1000">
                <StudentAnswering />
                <StudentFlashcards />
                <StudentChatting />
            </div>

            <WhyChooseUs onNavigate={onNavigate} />

        </div>
    );
};

export default Home;
