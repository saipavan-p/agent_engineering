import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeName } from '../types';

interface ThemeConfig {
  name: ThemeName;
  label: string;
  dotColor: string;
  bgGradient: string;
  cardBg: string;
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  accentText: string;
  accentBorder: string;
  ringStroke: string;
  ringGlow: string;
  badgeBg: string;
  badgeText: string;
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  sage: {
    name: 'sage',
    label: 'Matcha Sage',
    dotColor: '#608662',
    bgGradient: 'from-[#f4f7f4] via-[#edf3ed] to-[#e5ece5] dark:from-[#131a14] dark:via-[#18221a] dark:to-[#0f1510]',
    cardBg: 'bg-white/75 dark:bg-[#1b251c]/80 border-sage-200/80 dark:border-sage-800/50 shadow-zen backdrop-blur-xl',
    primaryBg: 'bg-sage-600 hover:bg-sage-700 text-white dark:bg-sage-500 dark:hover:bg-sage-600',
    primaryHover: 'hover:bg-sage-100 dark:hover:bg-sage-900/50',
    primaryText: 'text-sage-800 dark:text-sage-100',
    accentText: 'text-sage-600 dark:text-sage-400',
    accentBorder: 'border-sage-300 dark:border-sage-700',
    ringStroke: '#608662',
    ringGlow: 'rgba(96, 134, 98, 0.35)',
    badgeBg: 'bg-sage-100 dark:bg-sage-900/60',
    badgeText: 'text-sage-800 dark:text-sage-300',
  },
  twilight: {
    name: 'twilight',
    label: 'Nordic Twilight',
    dotColor: '#5073a5',
    bgGradient: 'from-[#f2f4f8] via-[#e8edf5] to-[#dee6f2] dark:from-[#0d131f] dark:via-[#131c2d] dark:to-[#090e17]',
    cardBg: 'bg-white/75 dark:bg-[#152033]/80 border-twilight-200/80 dark:border-twilight-800/50 shadow-zen backdrop-blur-xl',
    primaryBg: 'bg-twilight-600 hover:bg-twilight-700 text-white dark:bg-twilight-500 dark:hover:bg-twilight-600',
    primaryHover: 'hover:bg-twilight-100 dark:hover:bg-twilight-900/50',
    primaryText: 'text-twilight-900 dark:text-twilight-100',
    accentText: 'text-twilight-600 dark:text-twilight-400',
    accentBorder: 'border-twilight-300 dark:border-twilight-700',
    ringStroke: '#5073a5',
    ringGlow: 'rgba(80, 115, 165, 0.35)',
    badgeBg: 'bg-twilight-100 dark:bg-twilight-900/60',
    badgeText: 'text-twilight-800 dark:text-twilight-300',
  },
  terracotta: {
    name: 'terracotta',
    label: 'Warm Clay',
    dotColor: '#d17d54',
    bgGradient: 'from-[#fdf7f3] via-[#faede5] to-[#f4dfd3] dark:from-[#1a120e] dark:via-[#261914] dark:to-[#120b08]',
    cardBg: 'bg-white/75 dark:bg-[#281c16]/80 border-terracotta-200/80 dark:border-terracotta-800/50 shadow-zen backdrop-blur-xl',
    primaryBg: 'bg-terracotta-600 hover:bg-terracotta-700 text-white dark:bg-terracotta-500 dark:hover:bg-terracotta-600',
    primaryHover: 'hover:bg-terracotta-100 dark:hover:bg-terracotta-900/50',
    primaryText: 'text-terracotta-900 dark:text-terracotta-100',
    accentText: 'text-terracotta-600 dark:text-terracotta-400',
    accentBorder: 'border-terracotta-300 dark:border-terracotta-700',
    ringStroke: '#d17d54',
    ringGlow: 'rgba(209, 125, 84, 0.35)',
    badgeBg: 'bg-terracotta-100 dark:bg-terracotta-900/60',
    badgeText: 'text-terracotta-800 dark:text-terracotta-300',
  },
  sakura: {
    name: 'sakura',
    label: 'Sakura Blush',
    dotColor: '#e35987',
    bgGradient: 'from-[#fdf4f7] via-[#fceed5] to-[#fce4ee] dark:from-[#1b0f14] dark:via-[#25151c] dark:to-[#12090e]',
    cardBg: 'bg-white/75 dark:bg-[#28151f]/80 border-sakura-200/80 dark:border-sakura-800/50 shadow-zen backdrop-blur-xl',
    primaryBg: 'bg-sakura-600 hover:bg-sakura-700 text-white dark:bg-sakura-500 dark:hover:bg-sakura-600',
    primaryHover: 'hover:bg-sakura-100 dark:hover:bg-sakura-900/50',
    primaryText: 'text-sakura-900 dark:text-sakura-100',
    accentText: 'text-sakura-600 dark:text-sakura-400',
    accentBorder: 'border-sakura-300 dark:border-sakura-700',
    ringStroke: '#e35987',
    ringGlow: 'rgba(227, 89, 135, 0.35)',
    badgeBg: 'bg-sakura-100 dark:bg-sakura-900/60',
    badgeText: 'text-sakura-800 dark:text-sakura-300',
  },
  midnight: {
    name: 'midnight',
    label: 'Midnight OLED',
    dotColor: '#64748b',
    bgGradient: 'from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] dark:from-[#090a0f] dark:via-[#0f1117] dark:to-[#050608]',
    cardBg: 'bg-white/75 dark:bg-[#12141c]/80 border-slate-200/80 dark:border-slate-800/60 shadow-zen backdrop-blur-xl',
    primaryBg: 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white',
    primaryHover: 'hover:bg-slate-100 dark:hover:bg-slate-800/50',
    primaryText: 'text-slate-900 dark:text-slate-100',
    accentText: 'text-slate-700 dark:text-slate-300',
    accentBorder: 'border-slate-300 dark:border-slate-700',
    ringStroke: '#94a3b8',
    ringGlow: 'rgba(148, 163, 184, 0.3)',
    badgeBg: 'bg-slate-100 dark:bg-slate-800/80',
    badgeText: 'text-slate-800 dark:text-slate-300',
  },
};

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  currentThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('serene_theme') as ThemeName;
    return saved && THEMES[saved] ? saved : 'sage';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('serene_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('serene_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('serene_dark_mode', String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDark,
        toggleDarkMode,
        currentThemeConfig: THEMES[theme] || THEMES.sage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
