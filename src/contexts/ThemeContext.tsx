import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * THEME CONTEXT - Système de thèmes extensible
 * Current: dark/light
 * Futur: premium skins (royal, neon, vintage, etc.)
 */

type ThemeMode = 'light' | 'dark';
type PremiumSkin = 'default' | 'royal' | 'neon' | 'vintage'; // À implémenter

interface ThemeContextType {
  mode: ThemeMode;
  skin: PremiumSkin;
  toggleTheme: () => void;
  setSkin: (skin: PremiumSkin) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [skin, setSkin] = useState<PremiumSkin>('default');

  useEffect(() => {
    // Charger le thème depuis localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      setMode(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Appliquer le thème
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ mode, skin, toggleTheme, setSkin }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
