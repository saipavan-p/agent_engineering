import React, { useEffect } from 'react';
import { Minimize2, Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';

interface ZenFullscreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZenFullscreen: React.FC<ZenFullscreenProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    mode,
    timeLeft,
    totalDuration,
    isRunning,
    toggleTimer,
    resetTimer,
    skipSession,
    activeTaskId,
  } = useTimer();
  const { currentThemeConfig } = useTheme();
  const { tasks } = useTasks();
  const [showBackdrop, setShowBackdrop] = React.useState(true);

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Format time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Keyboard shortcut listener to close zen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' || e.key === 'f' || e.key === 'F') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const size = 360;
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 text-white animate-fade-in select-none overflow-hidden">
      {/* Background Image Ambient Backdrop Layer */}
      {showBackdrop && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/pomodoro-timer-art.jpg"
            alt="Zen Desk Background"
            className="w-full h-full object-cover filter blur-md scale-105 opacity-25 brightness-75"
          />
          <div className="absolute inset-0 bg-slate-950/70" />
        </div>
      )}

      {/* Top Bar */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
            Zen Focus Sanctuary
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBackdrop(!showBackdrop)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-300 transition-colors backdrop-blur-md"
            title="Toggle Desk Atmosphere"
          >
            {showBackdrop ? '🌿 Atmosphere: Desk' : '🌑 Atmosphere: Minimal'}
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-300 transition-colors backdrop-blur-md"
            title="Exit Zen Fullscreen (Escape or F)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Zen</span>
          </button>
        </div>
      </div>

      {/* Main Center Dial */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative flex items-center justify-center">
          {/* Background Ambient Glow */}
          <div
            className={`absolute inset-0 rounded-full transition-opacity duration-1000 ${
              isRunning ? 'opacity-80 animate-pulse-subtle scale-110' : 'opacity-20 scale-95'
            }`}
            style={{
              background: `radial-gradient(circle, ${currentThemeConfig.ringGlow} 0%, transparent 70%)`,
            }}
          />

          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={currentThemeConfig.ringStroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Time and Status */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-medium">
              {mode === 'pomodoro' ? 'Deep Flow State' : 'Peaceful Rest'}
            </span>
            <span className="text-7xl font-extrabold font-mono text-white drop-shadow-md">
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Active Task Name */}
        {activeTask && (
          <div className="mt-8 px-6 py-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md max-w-md text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
              Active Focus Target
            </span>
            <p className="text-sm font-semibold text-white">
              {activeTask.title}
            </p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 transition-all active:scale-95"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-3xl font-bold text-lg text-slate-900 bg-white hover:bg-slate-100 shadow-xl transition-all active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={skipSession}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 transition-all active:scale-95"
            title="Skip"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Subtle Hint */}
      <div className="text-xs text-slate-500 font-mono">
        Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">Space</kbd> to toggle • Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">Esc</kbd> to exit
      </div>
    </div>
  );
};
