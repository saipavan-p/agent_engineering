import React, { useState } from 'react';
import { 
  Plus, 
  Check, 
  Trash2, 
  Play, 
  Search, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Target
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useTimer } from '../context/TimerContext';
import { useTheme } from '../context/ThemeContext';
import { Task, Priority } from '../types';

export const TaskManager: React.FC = () => {
  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    incrementTaskPomodoro,
    clearCompletedTasks,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  } = useTasks();

  const { activeTaskId, setActiveTaskId, isRunning, startTimer } = useTimer();
  const { currentThemeConfig } = useTheme();

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Deep Work');
  const [customCategory, setCustomCategory] = useState('');
  const [newEstimate, setNewEstimate] = useState(2);
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newNotes, setNewNotes] = useState('');

  // Expandable notes state
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const cat = newCategory === 'Custom' ? (customCategory.trim() || 'General') : newCategory;
    addTask(newTitle, cat, newEstimate, newPriority, newNotes);

    // Reset form
    setNewTitle('');
    setNewNotes('');
    setCustomCategory('');
    setIsAddingTask(false);
  };

  const handleSelectTaskForFocus = (task: Task) => {
    setActiveTaskId(task.id);
    if (!isRunning) {
      startTimer();
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">Med</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Low</span>;
    }
  };

  return (
    <div className={`w-full rounded-3xl p-5 sm:p-6 border transition-all ${currentThemeConfig.cardBg}`}>
      {/* Header & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-sage-600 dark:text-sage-400" />
            Task Focus Stream
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {completedCount} of {totalCount} completed • {tasks.reduce((acc, t) => acc + t.completedPomodoros, 0)} pomodoros invested
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <button
              onClick={clearCompletedTasks}
              className="text-xs px-3 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              Clear Completed
            </button>
          )}

          <button
            onClick={() => setIsAddingTask(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${currentThemeConfig.primaryBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Category horizontal scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? `${currentThemeConfig.primaryBg} shadow-xs`
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div className="relative min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
          />
        </div>
      </div>

      {/* Add Task Expandable Form */}
      {isAddingTask && (
        <form onSubmit={handleCreateTask} className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Create New Intentional Task</span>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="What is your focus for this session? (e.g. Write chapter 2 draft)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-400 mb-3"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {/* Category Select */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sage-400"
              >
                <option value="Deep Work">Deep Work</option>
                <option value="Learning">Learning</option>
                <option value="Creative">Creative</option>
                <option value="Wellness">Wellness</option>
                <option value="Life">Life</option>
                <option value="Custom">+ Custom Category</option>
              </select>
              {newCategory === 'Custom' && (
                <input
                  type="text"
                  placeholder="Category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full mt-1.5 px-3 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              )}
            </div>

            {/* Estimated Pomodoros */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Estimated Pomodoros</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNewEstimate(num)}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                      newEstimate === num
                        ? 'bg-sage-600 text-white dark:bg-sage-500'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sage-400"
              >
                <option value="low">Low (Gentle)</option>
                <option value="medium">Medium (Focused)</option>
                <option value="high">High (Urgent)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <textarea
            placeholder="Subtasks, checklist, or mindful notes..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sage-400 mb-3"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold shadow-xs ${currentThemeConfig.primaryBg}`}
            >
              Add to Stream
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
            <Sparkles className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {searchQuery ? 'No matching tasks found' : 'Your focus stream is clear'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {searchQuery ? 'Try another search term' : 'Add an intentional task to cultivate mindful progress'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isActive = activeTaskId === task.id;
            const hasNotes = Boolean(task.notes);
            const isNotesExpanded = expandedNotesId === task.id;

            return (
              <div
                key={task.id}
                className={`group relative rounded-2xl p-3.5 transition-all duration-200 border ${
                  isActive
                    ? 'bg-sage-50/90 dark:bg-sage-950/40 border-sage-400/80 shadow-md ring-1 ring-sage-400/30'
                    : task.completed
                    ? 'bg-white/40 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-65'
                    : 'bg-white/70 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Complete checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-sage-600 border-sage-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-sage-500 bg-white dark:bg-slate-800'
                    }`}
                    title={task.completed ? 'Mark uncompleted' : 'Mark completed'}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>

                  {/* Main Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-medium transition-all ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                      
                      {/* Priority badge */}
                      {getPriorityBadge(task.priority)}

                      {/* Category tag */}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {task.category}
                      </span>
                    </div>

                    {/* Pomodoro Counter & Notes expander */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {/* Pomodoros counter */}
                      <div className="flex items-center gap-1 font-mono">
                        <span>🍅</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {task.completedPomodoros}/{task.estimatedPomodoros}
                        </span>
                        <button
                          onClick={() => incrementTaskPomodoro(task.id)}
                          className="ml-1 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700"
                          title="Log +1 Pomodoro"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Notes toggle if available */}
                      {hasNotes && (
                        <button
                          onClick={() =>
                            setExpandedNotesId(isNotesExpanded ? null : task.id)
                          }
                          className="flex items-center gap-0.5 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <span>Notes</span>
                          {isNotesExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expandable Notes */}
                    {hasNotes && isNotesExpanded && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap animate-fade-in">
                        {task.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!task.completed && (
                      <button
                        onClick={() => handleSelectTaskForFocus(task)}
                        className={`p-1.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-sage-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sage-100 hover:text-sage-700 dark:hover:bg-sage-900'
                        }`}
                        title={isActive ? 'Active Focus Task' : 'Focus on this task with timer'}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
