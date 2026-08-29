"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth-context';

type Theme = 'light' | 'dark';
type FontSize = 'small' | 'medium' | 'large';

type ThemeContextType = {
  theme: Theme;
  fontSize: FontSize;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app-theme', newTheme);
      } catch {
        // Ignorar errores de acceso a localStorage
      }
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    applyTheme(newTheme);
  }, [applyTheme]);

  const setFontSize = useCallback((newSize: FontSize) => {
    setFontSizeState(newSize);
  }, []);

  const loadUserPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/user-preferences');
      if (response.ok) {
        const { preferences } = await response.json();
        if (preferences?.theme === 'light' || preferences?.theme === 'dark') {
          applyTheme(preferences.theme);
        }
        if (preferences?.fontSize) {
          setFontSizeState(preferences.fontSize);
        }
      }
    } catch (error) {
      console.error('Error al cargar preferencias:', error);
    } finally {
      setIsLoading(false);
    }
  }, [applyTheme]);

  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem('app-theme') as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        applyTheme(savedTheme);
      }
    } catch {
      // Ignorar errores de acceso a localStorage
    }
  }, [applyTheme]);

  useEffect(() => {
    if (mounted && user) {
      loadUserPreferences();
    } else if (mounted) {
      setIsLoading(false);
    }
  }, [user, mounted, loadUserPreferences]);

  return (
    <ThemeContext.Provider value={{ theme, fontSize, setTheme, setFontSize, isLoading }}>
      <div className={`font-size-${fontSize}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useThemePreferences() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemePreferences debe usarse dentro de ThemeProvider');
  }
  return context;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light' as Theme,
      setTheme: () => {},
      themes: ['light', 'dark'] as string[],
      systemTheme: undefined,
    };
  }
  return {
    theme: context.theme,
    setTheme: context.setTheme,
    themes: ['light', 'dark'] as string[],
    systemTheme: undefined,
  };
}
