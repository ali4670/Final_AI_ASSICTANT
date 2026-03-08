import { motion } from 'framer-motion';
import { ExperienceTheme } from '../contexts/ThemeContext';

const AppBackground = ({ theme: exp }: { theme: ExperienceTheme }) => {

    const getColors = () => {
        switch (exp) {
            case 'rain': return { primary: 'rgba(59, 130, 246, 0.2)', secondary: 'rgba(30, 58, 138, 0.1)' };
            case 'snow': return { primary: 'rgba(199, 210, 254, 0.2)', secondary: 'rgba(129, 140, 248, 0.1)' };
            case 'sunset': return { primary: 'rgba(249, 115, 22, 0.2)', secondary: 'rgba(225, 29, 72, 0.1)' };
            case 'night': return { primary: 'rgba(88, 28, 135, 0.2)', secondary: 'rgba(30, 58, 138, 0.2)' };
            case 'coffee': return { primary: 'rgba(120, 53, 15, 0.2)', secondary: 'rgba(67, 20, 7, 0.1)' };
            case 'library': return { primary: 'rgba(6, 78, 59, 0.2)', secondary: 'rgba(2, 44, 34, 0.1)' };
            case 'forest': return { primary: 'rgba(16, 185, 129, 0.2)', secondary: 'rgba(6, 78, 59, 0.1)' };
            case 'mars': return { primary: 'rgba(239, 68, 68, 0.2)', secondary: 'rgba(127, 29, 29, 0.1)' };
            case 'ocean': return { primary: 'rgba(14, 165, 233, 0.2)', secondary: 'rgba(12, 74, 110, 0.1)' };
            case 'cyberpunk': return { primary: 'rgba(217, 70, 239, 0.2)', secondary: 'rgba(79, 70, 229, 0.1)' };
            case 'nebula': return { primary: 'rgba(139, 92, 246, 0.2)', secondary: 'rgba(30, 58, 138, 0.2)' };
            default: return { primary: 'rgba(37, 99, 235, 0.2)', secondary: 'rgba(79, 70, 229, 0.1)' };
        }
    };

    const colors = getColors();
    
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#020202]">
            {/* Top Right Mesh Glow */}
            <motion.div 
                key={`${exp}-1`}
                initial={{ opacity: 0 }}
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 50, 0],
                    y: [0, -50, 0],
                    backgroundColor: colors.primary
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[150px]"
            />

            {/* Bottom Left Mesh Glow */}
            <motion.div 
                key={`${exp}-2`}
                initial={{ opacity: 0 }}
                animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, -100, 0],
                    y: [0, 100, 0],
                    backgroundColor: colors.secondary
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-30%] left-[-20%] w-[100%] h-[100%] rounded-full blur-[180px]"
            />

            {/* Central Soft Pulse */}
            <motion.div 
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent"
            />

            {/* Neural Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ 
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '100px 100px'
            }} />

            {/* Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
        </div>
    );
};

export default AppBackground;
