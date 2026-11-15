'use client';

import { useEffect, useState, createContext, useContext, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'propati-theme';

const ThemeContext = createContext<{
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
} | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: 'light' as Theme, resolvedTheme: 'light', toggleTheme: () => {}, setTheme: () => {} };
  return ctx;
}

function getStoredTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* localStorage can throw in private mode — fall back to system. */
  }
  return null;
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return theme;
}

function applyTheme(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(resolved);
  document.documentElement.style.colorScheme = resolved;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  const stored = getStoredTheme();

  useEffect(() => {
    setMounted(true);
    const initial: Theme = stored ?? 'system';
    setThemeState(initial);
    setResolved(resolveTheme(initial));
    applyTheme(resolveTheme(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-resolve when the stored theme or system preference changes.
  useEffect(() => {
    if (!mounted) return;
    setResolved(resolveTheme(theme));
    applyTheme(resolveTheme(theme));
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* localStorage can throw in private mode. */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, mounted]);

  // Sync system preference changes while in system mode.
  useEffect(() => {
    if (!mounted || theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolved(resolveTheme(theme));
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, mounted]);

  // Cross-tab sync: another tab wrote propati-theme.
  useEffect(() => {
    if (!mounted) return;
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark' || e.newValue === 'system')) {
        setThemeState(e.newValue);
        setResolved(resolveTheme(e.newValue));
        applyTheme(resolveTheme(e.newValue));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [mounted]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    setResolved(resolveTheme(t));
    applyTheme(resolveTheme(t));
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      setResolved(next);
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: resolved, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
