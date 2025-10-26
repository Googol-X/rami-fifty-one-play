import { useState, useEffect } from 'react';

interface Settings {
  animationsEnabled: boolean;
  perfMode: boolean;
  colorBlindMode: boolean;
  volume: number;
  muted: boolean;
  hapticsEnabled: boolean;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    animationsEnabled: true,
    perfMode: false,
    colorBlindMode: false,
    volume: 0.7,
    muted: false,
    hapticsEnabled: true,
  });

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('game.settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.warn('Failed to parse settings:', e);
      }
    }
  }, []);

  return settings;
}
