import React from 'react';
import { useTimer } from '../context/TimerContext';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { TimerMode } from '../types';
import { Check, X, Target } from 'lucide-react';

export const TimerDial: React.FC = () => {
  const {
    mode,
    setMode,
    timeLeft,
    totalDuration,
    isRunning,
    currentCycle,
    settings,
    activeTaskId,
    setActiveTaskId,
  } = useTimer();
  const { currentThemeConfig } = useTheme();
  const { tasks, toggleTask } = useTasks();

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Calculate minutes and seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // SVG Progress calculation
  const size = 300;
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const modes: { id: TimerMode; label: string; duration: number }[] = [
    { id: 'pomodoro', label: 'Focus', duration: settings.pomodoroMinutes },
    { id: 'shortBreak', label: 'Short Break', duration: settings.shortBreakMinutes },
    { id: 'longBreak', label: 'Long Break', duration: settings.longBreakMinutes },
  ];

  return (
    <div className="flex flex-col items-center justify-center relative w-full">
      {/* Mode Selection Pills */}
      <div className="inline-flex p-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-inner backdrop-blur-md mb-6 transition-all">
        {modes.map((m) => {
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? `${currentThemeConfig.primaryBg} shadow-md shadow-black/5`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {m.label}
              <span className="ml-1.5 opacity-70 text-[11px] font-normal">
                {m.duration}m
              </span>
            </button>
          );
        })}
      </div>

      {/* Circular Timer Visual Dial */}
      <div className="relative flex items-center justify-center my-2 select-none">
        {/* Ambient Subtle Pulse Glow when running */}
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-1000 pointer-events-none ${
            isRunning ? 'opacity-70 animate-pulse-subtle scale-105' : 'opacity-0 scale-95'
          }`}
          style={{
            background: `radial-gradient(circle, ${currentThemeConfig.ringGlow} 0%, transparent 70%)`,
          }}
        />

        <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-200/70 dark:text-slate-800/80"
          />

          {/* Active Animated Progress Circle */}
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

        {/* Center Content Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          {/* Status badge */}
          <span
            className={`text-xs font-medium uppercase tracking-widest px-3 py-1 rounded-full mb-1 ${
              currentThemeConfig.badgeBg
            } ${currentThemeConfig.badgeText}`}
          >
            {mode === 'pomodoro'
              ? isRunning
                ? 'Deep Flow'
                : 'Ready to Focus'
              : mode === 'shortBreak'
              ? 'Mindful Rest'
              : 'Deep Recharge'}
          </span>

          {/* Digital Time Countdown */}
          <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-mono my-1">
            {formattedTime}
          </span>

          {/* Cycle dots indicator */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-1">
              Cycle {currentCycle}/{settings.longBreakInterval}
            </span>
            {Array.from({ length: settings.longBreakInterval }).map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx < currentCycle
                    ? 'scale-110 shadow-xs'
                    : 'opacity-30'
                }`}
                style={{
                  backgroundColor: idx < currentCycle ? currentThemeConfig.ringStroke : '#94a3b8',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Linked Task Banner */}
      {activeTask && (
        <div className="mt-4 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 max-w-sm w-full animate-fade-in backdrop-blur-md">
          <button
            onClick={() => toggleTask(activeTask.id)}
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              activeTask.completed
                ? 'bg-sage-600 border-sage-600 text-white'
                : 'border-slate-300 dark:border-slate-600 hover:border-sage-500'
            }`}
            title="Mark task completed"
          >
            {activeTask.completed && <Check className="w-3.5 h-3.5" />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400 shrink-0" />
              <p className={`text-xs font-semibold truncate ${activeTask.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {activeTask.title}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              🍅 {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros} pomodoros
            </p>
          </div>

          <button
            onClick={() => setActiveTaskId(null)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            title="Detach active task"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
