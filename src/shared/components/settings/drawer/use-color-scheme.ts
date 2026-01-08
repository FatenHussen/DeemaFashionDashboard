import type { ThemeColorScheme } from 'src/theme/types';

import { useState, useEffect } from 'react';

// ----------------------------------------------------------------------

const THEME_STORAGE_KEY = 'theme-mode';

export function useColorScheme() {
  const [mode, setMode] = useState<ThemeColorScheme | 'system'>(() => {
    // Initialize from localStorage or default to 'light'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored as ThemeColorScheme | 'system';
      }
    }
    return 'light';
  });
  const [systemMode, setSystemMode] = useState<ThemeColorScheme>('light');

  // Apply theme class to document
  useEffect(() => {
    const applyTheme = (scheme: ThemeColorScheme) => {
      const root = document.documentElement;
      if (scheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    const colorScheme = mode === 'system' ? systemMode : mode;
    applyTheme(colorScheme);
  }, [mode, systemMode]);

  useEffect(() => {
    // Detect system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemMode = () => {
      setSystemMode(mediaQuery.matches ? 'dark' : 'light');
    };

    updateSystemMode();
    mediaQuery.addEventListener('change', updateSystemMode);

    return () => {
      mediaQuery.removeEventListener('change', updateSystemMode);
    };
  }, []);

  const colorScheme = mode === 'system' ? systemMode : mode;

  return {
    mode,
    setMode: (newMode: ThemeColorScheme | 'system') => {
      setMode(newMode);
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, newMode);
      }
    },
    colorScheme,
    systemMode,
  };
}

