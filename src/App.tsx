import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { TimerProvider } from './contexts/TimerContext';
import { ArrowUp } from 'lucide-react';

// Pages
import Home from './Pages/Home';
import About from './Pages/About';
import StudyTimeline from './Pages/StudyTimeline';
import StudyPath from './Pages/StudyPath';
import Pomodoro from './Pages/Pomodoro';
import Calendar from './Pages/Calendar';
import Support from './Pages/Support';
import Resume from './Pages/Resume';
import Leaderboard from './Pages/Leaderboard';
import Admin from './Pages/Admin';
import Presentation from './Pages/Presentation';
import KnowledgeGraph from './Pages/KnowledgeGraph';
import MasteryMap from './Pages/MasteryMap';
import Trees from './Pages/Trees';
import Vision from './Pages/Vision';
import SocialHub from './Pages/Social';
import Messenger from './Pages/Messenger';
import Profile from './Pages/Profile';
import AIPlanner from './Pages/AIPlanner';
import SummaryHub from './Pages/SummaryHub';
import WriteSummary from './Pages/WriteSummary';
import Reader from './Pages/Reader';
import Themes from './Pages/Themes';
import Marketplace from './Pages/Marketplace';
import SkillTree from './Pages/SkillTree';

// Components
import Dashboard from './components/Dashboard';
import Documents from './components/Documents';
import Chat from './components/Chat';
import Flashcards from './components/Flashcards';
import Quizzes from './components/Quizzes';
import PublicDocs from './components/PublicDocs';
import Navbar from './components/Nave';
import PomodoroTimer from './components/PomodoroTimer';
import AppBackground from './components/AppBackground';
import WeatherEffects from './components/WeatherEffects';
import NeuralSummary from './components/NeuralSummary';
import GuestRestrictionModal from './components/GuestRestrictionModal';
import Login from './components/Login';
import Signup from './components/Signup';
import ErrorBoundary from './components/ErrorBoundary';

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
    | 'neuralSummary'
    | 'leaderboard'
    | 'admin'
    | 'vision'
    | 'public-docs'
    | 'social'
    | 'messenger'
    | 'profile'
    | 'ai-planner'
    | 'themes'
    | 'marketplace'
    | 'skill-tree'
    | 'summaryHub'
    | 'writeSummary'
    | 'reader'
    | 'resume'
    | 'presentation'
    | 'knowledgeGraph'
    | 'masteryMap'
    | 'trees'
    | 'login'
    | 'signup'
    ;

function ScrollToTop() {
    const [visible, setVisible] = useState(false);
    // Remove useTheme for now to check if it's the cause of the crash
    // const { theme } = useTheme();

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
            className="fixed bottom-24 right-6 z-[1000] p-4 backdrop-blur-xl border rounded-2xl shadow-2xl transition-all bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
        >
            <ArrowUp size={20} />
        </motion.button>
    );
}

