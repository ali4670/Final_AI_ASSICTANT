import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, X, Search } from 'lucide-react';
import { useSpotify } from '../contexts/SpotifyContext';
import { useTheme } from '../contexts/ThemeContext';

interface MusicPlayerProps {
  onNavigate?: (page: string) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const { 
    accessToken, loginWithSpotify, isPlaying, currentTrack, volume, 
    togglePlay, nextTrack, previousTrack, setVolume, playTrack, searchTracks 
  } = useSpotify();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    const results = await searchTracks(searchTerm);
    setSearchResults(results);
    setIsSearching(false);
  }, [searchTerm, searchTracks]);

  const handlePlayTrack = useCallback(async (uri: string) => {
    await playTrack(uri);
    setShowSearch(false);
  }, [playTrack]);

  if (!accessToken) {
    return (
      <div className="fixed bottom-6 left-6 z-[999]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={loginWithSpotify}
          className={`w-12 h-12 backdrop-blur-lg border rounded-full flex items-center justify-center shadow-lg transition-all ${
            theme === 'dark' ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
          }`}
          title="Login to Spotify"
        >
          <Music size={20} />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-[999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`absolute bottom-16 left-0 backdrop-blur-xl border p-4 rounded-2xl shadow-2xl w-72 mb-2 ${
                theme === 'dark' ? 'bg-black/90 border-white/20 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-lg" style={{ backgroundImage: `url(${currentTrack?.albumArt || 'https://via.placeholder.com/48'})`, backgroundSize: 'cover' }} />
                <div className="overflow-hidden">
                  <h3 className="font-bold text-sm truncate">{currentTrack?.name || 'No track playing'}</h3>
                  <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{currentTrack?.artist || 'Unknown Artist'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowSearch(!showSearch)} className={`hover:text-blue-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Search size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className={`hover:text-red-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {showSearch ? (
                <div className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search music..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className={`w-full p-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-slate-900'
                            }`}
                        />
                        <button onClick={handleSearch} disabled={isSearching} className="p-2 bg-blue-600 rounded-lg text-white">
                            <Search size={14} />
                        </button>
                    </div>

                    <div className="mt-4 max-h-40 overflow-y-auto custom-scrollbar">
                        {searchResults.map((track) => (
                            <div key={track.id} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`} onClick={() => handlePlayTrack(track.uri)}>
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <img src={track.albumArt} alt="" className="w-8 h-8 rounded" />
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-medium truncate">{track.name}</p>
                                        <p className="text-[8px] text-gray-500 truncate">{track.artist}</p>
                                    </div>
                                </div>
                                <Play size={12} className="text-blue-500" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <button onClick={previousTrack} className={`hover:text-blue-500 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            <SkipBack size={20} />
                        </button>
                        <button onClick={togglePlay} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 shadow-lg">
                            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                        </button>
                        <button onClick={nextTrack} className={`hover:text-blue-500 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            <SkipForward size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Volume2 size={14} className="text-gray-400" />
                        <input 
                            type="range" min="0" max="1" step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 backdrop-blur-lg border rounded-full flex items-center justify-center shadow-lg transition-all ${
            isPlaying ? 'border-blue-500 shadow-blue-500/20' : ''
        } ${
            theme === 'dark' ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-900 border-slate-800 text-white hover:bg-black'
        }`}
      >
        <Music size={20} className={isPlaying ? "animate-pulse" : ""} />
      </motion.button>
    </div>
  );
};

export default MusicPlayer;
