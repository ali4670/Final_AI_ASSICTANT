import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { TimerProvider } from './contexts/TimerContext';
import { SpotifyProvider } from './contexts/SpotifyContext';

import Login from './components/Login';
import Signup from './components/Signup';

import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import Documents from './components/Documents';
import Chat from './components/Chat';
import Flashcards from './components/Flashcards';
import Quizzes from './components/Quizzes';
import About from "./Pages/About";
import StudyTimeline from './Pages/StudyTimeline';
import StudyPath from './Pages/StudyPath';
import Pomodoro from './Pages/Pomodoro';
import Calendar from './Pages/Calendar';
import Support from './Pages/Support';
import Settings from './Pages/Settings';
import Navbar from './components/Nave';
import MusicPlayer from './components/MusicPlayer';
import PomodoroTimer from './components/PomodoroTimer';
import AppBackground from './components/AppBackground';
import { ArrowUp } from 'lucide-react';

export type Page =
    | 'home'
    | 'dashboard'
    | 'documents'
    | 'chat'
    | 'flashcards'
    | 'quizzes'
    | 'about'
    | 'studyTimeline'
    | 'studyPath'
    | 'pomodoro'
    | 'calendar'
    | 'support'
    | 'settings'
    | 'neuralSummary'
    | 'journal'
    | 'leaderboard'
    | 'admin'
    ;

function ScrollToTop() {
    const [visible, setVisible] = useState(false);
    const { theme } = useTheme();
    
    useEffect(() => {
        const toggleVisible = () => {
            if (window.scrollY > 300) setVisible(true);
            else setVisible(false);
        };
        window.addEventListener('scroll', toggleVisible);
        return () => window.removeEventListener('scroll', toggleVisible);
    }, []);

    if (!visible) return null;

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed bottom-24 right-6 z-[1000] p-4 backdrop-blur-xl border rounded-2xl shadow-2xl transition-all ${
                theme === 'dark' 
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
            }`}
        >
            <ArrowUp size={20} />
        </motion.button>
    );
}

function AppContent() {
    const { user, loading, isGuest } = useAuth();
    const { theme } = useTheme();
    const [isLogin, setIsLogin] = useState(true);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>();
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [showGuestModal, setShowGuestModal] = useState(false);

    const handleNavigate = (page: string, documentId?: string) => {
        // Guest restrictions
        const restrictedPages = ['documents', 'flashcards', 'quizzes', 'neuralSummary', 'journal', 'leaderboard', 'settings', 'admin'];
        if (isGuest && restrictedPages.includes(page)) {
            setShowGuestModal(true);
            return;
        }

        setCurrentPage(page as Page);
        if (documentId) {
            setSelectedDocumentId(documentId);
        }
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-700 ${
                theme === 'dark' ? 'bg-[#050505]' : 'bg-blue-50'
            }`}>
                <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${
                    theme === 'dark' ? 'border-blue-500' : 'border-blue-600'
                }`}></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={`transition-colors duration-700 ${theme === 'dark' ? 'dark bg-[#050505]' : 'bg-white'}`}>
                {isLogin ? (
                    <Login onToggleMode={() => setIsLogin(false)} />
                ) : (
                    <Signup onToggleMode={() => setIsLogin(true)} />
                )}
            </div>
        );
    }

    return (
        <div className={`transition-colors duration-700 min-h-screen relative ${theme === 'dark' ? 'dark' : ''}`}>
            <AppBackground />
            <Navbar onNavigate={handleNavigate} onVisibilityChange={setIsNavVisible} />
            <GuestRestrictionModal 
                isOpen={showGuestModal} 
                onClose={() => setShowGuestModal(false)} 
                onNavigate={handleNavigate} 
            />
            <div className="relative z-[1000]">
                <MusicPlayer onNavigate={handleNavigate} />
                <PomodoroTimer onNavigate={handleNavigate} />
                <ScrollToTop />
            </div>
            <motion.div
                animate={{ paddingTop: isNavVisible ? '80px' : '0px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative z-10"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {(() => {
                            switch (currentPage) {
                                case 'home':
                                    return <Hero onNavigate={handleNavigate} />;

                                case 'dashboard':
                                    return <Dashboard onNavigate={handleNavigate} />;

                                case 'studyTimeline':
                                    return <StudyTimeline onNavigate={handleNavigate} />;

                                case 'about':
                                    return <About onNavigate={handleNavigate}/>;

                                case 'documents':
                                    return <Documents onNavigate={handleNavigate} />;

                                case 'chat':
                                    return <Chat onNavigate={handleNavigate} documentId={selectedDocumentId} />;

                                case 'flashcards':
                                    return <Flashcards onNavigate={handleNavigate} documentId={selectedDocumentId} />;

                                case 'quizzes':
                                    return <Quizzes onNavigate={handleNavigate} documentId={selectedDocumentId} />;

                                case 'studyPath':
                                    return <StudyPath onNavigate={handleNavigate} />;

                                case 'pomodoro':
                                    return <Pomodoro onNavigate={handleNavigate} />;

                                case 'calendar':
                                    return <Calendar onNavigate={handleNavigate} />;
                                
                                case 'support':
                                    return <Support onNavigate={handleNavigate} />;

                                case 'settings':
                                    return <Settings onNavigate={handleNavigate} />;

                                case 'journal':
                                    return <Journal onNavigate={handleNavigate} />;

                                case 'leaderboard':
                                    return <Leaderboard onNavigate={handleNavigate} />;

                                case 'admin':
                                    return <Admin onNavigate={handleNavigate} />;

                                case 'neuralSummary':
                                    return <NeuralSummary onNavigate={handleNavigate} documentId={selectedDocumentId} />;

                                default:
                                    return <Dashboard onNavigate={handleNavigate} />;
                            }
                        })()}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <TimerProvider>
                    <SpotifyProvider>
                        <AppContent />
                    </SpotifyProvider>
                </TimerProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

import NeuralSummary from './components/NeuralSummary';
import Journal from './Pages/Journal';
import Leaderboard from './Pages/Leaderboard';
import Admin from './Pages/Admin';
import GuestRestrictionModal from './components/GuestRestrictionModal';
export default App;
