import { useState, useEffect } from 'react';

export interface FloatingLetter {
  id: number;
  letter: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
}

const arabicLetters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];
const englishLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export const useFloatingLetters = (count: number = 25, language: 'en' | 'ar' = 'en') => {
  const [letters, setLetters] = useState<FloatingLetter[]>([]);

  useEffect(() => {
    const lettersPool = language === 'ar' ? arabicLetters : englishLetters;
    
    const generateLetters = (): FloatingLetter[] => {
      return Array.from({ length: count }, (_, index) => ({
        id: index,
        letter: lettersPool[Math.floor(Math.random() * lettersPool.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.4,
        opacity: 0.1 + Math.random() * 0.2,
      }));
    };

    setLetters(generateLetters());

    const interval = setInterval(() => {
      setLetters(prev => prev.map(letter => ({
        ...letter,
        x: (letter.x + 0.05) % 100,
        y: (letter.y + 0.03) % 100,
        rotation: (letter.rotation + 0.2) % 360,
      })));
    }, 100);

    return () => clearInterval(interval);
  }, [count, language]);

  return letters;
};
