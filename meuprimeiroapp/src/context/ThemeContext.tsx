import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/storage-keys';
import { useColorScheme as _useColorScheme } from 'react-native';

type ThemeName = 'light' | 'dark';

type ThemeContextType = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
  initialized: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = _useColorScheme() as ThemeName | null;
  const [theme, setThemeState] = useState<ThemeName>((system ?? 'light') as ThemeName);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEYS.THEME)
      .then((v) => {
        if (!mounted) return;
        if (v === 'light' || v === 'dark') {
          setThemeState(v);
        } else if (system) {
          setThemeState(system as ThemeName);
        }
      })
      .catch(() => {})
      .finally(() => mounted && setInitialized(true));

    return () => {
      mounted = false;
    };
  }, [system]);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    AsyncStorage.setItem(STORAGE_KEYS.THEME, t).catch(() => {});
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, initialized }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export default ThemeContext;
