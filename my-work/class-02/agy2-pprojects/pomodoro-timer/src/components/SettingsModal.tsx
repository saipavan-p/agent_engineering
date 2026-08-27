import React from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Volume2, 
  Bell, 
  Clock, 
  RotateCcw, 
  Play,
  Check
} from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { audioEngine } from '../services/audioEngine';
import { ChimeSoundType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings } = useTimer();

  if (!isOpen) return null;

  const handlePreviewChime = (chime: ChimeSoundType) => {
    audioEngine.playChime(chime, settings.chimeVolume);
  };

  const handleNotificationToggle = async () => {
    if (!settings.desktopNotifications) {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          updateSettings({ desktopNotifications: true });
        } else {
          alert('Notification permission was not granted by your browser.');
        }
      } else {
        alert('Desktop notifications are not supported by this browser.');
      }
    } else {
      updateSettings({ desktopNotifications: false });
    }
  };

  const chimes: { id: ChimeSoundType; name: string }[] = [
    { id: 'tibetan', name: 'Tibetan Singing Bowl' },
    { id: 'crystal', name: 'Crystal Chime' },
    { id: 'bell', name: 'Acoustic Bell' },
    { id: 'woodblock', name: 'Temple Woodblock' },
    { id: 'none', name: 'Silent' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Preferences & Timer Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize your flow intervals and sensations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Time Durations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Interval Durations (Minutes)
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Focus
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={settings.pomodoroMinutes}
                  onChange={(e) =>
                    updateSettings({
                      pomodoroMinutes: Math.max(1, parseInt(e.target.value) || 25),
                    })
                  }
                  className="w-full text-center text-base font-bold font-mono bg-white dark:bg-slate-800 rounded-xl py-1.5 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Short Break
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakMinutes}
                  onChange={(e) =>
                    updateSettings({
                      shortBreakMinutes: Math.max(1, parseInt(e.target.value) || 5),
                    })
                  }
                  className="w-full text-center text-base font-bold font-mono bg-white dark:bg-slate-800 rounded-xl py-1.5 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Long Break
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakMinutes}
                  onChange={(e) =>
                    updateSettings({
                      longBreakMinutes: Math.max(1, parseInt(e.target.value) || 15),
                    })
                  }
                  className="w-full text-center text-base font-bold font-mono bg-white dark:bg-slate-800 rounded-xl py-1.5 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Long Break Interval & Daily Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Long Break Interval
                </span>
                <span className="text-[11px] text-slate-400">
                  Pomodoro count before long break
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.longBreakInterval}
                onChange={(e) =>
                  updateSettings({
                    longBreakInterval: Math.max(1, parseInt(e.target.value) || 4),
                  })
                }
                className="w-14 text-center font-mono font-bold bg-white dark:bg-slate-800 py-1 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Daily Goal
                </span>
                <span className="text-[11px] text-slate-400">
                  Target sessions per day
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="24"
                value={settings.dailyGoalPomodoros}
                onChange={(e) =>
                  updateSettings({
                    dailyGoalPomodoros: Math.max(1, parseInt(e.target.value) || 8),
                  })
                }
                className="w-14 text-center font-mono font-bold bg-white dark:bg-slate-800 py-1 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Completion Chime Selector */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Session Completion Chime
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chimes.map((c) => {
                const isSelected = settings.chimeSound === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => updateSettings({ chimeSound: c.id })}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sage-50 dark:bg-sage-950/40 border-sage-400 dark:border-sage-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-sage-600 border-sage-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {c.name}
                      </span>
                    </div>

                    {c.id !== 'none' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewChime(c.id);
                        }}
                        className="p-1 text-slate-400 hover:text-sage-600 dark:hover:text-sage-300"
                        title="Preview chime"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chime Volume */}
            <div className="mt-4 flex items-center gap-3 px-1">
              <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-500 font-medium w-24">Chime Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.chimeVolume}
                onChange={(e) =>
                  updateSettings({ chimeVolume: parseFloat(e.target.value) })
                }
                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sage-600"
              />
              <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                {Math.round(settings.chimeVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Automation & Behavior Toggles */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Behavior & Notifications
            </h4>

            {/* Auto Start Breaks */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Auto-start Breaks
                </span>
                <span className="text-[11px] text-slate-400">
                  Automatically start countdown when break begins
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoStartBreaks}
                onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                className="w-4 h-4 rounded text-sage-600 focus:ring-sage-400 accent-sage-600 cursor-pointer"
              />
            </label>

            {/* Auto Start Pomodoros */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Auto-start Pomodoros
                </span>
                <span className="text-[11px] text-slate-400">
                  Automatically start next focus session after break
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoStartPomodoros}
                onChange={(e) => updateSettings({ autoStartPomodoros: e.target.checked })}
                className="w-4 h-4 rounded text-sage-600 focus:ring-sage-400 accent-sage-600 cursor-pointer"
              />
            </label>

            {/* Subtle Ticking */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Tactile Second Tick
                </span>
                <span className="text-[11px] text-slate-400">
                  Gentle synthesized clock tick each second
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.tickingSound}
                onChange={(e) => updateSettings({ tickingSound: e.target.checked })}
                className="w-4 h-4 rounded text-sage-600 focus:ring-sage-400 accent-sage-600 cursor-pointer"
              />
            </label>

            {/* Desktop Notifications */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Desktop Notifications
                </span>
                <span className="text-[11px] text-slate-400">
                  Receive browser notifications when timer ends
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.desktopNotifications}
                onChange={handleNotificationToggle}
                className="w-4 h-4 rounded text-sage-600 focus:ring-sage-400 accent-sage-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Reset all timer settings to defaults?')) {
                localStorage.removeItem('serene_settings');
                window.location.reload();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
