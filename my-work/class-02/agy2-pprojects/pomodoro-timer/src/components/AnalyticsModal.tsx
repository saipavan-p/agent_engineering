import React from 'react';
import { 
  X, 
  BarChart2, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Download, 
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useTasks } from '../context/TaskContext';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { sessionHistory, dailyStats, settings, clearHistory } = useTimer();
  const { tasks } = useTasks();

  if (!isOpen) return null;

  // Calculate high-level analytics
  const totalFocusMinutes = sessionHistory
    .filter((s) => s.mode === 'pomodoro')
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const totalPomodoros = sessionHistory.filter((s) => s.mode === 'pomodoro').length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;

  // Calculate consecutive active streak days
  const calculateStreak = () => {
    if (dailyStats.length === 0) return 0;
    const sortedDates = [...dailyStats].map((d) => d.dateStr).sort().reverse();
    let streak = 0;
    const today = new Date();
    
    // Check if yesterday or today was logged
    let checkDate = new Date(today);
    
    for (let i = 0; i < 60; i++) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today hasn't had a session yet, check if yesterday had one
        if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  };

  const streakDays = calculateStreak();

  // Last 7 days for the chart
  const getLast7DaysData = () => {
    const days: { dateStr: string; label: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const stat = dailyStats.find((s) => s.dateStr === dateStr);
      days.push({
        dateStr,
        label: i === 0 ? 'Today' : dayName,
        minutes: stat ? stat.focusMinutes : 0,
      });
    }
    return days;
  };

  const last7Days = getLast7DaysData();
  const maxMinutes7Days = Math.max(60, ...last7Days.map((d) => d.minutes));

  // Last 28 days for the heatmap grid (4 weeks)
  const getLast28DaysHeatmap = () => {
    const days: { dateStr: string; pomodoros: number; level: number }[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const stat = dailyStats.find((s) => s.dateStr === dateStr);
      const pomos = stat ? stat.completedPomodoros : 0;
      
      let level = 0;
      if (pomos >= 8) level = 4;
      else if (pomos >= 5) level = 3;
      else if (pomos >= 3) level = 2;
      else if (pomos >= 1) level = 1;

      days.push({ dateStr, pomodoros: pomos, level });
    }
    return days;
  };

  const heatmapDays = getLast28DaysHeatmap();

  // Export data as JSON
  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      sessionHistory,
      tasks,
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serenefocus-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-100 dark:bg-sage-900/60 text-sage-700 dark:text-sage-300 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Productivity & Flow Insights
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your mindful progress and focus trends
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

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Focus Time</span>
              </div>
              <p className="text-lg sm:text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
                {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>🍅</span>
                <span>Sessions</span>
              </div>
              <p className="text-lg sm:text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
                {totalPomodoros}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Streak</span>
              </div>
              <p className="text-lg sm:text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
                {streakDays} {streakDays === 1 ? 'day' : 'days'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tasks Done</span>
              </div>
              <p className="text-lg sm:text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
                {completedTasksCount}
              </p>
            </div>
          </div>

          {/* 7-Day Focus Bar Chart */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
                Last 7 Days Focus Distribution
              </h4>
              <span className="text-[11px] text-slate-400">Minutes</span>
            </div>

            <div className="h-36 flex items-end justify-between gap-2 pt-4">
              {last7Days.map((day) => {
                const heightPercent = maxMinutes7Days > 0 ? (day.minutes / maxMinutes7Days) * 100 : 0;
                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.minutes}m
                    </span>
                    <div className="w-full max-w-[36px] bg-slate-200 dark:bg-slate-700/60 rounded-t-lg overflow-hidden h-24 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-sage-600 to-sage-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.max(day.minutes > 0 ? 10 : 0, heightPercent)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 28-Day Heatmap Grid */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
                4-Week Flow Activity
              </h4>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 dark:bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-xs bg-sage-300 dark:bg-sage-800" />
                <span className="w-2.5 h-2.5 rounded-xs bg-sage-400 dark:bg-sage-600" />
                <span className="w-2.5 h-2.5 rounded-xs bg-sage-600 dark:bg-sage-400" />
                <span>More</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {heatmapDays.map((day) => {
                const getBg = () => {
                  switch (day.level) {
                    case 0: return 'bg-slate-200/70 dark:bg-slate-800';
                    case 1: return 'bg-sage-300 dark:bg-sage-800/90 text-sage-900';
                    case 2: return 'bg-sage-400 dark:bg-sage-700 text-white';
                    case 3: return 'bg-sage-500 dark:bg-sage-500 text-white';
                    case 4: return 'bg-sage-600 dark:bg-sage-400 text-white';
                  }
                };

                return (
                  <div
                    key={day.dateStr}
                    className={`aspect-square rounded-md p-1 flex flex-col items-center justify-center transition-all hover:scale-110 cursor-default ${getBg()}`}
                    title={`${day.dateStr}: ${day.pomodoros} pomodoro sessions`}
                  >
                    <span className="text-[9px] font-mono opacity-80">
                      {day.pomodoros > 0 ? day.pomodoros : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent History Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
              Recent Completed Sessions
            </h4>

            {sessionHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No completed sessions logged yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {sessionHistory.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span>{session.mode === 'pomodoro' ? '🍅' : '🌿'}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                        {session.mode === 'pomodoro' ? 'Focus Block' : session.mode}
                      </span>
                      {session.taskTitle && (
                        <span className="text-slate-400 truncate max-w-[150px]">
                          • {session.taskTitle}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 font-mono">
                      <span>{session.durationMinutes} min</span>
                      <span>{new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          {sessionHistory.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all session history?')) {
                  clearHistory();
                }
              }}
              className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 px-2 py-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Stats</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
