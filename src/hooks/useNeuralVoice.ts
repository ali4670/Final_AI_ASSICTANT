import { useState, useCallback, useEffect } from 'react';

export interface VoiceProfile {
    id: string;
    name: string;
    lang: string;
}

export const useNeuralVoice = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const updateVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            // Default to a high-quality English voice if available
            const defaultVoice = availableVoices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || availableVoices[0];
            setSelectedVoice(defaultVoice);
        };

        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };
        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    }, [selectedVoice]);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    return {
        voices,
        selectedVoice,
        setSelectedVoice,
        speak,
        stop,
        isSpeaking
    };
};
