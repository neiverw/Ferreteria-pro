"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useAuth } from './auth-context';

type ThemeContextType = {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  setTheme: (theme: 'light' | 'dark') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar preferencias del usuario al iniciar sesión
  useEffect(() => {
    if (mounted && user) {
      loadUserPreferences();
    } else if (mounted) {
      setIsLoading(false);
    }
  }, [user, mounted]);

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user-preferences');
      if (response.ok) {
        const { preferences } = await response.json();
        if (preferences.theme) {
          setNextTheme(preferences.theme);
        }
        if (preferences.fontSize) {
          setFontSizeState(preferences.fontSize);
        }
      }
    } catch (error) {
      console.error('Error al cargar preferencias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: 'light' | 'dark') => {
    setNextTheme(newTheme);
    if (user) {
      try {
        await fetch('/api/user-preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: { theme: newTheme, fontSize }
          })
        });
      } catch (error) {
        console.error('Error al guardar tema:', error);
      }
    }
  };

  const setFontSize = async (newSize: 'small' | 'medium' | 'large') => {
    setFontSizeState(newSize);
    if (user) {
      try {
        await fetch('/api/user-preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: { theme: (nextTheme as 'light' | 'dark') || 'light', fontSize: newSize }
          })
        });
      } catch (error) {
        console.error('Error al guardar tamaño de fuente:', error);
      }
    }
  };

  const theme = (nextTheme as 'light' | 'dark') || 'light';

  return (
    <ThemeContext.Provider value={{ theme, fontSize, setTheme, setFontSize, isLoading }}>
      <div className={`font-size-${fontSize}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="app-theme"
      disableTransitionOnChange
    >
      <ThemeContent>{children}</ThemeContent>
    </NextThemesProvider>
  );
}

export function useThemePreferences() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemePreferences debe usarse dentro de ThemeProvider');
  }
  return context;
}
