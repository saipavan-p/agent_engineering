import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Plus, Minus } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useTheme } from '../context/ThemeContext';

interface TimerControlsProps {
  onOpenBreathing?: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({ onOpenBreathing }) => {
  const {
    isRunning,
    toggleTimer,
    resetTimer,
    skipSession,
    adjustTime,
  } = useTimer();
  const { currentThemeConfig } = useTheme();

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        skipSession();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetTimer();
      } else if ((e.key === 'b' || e.key === 'B') && onOpenBreathing) {
        e.preventDefault();
        onOpenBreathing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTimer, skipSession, resetTimer, onOpenBreathing]);

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      {/* Quick Time Adjusters & Control buttons */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Subtract 1 min */}
        <button
          onClick={() => adjustTime(-60)}
          className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-xs active:scale-95"
          title="Subtract 1 minute"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Reset */}
        <button
          onClick={resetTimer}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 shadow-xs transition-all active:scale-95"
          title="Reset timer (Press R)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Main Start / Pause Primary Button */}
        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center gap-2.5 px-8 py-4 rounded-3xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 ${
            currentThemeConfig.primaryBg
          }`}
          style={{
            boxShadow: isRunning ? `0 10px 25px -5px ${currentThemeConfig.ringGlow}` : undefined,
          }}
          title={isRunning ? 'Pause session (Space)' : 'Start session (Space)'}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current ml-0.5" />
              <span>Begin Focus</span>
            </>
          )}
        </button>

        {/* Skip */}
        <button
          onClick={skipSession}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 shadow-xs transition-all active:scale-95"
          title="Skip to next session (Press S)"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Add 5 min */}
        <button
          onClick={() => adjustTime(300)}
          className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-xs active:scale-95"
          title="Add 5 minutes"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard shortcuts subtle hints */}
      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">Space</kbd> Start/Pause</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">S</kbd> Skip</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">R</kbd> Reset</span>
      </div>
    </div>
  );
};
