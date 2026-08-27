import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Priority } from '../types';
import { useTimer } from './TimerContext';

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string, category?: string, estimatedPomodoros?: number, priority?: Priority, notes?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  incrementTaskPomodoro: (id: string) => void;
  clearCompletedTasks: () => void;
  activeTask: Task | null;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DEFAULT_CATEGORIES = ['All', 'Deep Work', 'Learning', 'Creative', 'Wellness', 'Life'];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Review project architecture & roadmap',
    category: 'Deep Work',
    estimatedPomodoros: 2,
    completedPomodoros: 1,
    completed: false,
    priority: 'high',
    notes: 'Draft the main component boundaries and state structure',
    createdAt: Date.now() - 3600000,
  },
  {
    id: '2',
    title: 'Mindful reading: Focus & deep work principles',
    category: 'Learning',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    completed: false,
    priority: 'medium',
    notes: 'Read chapter 3 on uninterrupted attention',
    createdAt: Date.now() - 7200000,
  },
  {
    id: '3',
    title: 'Hydrate & 5-minute stretch routine',
    category: 'Wellness',
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    completed: true,
    priority: 'low',
    notes: 'Drink 500ml water and do gentle shoulder rolls',
    createdAt: Date.now() - 10800000,
    completedAt: Date.now() - 1800000,
  },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTaskId, setActiveTaskId, sessionHistory } = useTimer();

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('serene_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist tasks
  useEffect(() => {
    localStorage.setItem('serene_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // When a session is logged in history that has an activeTaskId, automatically increment that task's completed pomodoros
  const lastSessionRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (sessionHistory.length > 0) {
      const latest = sessionHistory[0];
      if (latest.id !== lastSessionRef.current) {
        lastSessionRef.current = latest.id;
        if (latest.mode === 'pomodoro' && latest.taskId) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === latest.taskId
                ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
                : t
            )
          );
        }
      }
    }
  }, [sessionHistory]);

  const addTask = (
    title: string,
    category = 'Deep Work',
    estimatedPomodoros = 1,
    priority: Priority = 'medium',
    notes?: string
  ) => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      title: title.trim(),
      category: category || 'Deep Work',
      estimatedPomodoros: Math.max(1, estimatedPomodoros),
      completedPomodoros: 0,
      completed: false,
      priority,
      notes: notes?.trim() || undefined,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const nextCompleted = !task.completed;
          return {
            ...task,
            completed: nextCompleted,
            completedAt: nextCompleted ? Date.now() : undefined,
          };
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const reorderTasks = (startIndex: number, endIndex: number) => {
    setTasks((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const incrementTaskPomodoro = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t))
    );
  };

  const clearCompletedTasks = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  // Compute unique categories
  const categories = React.useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        reorderTasks,
        incrementTaskPomodoro,
        clearCompletedTasks,
        activeTask,
        categories,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
