"use client"
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const MusicContext = createContext<{
  muted: boolean;
  toggleMute: () => void;
} | undefined>(undefined);

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
};

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  // Persist mute state in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('bgm-muted');
    if (stored) setMuted(stored === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('bgm-muted', muted ? 'true' : 'false');
    if (audioRef.current) {
      audioRef.current.muted = muted;
      if (!muted) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [muted]);

  // Auto play on mount
  useEffect(() => {
    if (audioRef.current && !muted) {
      audioRef.current.play().catch(() => {});
    }
  }, [audioRef, muted]);

  const toggleMute = () => setMuted((m) => !m);

  return (
    <MusicContext.Provider value={{ muted, toggleMute }}>
      <audio
        ref={audioRef}
        src="/bgm.mp3"
        loop
        autoPlay
        style={{ display: 'none' }}
      />
      {children}
      <button
        onClick={toggleMute}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 10000,
          background: 'rgba(30,30,30,0.7)',
          border: 'none',
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          cursor: 'pointer',
        }}
        aria-label={muted ? 'Unmute background music' : 'Mute background music'}
      >
        {muted ? (
          <span role="img" aria-label="Unmute">🔇</span>
        ) : (
          <span role="img" aria-label="Mute">🔊</span>
        )}
      </button>
    </MusicContext.Provider>
  );
}; 