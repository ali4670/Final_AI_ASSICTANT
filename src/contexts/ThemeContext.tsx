import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'ar';

export type ExperienceTheme = 'none' | 'rain' | 'snow' | 'sunset' | 'night' | 'library' | 'coffee' | 'forest' | 'mars' | 'ocean' | 'cyberpunk' | 'nebula';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  experienceTheme: ExperienceTheme;
  soundVolume: number;
  useVoice: boolean;
  useSign: boolean;
  isSmartTheme: boolean;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  setExperienceTheme: (theme: ExperienceTheme) => void;
  setSoundVolume: (volume: number) => void;
  setUseVoice: (value: boolean) => void;
  setUseSign: (value: boolean) => void;
  setIsSmartTheme: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const [experienceTheme, setExperienceTheme] = useState<ExperienceTheme>(() => {
    const saved = localStorage.getItem('experience_theme');
    return (saved as ExperienceTheme) || 'none';
  });

  const [soundVolume, setSoundVolume] = useState(() => {
    const saved = localStorage.getItem('sound_volume');
    return saved ? parseFloat(saved) : 0.5;
  });

  const [useVoice, setUseVoice] = useState(() => {
    const saved = localStorage.getItem('use_voice');
    return saved === 'true';
  });
  
  const [useSign, setUseSign] = useState(() => {
    const saved = localStorage.getItem('use_sign');
    return saved === 'true';
  });

  const [isSmartTheme, setIsSmartTheme] = useState(() => {
    const saved = localStorage.getItem('smart_theme');
    return saved === 'true';
  });

  useEffect(() => {
    if (!isSmartTheme) return;

    const updateSmartTheme = () => {
      const hour = new Date().getHours();
      if (hour >= 20 || hour < 6) {
        setExperienceTheme('night');
        setTheme('dark');
      } else if (hour >= 17) {
        setExperienceTheme('sunset');
      } else if (hour >= 8 && hour < 12) {
        setExperienceTheme('forest');
      } else {
        setExperienceTheme('none');
      }
    };

    updateSmartTheme();
    const interval = setInterval(updateSmartTheme, 1000 * 60 * 15); // Check every 15 mins
    return () => clearInterval(interval);
  }, [isSmartTheme]);

  useEffect(() => {
    localStorage.setItem('smart_theme', isSmartTheme.toString());
  }, [isSmartTheme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('experience_theme', experienceTheme);
  }, [experienceTheme]);

  useEffect(() => {
    localStorage.setItem('sound_volume', soundVolume.toString());
  }, [soundVolume]);

  useEffect(() => {
    localStorage.setItem('use_voice', useVoice.toString());
  }, [useVoice]);

  useEffect(() => {
    localStorage.setItem('use_sign', useSign.toString());
  }, [useSign]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'ar' : 'en');

  return (
    <ThemeContext.Provider value={{ 
        theme, language, experienceTheme, soundVolume, useVoice, useSign, isSmartTheme,
        toggleTheme, toggleLanguage, setExperienceTheme, setSoundVolume, setUseVoice, setUseSign, setIsSmartTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
