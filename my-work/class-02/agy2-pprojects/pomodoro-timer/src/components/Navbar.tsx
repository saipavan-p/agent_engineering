import React, { useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Wind, 
  BarChart2, 
  Settings as SettingsIcon, 
  Maximize2, 
  Sun, 
  Moon,
  Palette,
  CheckCircle2
} from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useTimer } from '../context/TimerContext';
import { ThemeName } from '../types';

interface NavbarProps {
  onOpenSoundMixer: () => void;
  onOpenBreathing: () => void;
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
  onOpenZen: () => void;
  isAmbientPlaying: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSoundMixer,
  onOpenBreathing,
  onOpenAnalytics,
  onOpenSettings,
  onOpenZen,
  isAmbientPlaying,
}) => {
  const { theme, setTheme, isDark, toggleDarkMode } = useTheme();
  const { pomodorosCompletedToday, settings } = useTimer();
  const [showThemePicker, setShowThemePicker] = useState(false);

  return (
    <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <img
            src="/pomodoro-timer-art.jpg"
            alt="Serene Pomodoro Timer"
            className="w-11 h-11 rounded-2xl object-cover shadow-md shadow-sage-500/20 border-2 border-white/80 dark:border-slate-700/80 transform group-hover:scale-105 transition-all duration-300"
          />
          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sage-500 ring-2 ring-white dark:ring-slate-900">
            <Sparkles className="w-2 h-2 text-white" />
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-sans">
            SereneFocus
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sage-100 dark:bg-sage-900/60 text-sage-700 dark:text-sage-300 tracking-wider">
              Zen
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Calm, intentional productivity
          </p>
        </div>
      </div>

      {/* Center daily streak / goal pill */}
      <div 
        onClick={onOpenAnalytics}
        className="cursor-pointer group hidden md:flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-sage-300 dark:hover:border-sage-700 transition-all backdrop-blur-md"
        title="View Daily Analytics"
      >
        <span className="text-sm">🍅</span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
          {pomodorosCompletedToday}/{settings.dailyGoalPomodoros}
        </span>
        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sage-500 to-sage-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (pomodorosCompletedToday / settings.dailyGoalPomodoros) * 100)}%` }}
          />
        </div>
      </div>

      {/* Right actions toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Ambient Sound Mixer */}
        <button
          onClick={onOpenSoundMixer}
          className={`relative p-2.5 rounded-xl transition-all flex items-center gap-1.5 text-sm font-medium ${
            isAmbientPlaying
              ? 'bg-sage-100 text-sage-700 dark:bg-sage-900/70 dark:text-sage-300 shadow-xs ring-1 ring-sage-400/40'
              : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          title="Ambient Sound Sanctuary"
        >
          <Volume2 className="w-4 h-4" />
          {isAmbientPlaying && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-500"></span>
            </span>
          )}
          <span className="hidden lg:inline text-xs">Soundscape</span>
        </button>

        {/* Mindful Breathing */}
        <button
          onClick={onOpenBreathing}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 text-sm font-medium"
          title="Mindful Breathing Intermission (Press B)"
        >
          <Wind className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span className="hidden lg:inline text-xs">Breathe</span>
        </button>

        {/* Analytics */}
        <button
          onClick={onOpenAnalytics}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Productivity Insights"
        >
          <BarChart2 className="w-4 h-4" />
        </button>

        {/* Zen Fullscreen */}
        <button
          onClick={onOpenZen}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Distraction-Free Zen Mode (Press F)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Theme Palette Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1"
            title="Choose Aesthetic Theme"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showThemePicker && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 animate-scale-in">
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
                Aesthetic Theme
              </div>
              <div className="space-y-1">
                {(Object.keys(THEMES) as ThemeName[]).map((tKey) => {
                  const item = THEMES[tKey];
                  const isSelected = theme === tKey;
                  return (
                    <button
                      key={tKey}
                      onClick={() => {
                        setTheme(tKey);
                        setShowThemePicker(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: item.dotColor }}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Settings & Preferences"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
