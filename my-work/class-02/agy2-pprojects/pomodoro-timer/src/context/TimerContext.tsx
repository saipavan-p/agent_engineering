import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TimerMode, Settings, SessionHistory, DailyStat } from '../types';
import { audioEngine } from '../services/audioEngine';

interface TimerContextType {
  mode: TimerMode;
  setMode: (mode: TimerMode) => void;
  timeLeft: number;
  totalDuration: number;
  isRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  adjustTime: (seconds: number) => void;
  pomodorosCompletedToday: number;
  currentCycle: number; // 1 to settings.longBreakInterval
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  sessionHistory: SessionHistory[];
  dailyStats: DailyStat[];
  clearHistory: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  chimeSound: 'tibetan',
  chimeVolume: 0.8,
  ambientMasterVolume: 0.6,
  theme: 'sage',
  tickingSound: false,
  desktopNotifications: false,
  dailyGoalPomodoros: 8,
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load settings
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('serene_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [mode, setModeState] = useState<TimerMode>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Duration in seconds for current mode
  const getModeDuration = useCallback((m: TimerMode, s: Settings = settings): number => {
    switch (m) {
      case 'pomodoro':
        return s.pomodoroMinutes * 60;
      case 'shortBreak':
        return s.shortBreakMinutes * 60;
      case 'longBreak':
        return s.longBreakMinutes * 60;
    }
  }, [settings]);

  const [timeLeft, setTimeLeft] = useState<number>(() => getModeDuration('pomodoro', settings));
  const [totalDuration, setTotalDuration] = useState<number>(() => getModeDuration('pomodoro', settings));

  // History & stats
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>(() => {
    try {
      const saved = localStorage.getItem('serene_session_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate today's pomodoros
  const todayStr = new Date().toISOString().split('T')[0];
  const pomodorosCompletedToday = sessionHistory.filter(
    (s) => s.mode === 'pomodoro' && s.dateStr === todayStr
  ).length;

  // Save settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('serene_settings', JSON.stringify(updated));
      
      if (newSettings.ambientMasterVolume !== undefined) {
        audioEngine.setMasterVolume(newSettings.ambientMasterVolume);
      }
      return updated;
    });
  };

  // Save history
  useEffect(() => {
    localStorage.setItem('serene_session_history', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  // Request Notification permission if enabled
  useEffect(() => {
    if (settings.desktopNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [settings.desktopNotifications]);

  // Change mode safely
  const setMode = useCallback((newMode: TimerMode) => {
    setModeState(newMode);
    setIsRunning(false);
    const duration = getModeDuration(newMode, settings);
    setTimeLeft(duration);
    setTotalDuration(duration);
  }, [getModeDuration, settings]);

  // Trigger celebration effects
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#608662', '#a7c1a8', '#f7b0c9', '#5073a5', '#d17d54'],
        disableForReducedMotion: true,
      });
    } catch {
      // ignore
    }
  };

  // Complete session handler
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);

    // Play chime sound
    audioEngine.playChime(settings.chimeSound, settings.chimeVolume);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Log history
    const completedSession: SessionHistory = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      timestamp: Date.now(),
      mode,
      durationMinutes: Math.round(totalDuration / 60),
      taskId: activeTaskId || undefined,
      dateStr,
    };

    setSessionHistory((prev) => [completedSession, ...prev]);

    // Send Desktop Notification
    if (settings.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
      const title = mode === 'pomodoro' ? 'Focus Session Completed! 🌿' : 'Break Finished! ☀️';
      const body = mode === 'pomodoro' 
        ? 'Great job staying focused. Time for a peaceful breath and rest.' 
        : 'Feeling refreshed? Ready for your next focus session.';
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch {
        // Notification API failed
      }
    }

    if (mode === 'pomodoro') {
      triggerCelebration();

      // Check for long break
      if (currentCycle >= settings.longBreakInterval) {
        setCurrentCycle(1);
        setMode('longBreak');
        if (settings.autoStartBreaks) setIsRunning(true);
      } else {
        setCurrentCycle((prev) => prev + 1);
        setMode('shortBreak');
        if (settings.autoStartBreaks) setIsRunning(true);
      }
    } else {
      // Break is complete, go back to pomodoro
      setMode('pomodoro');
      if (settings.autoStartPomodoros) setIsRunning(true);
    }
  }, [
    mode,
    totalDuration,
    activeTaskId,
    settings,
    currentCycle,
    setMode
  ]);

  // High precision timer loop using requestAnimationFrame + Date.now() timestamp
  const endTimeRef = useRef<number | null>(null);

  const startTimer = () => {
    if (timeLeft <= 0) {
      const d = getModeDuration(mode, settings);
      setTimeLeft(d);
      setTotalDuration(d);
      endTimeRef.current = Date.now() + d * 1000;
    } else {
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    endTimeRef.current = null;
  };

  const toggleTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    const duration = getModeDuration(mode, settings);
    setTimeLeft(duration);
    setTotalDuration(duration);
  };

  const skipSession = () => {
    if (mode === 'pomodoro') {
      if (currentCycle >= settings.longBreakInterval) {
        setCurrentCycle(1);
        setMode('longBreak');
      } else {
        setCurrentCycle((prev) => prev + 1);
        setMode('shortBreak');
      }
    } else {
      setMode('pomodoro');
    }
  };

  const adjustTime = (seconds: number) => {
    setTimeLeft((prev) => {
      const next = Math.max(10, prev + seconds);
      if (isRunning && endTimeRef.current) {
        endTimeRef.current += seconds * 1000;
      }
      setTotalDuration((t) => Math.max(next, t));
      return next;
    });
  };

  // Timer Tick Effect
  useEffect(() => {
    if (!isRunning) return;

    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }

    const interval = setInterval(() => {
      if (!endTimeRef.current) return;
      const remainingMs = endTimeRef.current - Date.now();
      const remainingSec = Math.ceil(remainingMs / 1000);

      if (remainingSec <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        handleSessionComplete();
      } else {
        setTimeLeft(remainingSec);
        if (settings.tickingSound) {
          audioEngine.playTick();
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, handleSessionComplete, settings.tickingSound]);

  // Sync document title and favicon
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const modeLabel = mode === 'pomodoro' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break';
    const statusIcon = isRunning ? '▶' : '⏸';
    document.title = `${timeStr} ${statusIcon} ${modeLabel} | SereneFocus`;
  }, [timeLeft, isRunning, mode]);

  // Aggregate daily stats
  const dailyStats: DailyStat[] = React.useMemo(() => {
    const map = new Map<string, { focusMinutes: number; completedPomodoros: number; completedTasksCount: number }>();
    
    sessionHistory.forEach((session) => {
      const date = session.dateStr;
      const curr = map.get(date) || { focusMinutes: 0, completedPomodoros: 0, completedTasksCount: 0 };
      if (session.mode === 'pomodoro') {
        curr.focusMinutes += session.durationMinutes;
        curr.completedPomodoros += 1;
      }
      map.set(date, curr);
    });

    const result: DailyStat[] = [];
    map.forEach((val, key) => {
      result.push({
        dateStr: key,
        focusMinutes: val.focusMinutes,
        completedPomodoros: val.completedPomodoros,
        completedTasksCount: val.completedTasksCount,
      });
    });

    return result.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [sessionHistory]);

  const clearHistory = () => {
    setSessionHistory([]);
    localStorage.removeItem('serene_session_history');
  };

  return (
    <TimerContext.Provider
      value={{
        mode,
        setMode,
        timeLeft,
        totalDuration,
        isRunning,
        startTimer,
        pauseTimer,
        toggleTimer,
        resetTimer,
        skipSession,
        adjustTime,
        pomodorosCompletedToday,
        currentCycle,
        activeTaskId,
        setActiveTaskId,
        settings,
        updateSettings,
        sessionHistory,
        dailyStats,
        clearHistory,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
