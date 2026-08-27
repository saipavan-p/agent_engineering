import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, SunMedium } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useTheme } from '../context/ThemeContext';

export const TimerImageCard: React.FC = () => {
  const { mode, isRunning, timeLeft } = useTimer();
  const { currentThemeConfig } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className={`w-full rounded-3xl overflow-hidden border transition-all mb-6 ${currentThemeConfig.cardBg}`}>
      {/* Visual Header / Banner */}
      <div className="relative group overflow-hidden">
        <div className="relative h-36 sm:h-44 w-full overflow-hidden">
          <img
            src="/pomodoro-timer-art.jpg"
            alt="Calm Minimalist Pomodoro Timer Desk Sanctuary"
            className={`w-full h-full object-cover object-center transform transition-transform duration-1000 ${
              isRunning ? 'scale-105' : 'scale-100'
            }`}
          />

          {/* Soft calming gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium">
              <SunMedium className="w-3.5 h-3.5 text-amber-300" />
              <span>Desk Sanctuary</span>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-colors"
              title={isExpanded ? 'Collapse info' : 'Expand info'}
            >
              {isExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Bottom text overlay on image */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {mode === 'pomodoro' ? (isRunning ? 'Flow State Active' : 'Resting State') : 'Break Sanctuary'}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white/95 drop-shadow-sm font-sans">
                Analog Serenity • Digital Precision
              </h3>
            </div>

            <div className="text-right font-mono text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20">
              {timeStr}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable calm mindfulness prompt */}
      {isExpanded && (
        <div className="p-3.5 sm:p-4 bg-white/40 dark:bg-slate-900/40 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sage-600 dark:text-sage-400 shrink-0" />
            <span className="italic text-[11px] sm:text-xs">
              "One focus block at a time. Cultivate calm deliberate presence."
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
            25m / 5m
          </span>
        </div>
      )}
    </div>
  );
};
