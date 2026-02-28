import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';

// Extend Window interface for Spotify Web Playback SDK
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
  uri: string;
}

interface SpotifyContextType {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  loginWithSpotify: () => void;
  logoutSpotify: () => void;
  // Playback State
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  volume: number;
  deviceId: string | null;
  player: any | null;
  // Playback Controls
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  playTrack: (uri: string) => Promise<void>;
  searchTracks: (query: string) => Promise<SpotifyTrack[]>;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [volume, setVolumeState] = useState(0.5);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [player, setPlayer] = useState<any | null>(null);

  const volumeRef = useRef(0.5);

  const saveTokens = useCallback((token: string, refresh: string, expires: number) => {
    localStorage.setItem('spotify_access_token', token);
    localStorage.setItem('spotify_refresh_token', refresh);
    localStorage.setItem('spotify_expires_in', String(expires));
    setAccessToken(token);
    setRefreshToken(refresh);
    setExpiresIn(expires);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_expires_in');
    setAccessToken(null);
    setRefreshToken(null);
    setExpiresIn(null);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlAccessToken = urlParams.get('access_token');
    const urlRefreshToken = urlParams.get('refresh_token');
    const urlExpiresIn = urlParams.get('expires_in');

    if (urlAccessToken && urlRefreshToken && urlExpiresIn) {
      saveTokens(urlAccessToken, urlRefreshToken, Number(urlExpiresIn));
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const storedAccessToken = localStorage.getItem('spotify_access_token');
      const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
      const storedExpiresIn = localStorage.getItem('spotify_expires_in');

      if (storedAccessToken && storedRefreshToken && storedExpiresIn) {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setExpiresIn(Number(storedExpiresIn));
      }
    }
  }, [saveTokens]);

  useEffect(() => {
    if (!refreshToken || !expiresIn) return;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const interval = setInterval(() => {
      fetch(`${backendUrl}/api/spotify/refresh_token?refresh_token=${refreshToken}`)
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            saveTokens(data.access_token, refreshToken, data.expires_in);
          } else {
            clearTokens();
          }
        })
        .catch(() => clearTokens());
    }, (expiresIn - 60) * 1000);
    return () => clearInterval(interval);
  }, [refreshToken, expiresIn, saveTokens, clearTokens]);

  // Initialize Spotify Player
  useEffect(() => {
    if (accessToken) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const spotifyPlayer = new window.Spotify.Player({
          name: 'AI Study Assistant',
          getOAuthToken: (cb: any) => { cb(accessToken); },
          volume: volumeRef.current,
        });

        spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
          setDeviceId(device_id);
          setPlayer(spotifyPlayer);
        });

        spotifyPlayer.addListener('player_state_changed', (state: any) => {
          if (!state || !state.track_window) {
            setIsPlaying(false);
            setCurrentTrack(null);
            return;
          }
          setIsPlaying(!state.paused);
          setCurrentTrack({
            id: state.track_window.current_track.id,
            name: state.track_window.current_track.name,
            artist: state.track_window.current_track.artists[0]?.name || 'Unknown Artist',
            albumArt: state.track_window.current_track.album.images[0]?.url || 'https://via.placeholder.com/48',
            uri: state.track_window.current_track.uri,
          });
          spotifyPlayer.getVolume().then((vol: number) => {
            setVolumeState(vol);
            volumeRef.current = vol;
          });
        });

        spotifyPlayer.connect();
      };

      return () => {
        if (player) player.disconnect();
        document.body.removeChild(script);
      };
    }
  }, [accessToken]);

  const togglePlay = useCallback(() => player?.togglePlay(), [player]);
  const nextTrack = useCallback(() => player?.nextTrack(), [player]);
  const previousTrack = useCallback(() => player?.previousTrack(), [player]);
  const setVolume = useCallback((vol: number) => {
    player?.setVolume(vol);
    setVolumeState(vol);
    volumeRef.current = vol;
  }, [player]);

  const playTrack = useCallback(async (uri: string) => {
    if (!deviceId || !accessToken) return;
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ uris: [uri] }),
    });
  }, [deviceId, accessToken]);

  const searchTracks = useCallback(async (query: string): Promise<SpotifyTrack[]> => {
    if (!query || !accessToken) return [];
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      return data.tracks.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        artist: item.artists[0]?.name || 'Unknown Artist',
        albumArt: item.album.images[0]?.url || 'https://via.placeholder.com/48',
        uri: item.uri,
      }));
    } catch (e) {
      return [];
    }
  }, [accessToken]);

  const loginWithSpotify = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    window.location.href = `${backendUrl}/api/spotify/login`;
  };

  const logoutSpotify = () => clearTokens();

  const value = {
    accessToken, refreshToken, expiresIn, loginWithSpotify, logoutSpotify,
    isPlaying, currentTrack, volume, deviceId, player,
    togglePlay, nextTrack, previousTrack, setVolume, playTrack, searchTracks
  };

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (context === undefined) throw new Error('useSpotify must be used within a SpotifyProvider');
  return context;
}