function AppContent() {
    const auth = useAuth();
    const user = auth?.user;
    const loading = auth?.loading;
    const isGuest = auth?.isGuest;
    
    const themeCtx = useTheme();
    const theme = themeCtx?.theme || 'dark';
    const experienceTheme = themeCtx?.experienceTheme || 'none';

    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>();
    const [selectedFriendId, setSelectedFriendId] = useState<string | undefined>();
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [showGuestModal, setShowGuestModal] = useState(false);

    const handleNavigate = (page: string, id?: string) => {
        const restrictedPages = ['documents', 'flashcards', 'quizzes', 'neuralSummary', 'leaderboard', 'admin', 'public-docs', 'dashboard', 'social', 'messenger'];
        if (isGuest && restrictedPages.includes(page)) {
            setShowGuestModal(true);
            return;
        }

        if (!user && restrictedPages.includes(page)) {
            setCurrentPage('login');
            return;
        }

        if (page === 'messenger') {
            setSelectedFriendId(id);
        } else {
            setSelectedDocumentId(id);
        }

        setCurrentPage(page as Page);
        window.scrollTo(0, 0);
    };

    useEffect(() => {
        setIsNavVisible(!['login', 'signup', 'pomodoro'].includes(currentPage));
    }, [currentPage]);

    // Ensure user is redirected to home/login on sign out
    useEffect(() => {
        if (!user && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'home') {
            setCurrentPage('home');
        }
    }, [user, currentPage]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-white uppercase tracking-[0.8em] animate-pulse">Initializing Neural Core</p>
            </div>
        );
    }

    return (
        <div className={`transition-colors duration-700 min-h-screen relative ${theme === 'dark' ? 'dark' : ''}`}>
            <AppBackground theme={experienceTheme} />
            <WeatherEffects type={experienceTheme} />
            
            {user && isNavVisible && <Navbar onNavigate={handleNavigate} currentPage={currentPage} />}

            <main className={`relative z-10 ${user && isNavVisible ? 'pt-32 md:pt-36' : ''}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {!user ? (
                            (() => {
                                switch (currentPage) {
                                    case 'login': return <Login onToggleMode={() => setCurrentPage('signup')} />;
                                    case 'signup': return <Signup onToggleMode={() => setCurrentPage('login')} />;
                                    case 'home':
                                    default: return <Home onNavigate={handleNavigate} />;
                                }
                            })()
                        ) : (
                            (() => {
                                switch (currentPage) {
                                    case 'dashboard': return (
                                        <ErrorBoundary>
                                            <Dashboard onNavigate={handleNavigate} />
                                        </ErrorBoundary>
                                    );
                                    case 'documents': return <Documents onNavigate={handleNavigate} />;
                                    case 'chat': return <Chat onNavigate={handleNavigate} documentId={selectedDocumentId} />;
                                    case 'flashcards': return <Flashcards onNavigate={handleNavigate} documentId={selectedDocumentId} />;
                                    case 'quizzes': return <Quizzes onNavigate={handleNavigate} documentId={selectedDocumentId} />;
                                    case 'public-docs': return <PublicDocs onNavigate={handleNavigate} />;
                                    case 'social': return <SocialHub onNavigate={handleNavigate} />;
                                    case 'messenger': return <Messenger onNavigate={handleNavigate} friendId={selectedFriendId!} />;
                                    case 'profile': return <Profile onNavigate={handleNavigate} />;
                                    case 'ai-planner': return <AIPlanner onNavigate={handleNavigate} />;
                                    case 'themes': return <Themes onNavigate={handleNavigate} />;
                                    case 'marketplace': return <Marketplace onNavigate={handleNavigate} />;
                                    case 'skill-tree': return <SkillTree onNavigate={handleNavigate} />;
                                    case 'summaryHub': return <SummaryHub onNavigate={handleNavigate} />;
                                    case 'writeSummary': return <WriteSummary onNavigate={handleNavigate} documentId={selectedDocumentId} />;
                                    case 'reader': return <Reader onNavigate={handleNavigate} documentId={selectedDocumentId} />;
                                    case 'resume': return <Resume onNavigate={handleNavigate} />;
                                    case 'neuralSummary': return <NeuralSummary onNavigate={handleNavigate} documentId={selectedDocumentId} />;
                                    case 'leaderboard': return <Leaderboard onNavigate={handleNavigate} />;
                                    case 'studyTimeline': return <StudyTimeline onNavigate={handleNavigate} />;
                                    case 'studyPath': return <StudyPath onNavigate={handleNavigate} />;
                                    case 'pomodoro': return <Pomodoro onNavigate={handleNavigate} />;
                                    case 'calendar': return <Calendar onNavigate={handleNavigate} />;
                                    case 'support': return <Support onNavigate={handleNavigate} />;
                                    case 'admin': return <Admin onNavigate={handleNavigate} />;
                                    case 'vision': return <Vision onNavigate={handleNavigate} />;
                                    case 'knowledgeGraph': return <KnowledgeGraph onNavigate={handleNavigate} />;
                                    case 'masteryMap': return <MasteryMap onNavigate={handleNavigate} />;
                                    case 'trees': return <Trees onNavigate={handleNavigate} />;
                                    case 'presentation': return <Presentation onNavigate={handleNavigate} />;
                                    default: return (
                                        <ErrorBoundary>
                                            <Dashboard onNavigate={handleNavigate} />
                                        </ErrorBoundary>
                                    );
                                }
                            })()
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {showGuestModal && <GuestRestrictionModal onClose={() => setShowGuestModal(false)} />}

            <div className="relative z-[1000]">
                <PomodoroTimer onNavigate={handleNavigate} />
                <ScrollToTop />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <TimerProvider>
                    <AppContent />
                </TimerProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
