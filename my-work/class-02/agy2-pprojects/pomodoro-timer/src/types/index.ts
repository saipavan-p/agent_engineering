export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export type ThemeName = 'sage' | 'twilight' | 'terracotta' | 'sakura' | 'midnight';

export type AmbientSoundType = 'rain' | 'forest' | 'ocean' | 'fire' | 'cafe' | 'binaural';

export type ChimeSoundType = 'tibetan' | 'crystal' | 'bell' | 'woodblock' | 'none';

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  category: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  priority: Priority;
  notes?: string;
  createdAt: number;
  completedAt?: number;
}

export interface SessionHistory {
  id: string;
  timestamp: number;
  mode: TimerMode;
  durationMinutes: number;
  taskId?: string;
  taskTitle?: string;
  dateStr: string; // YYYY-MM-DD for heatmap and grouping
}

export interface Settings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  chimeSound: ChimeSoundType;
  chimeVolume: number;
  ambientMasterVolume: number;
  theme: ThemeName;
  tickingSound: boolean;
  desktopNotifications: boolean;
  dailyGoalPomodoros: number;
}

export interface AmbientTrack {
  id: AmbientSoundType;
  name: string;
  icon: string;
  description: string;
  volume: number;
  isPlaying: boolean;
}

export interface DailyStat {
  dateStr: string; // YYYY-MM-DD
  focusMinutes: number;
  completedPomodoros: number;
  completedTasksCount: number;
}
