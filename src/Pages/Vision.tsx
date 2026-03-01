import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Camera, ArrowLeft, Zap, Sparkles, 
    Loader, ShieldCheck, RefreshCw, CheckCircle2,
    Maximize, Smartphone, Scan, QrCode
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

const Vision: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<any[] | null>(null);
    const [capturedImage, setCapturedIdImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startCamera = useCallback(async () => {
        setScanResult(null);
        setCapturedIdImage(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Camera uplink failed. Check permissions.");
        }
    }, []);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const captureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        // Draw current frame to canvas
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedIdImage(imageData);
        stopCamera();
        
        setIsScanning(true);
        try {
            const response = await fetch(`/api/vision-to-cards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: imageData,
                    userId: user?.id
                })
            });

            if (!response.ok) throw new Error("Vision core failure");
            const data = await response.json();
            setScanResult(data.cards);
        } catch (err) {
            console.error(err);
            alert("Neural analysis failed. The image might be too blurry.");
            startCamera();
        } finally {
            setIsScanning(false);
        }
    };

    React.useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera]);

    return (
        <div className={`min-h-screen pt-24 pb-12 px-6 transition-colors duration-700 relative overflow-hidden ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'}`}>
            
            {/* Header */}
            <div className="max-w-xl mx-auto relative z-10">
                <motion.button 
                    whileHover={{ x: -5 }}
                    onClick={() => onNavigate('documents')}
                    className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all"
                >
                    <ArrowLeft size={14} /> Library Registry
                </motion.button>

                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20">
                            <Scan className="text-white" size={24} />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Vision <span className="text-blue-600">Link</span></h1>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Mobile Uplink 042</span>
                    </div>
                </div>

                {/* Viewport */}
                <div className="relative aspect-[3/4] rounded-[3rem] border-4 border-white/5 overflow-hidden shadow-2xl bg-black group">
                    {!capturedImage && (
                        <>
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover grayscale brightness-125 contrast-75"
                            />
                            {/* Scanning Overlays */}
                            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
                            <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-scan-line" />
                            <div className="absolute top-10 left-10 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                            <div className="absolute top-10 right-10 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                            <div className="absolute bottom-10 left-10 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                            <div className="absolute bottom-10 right-10 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                            
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Align Physical Fragment</p>
                            </div>
                        </>
                    )}

                    {capturedImage && (
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    )}

                    {/* Progress Overlay */}
                    <AnimatePresence>
                        {isScanning && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-blue-600/20 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center"
                            >
                                <div className="relative mb-8">
                                    <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={32} />
                                </div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Neural Extraction</h3>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60">Architecting Recall Nodes...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="mt-12 space-y-4">
                    {!scanResult && !isScanning && (
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={captureAndAnalyze}
                            className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-4 group"
                        >
                            <Camera size={24} className="group-hover:rotate-12 transition-transform" />
                            Initialize Scan
                        </motion.button>
                    )}

                    {scanResult && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="p-8 rounded-[3rem] bg-green-500/10 border border-green-500/20 text-center">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="text-white" size={24} />
                                </div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1 text-green-500">Sync Complete</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{scanResult.length} Recall Nodes Generated</p>
                            </div>
                            
                            <button 
                                onClick={startCamera}
                                className="w-full py-6 bg-white/5 border border-white/10 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                            >
                                <RefreshCw size={16} /> Scan Another Fragment
                            </button>
                            <button 
                                onClick={() => onNavigate('flashcards')}
                                className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
                            >
                                <Maximize size={16} /> Open Recall Core
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Device Info */}
                <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center opacity-20">
                    <div className="flex items-center gap-3">
                        <Smartphone size={16} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Mobile Bridge v1.0</span>
                    </div>
                    <QrCode size={16} />
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 0%; }
                    100% { top: 100%; }
                }
                .animate-scan-line {
                    animation: scan 3s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Vision;
