import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Globe, ArrowLeft, Share2, Loader, FileText, 
    Activity, Zap, Sparkles, MessageSquare, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import * as THREE from 'three';
import { Text, OrbitControls, Float, Sphere, MeshDistortMaterial, Line } from '@react-three/drei';

interface Node {
    id: string;
    title: string;
    pos: THREE.Vector3;
}

interface Link {
    start: THREE.Vector3;
    end: THREE.Vector3;
}

const NodeMesh: React.FC<{ node: Node, onClick: () => void }> = ({ node, onClick }) => {
    const [hovered, setHovered] = useState(false);
    
    return (
        <group position={node.pos}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Sphere 
                    args={[0.4, 32, 32]} 
                    onClick={onClick}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                >
                    <MeshDistortMaterial 
                        color={hovered ? "#3b82f6" : "#60a5fa"} 
                        speed={3} 
                        distort={0.2} 
                        emissive="#3b82f6"
                        emissiveIntensity={hovered ? 2 : 0.5}
                    />
                </Sphere>
            </Float>
            <Text
                position={[0, 0.8, 0]}
                fontSize={0.25}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={2}
                textAlign="center"
            >
                {node.title.toUpperCase()}
            </Text>
        </group>
    );
};

const ConnectionLine: React.FC<{ link: Link }> = ({ link }) => {
    return (
        <Line
            points={[link.start, link.end]}
            color="#3b82f6"
            lineWidth={0.5}
            transparent
            opacity={0.2}
        />
    );
};

const GraphScene: React.FC<{ documents: any[], onSelect: (id: string) => void }> = ({ documents, onSelect }) => {
    const nodes = useMemo(() => {
        return documents.map((doc, i) => {
            const angle = (i / documents.length) * Math.PI * 2;
            const radius = 5 + Math.random() * 5;
            return {
                id: doc.id,
                title: doc.title,
                pos: new THREE.Vector3(
                    Math.cos(angle) * radius,
                    (Math.random() - 0.5) * 8,
                    Math.sin(angle) * radius
                )
            };
        });
    }, [documents]);

    const links = useMemo(() => {
        const result: Link[] = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const words1 = nodes[i].title.toLowerCase().split(' ');
                const words2 = nodes[j].title.toLowerCase().split(' ');
                const intersection = words1.filter(w => w.length > 3 && words2.includes(w));
                if (intersection.length > 0 || Math.random() > 0.85) {
                    result.push({ start: nodes[i].pos, end: nodes[j].pos });
                }
            }
        }
        return result;
    }, [nodes]);

    return (
        <>
            <OrbitControls enablePan={false} maxDistance={25} minDistance={2} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            {nodes.map(node => (
                <NodeMesh key={node.id} node={node} onClick={() => onSelect(node.id)} />
            ))}
            {links.map((link, i) => (
                <ConnectionLine key={i} link={link} />
            ))}
            <Sphere args={[1, 64, 64]}>
                <MeshDistortMaterial color="#1e3a8a" speed={1} distort={0.4} transparent opacity={0.1} />
            </Sphere>
        </>
    );
};

const KnowledgeGraph: React.FC<{ onNavigate: (p: string, id?: string) => void }> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        fetchDocs();
    }, [user]);

    const fetchDocs = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.from('documents').select('*');
            if (error) throw error;
            setDocuments(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen pt-24 px-8 relative overflow-hidden transition-colors duration-700 ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-blue-50 text-slate-900'}`}>
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                    <GraphScene documents={documents} onSelect={setSelectedId} />
                </Canvas>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 pointer-events-none">
                <header className="flex justify-between items-start mb-12">
                    <div className="space-y-4">
                        <motion.button 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => onNavigate('dashboard')}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl pointer-events-auto hover:bg-white/10 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
                        >
                            <ArrowLeft size={16} /> Back to Command
                        </motion.button>
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                                    <Share2 className="text-blue-500" size={24} />
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Neural Web</h1>
                            </div>
                            <p className="opacity-40 font-black uppercase tracking-[0.4em] text-[10px] ml-16">Multidimensional Knowledge Mapping</p>
                        </div>
                    </div>

                    <div className="flex gap-4 pointer-events-auto">
                        <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl flex items-center gap-4">
                            <Activity size={16} className="text-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{documents.length} Active Nodes</span>
                        </div>
                    </div>
                </header>

                <AnimatePresence>
                    {selectedId && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg p-8 rounded-[3rem] border border-blue-500/30 bg-[#0D0D0D]/80 backdrop-blur-2xl pointer-events-auto shadow-2xl shadow-blue-500/20"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-blue-600 text-white rounded-2xl">
                                    <FileText size={24} />
                                </div>
                                <button onClick={() => setSelectedId(null)} className="opacity-40 hover:opacity-100 transition-opacity">
                                    <X size={24} />
                                </button>
                            </div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tight mb-4 leading-tight">
                                {documents.find(d => d.id === selectedId)?.title}
                            </h2>
                            <p className="opacity-50 text-sm font-medium mb-8 line-clamp-2">
                                {documents.find(d => d.id === selectedId)?.content.slice(0, 150)}...
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => onNavigate('chat', selectedId)}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={14} /> Open Sync
                                </button>
                                <button 
                                    onClick={() => onNavigate('neuralSummary', selectedId)}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={14} /> Synthesis
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[100]">
                    <div className="text-center space-y-6">
                        <Loader className="animate-spin text-blue-500 mx-auto" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Architecting Web Hierarchy...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KnowledgeGraph;
